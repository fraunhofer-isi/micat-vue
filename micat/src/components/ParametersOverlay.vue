<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import {onMounted, reactive, ref, watch, inject} from "vue";
import {XCircleIcon, ArrowsRightLeftIcon, InformationCircleIcon} from '@heroicons/vue/24/outline';
import {useSessionStore} from "@/stores/session";
import type {
  ParameterCategory,
  ParameterEntry,
  Parameters,
  PayloadParameterEntryInterface,
  SelectedImprovementInterface,
  ModalInjectInterface,
} from "@/types";
import {units, defaultModalInject} from "@/defaults";


const props = defineProps<{
  improvement: SelectedImprovementInterface,
  years: Array<number>,
}>()

const session = useSessionStore();

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject

// Refs
const activeCategory = ref<string>("");
const loading = ref<boolean>(true);
const useRenovationRate = ref<boolean>(session.useRenovationRate);
const parameters = reactive<Parameters>(session.parameters);

// Watchers
watch(parameters, (parameters) => {
  session.updateParameters(parameters);
});
watch(useRenovationRate, (useRenovationRate) => {
  session.useRenovationRate = useRenovationRate;
  session.updateUseRenovationRate(useRenovationRate);
});

// Variables
const rangeIndex: {[key: string]: number} = {};

// Lifecycle
onMounted(async () => {
  if (typeof parameters[props.improvement.internalId] === 'undefined') parameters[props.improvement.internalId] = {};
  await getParameters();
  activeCategory.value = Object.keys(parameters[props.improvement.internalId])[0];
  loading.value = false;
});

// Functions
const getParameters = async () => {
  loading.value = true;
  const body = {
    "id": props.improvement.internalId,
    // "row_number": 1,
    "active": true,
    "subsector": {
      "id": props.improvement.subsectorId,
      // "label": "Average agriculture",
      // "_description": "Agriculture, forestry & fishing"
    },
    "action_type": {
     "id": props.improvement.data ? props.improvement.data.id : 0,
     // "label": "Cross-cutting technologies",
     // "_description": "Energy-efficient electric cross-cutting technologies"
    },
    "details": {},
    "unit": {
      // "name": "kilotonne of oil equivalent",
      "symbol": units[session.unit].symbol,
      "factor": units[session.unit].factor
    }
  };
  // Since we also cache old values, we need to filter out the ones that are not in the current years selection
  const values = Object.fromEntries(
    Object.entries(props.improvement.data ? props.improvement.data.values : {}).filter(
      ([key, val])=>props.years.includes(parseInt(key))
    )
  );
  
  const responseParameters: Response = await fetch(
    `${import.meta.env.VITE_API_URL}json_measure?id_mode=${session.future ? 4 : 2}&id_region=${session.region}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...values, ...body})
    },
  );
  const results = await responseParameters.json();
  
  const restructuredResults: ParameterCategory = {};
  const yearRegex = /^[0-9]+$/;
  
  for (const [category, dataSet] of Object.entries(results)) {
    if (category === 'context') continue;
    // Add category key, if it doesn't exist yet
    if (!restructuredResults[category]) restructuredResults[category] = [];
    for (const data of (dataSet as Array<PayloadParameterEntryInterface>)) {
      if (data.id_parameter === null) continue;
      const entry: ParameterEntry = {years: [], parameters: {}};
      for (const [key, v] of Object.entries((data as {[key: string]: number | string}))) {
        const value: number = (v as number);
        if (yearRegex.test(key)) {
          // If there's a value for a year, we always take it; alternative values might have null values, but they don't
          // have constants defined, so we also set them
          if (value !== null || typeof data.constants === 'undefined') entry.years.push({key, value});
        } else {
          entry.parameters[key] = value;
        }
      }
      restructuredResults[category].push(entry);
    }
  }
  parameters[props.improvement.internalId] = restructuredResults;
}
const selectCategory = (category: string) => {
  activeCategory.value = category;
};
const roundNumber = (value: number, id: string) => {
  // round to next one, hundred, thousand, million, billion, etc.
  if (!rangeIndex[id]) {
    rangeIndex[id] = Math.max(100, 10 ** (Math.ceil(Math.log10(value))) * 2);
  }
  return rangeIndex[id];
};
const reset = () => {
  getParameters();
  activeCategory.value = Object.keys(parameters[props.improvement.internalId])[0];
  loading.value = false;
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
              'rounded-tl-3xl': i === 0,
              'rounded-bl-3xl': activeCategory === categoryName && i === Object.keys(parameters[props.improvement.internalId]).length - 1,
            }"
            v-for="(categoryName, i) in Object.keys(parameters[props.improvement.internalId])"
            v-bind:key="`parameter-${i}`"
          >
            <div class="py-3 grow font-bold capitalize whitespace-nowrap">{{ categoryName.replace(/([A-Z])/g, ' $1') }}</div>
          </div>
        </div>
        <div>
          <div>
            <div class="bg-sky-600 text-sky-500 p-2 inline-block rounded-br-xl">
              <span class="font-bold mr-2 text-sky-400">{{ improvement.program }}</span> &mdash;
              <span class="font-bold mx-2 text-sky-200">{{ improvement.subsector }}</span> &mdash;
              <span class="font-bold ml-2 mr-4 text-white">{{ improvement.name }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 px-5 py-2" v-if="activeCategory">
            <div
              v-for="parameter in parameters[props.improvement.internalId][activeCategory]"
              v-bind:key="`parameter-${parameter.parameters.id_parameter}-${parameter.parameters.id_final_energy_carrier ? parameter.parameters.id_final_energy_carrier : 'na'}`"
              class="block rounded-xl bg-white border border-sky-600 m-5 max-w-[450px] self-start"
              :class="{
                'hidden': parameter.parameters.id_parameter === 45 && useRenovationRate || [32, 43].indexOf(parameter.parameters.id_parameter as number) > -1 && !useRenovationRate,
              }"
            >
              <div class="bg-sky-600 rounded-t-xl text-sm text-white px-4 py-2 flex justify-between items-center">
                <span>{{ parameter.parameters.label }}</span>
                <span class="bg-white rounded-xl text-sky-600 px-2 py-1 ml-2">{{ parameter.parameters.unit }}</span>
              </div>
              <div class="p-4">
                <div v-if="parameter.years.length === 0" class="grid gap-2 py-1 items-center grid-cols-3">
                  <div>
                    <input
                      :id="`parameter-${parameter.parameters.id_parameter}-constant-range`"
                      type="range"
                      class="w-full h-1 bg-sky-200 rounded-lg appearance-none cursor-pointer"
                      min="0"
                      :max="roundNumber(parameter.parameters.constants as number, `parameter-${parameter.parameters.id_parameter}-constant-range`)"
                      :step="roundNumber(parameter.parameters.constants as number, `parameter-${parameter.parameters.id_parameter}-constant-range`) / 100"
                      v-model.number="parameter.parameters.constants"
                    />
                  </div>
                  <div>
                    <input
                      :id="`parameter-${parameter.parameters.id_parameter}-constant-input`"
                      type="number"
                      class="bg-sky-50 border border-sky-300 text-sky-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                      v-model.number="parameter.parameters.constants"
                    >
                  </div>
                </div>
                <div
                  v-else
                  v-for="year in parameter.years"
                  v-bind:key="`parameter-${parameter.parameters.id_parameter}-${year.key}`"
                  class="grid gap-2 py-1 items-center grid-cols-3"
                >
                  <div class="text-sky-600 font-bold text-xs">{{ year.key }}</div>
                  <div>
                    <input
                      :id="`parameter-${parameter.parameters.id_parameter}-${year.key}-range`"
                      type="range"
                      class="w-full h-1 bg-sky-200 rounded-lg appearance-none cursor-pointer"
                      min="0"
                      :max="roundNumber(year.value, `parameter-${parameter.parameters.id_parameter}-${year.key}-range`)"
                      :step="roundNumber(year.value, `parameter-${parameter.parameters.id_parameter}-${year.key}-range`) / 100"
                      v-model.number="year.value"
                    />
                  </div>
                  <div>
                    <input
                      :id="`parameter-${parameter.parameters.id_parameter}-${year.key}-input`"
                      type="number"
                      class="bg-sky-50 border border-sky-300 text-sky-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                      v-model.number="year.value"
                    >
                  </div>
                </div>
              </div>
              <div
                v-if="[43, 45].indexOf(parameter.parameters.id_parameter as number) > -1"
                class="bg-sky-100 rounded-b-xl text-center text-sm text-sky-500 p-2"
              >
                <button @click="useRenovationRate = !(useRenovationRate ?? false)">
                  <ArrowsRightLeftIcon
                    class="h-4 w-4 mt-[-3px] inline mr-1"
                  ></ArrowsRightLeftIcon>
                  Switch to <span class="font-bold italic">{{ useRenovationRate ? "affected dwellings" : "annual renovation rate" }}</span>
                  <InformationCircleIcon
                    @click="openModal('renovation')"
                    class="h-5 w-5 ml-1 cursor-pointer inline mt-[-3px]"
                  ></InformationCircleIcon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
