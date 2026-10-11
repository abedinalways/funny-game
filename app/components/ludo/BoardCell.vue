<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { StarIcon } from '@hugeicons/core-free-icons'
import type { BoardCell, PlayerColor } from '~/types/ludo'

const props = withDefaults(
  defineProps<{
    cell: BoardCell
    isDestination?: boolean
    destinationColor?: PlayerColor
  }>(),
  {
    isDestination: false,
    destinationColor: 'red',
  }
)

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

const targetRingStyles: Record<PlayerColor, string> = {
  red: 'border-ludo-red ring-2 ring-ludo-red shadow-[0_0_10px_var(--color-ludo-red)]',
  green: 'border-ludo-green ring-2 ring-ludo-green shadow-[0_0_10px_var(--color-ludo-green)]',
  yellow: 'border-ludo-yellow ring-2 ring-ludo-yellow shadow-[0_0_10px_var(--color-ludo-yellow)]',
  blue: 'border-ludo-blue ring-2 ring-ludo-blue shadow-[0_0_10px_var(--color-ludo-blue)]',
}

const targetDotStyles: Record<PlayerColor, string> = {
  red: 'bg-ludo-red',
  green: 'bg-ludo-green',
  yellow: 'bg-ludo-yellow',
  blue: 'bg-ludo-blue',
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
    class="relative w-full h-full border border-border/30 rounded-sm flex items-center justify-center select-none overflow-hidden transition-all duration-200"
    :class="[
      cellBg,
      isDestination ? `${targetRingStyles[destinationColor]} z-20` : '',
    ]"
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

    <!-- Move Destination Target Preview -->
    <div
      v-if="isDestination"
      class="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
    >
      <div
        class="w-full h-full border-2 border-dashed rounded-sm opacity-60 animate-spin"
        :class="targetDotStyles[destinationColor]"
      />
      <div
        class="absolute w-2 h-2 rounded-sm shadow-lg animate-ping"
        :class="targetDotStyles[destinationColor]"
      />
    </div>

    <div class="relative z-10 w-full h-full flex items-center justify-center">
      <slot />
    </div>
  </div>
</template>
