<script setup lang="ts">
import { ref } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Cancel01Icon, Copy01Icon, Link01Icon, RefreshIcon, UserAdd01Icon } from '@hugeicons/core-free-icons'
import type { PlayerColor } from '~/types/ludo'
import type { RoomSession, UserProfile } from '~/types/user'

const props = defineProps<{
  isOpen: boolean
  room: RoomSession
  inviteUrl: string
  copiedToast: boolean
  profile: UserProfile
  isConnected?: boolean
  isReconnecting?: boolean
  myAssignedColor?: PlayerColor | null
  roomOccupants?: Array<{ id: string; name: string; avatar: string; color?: PlayerColor; isHost: boolean }>
  assignedColors?: Record<PlayerColor, string | null>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copyLink'): void
  (e: 'copyCode'): void
  (e: 'joinRoom', code: string): void
  (e: 'newRoom'): void
  (e: 'claimSlot', color: PlayerColor): void
}>()

const inputRoomCode = ref('')

const handleJoin = () => {
  if (inputRoomCode.value.trim()) {
    emit('joinRoom', inputRoomCode.value)
    inputRoomCode.value = ''
    emit('close')
  }
}

const colorNames: Record<PlayerColor, string> = {
  red: 'লাল (Red)',
  green: 'সবুজ (Green)',
  yellow: 'হলুদ (Yellow)',
  blue: 'নীল (Blue)'
}

const colorBg: Record<PlayerColor, string> = {
  red: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  blue: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none"
  >
    <div class="relative w-full max-w-lg bg-surface border-2 border-border rounded-sm shadow-2xl p-6">
      <button
        type="button"
        class="absolute top-4 right-4 p-1.5 rounded-sm bg-slate-900 border border-border text-neutral-400 hover:text-white transition-colors cursor-pointer"
        @click="emit('close')"
      >
        <HugeiconsIcon
          :icon="Cancel01Icon"
          :size="16"
        />
      </button>

      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <HugeiconsIcon
              :icon="UserAdd01Icon"
              :size="18"
            />
          </div>
          <h3 class="text-base font-black uppercase tracking-wider text-neutral-100">
            মাল্টিপ্লেয়ার রুম (Live Room)
          </h3>
        </div>

        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-border text-[11px] font-bold">
          <span class="w-2 h-2 rounded-full" :class="isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
          <span :class="isConnected ? 'text-emerald-300' : 'text-rose-400'">
            {{ isConnected ? 'Online WS' : isReconnecting ? 'Connecting...' : 'Offline' }}
          </span>
        </div>
      </div>

      <p class="text-xs text-neutral-400 mb-4">
        এই লিংক বা রুম কোডটি শেয়ার করে বন্ধুদের ইনভাইট করুন। সবাই একই রুমে একসাথে রিয়েল-টাইমে খেলতে পারবেন!
      </p>

      <!-- Toast Feedback -->
      <div
        v-if="copiedToast"
        class="mb-4 p-2.5 rounded-sm bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center animate-bounce shadow-md"
      >
        ✅ লিংক কপি হয়েছে! বন্ধুদের পাঠিয়ে দিন!
      </div>

      <!-- Current Room Code Card -->
      <div class="p-3.5 rounded-sm bg-slate-950 border border-border/80 mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">
            রুম কোড:
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            @click="emit('newRoom')"
          >
            <HugeiconsIcon
              :icon="RefreshIcon"
              :size="13"
            />
            <span>নতুন রুম বানান</span>
          </button>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-2xl font-mono font-black text-amber-400 tracking-wider">
            {{ room.code }}
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-sm border border-border bg-slate-900 hover:bg-slate-800 text-neutral-200 cursor-pointer shadow-sm"
            @click="emit('copyCode')"
          >
            <HugeiconsIcon
              :icon="Copy01Icon"
              :size="14"
            />
            <span>কোড কপি</span>
          </button>
        </div>
      </div>

      <!-- Shareable Invite Link -->
      <div class="p-3 rounded-sm bg-slate-950/80 border border-border/60 mb-4">
        <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
          সরাসরি জয়েন করার লিংক:
        </label>
        <div class="flex items-center gap-2">
          <div class="flex-1 px-3 py-1.5 bg-slate-900 border border-border rounded-sm text-xs font-mono text-neutral-300 truncate">
            {{ inviteUrl }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black uppercase rounded-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer shadow-md shrink-0"
            @click="emit('copyLink')"
          >
            <HugeiconsIcon
              :icon="Link01Icon"
              :size="14"
            />
            <span>লিংক কপি</span>
          </button>
        </div>
      </div>

      <!-- Live Room Occupants & Slots -->
      <div v-if="roomOccupants && roomOccupants.length > 0" class="mb-4 p-3 bg-slate-950 rounded-sm border border-border">
        <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
          রুমের খেলোয়াড় ও রঙ নির্বাচন ({{ roomOccupants.length }}/4 Connected):
        </span>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="color in (['red', 'green', 'yellow', 'blue'] as PlayerColor[])"
            :key="color"
            class="p-2 rounded border flex items-center justify-between transition-all"
            :class="colorBg[color]"
          >
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-xs font-bold">{{ colorNames[color] }}</span>
              <span v-if="assignedColors && assignedColors[color]" class="text-[10px] text-neutral-300 font-mono">
                ({{ roomOccupants.find(o => o.id === assignedColors![color])?.name || 'খেলোয়াড়' }})
              </span>
              <span v-else class="text-[10px] opacity-60 italic">(ফাঁকা)</span>
            </div>

            <button
              v-if="assignedColors && !assignedColors[color] && myAssignedColor !== color"
              type="button"
              class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 border border-border cursor-pointer"
              @click="emit('claimSlot', color)"
            >
              নিন
            </button>
            <span v-else-if="myAssignedColor === color" class="text-[10px] font-black uppercase bg-white text-slate-950 px-1.5 py-0.2 rounded">
              আপনি
            </span>
          </div>
        </div>
      </div>

      <!-- Join another room -->
      <div class="pt-3 border-t border-border/50">
        <label class="text-xs font-bold text-neutral-300 block mb-1.5">
          অন্য কোনো রুমে জয়েন করতে চান? (কোড লিখুন):
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="inputRoomCode"
            type="text"
            class="flex-1 px-3 py-2 bg-slate-950 border border-border rounded-sm text-xs font-mono uppercase text-neutral-100 focus:outline-none focus:border-amber-400"
            placeholder="e.g. LUDO-5921"
            @keyup.enter="handleJoin"
          >
          <button
            type="button"
            class="px-4 py-2 text-xs font-bold uppercase rounded-sm border border-border bg-slate-900 hover:bg-slate-800 text-neutral-200 cursor-pointer shadow-sm"
            @click="handleJoin"
          >
            জয়েন করুন
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
