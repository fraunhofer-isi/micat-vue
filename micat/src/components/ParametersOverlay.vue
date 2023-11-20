<script setup lang="ts">
import {onMounted, ref} from "vue";
import {
  XCircleIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline';
import {useSessionStore} from "@/stores/session";
import type {GlobalParameters, PayloadParameterEntryInterface} from "@/types";

const session = useSessionStore();

// Refs
const activeCategory = ref<string>("");
const activeSubsector = ref<number>(0);
const loading = ref<boolean>(true);

// Variables
const rangeIndex: {[key: string]: number} = {};

// Lifecycle
onMounted(async () => {
  if (Object.keys(session.globalParameters).length == 0) {
    await getAndStructureGlobalParameters();
  }
  activeCategory.value = Object.keys(session.globalParameters)[0];
  activeSubsector.value = Number(Object.keys(session.globalParameters[activeCategory.value])[0]);
  loading.value = false;
});

// Functions
const getAndStructureGlobalParameters = async () => {
  loading.value = true;
  const responseGlobalParameters: Response = await fetch(`${import.meta.env.VITE_API_URL}json_parameters?id_mode=${session.future ? 4 : 2}&id_region=${session.region}&orient=records`);
  const results = await responseGlobalParameters.json();
  // Re-structure parameters
  const restructuredResults: GlobalParameters = {};
  const yearRegex = /^[0-9]+$/;
  for (const [category, dataSet] of Object.entries(results)) {
    if (category === 'Options') continue;
    // Add category key, if it doesn't exist yet
    if (!restructuredResults[category]) restructuredResults[category] = {};
    for (const data of (dataSet as Array<PayloadParameterEntryInterface>)) {
      // Add subsector key, if it doesn't exist yet
      let subsectorId = data['id_subsector'] ? data['id_subsector'] : 0;
      session.subsectorMapping[subsectorId] = data['Subsector'] ? data['Subsector'] : 'General';
      if (!restructuredResults[category][subsectorId]) restructuredResults[category][subsectorId] = {};

      if (category === 'MonetisationFactors') {
        if (!data['Monetisation factor'] || typeof data['Value'] === 'undefined' || !data['index']) continue;
        session.monetisationFactorMapping[data['index']] = data['Monetisation factor'];
        restructuredResults[category][subsectorId][data['index']] = [];
        if (data['Value'] !== null) {
          // monetisation factors might have one value only
          restructuredResults[category][subsectorId][data['index']].push({
            key: 0,
            value: data['Value'],
          });
          continue
        }
      }

      for (const [key, value] of Object.entries(data)) {
        if (yearRegex.test(key)) {
          if (category === 'MonetisationFactors') {
            // monetisation factors are handled differently
            if (value === null || !data['index']) continue;
            restructuredResults[category][subsectorId][data['index']].push({key: parseInt((key as string)), value: (value as number)});
          } else if (data['id_final_energy_carrier'] || data['id_primary_energy_carrier']) {
            // Add year key, if it doesn't exist yet
            if (!restructuredResults[category][subsectorId][key]) restructuredResults[category][subsectorId][key] = [];
            // Map carrier data
            if (data['id_final_energy_carrier'] && data['Final energy carrier']) session.carrierMapping[data['id_final_energy_carrier']] = data['Final energy carrier'];
            if (data['id_primary_energy_carrier'] && data['Primary energy carrier']) session.carrierMapping[data['id_primary_energy_carrier']] = data['Primary energy carrier'];
            restructuredResults[category][subsectorId][key].push({
              key: data['id_final_energy_carrier'] ? data['id_final_energy_carrier'] : data['id_primary_energy_carrier'] ? data['id_primary_energy_carrier'] : 0,
              value: (value as number),
            });
          }
        }
      }
    }
  }
  session.globalParameters = restructuredResults;
}
const selectCategory = (category: string) => {
  activeCategory.value = category;
  activeSubsector.value = Number(Object.keys(session.globalParameters[activeCategory.value])[0]);
};
const roundNumber = (value: number, id: string) => {
  // round to next one, hundred, thousand, million, billion, etc.
  if (!rangeIndex[id]) {
    rangeIndex[id] = Math.max(1, 10 ** (Math.ceil(Math.log10(value))));
  }
  return rangeIndex[id];
};
const reset = () => {
  getAndStructureGlobalParameters();
  activeCategory.value = Object.keys(session.globalParameters)[0];
  activeSubsector.value = Number(Object.keys(session.globalParameters[activeCategory.value])[0]);
}
</script>

<template>
  <div role="status" v-if="loading" class="text-center p-5">
      <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span class="sr-only">Loading...</span>
  </div>
  <div v-else class="max-w-screen-xl mx-auto pt-5 pb-10">
    <div class="flex items-center gap-2 justify-between pb-2">
      <a href="#" @click="$emit('close')" class="text-sm text-orange-700 dark:text-orange-300">back to the entries</a>
      <button
        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 pl-3 pr-4 rounded-full uppercase text-xs mr-3"
        @click="reset()"
        :disabled="loading"
      >
        <XCircleIcon class="h-5 w-5 mt-[-3px] inline text-white"></XCircleIcon>
        Reset to defaults
      </button>
    </div>
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
              @click="activeSubsector = Number(subsector)"
              :class="{
                'text-white': activeSubsector !== Number(subsector),
                'text-orange-700': activeSubsector === Number(subsector),
                'bg-white': activeSubsector === Number(subsector),
                'hover:text-orange-600': activeSubsector === Number(subsector),
                'hover:bg-orange-600': activeSubsector !== Number(subsector),
              }"
              v-for="(subsector, i) in Object.keys(session.globalParameters[activeCategory])"
              v-bind:key="`global-parameters-subcategory-${i}`"
            >
              <span class="font-bold mr-8 grow whitespace-nowrap">{{ session.subsectorMapping[Number(subsector)] }}</span>
              <CheckIcon v-if="activeSubsector === Number(subsector)" class="h-5 w-5"></CheckIcon>
            </div>
          </div>
          <div class="px-5 py-3">
            <div
              v-for="[yearOrFactor, entries] in Object.entries(session.globalParameters[activeCategory][activeSubsector])"
              v-bind:key="`global-parameters-years-${yearOrFactor}`"
              class="block rounded-xl bg-white border border-orange-600 m-5 max-w-[450px]">
              <div
                class="bg-orange-600 rounded-t-xl text-white px-4 py-2">
                {{ activeCategory === 'MonetisationFactors' ? session.monetisationFactorMapping[Number(yearOrFactor)] : yearOrFactor }}
              </div>
              <div class="p-4">
                <div
                  v-for="(entry, i) in entries"
                  v-bind:key="`global-parameters-years-${yearOrFactor}-${i}`"
                  class="grid gap-2 py-1 items-center"
                  :class="{
                    'grid-cols-3': entries.length > 1,
                    'grid-cols-2': entries.length == 1,
                  }"
                >
                  <div class="text-orange-600 font-bold text-xs" v-if="entries.length > 1">{{ activeCategory === 'MonetisationFactors' ? entry.key : session.carrierMapping[entry.key] }}</div>
                  <div>
                    <input
                      :id="`global-parameters-years-${yearOrFactor}-${i}-range`"
                      type="range"
                      class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                      min="0"
                      :max="roundNumber(entry.value, `global-parameters-years-${yearOrFactor}-${i}-range`)"
                      :step="roundNumber(entry.value, `global-parameters-years-${yearOrFactor}-${i}-range`) / 100"
                      v-model.number="entry.value"
                    />
                  </div>
                  <div>
                    <input
                      :id="`global-parameters-years-${yearOrFactor}-${i}-input`"
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
