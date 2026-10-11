<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Comment01Icon } from '@hugeicons/core-free-icons'
import type { FunnyMessage, PlayerColor } from '~/types/ludo'

defineProps<{
  messages: FunnyMessage[]
}>()

const colorBadge: Record<PlayerColor, string> = {
  red: 'bg-ludo-red text-white',
  green: 'bg-ludo-green text-white',
  yellow: 'bg-ludo-yellow text-slate-950',
  blue: 'bg-ludo-blue text-white',
}
</script>

<template>
  <div class="flex flex-col h-full max-h-[360px] bg-surface border border-border rounded-sm shadow-md overflow-hidden">
    <div class="flex items-center gap-2 px-3 py-2 border-b border-border bg-slate-950/40">
      <HugeiconsIcon
        :icon="Comment01Icon"
        :size="16"
        class="text-amber-400"
      />
      <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-200">
        Funny Trash Talk & Commentary
      </h3>
    </div>

    <div class="flex-1 p-2 space-y-2 overflow-y-auto">
      <div
        v-if="messages.length === 0"
        class="text-center py-6 text-xs text-neutral-400 italic"
      >
        খেলা শুরু করুন, ট্রল আর ডায়লগ এখানে ভাসবে!
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
  </div>
</template>
