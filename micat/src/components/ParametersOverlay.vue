<script setup lang="ts">
import {onMounted, ref} from "vue";
import {
  XCircleIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline';
import {useSessionStore} from "@/stores/session";
import type {GlobalParameters, OriginalGlobalParameterSubcategory} from "@/types";

const session = useSessionStore();

// Refs
const activeCategory = ref<string>("");
const activeSubsector = ref<string>("");

// Lifecycle
onMounted(async () => {
  if (Object.keys(session.globalParameters).length == 0) {
    // Global parameters
    const responseGlobalParameters: Response = await fetch(`${import.meta.env.VITE_API_URL}json_parameters?id_mode=${session.future ? 4 : 2}&id_region=${session.region}&orient=records`);
    const results = await responseGlobalParameters.json();
    // Re-structure parameters
    const restructuredResults: GlobalParameters = {};
    const yearRegex = /^[0-9]+$/;
    for (const [category, dataSet] of Object.entries(results)) {
      if (category === 'Options') continue;
      // Add category key, if it doesn't exist yet
      if (!restructuredResults[category]) restructuredResults[category] = {};
      for (const data of (dataSet as Array<OriginalGlobalParameterSubcategory>)) {
        // Add subsector key, if it doesn't exist yet
        let subsector = data['Subsector'] ? data['Subsector'] : 'General';
        if (!restructuredResults[category][subsector]) restructuredResults[category][subsector] = {};

        if (category === 'MonetisationFactors') {
          restructuredResults[category][subsector][data['Monetisation factor']] = [];
          if (data['Value'] !== null) {
            // monetisation factors might have one value only
            restructuredResults[category][subsector][data['Monetisation factor']].push({
              key: 'Value',
              value: data['Value'],
            });
            continue
          }
        }

        for (const [key, value] of Object.entries(data)) {
          if (yearRegex.test(key)) {
            if (category === 'MonetisationFactors') {
              // monetisation factors are handled differently
              if (value === null) continue;
              restructuredResults[category][subsector][data['Monetisation factor']].push({key, value});
            } else {
              // Add year key, if it doesn't exist yet
              if (!restructuredResults[category][subsector][key]) restructuredResults[category][subsector][key] = [];
              restructuredResults[category][subsector][key].push({
                key: data['Final energy carrier'] ? data['Final energy carrier'] : data['Primary energy carrier'],
                value,
              });
            }
          }
        }
      }
    }
    session.globalParameters = restructuredResults;
  }
  activeCategory.value = Object.keys(session.globalParameters)[0];
  activeSubsector.value = Object.keys(session.globalParameters[activeCategory.value])[0];
});

// Functions
const selectCategory = (category: string) => {
  activeCategory.value = category;
  activeSubsector.value = Object.keys(session.globalParameters[activeCategory.value])[0];
};
const roundNumber = (value: number) => {
  // round to next one, hundred, thousand, million, billion, etc.
  return Math.max(1, 10 ** (Math.ceil(Math.log10(value))));
};
</script>

<template>
  <div class="max-w-screen-xl mx-auto pt-5 pb-10">
    <a href="#" @click="$emit('close')" class="text-sm text-orange-700 dark:text-orange-300">back to the entries</a>
    <div class="rounded-3xl border border-gray-300 my-3 relative bg-white">
      <div @click="$emit('close')"
           class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-orange-700 dark:text-orange-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-orange-600 rounded-l-3xl self-stretch">
          <div
            class="flex items-center px-5 cursor-pointer"
            @click="selectCategory(categoryName)"
            :class="{
              'text-white': activeCategory !== categoryName,
              'text-orange-700': activeCategory === categoryName,
              'bg-white': activeCategory === categoryName,
              'hover:text-orange-700': activeCategory === categoryName,
              'hover:bg-orange-900': activeCategory !== categoryName,
              'rounded-tl-3xl': activeCategory === categoryName && i === 0,
              'rounded-bl-3xl': activeCategory === categoryName && i === Object.keys(session.globalParameters).length - 1,
            }"
            v-for="(categoryName, i) in Object.keys(session.globalParameters)"
            v-bind:key="`global-parameter-${i}`"
          >
            <div class="py-3 grow font-bold">{{ categoryName.replace(/([A-Z])/g, ' $1') }}</div>
          </div>
        </div>
        <div class="flex" v-if="activeCategory">
          <div class="bg-orange-500 self-start" v-if="Object.keys(session.globalParameters[activeCategory]).length > 1">
            <div
              class="flex items-center px-3 py-3 cursor-pointer text-sm"
              @click="activeSubsector = subsector"
              :class="{
                'text-white': activeSubsector !== subsector,
                'text-orange-700': activeSubsector === subsector,
                'bg-white': activeSubsector === subsector,
                'hover:text-orange-600': activeSubsector === subsector,
                'hover:bg-orange-600': activeSubsector !== subsector,
              }"
              v-for="(subsector, i) in Object.keys(session.globalParameters[activeCategory])"
              v-bind:key="`global-parameters-subcategory-${i}`"
            >
              <span class="font-bold mr-8 grow whitespace-nowrap">{{ subsector }}</span>
              <CheckIcon v-if="activeSubsector === subsector" class="h-5 w-5"></CheckIcon>
            </div>
          </div>
          <div class="px-5 py-3">
            <div
              v-for="[year, entries] in Object.entries(session.globalParameters[activeCategory][activeSubsector])"
              v-bind:key="`global-parameters-years-${year}`"
              class="block rounded-xl bg-white border border-orange-600 m-5 max-w-[450px]">
              <div
                class="bg-orange-600 rounded-t-xl text-white px-4 py-2">
                {{ year }}
              </div>
              <div class="p-4">
                <div
                  v-for="(entry, i) in entries"
                  v-bind:key="`global-parameters-years-${year}-${i}`"
                  class="grid gap-2 py-1 items-center"
                  :class="{
                    'grid-cols-3': entries.length > 1,
                    'grid-cols-2': entries.length == 1,
                  }"
                >
                  <div class="text-orange-600 font-bold text-xs" v-if="entries.length > 1">{{ entry.key }}</div>
                  <div>
                    <input
                      :id="`global-parameters-years-${year}-${i}-range`"
                      type="range"
                      class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                      min="0"
                      :max="roundNumber(entry.value)"
                      :step="roundNumber(entry.value) / 100"
                      v-model.number="entry.value"
                    />
                  </div>
                  <div>
                    <input
                      :id="`global-parameters-years-${year}-${i}-input`"
                      type="number"
                      class="bg-orange-50 border border-orange-300 text-orange-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                      v-model.number="entry.value"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
