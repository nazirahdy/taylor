<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 10px; 
            color: #334155; 
            line-height: 1.5;
            margin: 0;
            padding: 10px;
        }
        .header-container {
            border-bottom: 3px solid #79D12A;
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
        table.data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
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
            border-bottom: 2px solid #cbd5e1;
        }
        table.data-table td { 
            padding: 8px 10px; 
            border-bottom: 1px solid #e2e8f0; 
            color: #334155;
            font-size: 9px;
            vertical-align: middle;
        }
        table.data-table tr:nth-child(even) td { 
            background-color: #f8fafc; 
        }
        .summary-container {
            margin-top: 18px;
            width: 100%;
        }
        .summary-box {
            display: inline-block;
            vertical-align: top;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 12px;
            margin-right: 8px;
            margin-bottom: 8px;
            width: 30%;
            box-sizing: border-box;
        }
        .summary-label {
            display: block;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: bold;
        }
        .summary-value {
            display: block;
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 3px;
        }
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
        <div class="report-title">{{ $title }}</div>
        <div class="period-badge">
            Periode: {{ $startDate || $endDate ? ($startDate ?? 'Awal') . ' sampai ' . ($endDate ?? 'Akhir') : 'Semua Data' }}
        </div>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                @foreach ($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    @foreach ($row as $value)
                        <td>{{ $value }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($headers) }}" style="text-align: center; color: #94a3b8; padding: 20px; font-size: 10px;">Tidak ada data laporan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if (!empty($summary))
        <div class="summary-container">
            @foreach ($summary as $summaryLabel => $summaryValue)
                <div class="summary-box">
                    <span class="summary-label">{{ $summaryLabel }}</span>
                    <span class="summary-value">{{ $summaryValue }}</span>
                </div>
            @endforeach
        </div>
    @endif

    <div class="footer">
        Dicetak otomatis oleh Taylor System pada {{ now()->format('d M Y H:i') }}
    </div>
</body>
</html>
