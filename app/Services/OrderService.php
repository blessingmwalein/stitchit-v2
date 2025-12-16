<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\ClientRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected ClientRepositoryInterface $clientRepository,
        protected AccountingService $accountingService
    ) {}

    /**
     * Get orders with filters
     */
    public function getOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->getWithRelations($filters, $perPage);
    }

    /**
     * Create a new order
     */
    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            // Get or create client
            $client = $this->clientRepository->findOrFail($data['client_id']);

            // Create order
            $order = $this->orderRepository->create([
                'client_id' => $client->id,
                'state' => $data['state'] ?? 'DRAFT',
                'deposit_percent' => $data['deposit_percent'] ?? 30,
                'notes' => $data['notes'] ?? null,
                'delivery_address' => $data['delivery_address'] ?? null,
                'delivery_contact' => $data['delivery_contact'] ?? null,
                'preferred_dimensions_unit' => $data['preferred_dimensions_unit'] ?? 'cm',
            ]);

            // Create order items if provided
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $itemData) {
                    $order->items()->create($itemData);
                }
            }

            // Calculate totals
            $order->calculateTotal();

            return $order->fresh(['client', 'items']);
        });
    }

    /**
     * Update order
     */
    public function update(int $id, array $data): Order
    {
        return DB::transaction(function () use ($id, $data) {
            $order = $this->orderRepository->update($id, $data);

            // Update items if provided
            if (isset($data['items'])) {
                // Delete existing items
                $order->items()->delete();

                // Create new items
                foreach ($data['items'] as $itemData) {
                    $order->items()->create($itemData);
                }

                $order->calculateTotal();
            }

            return $order->fresh(['client', 'items']);
        });
    }

    /**
     * Transition order to next state
     */
    public function transitionState(int $id, string $newState): Order
    {
        $order = $this->orderRepository->findOrFail($id);

        // Validate state transitions
        $validTransitions = [
            'DRAFT' => ['PENDING_DEPOSIT', 'ARCHIVED'],
            'PENDING_DEPOSIT' => ['DEPOSIT_PAID', 'ARCHIVED'],
            'DEPOSIT_PAID' => ['IN_PRODUCTION'],
            'IN_PRODUCTION' => ['READY_FOR_DISPATCH'],
            'READY_FOR_DISPATCH' => ['DISPATCHED'],
            'DISPATCHED' => ['CLOSED'],
        ];

        if (!isset($validTransitions[$order->state]) || 
            !in_array($newState, $validTransitions[$order->state])) {
            throw new \Exception("Invalid state transition from {$order->state} to {$newState}");
        }

        // Special validation for DEPOSIT_PAID
        if ($newState === 'DEPOSIT_PAID' && !$order->hasDepositPaid()) {
            throw new \Exception('Cannot mark order as deposit paid. Insufficient deposit amount received.');
        }

        $order->state = $newState;
        $order->save();

        return $order->fresh();
    }

    /**
     * Record a payment
     */
    public function recordPayment(int $orderId, array $paymentData): Payment
    {
        return DB::transaction(function () use ($orderId, $paymentData) {
            $order = $this->orderRepository->findOrFail($orderId);

            // Determine payment type based on order state
            // If order is in production or later, it's a balance payment
            $isBalancePayment = in_array($order->state, [
                'IN_PRODUCTION',
                'READY_FOR_DISPATCH',
                'DISPATCHED',
                'CLOSED'
            ]);

            $paymentType = $isBalancePayment ? 'balance' : 'deposit';

            $payment = $order->payments()->create([
                'client_id' => $order->client_id,
                'amount' => $paymentData['amount'],
                'method' => $paymentData['method'] ?? 'cash',
                'type' => $paymentType,
                'reference' => $paymentData['reference'] ?? null,
                'paid_at' => $paymentData['paid_at'] ?? now(),
                'recorded_by' => $paymentData['recorded_by'] ?? auth()->id(),
            ]);

            // Recalculate order balance
            $order->calculateTotal();

            // Create journal entry for payment
            $this->createPaymentJournalEntry($order, $payment);

            // Auto-transition if deposit is complete
            if ($order->state === 'PENDING_DEPOSIT' && $order->hasDepositPaid()) {
                $this->transitionState($order->id, 'DEPOSIT_PAID');
            }

            return $payment->fresh('journalEntry');
        });
    }

    /**
     * Create journal entry for payment
     */
    protected function createPaymentJournalEntry(Order $order, Payment $payment): void
    {
        // Get accounts based on payment method
        $cashBankAccount = $this->getCashBankAccount($payment->method);
        $accountsReceivableAccount = \App\Models\Account::where('code', '1200')->first(); // Accounts Receivable
        $salesRevenueAccount = \App\Models\Account::where('code', '4000')->first(); // Sales Revenue

        if (!$cashBankAccount || !$accountsReceivableAccount || !$salesRevenueAccount) {
            throw new \Exception('Required accounts not found. Please ensure Cash/Bank (1000/1100), Accounts Receivable (1200), and Sales Revenue (4000) accounts exist.');
        }

        // Create descriptive labels based on payment type
        $paymentTypeLabel = $payment->type === 'deposit' ? 'Deposit' : 'Balance Payment';
        $orderStateLabel = $this->getOrderStateLabel($order->state);

        // Determine transaction type description
        $description = "{$paymentTypeLabel} received - Order: {$order->reference} ({$orderStateLabel}) - Client: {$order->client->full_name}";

        // For deposits and balance payments:
        // Debit: Cash/Bank (increases asset)
        // Credit: Accounts Receivable (decreases asset) OR Sales Revenue (if recognizing revenue)
        
        // If this is the first payment (deposit), we recognize the sale
        $isFirstPayment = $order->payments()->count() === 1;
        
        if ($isFirstPayment) {
            // Initial sale recognition: Debit AR, Credit Revenue for full order amount
            $saleJournalEntry = $this->accountingService->createJournalEntry([
                'transaction_date' => now()->format('Y-m-d'),
                'type' => 'SALES',
                'description' => "Sale recognized - Order: {$order->reference} - Client: {$order->client->full_name} - Total: $" . number_format($order->total_amount, 2),
                'source_type' => 'App\\Models\\Order',
                'source_id' => $order->id,
                'lines' => [
                    [
                        'account_id' => $accountsReceivableAccount->id,
                        'type' => 'DEBIT',
                        'amount' => $order->total_amount,
                        'description' => "Amount receivable from {$order->client->full_name} for order {$order->reference}",
                    ],
                    [
                        'account_id' => $salesRevenueAccount->id,
                        'type' => 'CREDIT',
                        'amount' => $order->total_amount,
                        'description' => "Sales revenue for custom rug order {$order->reference}",
                    ],
                ],
            ]);
            $this->accountingService->postJournalEntry($saleJournalEntry->id);
        }

        // Payment receipt: Debit Cash/Bank, Credit AR
        $paymentMethodLabel = ucwords(str_replace('_', ' ', $payment->method));
        
        $paymentJournalEntry = $this->accountingService->createJournalEntry([
            'transaction_date' => $payment->paid_at->format('Y-m-d'),
            'type' => 'RECEIPT',
            'description' => $description,
            'source_type' => 'App\\Models\\Payment',
            'source_id' => $payment->id,
            'lines' => [
                [
                    'account_id' => $cashBankAccount->id,
                    'type' => 'DEBIT',
                    'amount' => $payment->amount,
                    'description' => "{$paymentTypeLabel} of $" . number_format($payment->amount, 2) . " received via {$paymentMethodLabel} for order {$order->reference}",
                ],
                [
                    'account_id' => $accountsReceivableAccount->id,
                    'type' => 'CREDIT',
                    'amount' => $payment->amount,
                    'description' => "{$paymentTypeLabel} payment from {$order->client->full_name} - Order {$order->reference} ({$orderStateLabel})",
                ],
            ],
        ]);

        // Automatically post the journal entry
        $this->accountingService->postJournalEntry($paymentJournalEntry->id);
    }

    /**
     * Get human-readable order state label
     */
    protected function getOrderStateLabel(string $state): string
    {
        $labels = [
            'DRAFT' => 'Draft',
            'PENDING_DEPOSIT' => 'Pending Deposit',
            'DEPOSIT_PAID' => 'Deposit Paid',
            'IN_PRODUCTION' => 'In Production',
            'READY_FOR_DISPATCH' => 'Ready for Dispatch',
            'DISPATCHED' => 'Dispatched',
            'CLOSED' => 'Closed',
            'ARCHIVED' => 'Archived',
        ];

        return $labels[$state] ?? $state;
    }

    /**
     * Get cash or bank account based on payment method
     */
    protected function getCashBankAccount(string $method): ?\App\Models\Account
    {
        // Cash methods go to Cash on Hand (1000)
        if (in_array($method, ['cash'])) {
            return \App\Models\Account::where('code', '1000')->first();
        }
        
        // All other methods go to Bank Account (1100)
        return \App\Models\Account::where('code', '1100')->first();
    }

    /**
     * Convert order items to production jobs
     */
    public function convertToProduction(int $orderId): array
    {
        $order = $this->orderRepository->findOrFail($orderId);

        if ($order->state !== 'DEPOSIT_PAID') {
            throw new \Exception('Order must have deposit paid before converting to production.');
        }

        $jobs = [];

        DB::transaction(function () use ($order, &$jobs) {
            foreach ($order->items as $item) {
                if (!$item->productionJob) {
                    $job = $item->productionJob()->create([
                        'state' => 'PLANNED',
                        'created_by' => auth()->id(),
                        'notes' => "Auto-created from order {$order->reference}",
                    ]);
                    $jobs[] = $job;
                }
            }

            if (count($jobs) > 0) {
                $this->transitionState($order->id, 'IN_PRODUCTION');
            }
        });

        return $jobs;
    }

    /**
     * Delete order
     */
    public function delete(int $id): bool
    {
        $order = $this->orderRepository->findOrFail($id);

        // Only allow deleting DRAFT or ARCHIVED orders
        if (!in_array($order->state, ['DRAFT', 'ARCHIVED'])) {
            throw new \Exception('Can only delete DRAFT or ARCHIVED orders.');
        }

        return $this->orderRepository->delete($id);
    }
}
