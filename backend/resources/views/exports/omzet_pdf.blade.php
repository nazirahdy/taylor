<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Omzet</title>
    <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 11px; 
            color: #334155; 
            line-height: 1.5;
            margin: 0;
            padding: 10px;
        }
        .header-container {
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: -0.5px;
        }
        .report-title {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin-top: 4px;
            font-weight: bold;
        }
        .period-badge {
            display: inline-block;
            background: #f1f5f9;
            color: #475569;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 6px;
            font-size: 10px;
        }
        table.summary-table {
            width: 100%;
            border: none;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        table.summary-table td {
            border: none;
            padding: 0;
            background: none;
        }
        .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
        }
        .summary-card.highlighted {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            border-left: 4px solid #f59e0b;
        }
        .summary-label {
            font-size: 8px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 3px;
            font-weight: 600;
        }
        .summary-label.highlighted {
            color: #b45309;
        }
        .summary-value {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
        }
        .summary-value.highlighted {
            color: #b45309;
        }
        table.data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
        }
        table.data-table th { 
            background-color: #0f172a; 
            color: #ffffff; 
            font-weight: 600; 
            text-transform: uppercase; 
            font-size: 8px; 
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
        }
        table.data-table td { 
            padding: 8px 10px; 
            border-bottom: 1px solid #e2e8f0; 
            color: #334155;
            font-size: 10px;
        }
        table.data-table tr:nth-child(even) td { 
            background-color: #f8fafc; 
        }
        .text-right { 
            text-align: right; 
        }
        .status-pill {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-completed { background-color: #dcfce7; color: #15803d; }
        .status-finished { background-color: #dbeafe; color: #1d4ed8; }
        .status-paid { background-color: #fef9c3; color: #a16207; }
        .status-other { background-color: #f1f5f9; color: #475569; }
        .footer {
            margin-top: 30px;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header-container">
        <div class="company-name">TAYLOR PANEL</div>
        <div class="report-title">Laporan Omzet Realisasi</div>
        <div class="period-badge">
            Periode: {{ $startDate || $endDate ? ($startDate ?? 'Awal') . ' sampai ' . ($endDate ?? 'Akhir') : 'Semua Data' }}
        </div>
    </div>
    
    <table class="summary-table">
        <tr>
            <td style="width: 32%; padding-right: 10px;">
                <div class="summary-card">
                    <div class="summary-label">Total Pesanan Omzet</div>
                    <div class="summary-value">{{ count($orders) }}</div>
                </div>
            </td>
            <td style="width: 32%; padding-right: 10px;">
                <div class="summary-card">
                    <div class="summary-label">Tanggal Cetak</div>
                    <div class="summary-value" style="font-size: 13px; font-weight: bold; padding: 1px 0;">{{ now()->format('d M Y') }}</div>
                </div>
            </td>
            <td style="width: 36%;">
                <div class="summary-card highlighted">
                    <div class="summary-label highlighted">Total Omzet</div>
                    <div class="summary-value highlighted">Rp {{ number_format($totalOmzet, 0, ',', '.') }}</div>
                </div>
            </td>
        </tr>
    </table>
    
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25%;">No. Pesanan</th>
                <th style="width: 20%;">Tanggal</th>
                <th style="width: 25%;">Pelanggan</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 15%; text-align: right;">Harga (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
                <tr>
                    <td style="font-weight: bold; color: #0f172a;">{{ $order->order_number }}</td>
                    <td>{{ $order->order_date->format('d M Y') }}</td>
                    <td>{{ $order->user->name ?? '-' }}</td>
                    <td>
                        @php
                            $status = strtolower($order->status);
                            $class = 'status-other';
                            if ($status === 'completed') $class = 'status-completed';
                            elseif ($status === 'finished') $class = 'status-finished';
                            elseif ($status === 'paid') $class = 'status-paid';
                        @endphp
                        <span class="status-pill {{ $class }}">{{ ucfirst($order->status) }}</span>
                    </td>
                    <td class="text-right" style="font-weight: bold; color: #0f172a;">{{ number_format($order->estimated_price, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dicetak otomatis oleh Taylor System pada {{ now()->format('d M Y H:i') }}
    </div>
</body>
</html>
