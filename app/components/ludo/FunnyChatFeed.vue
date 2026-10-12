<script setup lang="ts">
import { ref } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Comment01Icon, SentIcon } from '@hugeicons/core-free-icons'
import type { FunnyMessage, PlayerColor } from '~/types/ludo'

const props = defineProps<{
  messages: FunnyMessage[]
  myColor?: PlayerColor | null
}>()

const emit = defineEmits<{
  (e: 'sendMessage', text: string): void
}>()

const inputText = ref('')

const handleSend = () => {
  const text = inputText.value.trim()
  if (!text) return
  emit('sendMessage', text)
  inputText.value = ''
}

const colorBadge: Record<PlayerColor, string> = {
  red: 'bg-ludo-red text-white',
  green: 'bg-ludo-green text-white',
  yellow: 'bg-ludo-yellow text-slate-950',
  blue: 'bg-ludo-blue text-white',
}
</script>

<template>
  <div class="flex flex-col h-full max-h-[380px] bg-surface border border-border rounded-sm shadow-md overflow-hidden">
    <div class="flex items-center justify-between px-3 py-2 border-b border-border bg-slate-950/40">
      <div class="flex items-center gap-2">
        <HugeiconsIcon
          :icon="Comment01Icon"
          :size="16"
          class="text-amber-400"
        />
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-200">
          লাইভ চ্যাট ও ট্রল ধারাভাষ্য
        </h3>
      </div>
      <span class="text-[9px] text-neutral-400 font-mono">Real-time Chat</span>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 p-2 space-y-2 overflow-y-auto">
      <div
        v-if="messages.length === 0"
        class="text-center py-6 text-xs text-neutral-400 italic"
      >
        খেলা শুরু করুন অথবা মেসেজ পাঠিয়ে বন্ধুদের ট্রল করুন!
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex items-start gap-2 p-1.5 rounded-sm bg-slate-900/60 border border-border/30 transition-all"
      >
        <span
          class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5"
          :class="colorBadge[msg.color] || 'bg-slate-700 text-white'"
        >
          {{ msg.sender }}
        </span>
        <p class="text-xs text-neutral-100 leading-snug break-words">
          {{ msg.text }}
        </p>
      </div>
    </div>

    <!-- Live Text Chat Input Box -->
    <form class="p-2 border-t border-border bg-slate-950/60 flex items-center gap-1.5" @submit.prevent="handleSend">
      <input
        v-model="inputText"
        type="text"
        placeholder="বন্ধুদের মেসেজ পাঠান... (Enter)"
        class="flex-1 px-2.5 py-1.5 rounded-sm bg-slate-900 border border-border text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
      />
      <button
        type="submit"
        class="inline-flex items-center justify-center p-1.5 rounded-sm bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow transition"
        :disabled="!inputText.trim()"
      >
        <HugeiconsIcon
          :icon="SentIcon"
          :size="14"
        />
      </button>
    </form>
  </div>
</template>
