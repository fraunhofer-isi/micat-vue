<script setup lang="ts">
import {
  XCircleIcon,
  CursorArrowRaysIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline';
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();

// Lifecycle
onMounted(async () => {
  // id_region
  const responseRegion: Response = await fetch(`${import.meta.env.VITE_API_URL}json_parameters?id_mode=1&id_region=0`);
};
</script>

<template>
  <div class="max-w-screen-xl mx-auto pt-5 pb-10">
    <a href="#" @click="$emit('close')" class="text-sm text-sky-700 dark:text-sky-300">back to the entries</a>
    <div class="rounded-3xl border border-gray-300 my-3 relative bg-white">
      <div @click="$emit('close')" class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-sky-700 dark:text-sky-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-sky-800 rounded-l-3xl min-w-[325px] self-stretch">
          <div
            class="flex items-center pl-7 cursor-pointer"
            @click="selectCategory(key)"
            :class="{
              'text-white': activeCategory !== key,
              'text-sky-900': activeCategory === key,
              'bg-white': activeCategory === key,
              'hover:text-sky-700': activeCategory === key,
              'hover:bg-sky-900': activeCategory !== key,
              'rounded-tl-3xl': activeCategory === key && i === 0,
              'rounded-bl-3xl': activeCategory === key && i === Object.keys(categories).length - 1,
              'pr-16': !category.subcategories,
            }"
            v-for="([key, category], i) in Object.entries(categories)"
            v-bind:key="`category-${key}`"
          >
            <div class="py-5 grow">
              <span class="font-bold">{{ category.title }}</span><br />
              <span>{{ category.subtitle }}</span>
            </div>
            <div v-if="category.subcategories">
              <div
                v-for="(subcategory, i) in category.subcategories"
                v-bind:key="`subcategory-${key}-${i}`"
                class="py-2 px-4 text-sm font-bold"
                :class="{
                  'text-white': activeSubcategory !== subcategory,
                  'text-sky-700': activeSubcategory === subcategory,
                  'bg-gradient-to-r from-sky-600 to-sky-700 hover:bg-gradient-to-r hover:from-sky-600 hover:to-sky-700': activeSubcategory !== subcategory,
                  'bg-white hover:bg-sky-100': activeSubcategory === subcategory,
                  'rounded-tl-2xl': i === 0,
                  'rounded-bl-2xl': i === category.subcategories.length - 1,
                }"
                @click="selectSubcategory(subcategory)"
              >
                {{ subcategory }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="['quantification', 'monetization'].indexOf(activeCategory) > -1">
          <div class="flex">
            <div class="bg-orange-600 rounded-br-3xl pl-1 border-l border-white self-start">
              <div
                class="flex items-center pl-5 pr-3 py-4 cursor-pointer text-sm rounded-bl-3xl"
                @click="activeMeasurement = measurement"
                :class="{
                  'text-white': activeMeasurement.identifier !== measurement.identifier,
                  'text-orange-800': activeMeasurement.identifier === measurement.identifier,
                  'bg-white': activeMeasurement.identifier === measurement.identifier,
                  'hover:text-orange-700': activeMeasurement.identifier === measurement.identifier,
                  'hover:bg-orange-700': activeMeasurement.identifier !== measurement.identifier,
                  'hover:rounded-br-3xl': activeMeasurement.identifier !== measurement.identifier
                }"
                v-for="measurement in categories[activeCategory].measurements.filter(measurement => !measurement.subcategory || measurement.subcategory === activeSubcategory)"
                v-bind:key="`measurement-${measurement.identifier}`"
              >
                <span class="font-bold mr-8 grow whitespace-nowrap">{{ measurement.title }}</span>
                <CheckIcon v-if="activeMeasurement.identifier === measurement.identifier" class="h-5 w-5"></CheckIcon>
                <CursorArrowRaysIcon v-else class="h-5 w-5"></CursorArrowRaysIcon>
              </div>
            </div>
            <div>
              <div class="bg-sky-600 text-white mx-7 my-7 p-4 text-sm rounded-lg">
                <h3 class="font-bold mb-2">{{ activeMeasurement.title }}</h3>
                <p>{{ activeMeasurement.description }}</p>
              </div>
            </div>
          </div>
          <div class="px-10 py-5">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
