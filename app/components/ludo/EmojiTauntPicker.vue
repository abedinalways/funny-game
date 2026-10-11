<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { FireIcon } from '@hugeicons/core-free-icons'
import type { EmojiTauntItem } from '~/types/taunt'
import { AVAILABLE_TAUNTS } from '~/constants/taunts'

const emit = defineEmits<{
  (e: 'select', taunt: EmojiTauntItem): void
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5 p-2 bg-surface border border-border rounded-sm shadow select-none">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-1.5 text-neutral-300">
        <HugeiconsIcon
          :icon="FireIcon"
          :size="14"
          class="text-amber-400"
        />
        <span class="text-[11px] font-black uppercase tracking-wider">
          Meme & Emoji Taunts (ট্রল বাটন)
        </span>
      </div>
      <span class="text-[9px] text-neutral-400">ক্লিক করে বোর্ডে ছুড়ে মারুন!</span>
    </div>

    <div class="flex items-center justify-between gap-1 overflow-x-auto py-1">
      <button
        v-for="taunt in AVAILABLE_TAUNTS"
        :key="taunt.id"
        type="button"
        class="group flex flex-col items-center justify-center p-1.5 rounded-sm border border-border/60 bg-slate-950/70 hover:bg-slate-900 hover:border-amber-400/80 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm min-w-[42px]"
        @click="emit('select', taunt)"
      >
        <span class="text-xl transition-transform group-hover:animate-bounce">
          {{ taunt.emoji }}
        </span>
        <span class="text-[8px] font-bold text-neutral-400 group-hover:text-amber-400 whitespace-nowrap mt-0.5">
          {{ taunt.label }}
        </span>
      </button>
    </div>
  </div>
</template>
