<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Award01Icon } from '@hugeicons/core-free-icons'
import type { PlayerColor } from '~/types/ludo'

defineProps<{
  finishedCounts: Record<PlayerColor, number>
}>()
</script>

<template>
  <div class="relative w-full h-full bg-slate-900 border border-border/40 rounded-sm overflow-hidden select-none">
    <div
      class="absolute inset-0"
      style="clip-path: polygon(0% 0%, 50% 50%, 0% 100%); background-color: var(--color-ludo-red); opacity: 0.85;"
    />
    <div
      class="absolute inset-0"
      style="clip-path: polygon(0% 0%, 50% 50%, 100% 0%); background-color: var(--color-ludo-green); opacity: 0.85;"
    />
    <div
      class="absolute inset-0"
      style="clip-path: polygon(100% 0%, 50% 50%, 100% 100%); background-color: var(--color-ludo-yellow); opacity: 0.85;"
    />
    <div
      class="absolute inset-0"
      style="clip-path: polygon(0% 100%, 50% 50%, 100% 100%); background-color: var(--color-ludo-blue); opacity: 0.85;"
    />

    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-7 h-7 rounded-sm bg-slate-950/90 border border-amber-400/80 shadow-lg flex items-center justify-center text-amber-400">
        <HugeiconsIcon
          :icon="Award01Icon"
          :size="16"
        />
      </div>
    </div>

    <div class="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white drop-shadow">
      {{ finishedCounts.red }}
    </div>
    <div class="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white drop-shadow">
      {{ finishedCounts.green }}
    </div>
    <div class="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-950 drop-shadow">
      {{ finishedCounts.yellow }}
    </div>
    <div class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white drop-shadow">
      {{ finishedCounts.blue }}
    </div>
  </div>
</template>
