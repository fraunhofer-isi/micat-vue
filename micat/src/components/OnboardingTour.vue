<!--
© 2024 - 2026 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

export interface OnboardingStepInterface {
  title: string;
  text: string;
  target?: string;
}

const props = defineProps<{
  steps: Array<OnboardingStepInterface>;
  storageKey: string;
}>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const current = ref<number>(0);
let previousTargetId: string | null = null;

const clearHighlight = () => {
  if (previousTargetId) {
    const el = document.getElementById(previousTargetId);
    if (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.position = '';
      el.style.zIndex = '';
    }
    previousTargetId = null;
  }
};

const applyHighlight = () => {
  clearHighlight();
  const step = props.steps[current.value];
  if (step.target) {
    const el = document.getElementById(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.outline = '2px solid #0284c7';
      el.style.outlineOffset = '2px';
      el.style.position = 'relative';
      el.style.zIndex = '20';
      previousTargetId = step.target;
    }
  }
};

const next = () => {
  if (current.value < props.steps.length - 1) {
    current.value += 1;
    applyHighlight();
  } else {
    close();
  }
};
const back = () => {
  if (current.value > 0) {
    current.value -= 1;
    applyHighlight();
  }
};
const close = () => {
  clearHighlight();
  localStorage.setItem(props.storageKey, 'true');
  emit('close');
};

onMounted(() => {
  applyHighlight();
});
onBeforeUnmount(() => {
  clearHighlight();
});
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]">
    <div class="bg-white dark:bg-blue-950 border border-sky-600 rounded-2xl shadow-lg p-5">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold text-sky-900 dark:text-white">{{ steps[current].title }}</h3>
        <button class="text-xs text-gray-400 hover:text-gray-600" @click="close()">Skip tour</button>
      </div>
      <p class="text-sm text-gray-600 dark:text-sky-200 mb-2">{{ steps[current].text }}</p>
      <p v-if="current === steps.length - 1" class="text-xs text-gray-400 dark:text-sky-400 mb-4">
        You can restart this tour anytime from the "Take a tour" button in the header.
      </p>
      <div class="flex items-center justify-between" :class="{ 'mt-4': current !== steps.length - 1 }">
        <div class="flex gap-1">
          <span
            v-for="(step, i) in steps"
            :key="`dot-${i}`"
            class="w-1.5 h-1.5 rounded-full"
            :class="i === current ? 'bg-sky-600' : 'bg-gray-300 dark:bg-sky-800'"
          ></span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="current > 0"
            class="text-xs font-bold uppercase text-sky-600 dark:text-sky-300"
            @click="back()"
          >Back</button>
          <button
            class="text-xs font-bold uppercase text-white bg-sky-600 hover:bg-sky-700 rounded-full px-4 py-1.5"
            @click="next()"
          >{{ current === steps.length - 1 ? "Let's go" : 'Next' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>