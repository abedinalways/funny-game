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
  red: 'bg-gradient-to-br from-red-500 to-ludo-red-dark text-white border-red-700/60 shadow-inner',
  green: 'bg-gradient-to-br from-emerald-500 to-ludo-green-dark text-white border-emerald-700/60 shadow-inner',
  yellow: 'bg-gradient-to-br from-yellow-400 to-ludo-yellow-dark text-slate-950 border-yellow-700/60 shadow-inner font-bold',
  blue: 'bg-gradient-to-br from-blue-500 to-ludo-blue-dark text-white border-blue-700/60 shadow-inner',
}

const safeBgColors: Record<PlayerColor, string> = {
  red: 'bg-ludo-red/25 border-ludo-red/60 text-ludo-red',
  green: 'bg-ludo-green/25 border-ludo-green/60 text-ludo-green',
  yellow: 'bg-ludo-yellow/25 border-ludo-yellow/60 text-ludo-yellow',
  blue: 'bg-ludo-blue/25 border-ludo-blue/60 text-ludo-blue',
}

const targetRingStyles: Record<PlayerColor, string> = {
  red: 'border-red-400 ring-2 ring-red-500 shadow-[0_0_16px_rgba(239,68,68,0.8)]',
  green: 'border-emerald-400 ring-2 ring-emerald-500 shadow-[0_0_16px_rgba(34,197,94,0.8)]',
  yellow: 'border-amber-300 ring-2 ring-amber-400 shadow-[0_0_16px_rgba(234,179,8,0.8)]',
  blue: 'border-sky-400 ring-2 ring-sky-500 shadow-[0_0_16px_rgba(59,130,246,0.8)]',
}

const targetPulseBg: Record<PlayerColor, string> = {
  red: 'bg-red-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  blue: 'bg-blue-500',
}

const cellBg = computed(() => {
  if (props.cell.type === 'home_run' && props.cell.color) {
    return homeRunColors[props.cell.color]
  }
  if (props.cell.color && props.cell.type === 'safe') {
    return safeBgColors[props.cell.color]
  }
  return 'bg-surface/90 hover:bg-slate-800/80 text-neutral-300'
})
</script>

<template>
  <div
    class="relative w-full h-full min-h-[22px] sm:min-h-[34px] md:min-h-[42px] border border-border/70 rounded-sm flex items-center justify-center select-none overflow-hidden transition-all duration-200"
    :class="[
      cellBg,
      isDestination ? `${targetRingStyles[destinationColor]} z-20 scale-[1.02]` : '',
    ]"
  >
    <!-- Safe Star Square Indicator -->
    <div
      v-if="cell.isStar"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div class="w-6 h-6 rounded-sm bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shadow-sm">
        <HugeiconsIcon
          :icon="StarIcon"
          :size="15"
          class="text-amber-400 drop-shadow"
        />
      </div>
    </div>

    <!-- Move Destination Target Preview -->
    <div
      v-if="isDestination"
      class="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
    >
      <div
        class="w-full h-full border-2 border-dashed rounded-sm opacity-80 animate-spin"
        :class="targetRingStyles[destinationColor]"
      />
      <div
        class="absolute w-3 h-3 rounded-sm shadow-xl animate-ping"
        :class="targetPulseBg[destinationColor]"
      />
    </div>

    <div class="relative z-10 w-full h-full flex items-center justify-center p-0.5">
      <slot />
    </div>
  </div>
</template>
