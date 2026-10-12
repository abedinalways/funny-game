<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Cancel01Icon, Copy01Icon, Link01Icon, RefreshIcon, UserAdd01Icon } from '@hugeicons/core-free-icons'
import type { RoomSession, UserProfile } from '~/types/user'

const props = defineProps<{
  isOpen: boolean
  room: RoomSession
  inviteUrl: string
  copiedToast: boolean
  profile: UserProfile
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copyLink'): void
  (e: 'copyCode'): void
  (e: 'joinRoom', code: string): void
  (e: 'newRoom'): void
}>()

const inputRoomCode = ref('')

const handleJoin = () => {
  if (inputRoomCode.value.trim()) {
    emit('joinRoom', inputRoomCode.value)
    inputRoomCode.value = ''
    emit('close')
  }
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

      <div class="flex items-center gap-2 mb-2">
        <div class="w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
          <HugeiconsIcon
            :icon="UserAdd01Icon"
            :size="18"
          />
        </div>
        <h3 class="text-base font-black uppercase tracking-wider text-neutral-100">
          বন্ধুদের ইনভাইট করুন (Invite Friends)
        </h3>
      </div>

      <p class="text-xs text-neutral-400 mb-5">
        এই লিংক বা রুম কোডটি কপি করে মেসেঞ্জার, হোয়াটসঅ্যাপ বা ডিসকর্ড-এ বন্ধুদের পাঠান।
      </p>

      <!-- Toast Feedback -->
      <div
        v-if="copiedToast"
        class="mb-4 p-2.5 rounded-sm bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center animate-bounce shadow-md"
      >
        ✅ লিংক কপি হয়েছে! এখন বন্ধুদের মেসেঞ্জারে পাঠান!
      </div>

      <!-- Current Room Code Card -->
      <div class="p-4 rounded-sm bg-slate-950 border border-border/80 mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">
            বর্তমান রুম কোড:
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
      <div class="p-3.5 rounded-sm bg-slate-950/80 border border-border/60 mb-5">
        <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
          সরাসরি জয়েন করার লিংক:
        </label>
        <div class="flex items-center gap-2">
          <div class="flex-1 px-3 py-2 bg-slate-900 border border-border rounded-sm text-xs font-mono text-neutral-300 truncate">
            {{ inviteUrl }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase rounded-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer shadow-md shrink-0"
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

      <!-- Join another room -->
      <div class="pt-4 border-t border-border/50">
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
