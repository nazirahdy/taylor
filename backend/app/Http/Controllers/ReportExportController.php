<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

use App\Exports\OwnerReportExport;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;

class ReportExportController extends Controller
{


    public function exportReport(Request $request)
    {
        $type = $request->get('type', 'pesanan');
        $format = $request->get('format', 'pdf');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $status = $request->get('status', 'semua');

        $reportData = $this->buildReportData($type, $status, $startDate, $endDate);

        if ($format === 'excel') {
            return Excel::download(
                new OwnerReportExport($reportData['title'], $reportData['headers'], $reportData['rows']),
                $reportData['filename'] . '.xlsx'
            );
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.owner_report_pdf', [
                'title' => $reportData['title'],
                'headers' => $reportData['headers'],
                'rows' => $reportData['rows'],
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);

            return $pdf->download($reportData['filename'] . '.pdf');
        }

        if ($format === 'word') {
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();

            $section->addText($reportData['title'], ['bold' => true, 'size' => 16]);
            if ($startDate || $endDate) {
                $start = $startDate ?? 'Awal';
                $end = $endDate ?? 'Akhir';
                $section->addText("Periode: $start sampai $end");
            } else {
                $section->addText('Periode: Semua Data');
            }
            $section->addText("Status Filter: " . ucfirst($status));
            $section->addText('');

            $table = $section->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 50]);
            $table->addRow();

            foreach ($reportData['headers'] as $header) {
                $table->addCell(2000)->addText($header, ['bold' => true]);
            }

            foreach ($reportData['rows'] as $row) {
                $table->addRow();
                foreach ($row as $value) {
                    $table->addCell(2000)->addText((string) $value);
                }
            }

            $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
            $tempFile = tempnam(sys_get_temp_dir(), 'word');
            $objWriter->save($tempFile);

            return response()->download($tempFile, $reportData['filename'] . '.docx')->deleteFileAfterSend(true);
        }

        return abort(404);
    }

    protected function buildReportData(string $type, string $status, ?string $startDate, ?string $endDate): array
    {
        if (! in_array($type, ['pesanan', 'transaksi', 'pelunasan', 'dp'], true)) {
            abort(404);
        }

        if ($type === 'dp') {
            $query = Payment::query()->where('type', 'dp')->with(['order.user']);
            if ($startDate) $query->where('created_at', '>=', $startDate . ' 00:00:00');
            if ($endDate) $query->where('created_at', '<=', $endDate . ' 23:59:59');

            $items = $query->get();

            return [
                'title' => 'Laporan Pembayaran DP',
                'filename' => 'Laporan_DP',
                'headers' => ['No. Pesanan', 'Pelanggan', 'Tanggal Upload', 'Tanggal Verifikasi', 'Nominal DP', 'Status'],
                'rows' => $items->map(function (Payment $payment) {
                    return [
                        $payment->order->order_number ?? '-',
                        $payment->order->user->name ?? '-',
                        $payment->created_at->format('d M Y H:i'),
                        $payment->verified_at ? $payment->verified_at->format('d M Y H:i') : '-',
                        'Rp ' . number_format($payment->amount, 0, ',', '.'),
                        ucfirst($payment->status),
                    ];
                })->all(),
            ];
        }

        $query = Order::query()->with(['user', 'payments']);

        if ($startDate) {
            $query->where('order_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('order_date', '<=', $endDate);
        }

        if ($type === 'pesanan' || $type === 'transaksi') {
            if ($status && $status !== 'semua') {
                $query->where('status', $status);
            }
        } elseif ($type === 'pelunasan') {
            if ($status === 'lunas') {
                $query->whereRaw('estimated_price > 0 AND (select coalesce(sum(amount), 0) from payments where order_id = orders.id) >= estimated_price');
            } elseif ($status === 'belum_lunas') {
                $query->whereRaw('(select coalesce(sum(amount), 0) from payments where order_id = orders.id) < estimated_price');
            }
        }

        $items = $query->get();

        return match ($type) {
            'pesanan', 'transaksi' => [
                'title' => 'Laporan Pesanan Pelanggan',
                'filename' => 'Laporan_Pesanan',
                'headers' => ['No. Pesanan', 'Tanggal Pesan', 'Pelanggan', 'WhatsApp', 'Metode', 'Status', 'Total DP', 'Lunas', 'Tgl Janji'],
                'rows' => $items->map(function (Order $order) {
                    return [
                        $order->order_number,
                        optional($order->order_date)->format('d M Y') ?? '-',
                        $order->user->name ?? '-',
                        $order->user->phone_wa ?? '-',
                        $order->method === 'home_service' ? 'Home Service' : 'Booking ke Toko',
                        ucfirst($order->status),
                        'Rp ' . number_format($order->dp_amount, 0, ',', '.'),
                        $order->is_fully_paid ? 'Lunas' : 'Belum Lunas',
                        optional($order->quota_date)->format('d M Y') ?? '-',
                    ];
                })->all(),
            ],
            'pelunasan' => [
                'title' => 'Laporan Pelunasan Pembayaran',
                'filename' => 'Laporan_Pelunasan',
                'headers' => ['No. Pesanan', 'Pelanggan', 'WhatsApp', 'Estimasi Harga', 'Total DP', 'Pelunasan', 'Total Dibayar', 'Sisa Tagihan', 'Status Pelunasan'],
                'rows' => $items->map(function (Order $order) {
                    $dpAmount = (float) $order->dp_amount;
                    $finalAmount = (float) $order->final_payment_amount;
                    $totalPaid = $dpAmount + $finalAmount;
                    $remaining = (float) $order->estimated_price - $totalPaid;

                    return [
                        $order->order_number,
                        $order->user->name ?? '-',
                        $order->user->phone_wa ?? '-',
                        'Rp ' . number_format($order->estimated_price, 0, ',', '.'),
                        'Rp ' . number_format($dpAmount, 0, ',', '.'),
                        'Rp ' . number_format($finalAmount, 0, ',', '.'),
                        'Rp ' . number_format($totalPaid, 0, ',', '.'),
                        'Rp ' . number_format(max($remaining, 0), 0, ',', '.'),
                        $order->payment_status_label ?? '-',
                    ];
                })->all(),
            ],
        };
    }
}
