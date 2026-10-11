<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { StarIcon } from '@hugeicons/core-free-icons'
import type { BoardCell, PlayerColor } from '~/types/ludo'

const props = defineProps<{
  cell: BoardCell
}>()

const homeRunColors: Record<PlayerColor, string> = {
  red: 'bg-ludo-red text-white',
  green: 'bg-ludo-green text-white',
  yellow: 'bg-ludo-yellow text-white',
  blue: 'bg-ludo-blue text-white',
}

const safeBgColors: Record<PlayerColor, string> = {
  red: 'bg-ludo-red/20 text-ludo-red',
  green: 'bg-ludo-green/20 text-ludo-green',
  yellow: 'bg-ludo-yellow/20 text-ludo-yellow',
  blue: 'bg-ludo-blue/20 text-ludo-blue',
}

const cellBg = computed(() => {
  if (props.cell.type === 'home_run' && props.cell.color) {
    return homeRunColors[props.cell.color]
  }
  if (props.cell.color && props.cell.type === 'safe') {
    return safeBgColors[props.cell.color]
  }
  return 'bg-surface text-neutral-300'
})
</script>

<template>
  <div
    class="relative w-full h-full border border-border/30 rounded-sm flex items-center justify-center select-none overflow-hidden"
    :class="cellBg"
  >
    <div
      v-if="cell.isStar"
      class="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none"
    >
      <HugeiconsIcon
        :icon="StarIcon"
        :size="14"
        class="text-amber-400 drop-shadow"
      />
    </div>

    <div class="relative z-10 w-full h-full flex items-center justify-center">
      <slot />
    </div>
  </div>
</template>
