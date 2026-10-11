<script setup lang="ts">
import type { ActiveTaunt, PlayerColor } from '~/types/taunt'

defineProps<{
  taunts: ActiveTaunt[]
}>()

const senderBadges: Record<PlayerColor, string> = {
  red: 'bg-ludo-red text-white border-ludo-red-dark',
  green: 'bg-ludo-green text-white border-ludo-green-dark',
  yellow: 'bg-ludo-yellow text-slate-950 border-ludo-yellow-dark',
  blue: 'bg-ludo-blue text-white border-ludo-blue-dark',
}
</script>

<template>
  <div class="absolute inset-0 pointer-events-none z-30 overflow-hidden">
    <TransitionGroup name="taunt-float">
      <div
        v-for="taunt in taunts"
        :key="taunt.id"
        class="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none"
        :style="{
          left: `${taunt.x}%`,
          top: `${taunt.y}%`,
        }"
      >
        <span class="text-4xl filter drop-shadow-xl animate-bounce">
          {{ taunt.emoji }}
        </span>
        <span
          class="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm border shadow-lg mt-1 whitespace-nowrap"
          :class="senderBadges[taunt.senderColor] || 'bg-slate-800 text-white'"
        >
          {{ taunt.senderName }}: {{ taunt.label }}
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.taunt-float-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.taunt-float-leave-active {
  transition: all 0.6s ease-out;
}
.taunt-float-enter-from {
  opacity: 0;
  transform: translate(-50%, -30%) scale(0.3);
}
.taunt-float-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.8);
}
</style>
