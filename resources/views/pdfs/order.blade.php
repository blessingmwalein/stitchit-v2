<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order {{ $order->reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
            padding: 40px;
            background: #fff;
            position: relative;
        }
        
        /* Watermark */
        body::before {
            content: "STITCHIT TUFTING";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            font-weight: bold;
            color: rgba(255, 138, 80, 0.05);
            z-index: -1;
            white-space: nowrap;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 4px solid #FF8A50;
        }
        
        .logo {
            width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #FF8A50;
            margin-bottom: 5px;
        }
        
        .company-tagline {
            font-size: 14px;
            color: #666;
            font-style: italic;
        }
        
        .order-title {
            font-size: 24px;
            color: #333;
            margin: 30px 0 10px;
            font-weight: bold;
        }
        
        .order-ref {
            font-size: 18px;
            color: #FF8A50;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #FF8A50;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #FFE5D9;
        }
        
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-label {
            display: table-cell;
            padding: 8px 0;
            width: 30%;
            font-weight: bold;
            color: #666;
        }
        
        .info-value {
            display: table-cell;
            padding: 8px 0;
            color: #333;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            background: #FFE5D9;
            color: #FF8A50;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .items-table thead {
            background: linear-gradient(135deg, #FF8A50 0%, #FF9B71 100%);
            color: white;
        }
        
        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .items-table tbody tr:hover {
            background: #fff8f5;
        }
        
        .item-image-cell {
            width: 120px;
            text-align: center;
        }
        
        .item-image {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #f0f0f0;
        }
        
        .item-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 32px;
        }
        
        .totals-section {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #FFF5F0 0%, #FFE5D9 100%);
            border-radius: 12px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        
        .total-row.grand-total {
            font-size: 20px;
            font-weight: bold;
            color: #FF8A50;
            border-top: 2px solid #FF8A50;
            padding-top: 15px;
            margin-top: 10px;
        }
        
        .financial-cards {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        
        .financial-card {
            flex: 1;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .financial-card.total {
            background: #E3F2FD;
            border: 2px solid #2196F3;
        }
        
        .financial-card.paid {
            background: #E8F5E9;
            border: 2px solid #4CAF50;
        }
        
        .financial-card.balance {
            background: #FFF3E0;
            border: 2px solid #FFC107;
        }
        
        .financial-summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .financial-summary-table td {
            padding: 20px;
            text-align: center;
            border-right: 1px solid #f0f0f0;
            font-size: 14px;
        }
        
        .financial-summary-table td:last-child {
            border-right: none;
        }
        
        .financial-summary-table .fin-label {
            font-weight: bold;
            color: #666;
            margin-bottom: 10px;
            font-size: 12px;
            text-transform: uppercase;
        }
        
        .financial-summary-table .fin-amount {
            font-size: 24px;
            font-weight: bold;
        }
        
        .financial-summary-table .total-col { background: #E3F2FD; }
        .financial-summary-table .total-col .fin-amount { color: #2196F3; }
        
        .financial-summary-table .paid-col { background: #E8F5E9; }
        .financial-summary-table .paid-col .fin-amount { color: #4CAF50; }
        
        .financial-summary-table .balance-col { background: #FFF3E0; }
        .financial-summary-table .balance-col .fin-amount { color: #FFC107; }
        
        .financial-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .financial-amount {
            font-size: 24px;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        
        .delivery-info {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #FF8A50;
        }
        
        .notes-box {
            background: #FFF9F5;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #FFE5D9;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <img src="{{ public_path('STICHIT-01.png') }}" alt="Stitchit Tufting Logo" class="logo">
    </div>
    
    <!-- Order Title -->
    <div style="text-align: center; margin-bottom: 30px;">
        <div class="order-title">ORDER CONFIRMATION</div>
        <div class="order-ref">{{ $order->reference }}</div>
        <div style="margin-top: 10px;">
            <span class="status-badge">{{ str_replace('_', ' ', $order->state) }}</span>
        </div>
    </div>
    
    <!-- Client Information -->
    <div class="section">
        <div class="section-title">CLIENT INFORMATION</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">
                    @if($order->client->nickname)
                        {{ $order->client->full_name }} ({{ $order->client->nickname }})
                    @else
                        {{ $order->client->full_name }}
                    @endif
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">{{ $order->client->phone }}</div>
            </div>
            @if($order->client->address)
            <div class="info-row">
                <div class="info-label">Address:</div>
                <div class="info-value">{{ $order->client->address }}</div>
            </div>
            @endif
        </div>
    </div>
    
    <!-- Order Details -->
    <div class="section">
        <div class="section-title">ORDER DETAILS</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Order Date:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($order->created_at)->format('F d, Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Expected Delivery:</div>
                <div class="info-value">
                    {{ \Carbon\Carbon::parse($order->created_at)->addDays(14)->format('F d, Y') }}
                    <span style="font-size: 11px; color: #999;">(Estimated)</span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Deposit Paid:</div>
                <div class="info-value">
                    @php
                        $depositPaid = $order->payments->where('type', 'deposit')->sum('amount');
                    @endphp
                    ${{ number_format($depositPaid, 2) }}
                    @if($depositPaid > 0)
                        <span style="font-size: 11px; color: #4CAF50; font-weight: bold;">(PAID)</span>
                    @else
                        <span style="font-size: 11px; color: #999;">(Required: ${{ number_format($order->deposit_required_amount, 2) }} - {{ $order->deposit_percent }}%)</span>
                    @endif
                </div>
            </div>
        </div>
    </div>
    
    <!-- Order Items -->
    <div class="section">
        <div class="section-title">ORDER ITEMS ({{ $order->items->count() }})</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th class="item-image-cell">Design</th>
                    <th>Description</th>
                    <th style="text-align: center;">Dimensions</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td class="item-image-cell">
                        @if($item->design_image_path)
                            @php
                                $imagePath = public_path('storage/' . $item->design_image_path);
                            @endphp
                            @if(file_exists($imagePath))
                                <img src="{{ $imagePath }}" alt="{{ $item->description }}" class="item-image">
                            @else
                                <div class="item-placeholder">🎨</div>
                            @endif
                        @else
                            <div class="item-placeholder">🎨</div>
                        @endif
                    </td>
                    <td>
                        <div style="font-weight: bold;">{{ $item->description }}</div>
                        @if($item->sku)
                            <div style="font-size: 11px; color: #999;">SKU: {{ $item->sku }}</div>
                        @endif
                        <div style="font-size: 11px; color: #666;">Area: {{ number_format($item->area, 2) }} m²</div>
                    </td>
                    <td style="text-align: center;">
                        <span style="font-size: 12px;">{{ $item->width }} × {{ $item->height }} {{ $item->unit }}</span>
                    </td>
                    <td style="text-align: center;">{{ $item->quantity }}</td>
                    <td style="text-align: right; font-weight: bold;">
                        ${{ number_format($item->planned_price * $item->quantity, 2) }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    <!-- Payment History -->
    @if($order->payments->count() > 0)
    <div class="section">
        <div class="section-title">PAYMENT HISTORY</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->payments as $payment)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($payment->paid_at)->format('M d, Y') }}</td>
                    <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $payment->method) }}</td>
                    <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $payment->type) }}</td>
                    <td>{{ $payment->reference ?: '—' }}</td>
                    <td style="text-align: right; font-weight: bold; color: #4CAF50;">
                        ${{ number_format($payment->amount, 2) }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif
    
    <!-- Delivery Information -->
    @if($order->delivery_address || $order->delivery_contact)
    <div class="section">
        <div class="section-title">DELIVERY INFORMATION</div>
        <div class="delivery-info">
            @if($order->delivery_address)
                <div><strong>Address:</strong> {{ $order->delivery_address }}</div>
            @endif
            @if($order->delivery_contact)
                <div style="margin-top: 5px;"><strong>Contact:</strong> {{ $order->delivery_contact }}</div>
            @endif
        </div>
    </div>
    @endif
    
    <!-- Notes -->
    @if($order->notes)
    <div class="section">
        <div class="section-title">NOTES</div>
        <div class="notes-box">
            {{ $order->notes }}
        </div>
    </div>
    @endif
    
    <!-- Financial Summary -->
    <div class="section">
        <table class="financial-summary-table">
            <tr>
                <td class="total-col">
                    <div class="fin-label">Total Amount</div>
                    <div class="fin-amount">${{ number_format($order->total_amount, 2) }}</div>
                </td>
                <td class="paid-col">
                    <div class="fin-label">Paid</div>
                    <div class="fin-amount">${{ number_format($order->payments->sum('amount'), 2) }}</div>
                </td>
                <td class="balance-col">
                    <div class="fin-label">Balance Due</div>
                    <div class="fin-amount">${{ number_format($order->balance_due, 2) }}</div>
                </td>
            </tr>
        </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <p><strong>Thank you for choosing Stitchit Tufting!</strong></p>
        <p style="margin-top: 5px;">For inquiries, please contact us at stichiitt@gmail.com</p>
        <p style="margin-top: 10px; font-size: 10px;">
            Document generated on {{ \Carbon\Carbon::now()->format('F d, Y \a\t g:i A') }}
        </p>
    </div>
</body>
</html>
