<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;
    
    public array $virtualData = [];

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['dp_amount'] = $this->record->dp_amount;
        $data['final_payment_amount'] = $this->record->final_payment_amount;
        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $this->virtualData['dp_amount'] = $data['dp_amount'] ?? null;
        $this->virtualData['final_payment_amount'] = $data['final_payment_amount'] ?? null;
        
        unset($data['dp_amount'], $data['final_payment_amount']);
        return $data;
    }

    protected function afterSave(): void
    {
        if (isset($this->virtualData['dp_amount'])) {
            $dp = $this->record->payments()->where('type', 'dp')->first();
            if ($dp) {
                $dp->update(['amount' => $this->virtualData['dp_amount']]);
            } else if ($this->virtualData['dp_amount'] > 0) {
                $this->record->payments()->create([
                    'type' => 'dp',
                    'amount' => $this->virtualData['dp_amount'],
                    'status' => 'pending'
                ]);
            }
        }

        if (isset($this->virtualData['final_payment_amount'])) {
            $final = $this->record->payments()->where('type', 'final')->first();
            if ($final) {
                $final->update(['amount' => $this->virtualData['final_payment_amount']]);
            } else if ($this->virtualData['final_payment_amount'] > 0) {
                $this->record->payments()->create([
                    'type' => 'final',
                    'amount' => $this->virtualData['final_payment_amount'],
                    'status' => 'verified',
                    'verified_at' => \Carbon\Carbon::now(),
                ]);
            }
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
