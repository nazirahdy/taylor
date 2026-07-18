<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OmzetExport implements FromCollection, WithHeadings, WithMapping
{
    protected $orders;
    protected $totalOmzet;

    public function __construct($orders, $totalOmzet)
    {
        $this->orders = $orders;
        $this->totalOmzet = $totalOmzet;
    }

    public function collection()
    {
        return $this->orders;
    }

    public function map($order): array
    {
        return [
            $order->order_number,
            $order->order_date->format('d M Y'),
            $order->user->name ?? '-',
            $order->status,
            $order->estimated_price,
        ];
    }

    public function headings(): array
    {
        return [
            ['Total Omzet: Rp ' . number_format($this->totalOmzet, 0, ',', '.')],
            [''], // empty row
            [
                'No. Pesanan',
                'Tanggal Pesan',
                'Pelanggan',
                'Status',
                'Harga (Rp)',
            ]
        ];
    }
}
