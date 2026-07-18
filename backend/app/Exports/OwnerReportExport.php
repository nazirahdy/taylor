<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OwnerReportExport implements FromCollection, WithHeadings
{
    public function __construct(
        protected string $title,
        protected array $headers,
        protected array $rows,
    ) {
    }

    public function collection(): Collection
    {
        return new Collection($this->rows);
    }

    public function headings(): array
    {
        return $this->headers;
    }
}
