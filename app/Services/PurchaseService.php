<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\StockLot;
use App\Models\Account;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function __construct(
        protected PurchaseRepositoryInterface $purchaseRepository,
        protected InventoryRepositoryInterface $inventoryRepository,
        protected AccountingService $accountingService
    ) {}

    /**
     * Get single purchase order with relations
     */
    public function findPurchaseOrder(int $id): ?PurchaseOrder
    {
        return $this->purchaseRepository->findWithRelations($id);
    }

    /**
     * Get purchase orders
     */
    public function getPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->purchaseRepository->getWithRelations($filters, $perPage);
    }

    /**
     * Create purchase order
     */
    public function create(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            $po = $this->purchaseRepository->create([
                'supplier_id' => $data['supplier_id'],
                'state' => $data['state'] ?? 'DRAFT',
                'expected_date' =>  $data['expected_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            // Create purchase lines
            if (isset($data['lines']) && is_array($data['lines'])) {
                foreach ($data['lines'] as $lineData) {
                    $po->lines()->create([
                        'inventory_item_id' => $lineData['inventory_item_id'],
                        'description' => $lineData['description'] ?? null,
                        'quantity_ordered' => $lineData['quantity_ordered'],
                        'unit_cost' => $lineData['unit_cost'],
                    ]);
                }
            }

            $po->calculateTotal();

            return $po->fresh(['supplier', 'lines.inventoryItem']);
        });
    }

    /**
     * Update purchase order
     */
    public function update(int $id, array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($id, $data) {
            $po = $this->purchaseRepository->update($id, $data);

            if (isset($data['lines'])) {
                $po->lines()->delete();

                foreach ($data['lines'] as $lineData) {
                    $po->lines()->create($lineData);
                }

                $po->calculateTotal();
            }

            return $po->fresh(['supplier', 'lines']);
        });
    }

    /**
     * Receive goods for a purchase order line
     */
    public function receiveGoods(int $purchaseOrderId, array $receiptData): array
    {
        return DB::transaction(function () use ($purchaseOrderId, $receiptData) {
            $po = $this->purchaseRepository->findOrFail($purchaseOrderId);

            $stockLots = [];

            foreach ($receiptData as $receipt) {
                $line = $po->lines()->findOrFail($receipt['purchase_line_id']);
                $quantityToReceive = $receipt['quantity_received'];

                // Update line received quantity
                $line->quantity_received += $quantityToReceive;
                $line->save();

                // Create stock lot
                $stockLot = StockLot::create([
                    'inventory_item_id' => $line->inventory_item_id,
                    'supplier_id' => $po->supplier_id,
                    'purchase_line_id' => $line->id,
                    'lot_number' => $receipt['lot_number'] ?? null,
                    'quantity_received' => $quantityToReceive,
                    'quantity_remaining' => $quantityToReceive,
                    'unit_cost' => $line->unit_cost,
                    'received_at' => $receipt['received_at'] ?? now(),
                ]);

                // Update inventory item (average cost and stock)
                $item = $this->inventoryRepository->findOrFail($line->inventory_item_id);
                $item->recalculateAverageCost($quantityToReceive, $line->unit_cost);

                $stockLots[] = $stockLot;
            }

            // Update PO state
            if ($po->isFullyReceived()) {
                $po->state = 'FULLY_RECEIVED';
            } else if ($po->state === 'SENT') {
                $po->state = 'PARTIALLY_RECEIVED';
            }
            $po->save();

            return $stockLots;
        });
    }

    /**
     * Send purchase order to supplier (and auto-receive all goods)
     */
    public function sendToSupplier(int $id): PurchaseOrder
    {
        return DB::transaction(function () use ($id) {
            $po = $this->purchaseRepository->findOrFail($id);

            if ($po->state !== 'DRAFT') {
                throw new \Exception('Only DRAFT purchase orders can be sent.');
            }

            if ($po->lines()->count() === 0) {
                throw new \Exception('Cannot send purchase order with no lines.');
            }

            // Calculate total purchase amount
            $totalAmount = 0;

            // Mark as SENT
            $po->state = 'SENT';
            $po->save();

            // Automatically receive all goods and update inventory
            foreach ($po->lines as $line) {
                $quantityToReceive = $line->quantity_ordered;
                $lineTotal = $quantityToReceive * $line->unit_cost;
                $totalAmount += $lineTotal;

                // Update line received quantity
                $line->quantity_received = $quantityToReceive;
                $line->save();

                // Create stock lot
                StockLot::create([
                    'inventory_item_id' => $line->inventory_item_id,
                    'supplier_id' => $po->supplier_id,
                    'purchase_line_id' => $line->id,
                    'lot_number' => $po->reference,
                    'quantity_received' => $quantityToReceive,
                    'quantity_remaining' => $quantityToReceive,
                    'unit_cost' => $line->unit_cost,
                    'received_at' => now(),
                ]);

                // Update inventory item (average cost and stock)
                $item = $this->inventoryRepository->findOrFail($line->inventory_item_id);
                $item->recalculateAverageCost($quantityToReceive, $line->unit_cost);
            }

            // Mark as fully received
            $po->state = 'FULLY_RECEIVED';
            $po->save();

            // Create journal entry for purchase
            $this->createPurchaseJournalEntry($po, $totalAmount);

            return $po->fresh(['lines.inventoryItem', 'supplier']);
        });
    }

    /**
     * Create journal entry for purchase
     * 
     * @param PurchaseOrder $po
     * @param float $totalAmount
     * @return void
     */
    protected function createPurchaseJournalEntry(PurchaseOrder $po, float $totalAmount): void
    {
        // Get accounts
        $inventoryAccount = Account::where('code', '1300')->first(); // Inventory - Raw Materials
        $accountsPayableAccount = Account::where('code', '2000')->first(); // Accounts Payable

        if (!$inventoryAccount || !$accountsPayableAccount) {
            throw new \Exception('Required accounts not found. Please ensure Inventory (1300) and Accounts Payable (2000) accounts exist.');
        }

        // Create journal entry
        $journalEntry = $this->accountingService->createJournalEntry([
            'transaction_date' => now()->format('Y-m-d'),
            'type' => 'PURCHASE',
            'description' => "Purchase of raw materials - PO: {$po->reference} from {$po->supplier->name}",
            'source_type' => 'App\\Models\\PurchaseOrder',
            'source_id' => $po->id,
            'lines' => [
                [
                    'account_id' => $inventoryAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $totalAmount,
                    'description' => "Raw materials purchase from {$po->supplier->name}",
                ],
                [
                    'account_id' => $accountsPayableAccount->id,
                    'type' => 'CREDIT',
                    'amount' => $totalAmount,
                    'description' => "Amount payable to {$po->supplier->name}",
                ],
            ],
        ]);

        // Automatically post the journal entry
        $this->accountingService->postJournalEntry($journalEntry->id);
    }

    /**
     * Close purchase order
     */
    public function close(int $id): PurchaseOrder
    {
        $po = $this->purchaseRepository->findOrFail($id);

        if (!in_array($po->state, ['FULLY_RECEIVED', 'SENT'])) {
            throw new \Exception('Can only close SENT or FULLY_RECEIVED purchase orders.');
        }

        $po->state = 'CLOSED';
        $po->save();

        return $po->fresh();
    }

    /**
     * Delete purchase order
     */
    public function delete(int $id): bool
    {
        $po = $this->purchaseRepository->findOrFail($id);

        if ($po->state !== 'DRAFT') {
            throw new \Exception('Can only delete DRAFT purchase orders.');
        }

        return $this->purchaseRepository->delete($id);
    }
}
