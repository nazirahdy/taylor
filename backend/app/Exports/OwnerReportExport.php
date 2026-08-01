<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class OwnerReportExport implements FromArray, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected string $title;
    protected array $headers;
    protected array $rows;
    protected array $summary;

    public function __construct(string $title, array $headers, array $rows, array $summary = [])
    {
        $this->title   = $title;
        $this->headers = $headers;
        $this->rows    = $rows;
        $this->summary = $summary;
    }

    public function array(): array
    {
        if (empty($this->summary)) {
            return $this->rows;
        }

        $rows = $this->rows;
        $rows[] = [];

        foreach ($this->summary as $label => $value) {
            $rows[] = ["{$label}: {$value}"];
        }

        return $rows;
    }

    public function headings(): array
    {
        return $this->headers;
    }

    public function title(): string
    {
        return mb_substr($this->title, 0, 31);
    }

    public function styles(Worksheet $sheet): array
    {
        $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($this->headers));
        $headerRange = "A1:{$lastCol}1";

        $styles = [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1A5C4A'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];

        if (! empty($this->summary)) {
            // +1 header row, +1 blank spacer row, then summary rows begin
            $summaryStartRow = 1 + count($this->rows) + 2;
            $summaryEndRow = $summaryStartRow + count($this->summary) - 1;

            $styles["A{$summaryStartRow}:A{$summaryEndRow}"] = [
                'font' => ['bold' => true, 'color' => ['rgb' => '1A5C4A']],
            ];
        }

        return $styles;
    }
}
