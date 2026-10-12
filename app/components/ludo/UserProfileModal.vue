<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Cancel01Icon, Copy01Icon, User02Icon } from '@hugeicons/core-free-icons'
import type { UserProfile } from '~/types/user'

const props = defineProps<{
  isOpen: boolean
  profile: UserProfile
  availableAvatars: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saveName', name: string): void
  (e: 'saveAvatar', avatar: string): void
}>()

const inputName = ref(props.profile.name)
const copiedId = ref(false)

watch(
  () => props.profile.name,
  (val) => {
    inputName.value = val
  }
)

const handleSave = () => {
  emit('saveName', inputName.value)
  emit('close')
}

const copyId = async () => {
  try {
    await navigator.clipboard.writeText(props.profile.id)
    copiedId.value = true
    setTimeout(() => {
      copiedId.value = false
    }, 2000)
  } catch {
    // fallback
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none"
  >
    <div class="relative w-full max-w-md bg-surface border-2 border-border rounded-sm shadow-2xl p-6">
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

      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
          <HugeiconsIcon
            :icon="User02Icon"
            :size="18"
          />
        </div>
        <h3 class="text-base font-black uppercase tracking-wider text-neutral-100">
          আপনার প্লেয়ার প্রোফাইল
        </h3>
      </div>

      <!-- Persistent ID Badge -->
      <div class="flex items-center justify-between p-3 rounded-sm bg-slate-950 border border-border/80 mb-5">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            আপনার ইউনিক প্লেয়ার আইডি:
          </span>
          <span class="text-sm font-mono font-black text-amber-400">
            {{ profile.id }}
          </span>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-sm border border-border bg-slate-900 hover:bg-slate-800 text-neutral-200 transition-colors cursor-pointer"
          @click="copyId"
        >
          <HugeiconsIcon
            :icon="Copy01Icon"
            :size="13"
          />
          <span>{{ copiedId ? 'কপি হয়েছে!' : 'কপি আইডি' }}</span>
        </button>
      </div>

      <!-- Avatar Picker -->
      <div class="mb-4">
        <label class="text-xs font-bold text-neutral-300 block mb-1.5">
          অ্যাভাটার সিলেক্ট করুন:
        </label>
        <div class="flex gap-2">
          <button
            v-for="av in availableAvatars"
            :key="av"
            type="button"
            class="w-10 h-10 text-xl rounded-sm border transition-all cursor-pointer flex items-center justify-center hover:scale-110"
            :class="[
              profile.avatar === av
                ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/40'
                : 'border-border bg-slate-900 hover:border-slate-600',
            ]"
            @click="emit('saveAvatar', av)"
          >
            {{ av }}
          </button>
        </div>
      </div>

      <!-- Name Input -->
      <div class="mb-6">
        <label class="text-xs font-bold text-neutral-300 block mb-1.5">
          আপনার ডাকনাম (Nickname):
        </label>
        <input
          v-model="inputName"
          type="text"
          maxlength="20"
          class="w-full px-3 py-2 bg-slate-950 border border-border rounded-sm text-sm text-neutral-100 focus:outline-none focus:border-amber-400 transition-colors"
          placeholder="নাম লিখুন..."
          @keyup.enter="handleSave"
        >
      </div>

      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 text-xs font-bold rounded-sm border border-border bg-slate-900 hover:bg-slate-800 text-neutral-300 cursor-pointer"
          @click="emit('close')"
        >
          বাতিল
        </button>
        <button
          type="button"
          class="px-5 py-2 text-xs font-black uppercase rounded-sm bg-amber-400 hover:bg-amber-500 text-slate-950 cursor-pointer shadow-md"
          @click="handleSave"
        >
          সংরক্ষণ করুন
        </button>
      </div>
    </div>
  </div>
</template>
