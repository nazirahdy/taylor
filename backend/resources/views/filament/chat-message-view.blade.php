<div class="bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800">
    <div class="bg-slate-900 px-6 py-5 border-b border-slate-700">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 class="text-xl font-semibold text-white">Chat Percakapan</h2>
                <p class="text-sm text-slate-400">Tampilan pesan bergaya WhatsApp dengan label "Dari" pada setiap balon.</p>
            </div>
            <div class="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-300">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Online
            </div>
        </div>
    </div>

    <div class="max-h-[70vh] overflow-y-auto bg-gray-50 px-8 py-8 space-y-6">
        @if($messages->isEmpty())
            <div class="rounded-3xl bg-white px-6 py-10 text-center text-gray-400 border border-gray-200">
                Tidak ada pesan untuk percakapan ini.
            </div>
        @endif

        @foreach($messages as $msg)
            @php
                $isAdmin = ($msg->sender?->role === 'admin') || $msg->is_admin;
                $senderName = $isAdmin ? 'Admin Era Jahit' : ($msg->sender?->name ?: 'Pelanggan');
            @endphp
            <div class="flex w-full {{ $isAdmin ? 'justify-end' : 'justify-start' }}">
                <div class="flex flex-col max-w-[85%] md:max-w-[70%] {{ $isAdmin ? 'items-end' : 'items-start' }}">
                    @if(!$isAdmin)
                        <span class="text-[9px] text-primary-600 font-bold uppercase tracking-widest mb-2 ml-1 font-sans">
                            {{ $senderName }}
                        </span>
                    @endif
                    <div class="p-6 rounded-2xl relative text-[14px] font-sans leading-relaxed shadow-sm
                        {{ $isAdmin ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/10 rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none' }}">
                        {!! nl2br(e($msg->message)) !!}
                    </div>
                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2 font-sans">
                        {{ $msg->created_at ? $msg->created_at->format('H:i') : '...' }}
                    </span>
                </div>
            </div>
        @endforeach
    </div>
</div>
