<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Award01Icon } from '@hugeicons/core-free-icons'
import type { PlayerColor } from '~/types/ludo'

defineProps<{
  finishedCounts: Record<PlayerColor, number>
}>()
</script>

<template>
  <div class="relative w-full h-full bg-slate-950 border-2 border-border/80 rounded-sm overflow-hidden select-none shadow-inner">
    <div
      class="absolute inset-0"
      style="clip-path: polygon(0% 0%, 50% 50%, 0% 100%); background: linear-gradient(to right, var(--color-ludo-red), var(--color-ludo-red-dark)); opacity: 0.9;"
    />
    <div
      class="absolute inset-0"
      style="clip-path: polygon(0% 0%, 50% 50%, 100% 0%); background: linear-gradient(to bottom, var(--color-ludo-green), var(--color-ludo-green-dark)); opacity: 0.9;"
    />
    <div
      class="absolute inset-0"
      style="clip-path: polygon(100% 0%, 50% 50%, 100% 100%); background: linear-gradient(to left, var(--color-ludo-yellow), var(--color-ludo-yellow-dark)); opacity: 0.9;"
    />
    <div
      class="absolute inset-0"
      style="clip-path: polygon(0% 100%, 50% 50%, 100% 100%); background: linear-gradient(to top, var(--color-ludo-blue), var(--color-ludo-blue-dark)); opacity: 0.9;"
    />

    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-sm bg-slate-950 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-amber-400 animate-pulse">
        <HugeiconsIcon
          :icon="Award01Icon"
          :size="22"
        />
      </div>
    </div>

    <!-- Finished Counters per side -->
    <div class="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-black text-white drop-shadow-md bg-black/40 px-1 py-0.5 rounded-sm">
      {{ finishedCounts.red }}
    </div>
    <div class="absolute top-1.5 left-1/2 -translate-x-1/2 text-xs font-black text-white drop-shadow-md bg-black/40 px-1 py-0.5 rounded-sm">
      {{ finishedCounts.green }}
    </div>
    <div class="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-950 drop-shadow-md bg-yellow-300/80 px-1 py-0.5 rounded-sm">
      {{ finishedCounts.yellow }}
    </div>
    <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-xs font-black text-white drop-shadow-md bg-black/40 px-1 py-0.5 rounded-sm">
      {{ finishedCounts.blue }}
    </div>
  </div>
</template>
