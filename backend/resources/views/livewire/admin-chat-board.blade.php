<div 
    x-data="{
        userScrolledUp: false,
        scrollToBottom(force = false) {
            this.$nextTick(() => {
                const body = this.$refs.chatBody;
                if (!body) return;
                if (force || !this.userScrolledUp) {
                    body.scrollTop = body.scrollHeight;
                }
            });
        },
        handleScroll() {
            const body = this.$refs.chatBody;
            if (!body) return;
            const distanceToBottom = body.scrollHeight - body.scrollTop - body.clientHeight;
            this.userScrolledUp = distanceToBottom > 80;
        },
        initScroll() {
            const doScroll = () => {
                const body = this.$refs.chatBody;
                if (body) {
                    body.scrollTop = body.scrollHeight;
                }
            };
            doScroll();
            this.$nextTick(doScroll);
            setTimeout(doScroll, 100);
            setTimeout(doScroll, 300);
        }
    }"
    x-init="
        initScroll();
        Livewire.hook('morph.updated', ({ component, el }) => {
            if ($el.contains(el) || el === $el) {
                scrollToBottom(false);
            }
        });
    "
    class="flex flex-col bg-white overflow-hidden w-full" 
    style="height: 480px; display: flex; flex-direction: column;"
    wire:poll.3s
>

    <!-- Chat Body -->
    <div 
        x-ref="chatBody" 
        @scroll.passive="handleScroll()" 
        class="flex-grow overflow-y-auto p-4 space-y-4 bg-[#f8f5f0] rounded-xl border border-gray-200/80 mb-3" 
        id="chat-body-{{ $this->getId() }}"
        style="flex: 1 1 auto; overflow-y: auto;"
    >
        @if(auth()->guest())
            <div class="text-center text-gray-500 mt-10 text-sm font-sans bg-white/70 py-3 mx-6 rounded-lg border border-gray-200">
                <p>Silakan login admin untuk membuka percakapan chat.</p>
            </div>
        @elseif(!$orderId && !$sessionId)
            <div class="text-center text-gray-500 mt-10 text-sm font-sans bg-white/70 py-3 mx-6 rounded-lg border border-gray-200">
                <p>Data chat tidak tersedia. Pastikan percakapan sudah dibuat terlebih dahulu.</p>
            </div>
        @elseif($this->messages->isEmpty())
            <div class="text-center text-gray-500 mt-10 text-sm font-sans bg-white/70 py-3 mx-6 rounded-lg border border-gray-200">
                <p>Belum ada pesan dalam percakapan ini.</p>
            </div>
        @endif

        @foreach($this->messages as $msg)
            @php
                $isAdmin = $msg->is_admin;
                $senderName = $isAdmin ? 'Admin Era Jahit' : ($msg->sender?->name ?: 'Pelanggan');
                $initial = strtoupper(substr($senderName, 0, 1));
            @endphp
            <div class="flex w-full mb-3 {{ $isAdmin ? 'justify-end' : 'justify-start' }} group relative">
                
                @if(!$isAdmin)
                    <!-- Avatar Pelanggan -->
                    <div class="w-8 h-8 text-white flex items-center justify-center font-bold text-xs mr-2 flex-shrink-0 mt-1 shadow-sm rounded-full" style="background-color: #79D12A;">
                        {{ $initial }}
                    </div>
                @endif

                <div class="flex flex-col max-w-[75%]">
                    <div class="flex items-center gap-2 {{ $isAdmin ? 'flex-row-reverse' : 'flex-row' }}">
                        <!-- Message Bubble -->
                        @if($editingMessageId === $msg->id)
                            <div class="flex flex-col gap-2 bg-white p-3 shadow-md border border-gray-200 w-[260px] rounded-lg">
                                <textarea wire:model="editingMessageText" class="w-full border border-gray-300 text-sm p-2 focus:ring-green-500 focus:border-green-500 rounded-md" rows="3"></textarea>
                                <div class="flex justify-end gap-2 mt-1">
                                    <button wire:click="cancelEdit" class="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-md">Batal</button>
                                    <button wire:click="saveEdit" class="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 text-white rounded-md" style="background-color: #79D12A;">Simpan</button>
                                </div>
                            </div>
                        @else
                            <div class="px-4 py-2.5 text-[13px] leading-relaxed shadow-sm font-sans break-words relative min-w-[100px]"
                                style="{{ $isAdmin ? 'background-color: #e4e2e2ff; color: #3f3c3cff; border-radius: 12px 2px 12px 12px;' : 'background-color: #e4e2e2ff; color: #3f3c3cff; border: 1px solid #e5e7eb; border-radius: 2px 12px 12px 12px;' }}">
                                
                                <!-- Sender Name Inside Bubble -->
                                <div class="text-[10px] font-bold mb-0.5" style="color: {{ $isAdmin ? 'rgba(91, 92, 95, 0.85)' : '#6b7280' }}">
                                    {{ $senderName }}
                                </div>

                                <!-- Text -->
                                <div class="whitespace-pre-line font-medium">
                                    {!! e($msg->message) !!}
                                </div>

                                <!-- Time -->
                                <div class="text-[9px] text-right mt-1 italic" style="color: {{ $isAdmin ? '#6b7280' : '#6b7280' }}">
                                    {{ $msg->created_at ? $msg->created_at->format('H:i') : '' }}
                                </div>
                            </div>
                        @endif

                        <!-- Actions (Edit/Delete) only for Admin -->
                        @if($isAdmin && $editingMessageId !== $msg->id)
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex {{ $isAdmin ? 'flex-row-reverse mr-1' : 'ml-1' }} gap-1">
                                <button wire:click="startEdit({{ $msg->id }}, '{{ addslashes($msg->message) }}')" class="p-1 text-gray-400 hover:text-blue-500 bg-white hover:bg-blue-50 shadow-sm transition-colors rounded" title="Edit Pesan">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                                <button wire:click="deleteMessage({{ $msg->id }})" onclick="return confirm('Hapus pesan ini?')" class="p-1 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 shadow-sm transition-colors rounded" title="Hapus Pesan">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        @endif
                    </div>
                </div>

                @if($isAdmin)
                    <!-- Avatar Admin -->
                    <div class="w-8 h-8 text-white flex items-center justify-center font-bold text-xs ml-2 flex-shrink-0 mt-1 shadow-sm rounded-full" style="background-color: #79D12A;">
                        A
                    </div>
                @endif
            </div>
        @endforeach
    </div>

    <!-- Input Box -->
    <div class="pt-1 pb-1 bg-white flex-shrink-0" style="flex-shrink: 0;">
        <form wire:submit.prevent="sendMessage" @submit="userScrolledUp = false; setTimeout(() => scrollToBottom(true), 150)" class="flex gap-2 items-center w-full">
            <input 
                type="text" 
                wire:model="newMessage" 
                placeholder="Tulis pesan..." 
                class="flex-1 w-full min-w-0 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-sans rounded-full bg-gray-50 focus:bg-white"
                style="outline: none;"
            />
            <button 
                type="submit" 
                class="text-white flex items-center justify-center transition-transform hover:scale-105 flex-shrink-0 rounded-full shadow-sm"
                style="background-color: #79D12A; width: 40px; height: 40px; min-width: 40px;"
            >
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 18px; height: 18px; margin-left: -2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </form>
    </div>
</div>
