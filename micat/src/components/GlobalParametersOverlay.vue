<!--
© 2024 - 2026 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import {onMounted, reactive, ref, watch, inject} from "vue";
import {
  XCircleIcon,
  CheckIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import {useSessionStore} from "@/stores/session";
import { defaultModalInject } from "@/defaults";
import type {CarrierMapping, GlobalParameters, GlobalParameterValue, PayloadParameterEntryInterface, ModalInjectInterface} from "@/types";

const session = useSessionStore();

// Refs
const activeCategory = ref<string>("");
const activeSubsector = ref<number>(0);
const loading = ref<boolean>(true);

let globalParameters = reactive<GlobalParameters>(session.globalParameters);
let subsectorMapping = reactive<{[key: number]: string}>(session.subsectorMapping);
let carrierMapping = reactive<CarrierMapping>(session.carrierMapping);
let monetisationFactorMapping = reactive<{[key: number]: string}>(session.monetisationFactorMapping);

// Watchers
watch(globalParameters, (globalParameters: GlobalParameters) => {
  session.updateGlobalParameters(globalParameters);
});
watch(subsectorMapping, (subsectorMapping: {[key: number]: string}) => {
  session.updateSubsectorMapping(subsectorMapping);
});
watch(carrierMapping, (carrierMapping: CarrierMapping) => {
  session.updateCarrierMapping(carrierMapping);
});
watch(monetisationFactorMapping, (monetisationFactorMapping: {[key: number]: string}) => {
  session.updateMonetisationFactorMapping(monetisationFactorMapping);
});

// Variables
const rangeIndex: {[key: string]: number} = {};

// Lifecycle
onMounted(async () => {
  if (Object.keys(JSON.parse(localStorage.getItem("globalParameters") || JSON.stringify({}))).length == 0) {    
    await getAndStructureGlobalParameters(true);
  }
  activeCategory.value = Object.keys(globalParameters)[0];
  activeSubsector.value = Number(Object.keys(globalParameters[activeCategory.value])[0]);
  loading.value = false;
});

// Functions
const getAndStructureGlobalParameters = async (reset: boolean = false) => {
  session.updateGlobalParameters({});
  loading.value = true;
  const years = session.years.map(y => `&years=${y}`).join('');
  const responseGlobalParameters: Response = await fetch(`${import.meta.env.VITE_API_URL}json_parameters?id_region=${session.region}&orient=records${years}`);
  const results = await responseGlobalParameters.json();
  // Re-structure parameters
  const yearRegex = /^[0-9]+$/;
  for (const [category, dataSet] of Object.entries(results)) {
    if (category === 'Options') continue;
    // Add category key, if it doesn't exist yet
    if (!globalParameters[category] || reset) globalParameters[category] = {};
    for (const data of (dataSet as Array<PayloadParameterEntryInterface>)) {
      // Add subsector key, if it doesn't exist yet
      let subsectorId = data['id_subsector'] ? data['id_subsector'] : 0;
      subsectorMapping[subsectorId] = data['Subsector'] ? data['Subsector'] : 'General';
      if (!globalParameters[category][subsectorId]) globalParameters[category][subsectorId] = {};

      if (category === 'MonetisationFactors') {
        if (!data['Monetisation factor'] || typeof data['Value'] === 'undefined' || data['index'] === null || typeof data['index'] === 'undefined') continue;
        monetisationFactorMapping[data['index']] = data['Monetisation factor'];
        globalParameters[category][subsectorId][data['index']] = [];
        if (data['Value'] !== null) {
          // monetisation factors might have one value only
          globalParameters[category][subsectorId][data['index']].push({
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
            if (value === null || data['index'] === null || typeof data['index'] === 'undefined') continue;
            globalParameters[category][subsectorId][data['index']].push({key: parseInt((key as string)), value: (value as number)});
          } else if (data['id_final_energy_carrier'] || data['id_primary_energy_carrier']) {
            // Add year key, if it doesn't exist yet
            if (!globalParameters[category][subsectorId][key]) globalParameters[category][subsectorId][key] = [];
            // Map carrier data
            if (!carrierMapping['final']) carrierMapping['final'] = {};
            if (!carrierMapping['primary']) carrierMapping['primary'] = {};
            if (data['id_final_energy_carrier'] && data['Final energy carrier']) carrierMapping['final'][data['id_final_energy_carrier']] = data['Final energy carrier'];
            if (data['id_primary_energy_carrier'] && data['Primary energy carrier']) carrierMapping['primary'][data['id_primary_energy_carrier']] = data['Primary energy carrier'];
            globalParameters[category][subsectorId][key].push({
              key: data['id_final_energy_carrier'] ? data['id_final_energy_carrier'] : data['id_primary_energy_carrier'] ? data['id_primary_energy_carrier'] : 0,
              carrierType: data['id_final_energy_carrier'] ? 'final' : 'primary',
              value: ['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(category) > -1 ? (value as number) * 100 : (value as number),
            });
          }
        }
      }
    }
  }
}
const selectCategory = (category: string) => {
  activeCategory.value = category;
  activeSubsector.value = Number(Object.keys(globalParameters[activeCategory.value])[0]);
};
const roundNumber = (value: number, id: string) => {
  // round to next one, hundred, thousand, million, billion, etc.
  if (!rangeIndex[id]) {
    rangeIndex[id] = Math.max(1, 10 ** (Math.ceil(Math.log10(value))) * 2);
  }
  return rangeIndex[id];
};
const reset = async () => {
  await getAndStructureGlobalParameters(true);
  activeCategory.value = Object.keys(globalParameters)[0];
  activeSubsector.value = Number(Object.keys(globalParameters[activeCategory.value])[0]);
  loading.value = false;
}
const entriesAreValid = (entries: Array<GlobalParameterValue>) => {
  // Check if all entries sum up to (almost) 1, or 100% in case of FuelSplitCoefficient, HeatGeneration or ElectricityGeneration
  const factor = ['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(activeCategory.value) > -1 ? 100 : 1;
  return Math.abs(entries.map((entry) => entry.value || 0).reduce((a, b) => a + b)) == factor;
};
const entriesAreNull = (entries: Array<GlobalParameterValue>) => {
  // Check if all entries are null
  return entries.map((entry) => entry.value).every(x => x === null);
};
const reformatCategoryTitle = (categoryName: string) => {
  let name = categoryName.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  return name[0].toUpperCase() + name.slice(1);
};
const getCategoryTitle = (categoryName: string) => {
  switch (categoryName) {
    case 'FuelSplitCoefficient':
      return 'Energy mix coefficient';
    case 'EnergyPrice':
      return 'Energy prices';
    default:
      return reformatCategoryTitle(categoryName);
  }
};
const getFactorTitle = (factor: string) => {
  const cleaned_factor = getCleanedMonetisationFactorName(factor);
  switch (cleaned_factor) {
    case 'CostpertonofemittedCO2':
      return 'Cost of CO2-emissions';
    default:
      // Remove units
      return factor.replace(/ \[[\s\S]*?\]|/g, '');
  }
};  
const getFactorUnit = (factor: string) => {  
  const cleaned_factor = getCleanedMonetisationFactorName(factor);
  const regExp = /\[([^)]+)\]/;

  switch (cleaned_factor) {
    case 'CostpertonofemittedCO2':
      return '€/ktCO2';
    default:
      return regExp.exec(factor)![1];
  }
};
const getCleanedMonetisationFactorName = (factor: string) => { 
  return factor.replace(/ \[[\s\S]*?\]|\s/g, '');
};
const getMaxValue = (value: number, identifier: string) => {
  if (['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(activeCategory.value) > -1) return 100;
  if (activeCategory.value === 'EnergyPrice') return 5000;
  return roundNumber(value || 0, identifier)
};
const getStepValue = (value: number, identifier: string) => {
  if (['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(activeCategory.value) > -1) return 1;
  if (activeCategory.value === 'EnergyPrice') return 100;
  return roundNumber(value || 0, identifier) / 100
};

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject
</script>

<template>
  <div role="status" v-if="loading" class="p-5 text-center">
      <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span class="sr-only">Loading...</span>
  </div>
  <div v-else class="max-w-screen-xl pt-5 pb-10 mx-auto">
    <div class="flex items-center justify-between gap-2 pb-2">
      <a href="#" @click="$emit('close')" class="text-sm text-orange-700 dark:text-orange-300">back to the entries</a>
      <button
        class="py-2 pl-3 pr-4 mr-3 text-xs font-bold text-white uppercase bg-gray-500 rounded-full hover:bg-gray-600"
        @click="reset()"
        :disabled="loading"
      >
        <XCircleIcon class="h-5 w-5 mt-[-3px] inline text-white"></XCircleIcon>
        Reset to defaults
      </button>
    </div>
    <div
      v-if="Object.keys(session.globalParameters).length > 0 && Object.keys(session.parameters).length > 0"
      class="flex p-4 mt-5 text-sm text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 rounded-2xl"
      role="alert"
    >
      <ExclamationCircleIcon class="h-7 w-7"></ExclamationCircleIcon>
      <div class="ml-3 font-medium">
        You have made changes to the advanced parameters in one or more programmes. Changes to the global parameters are only taken into account if the advanced parameters of the corresponding programmes are reset.
      </div>
    </div>
    <div class="relative my-3 bg-white border border-gray-300 rounded-3xl">
      <div @click="$emit('close')"
           class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-orange-700 dark:text-orange-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="self-stretch bg-orange-600 rounded-l-3xl">
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
              'rounded-bl-3xl': activeCategory === categoryName && i === Object.keys(globalParameters).length - 1,
            }"
            v-for="(categoryName, i) in Object.keys(globalParameters)"
            v-bind:key="`global-parameter-${i}`"
          >
            <div class="py-3 grow">
              <span class="font-bold">{{ getCategoryTitle(categoryName) }}</span>
              <InformationCircleIcon
                @click="openModal(categoryName)"
                class="inline w-6 h-6 ml-2 cursor-pointer"
              ></InformationCircleIcon>
            </div>
          </div>
        </div>
        <div class="flex" v-if="activeCategory">
          <div class="self-start bg-orange-500" v-if="Object.keys(globalParameters[activeCategory]).length > 1">
            <div
              class="flex items-center px-3 py-3 text-sm cursor-pointer"
              @click="activeSubsector = Number(subsector)"
              :class="{
                'text-white': activeSubsector !== Number(subsector),
                'text-orange-700': activeSubsector === Number(subsector),
                'bg-white': activeSubsector === Number(subsector),
                'hover:text-orange-600': activeSubsector === Number(subsector),
                'hover:bg-orange-600': activeSubsector !== Number(subsector),
              }"
              v-for="(subsector, i) in Object.keys(globalParameters[activeCategory])"
              v-bind:key="`global-parameters-subcategory-${i}`"
            >
              <span class="mr-8 font-bold grow whitespace-nowrap">{{ subsectorMapping[Number(subsector)] }}</span>
              <CheckIcon v-if="activeSubsector === Number(subsector)" class="w-5 h-5"></CheckIcon>
            </div>
          </div>
          <div class="px-5 py-3">
            <div
              v-for="[yearOrFactor, entries] in Object.entries(globalParameters[activeCategory][activeSubsector])"
              v-bind:key="`global-parameters-years-${yearOrFactor}`"
              class="block rounded-xl bg-white border border-orange-600 m-5 max-w-[450px]">
              <div
                class="flex items-center px-4 py-2 text-white bg-orange-600 rounded-t-xl justify-items-start">
                <span class="grow">{{ activeCategory === 'MonetisationFactors' ? getFactorTitle(monetisationFactorMapping[Number(yearOrFactor)]) : yearOrFactor }}</span>
                <InformationCircleIcon
                  v-if="activeCategory === 'MonetisationFactors'"
                  @click="openModal(getCleanedMonetisationFactorName(monetisationFactorMapping[Number(yearOrFactor)]))"
                  class="inline w-6 h-6 ml-2 cursor-pointer"
                ></InformationCircleIcon>
                <span v-if="activeCategory === 'MonetisationFactors'" class="px-2 py-1 ml-2 text-xs bg-white rounded-xl text-sky-600">{{ getFactorUnit(monetisationFactorMapping[Number(yearOrFactor)]) }}</span>
                <span v-if="activeCategory === 'EnergyPrice'" class="px-2 py-1 ml-2 text-xs bg-white rounded-xl text-sky-600">M€/ktoe</span>
                <span v-else-if="['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(activeCategory) > -1" class="px-2 py-1 ml-2 text-xs bg-white rounded-xl text-sky-600">% or absolute</span>
              </div>
              <div class="p-4">
                <div
                  v-for="(entry, i) in entries"
                  v-bind:key="`global-parameters-years-${yearOrFactor}-${i}`"
                  class="grid items-center gap-2 py-1"
                  :class="{
                    'grid-cols-3': entries.length > 1,
                    'grid-cols-2': entries.length == 1,
                  }"
                >
                  <div class="text-xs font-bold text-orange-600" v-if="entries.length > 1">{{ activeCategory === 'MonetisationFactors' ? entry.key : carrierMapping[entry.carrierType!][entry.key] }}</div>
                  <div>
                    <input
                      :id="`global-parameters-years-${yearOrFactor}-${i}-range`"
                      type="range"
                      class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                      min="0"
                      :max="getMaxValue(entry.value || 0, `global-parameters-years-${yearOrFactor}-${i}-range`)"
                      :step="getStepValue(entry.value || 0, `global-parameters-years-${yearOrFactor}-${i}-range`)"
                      v-model.number="entry.value"
                    />
                  </div>
                  <div>
                    <VueNumberFormat
                      :value="entry.value"
                      class="bg-orange-50 border border-orange-300 text-orange-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                      placeholder="0"
                      :id="`global-parameters-years-${yearOrFactor}-${i}-input`"
                      :options="{precision: activeCategory === 'MonetisationFactors' ? 0 : 2}"
                      @change="(e: Event) => entry.value = parseFloat((e.target as HTMLInputElement).value.replace(/,/g, ''))"
                    />
                  </div>
                </div>
                
                <div
                  v-if="activeCategory !== 'MonetisationFactors' && entriesAreNull(entries)"
                  class="flex p-4 mt-5 text-sm text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 rounded-2xl"
                  role="alert"
                >
                  <div class="ml-3 font-medium">
                    The default values for these fields are confidential. Thus, they cannot be displayed. However, in case you know the values for your specific use case, you can input it in these fields, in order to improve the results' accuracy.
                  </div>
                </div>
                <div
                  v-else-if="['MonetisationFactors', 'EnergyPrice'].indexOf(activeCategory) === -1 && !entriesAreValid(entries)"
                  class="flex p-4 mt-5 text-sm text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 rounded-2xl"
                  role="alert"
                >
                  <ExclamationCircleIcon class="h-7 w-7"></ExclamationCircleIcon>
                  <div class="ml-3 font-medium">
                    The values of all energy carriers should normally sum up to {{ ['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(activeCategory) > -1 ? "100%" : "1" }}.
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
