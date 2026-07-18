<x-filament-panels::page>
    <x-filament::card class="overflow-hidden border-0 shadow-sm">
        <!-- Header Section -->
        <div class="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white relative overflow-hidden shadow-lg animate-fade-in">
            <div class="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>
            <div class="absolute left-1/3 bottom-0 -mb-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"></div>
            
            <div class="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-amber-500 text-slate-950 rounded-md">Owner Dashboard</span>
                    </div>
                    <h2 class="text-3xl font-extrabold tracking-tight">Portal Laporan & Analisis</h2>
                    <p class="mt-2 max-w-2xl text-sm text-slate-300">Pantau performa keuangan toko, tinjau riwayat pembayaran masuk (DP & Pelunasan), serta unduh dokumen laporan.</p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md min-w-[200px] shadow-inner">
                    <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Omzet Realisasi</div>
                    <div class="mt-1 text-3xl font-black text-amber-400">Rp {{ number_format($totalOmzet, 0, ',', '.') }}</div>
                </div>
            </div>
        </div>

        <!-- Langkah 1: Saring Berdasarkan Periode -->
        <div class="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <div class="flex items-center gap-3 mb-4">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-extrabold text-sm">1</div>
                <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Langkah 1: Tentukan Periode Data</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Tentukan rentang tanggal untuk menyaring statistik dashboard dan data pada dokumen laporan.</p>
                </div>
            </div>
            <form method="GET" action="" class="grid gap-4 md:grid-cols-3 md:items-end">
                <div>
                    <label for="start_date" class="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tanggal Mulai</label>
                    <div class="relative mt-1.5">
                        <input type="date" name="start_date" id="start_date" value="{{ $startDate }}" class="block w-full rounded-xl border-gray-200 bg-slate-50 px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-amber-500 focus:bg-white focus:ring-amber-500 dark:border-gray-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900">
                    </div>
                </div>
                <div>
                    <label for="end_date" class="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tanggal Selesai</label>
                    <div class="relative mt-1.5">
                        <input type="date" name="end_date" id="end_date" value="{{ $endDate }}" class="block w-full rounded-xl border-gray-200 bg-slate-50 px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-amber-500 focus:bg-white focus:ring-amber-500 dark:border-gray-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900">
                    </div>
                </div>
                <div class="flex gap-2">
                    <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                        </svg>
                        Terapkan Filter
                    </button>
                    @if($startDate || $endDate)
                        <a href="{{ request()->url() }}" class="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition dark:border-gray-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900">
                            Reset
                        </a>
                    @endif
                </div>
            </form>
        </div>

        <!-- Langkah 2: Ringkasan Finansial & Statistik -->
        <div class="mt-8">
            <div class="mb-5 flex items-center gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-extrabold text-sm">2</div>
                <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Langkah 2: Ringkasan Finansial & Statistik</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Total akumulasi transaksi toko berdasarkan filter periode yang diterapkan.</p>
                </div>
            </div>
            
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                @php
                    $stats = [
                        ['label' => 'Total Transaksi', 'value' => $transactionsCount, 'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 'tone' => 'from-emerald-500 to-green-600'],
                        ['label' => 'Total Pembayaran DP', 'value' => 'Rp ' . number_format($dpTotal, 0, ',', '.'), 'icon' => 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'tone' => 'from-blue-500 to-cyan-600'],
                        ['label' => 'Total Pelunasan', 'value' => 'Rp ' . number_format($finalTotal, 0, ',', '.'), 'icon' => 'M5 13l4 4L19 7', 'tone' => 'from-violet-500 to-purple-600'],
                        ['label' => 'Jumlah Data DP', 'value' => $dpPayments->count(), 'icon' => 'M3 10h18M7 15h.01M11 15h.01M15 15h.01M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z', 'tone' => 'from-amber-500 to-orange-600'],
                    ];
                @endphp

                @foreach ($stats as $stat)
                    <div class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-slate-900">
                        <div class="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b {{ $stat['tone'] }}"></div>
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ $stat['label'] }}</div>
                                <div class="mt-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white">{{ $stat['value'] }}</div>
                            </div>
                            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br {{ $stat['tone'] }} text-white shadow-md shadow-gray-200/50 dark:shadow-none transition-transform duration-300 group-hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="{{ $stat['icon'] }}" />
                                </svg>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Langkah 3: Pilihan Unduh Laporan -->
        <div class="mt-8 rounded-2xl border border-gray-100 bg-slate-50/50 p-6 dark:border-gray-800 dark:bg-slate-900/40">
            <div class="mb-6 flex items-center gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-extrabold text-sm">3</div>
                <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Langkah 3: Unduh Dokumen Laporan</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Pilih jenis laporan di bawah ini. Poin-poin rincian data menjelaskan isi dari setiap jenis laporan.</p>
                </div>
            </div>

            <div class="space-y-4">
                @php
                    $reports = [
                        [
                            'title' => 'Laporan Omzet Penjualan',
                            'desc' => 'Laporan khusus untuk memantau pendapatan bersih riil dari pesanan pelanggan yang sudah selesai/lunas.',
                            'points' => [
                                'Menyaring data pesanan dengan status: Completed, Finished, & Paid.',
                                'Menampilkan harga estimasi pesanan sebagai omzet terealisasi.',
                                'Berguna sebagai referensi omzet bersih dan laba kotor toko.'
                            ],
                            'type' => 'omzet',
                            'route' => 'export.omzet',
                            'accent' => 'from-amber-500 to-orange-500'
                        ],
                        [
                            'title' => 'Laporan Semua Transaksi',
                            'desc' => 'Daftar kumulatif dari seluruh transaksi pesanan pelanggan tanpa memandang status pembayaran.',
                            'points' => [
                                'Menampilkan status pemesanan lengkap (baru masuk, diproses, selesai, ditolak).',
                                'Dilengkapi nama pelanggan, tanggal pesan, serta harga estimasi.',
                                'Ideal untuk audit volume transaksi dan operasional toko.'
                            ],
                            'type' => 'transaksi',
                            'route' => 'export.reports',
                            'accent' => 'from-indigo-500 to-purple-500'
                        ],
                        [
                            'title' => 'Laporan Pembayaran DP (Down Payment)',
                            'desc' => 'Riwayat pembayaran uang muka (DP) pelanggan sebagai tanda jadi pengerjaan pesanan.',
                            'points' => [
                                'Hanya memuat daftar pembayaran bertipe uang muka (DP).',
                                'Dilengkapi rincian tanggal pembayaran, metode transfer, dan status verifikasi.',
                                'Berguna untuk melacak arus kas masuk awal.'
                            ],
                            'type' => 'dp',
                            'route' => 'export.reports',
                            'accent' => 'from-blue-500 to-cyan-500'
                        ],
                        [
                            'title' => 'Laporan Pelunasan Pembayaran',
                            'desc' => 'Riwayat pembayaran sisa dari total tagihan untuk penyelesaian transaksi pesanan.',
                            'points' => [
                                'Hanya memuat daftar pembayaran akhir bertipe pelunasan.',
                                'Mencatat tanggal pelunasan, nominal pembayaran, dan status persetujuan verifikasi.',
                                'Berguna melacak pesanan selesai dikerjakan yang siap diambil.'
                            ],
                            'type' => 'pelunasan',
                            'route' => 'export.reports',
                            'accent' => 'from-violet-500 to-fuchsia-500'
                        ],
                        [
                            'title' => 'Laporan Ringkasan Keuangan & Sisa Tagihan',
                            'desc' => 'Lembar peta finansial untuk memantau status utang piutang tagihan pelanggan.',
                            'points' => [
                                'Membandingkan harga estimasi, nominal DP, nominal pelunasan, & sisa sisa tagihan.',
                                'Menampilkan label status pelunasan (Belum Lunas / Lunas / Belum Ada Pembayaran).',
                                'Sangat penting untuk penagihan sisa pembayaran piutang pelanggan.'
                            ],
                            'type' => 'keuangan',
                            'route' => 'export.reports',
                            'accent' => 'from-emerald-500 to-teal-500'
                        ],
                    ];
                @endphp

                @foreach ($reports as $report)
                    <div class="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-slate-900">
                        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <!-- Left: Details & Points -->
                            <div class="flex-1">
                                <div class="flex items-center gap-2.5">
                                    <span class="h-3 w-3 rounded-full bg-gradient-to-br {{ $report['accent'] }}"></span>
                                    <h4 class="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wide">{{ $report['title'] }}</h4>
                                </div>
                                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-4xl">{{ $report['desc'] }}</p>
                                
                                <!-- Bullet points -->
                                <ul class="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                    @foreach ($report['points'] as $point)
                                        <li class="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{{ $point }}</span>
                                        </li>
                                    @endforeach
                                </ul>
                            </div>

                            <!-- Right: Download Buttons -->
                            <div class="flex flex-row gap-2 shrink-0 lg:w-44 lg:flex-col">
                                @php
                                    $queryParams = ['format' => 'pdf'];
                                    if ($report['route'] === 'export.reports') {
                                        $queryParams['type'] = $report['type'];
                                    }
                                    if ($startDate) $queryParams['start_date'] = $startDate;
                                    if ($endDate) $queryParams['end_date'] = $endDate;
                                    $targetRoute = $report['route'];
                                @endphp
                                <a href="{{ route($targetRoute, array_merge($queryParams, ['format' => 'pdf'])) }}" target="_blank" class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-rose-600 hover:to-red-700 transition duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    PDF
                                </a>
                                <a href="{{ route($targetRoute, array_merge($queryParams, ['format' => 'excel'])) }}" target="_blank" class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 transition duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Excel
                                </a>
                                <a href="{{ route($targetRoute, array_merge($queryParams, ['format' => 'word'])) }}" target="_blank" class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-sky-600 hover:to-blue-700 transition duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Word
                                </a>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Langkah 4: Rincian Transaksi Terbaru -->
        <div class="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <div class="border-b border-gray-100 bg-slate-50/50 px-5 py-4 dark:border-gray-800 dark:bg-slate-900/50 flex items-center gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-extrabold text-sm">4</div>
                <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Langkah 4: Rincian Transaksi Terbaru</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Daftar order completed/finished/paid yang saat ini terpengaruh oleh penyaringan tanggal.</p>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-slate-950 dark:text-gray-400">
                        <tr>
                            <th class="px-5 py-3.5">No. Pesanan</th>
                            <th class="px-5 py-3.5">Tanggal Pesan</th>
                            <th class="px-5 py-3.5">Pelanggan</th>
                            <th class="px-5 py-3.5">Status</th>
                            <th class="px-5 py-3.5 text-right">Harga (Rp)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse($orders as $order)
                            <tr class="bg-white hover:bg-slate-50/50 transition duration-150 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                <td class="px-5 py-4 font-semibold text-gray-900 dark:text-white">{{ $order->order_number }}</td>
                                <td class="px-5 py-4 text-gray-600 dark:text-gray-300">{{ optional($order->order_date)->format('d M Y') ?? '-' }}</td>
                                <td class="px-5 py-4 text-gray-600 dark:text-gray-300">{{ $order->user->name ?? '-' }}</td>
                                <td class="px-5 py-4">
                                    @php
                                        $status = strtolower($order->status);
                                        $badgeClass = 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
                                        if ($status === 'completed') {
                                            $badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
                                        } elseif ($status === 'finished') {
                                            $badgeClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
                                        } elseif ($status === 'paid') {
                                            $badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
                                        }
                                    @endphp
                                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {{ $badgeClass }}">
                                        {{ ucfirst($order->status) }}
                                    </span>
                                </td>
                                <td class="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">Rp {{ number_format($order->estimated_price, 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                                    Tidak ada data transaksi terbaru dalam rentang tanggal ini.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </x-filament::card>
</x-filament-panels::page>
