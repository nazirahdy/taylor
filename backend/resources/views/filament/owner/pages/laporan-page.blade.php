<x-filament-panels::page>
    <x-filament::tabs class="mb-4">
        <x-filament::tabs.item 
            wire:click="$set('activeTab', 'transaksi')" 
            :active="$activeTab === 'transaksi'">
            Laporan Transaksi
        </x-filament::tabs.item>
        

        <x-filament::tabs.item 
            wire:click="$set('activeTab', 'dp')" 
            :active="$activeTab === 'dp'">
            Pembayaran DP
        </x-filament::tabs.item>
        
        <x-filament::tabs.item 
            wire:click="$set('activeTab', 'pelunasan')" 
            :active="$activeTab === 'pelunasan'">
            Pelunasan Pembayaran
        </x-filament::tabs.item>
    </x-filament::tabs>

    <div class="mt-4">
        @if ($activeTab === 'transaksi')
            @livewire(\App\Livewire\Owner\LaporanTransaksiTable::class)

        @elseif ($activeTab === 'dp')
            @livewire(\App\Livewire\Owner\LaporanDpTable::class)
        @elseif ($activeTab === 'pelunasan')
            @livewire(\App\Livewire\Owner\LaporanPelunasanTable::class)
        @endif
    </div>
</x-filament-panels::page>
