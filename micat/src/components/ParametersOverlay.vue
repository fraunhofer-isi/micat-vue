<!--
© 2024 - 2025 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import {onMounted, reactive, ref, watch, inject} from "vue";
import {XCircleIcon, ArrowsRightLeftIcon, InformationCircleIcon, ExclamationCircleIcon} from '@heroicons/vue/24/outline';
import {useSessionStore} from "@/stores/session";
import type {
  Parameters,
  SelectedImprovementInterface,
  ModalInjectInterface,
} from "@/types";
import {units, defaultModalInject} from "@/defaults";
import {getGlobalParametersPayload, restructureParameters} from "@/helpers";


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
const energyCarrierSumValid = ref<boolean>(true);
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
  const storedParams = JSON.parse(localStorage.getItem("parameters") || JSON.stringify({}));
  if (typeof storedParams[props.improvement.internalId] !== 'undefined') {
    parameters[props.improvement.internalId] = storedParams[props.improvement.internalId];
  } else {
    if (typeof parameters[props.improvement.internalId] === 'undefined') parameters[props.improvement.internalId] = {};
    await getParameters();
  }  
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
    },
    "global_parameters": getGlobalParametersPayload(session.globalParameters, session.monetisationFactorMapping),
  };

  const responseParameters: Response = await fetch(
    `${import.meta.env.VITE_API_URL}json_measure?id_mode=${session.future ? 2 : 4}&id_region=${session.region}&id_subsector=${props.improvement.subsectorId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...props.improvement.data?.values, ...body})
    },
  );
  const results = await responseParameters.json();
  // Remove affected fuel parameters for fuel switch improvements
  if (props.improvement.name!.toLowerCase().includes('fuel switch')) {
    delete results["affectedFuels"];
  }
  parameters[props.improvement.internalId] = restructureParameters(props.improvement.subsectorId!, props.improvement.name!, results);
}
const selectCategory = (category: string) => {
  activeCategory.value = category;
};
const roundNumber = (value: number, id: string, unit: string | number | undefined | null = null) => {
  // round to next one, hundred, thousand, million, billion, etc.
  if (!rangeIndex[id]) {
    rangeIndex[id] = Math.max(100, 10 ** (Math.ceil(Math.log10(value))) * 2);
  }
  // If the unit is a percentage, we need to make sure the range is capped at 100
  return unit && unit === '%' ? Math.min(rangeIndex[id], 100) : rangeIndex[id];
};
const checkEnergyCarrierValues = () => {
  if (activeCategory.value === 'main') {
    energyCarrierSumValid.value = true;
    for (const year of props.years) {
      const sum = parameters[props.improvement.internalId]['main'].filter((entry) => entry.parameters.id_parameter === 16 && entry.years.length > 0).reduce((acc, entry) => {
        return acc + entry.years.find(y => y.key === year.toString())!.value;
      }, 0);
      if (sum > 100) energyCarrierSumValid.value = false;
    }  
  }
};
const reset = () => {
  getParameters();
  activeCategory.value = Object.keys(parameters[props.improvement.internalId])[0];
  loading.value = false;
  energyCarrierSumValid.value = true;
}
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
              'rounded-bl-3xl': activeCategory === categoryName && i === Object.keys(parameters[props.improvement.internalId]).length - 1,
            }"
            v-for="(categoryName, i) in Object.keys(parameters[props.improvement.internalId])"
            v-bind:key="`parameter-${i}`"
          >
            <div class="py-3 font-bold capitalize grow whitespace-nowrap">{{ categoryName.replace(/([A-Z])/g, ' $1') }}</div>
          </div>
        </div>
        <div>
          <div>
            <div class="inline-block p-2 bg-sky-600 text-sky-500 rounded-br-xl">
              <span class="mr-2 font-bold text-sky-400">{{ improvement.program }}</span> &mdash;
              <span class="mx-2 font-bold text-sky-200">{{ improvement.subsector }}</span> &mdash;
              <span class="ml-2 mr-4 font-bold text-white">{{ improvement.name }}</span>
            </div>
          </div>
          <div
            v-if="activeCategory === 'main' && !energyCarrierSumValid"
            class="sticky flex p-4 mx-6 mt-3 text-sm text-yellow-800 border-t-4 border-yellow-300 top-2 bg-yellow-50 rounded-2xl"
            role="alert"
          >
            <ExclamationCircleIcon class="h-7 w-7"></ExclamationCircleIcon>
            <div class="ml-3 font-medium">
              The values of all energy carriers should normally sum up to 100%.
            </div>
          </div>
          <div class="grid grid-cols-2 px-5 py-2" v-if="activeCategory">
            <div
              v-for="parameter in parameters[props.improvement.internalId][activeCategory]"
              v-bind:key="`parameter-${parameter.identifier}`"
              class="block rounded-xl bg-white border border-sky-600 m-5 max-w-[450px] self-start"
              :class="{
                'hidden': parameter.parameters.id_parameter === 45 && useRenovationRate || [32, 43].indexOf(parameter.parameters.id_parameter as number) > -1 && !useRenovationRate,
              }"
            >
              <div class="flex items-center px-4 py-2 text-sm text-white justify-items-start bg-sky-600 rounded-t-xl">
                <span class="grow">{{ parameter.parameters.label }}</span>
                <InformationCircleIcon
                  @click="openModal(`advanced-parameters-${parameter.parameters.id_parameter}${parameter.parameters.id_final_energy_carrier ? `-${parameter.parameters.id_final_energy_carrier}` : ''}`)"
                  class="inline w-6 h-6 ml-2 cursor-pointer"
                ></InformationCircleIcon>
                <span class="px-2 py-1 ml-2 bg-white rounded-xl text-sky-600" v-if="!parameter.parameters.label.toString().toLowerCase().includes('efficiency')">{{ parameter.parameters.unit }}</span>
              </div>
              <div class="p-4">
                <div v-if="parameter.years.length === 0" class="grid items-center grid-cols-3 gap-2 py-1">
                  <div>
                    <input
                      :id="`parameter-${parameter.identifier}-constant-range`"
                      type="range"
                      class="w-full h-1 rounded-lg appearance-none cursor-pointer bg-sky-200"
                      min="0"
                      :max="roundNumber(parameter.parameters.constants as number, `parameter-${parameter.identifier}-constant-range`, parameter.parameters.unit)"
                      :step="roundNumber(parameter.parameters.constants as number, `parameter-${parameter.identifier}-constant-range`) / 100"
                      v-model.number="parameter.parameters.constants"
                    />
                  </div>
                  <div>
                    <VueNumberFormat
                      :value="parameter.parameters.constants"
                      class="bg-sky-50 border border-sky-300 text-sky-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                      :id="`parameter-${parameter.identifier}-constant-input`"
                      @change="(e: Event) => parameter.parameters.constants = parseFloat((e.target as HTMLInputElement).value.replace(',', ''))"
                    />
                  </div>
                </div>
                <div
                  v-else
                  v-for="year in parameter.years"
                  v-bind:key="`parameter-${parameter.identifier}-${year.key}`"
                  class="grid items-center grid-cols-3 gap-2 py-1"
                >
                  <div class="text-xs font-bold text-sky-600">{{ year.key }}</div>
                  <div>
                    <input
                      :id="`parameter-${parameter.identifier}-${year.key}-range`"
                      type="range"
                      class="w-full h-1 rounded-lg appearance-none cursor-pointer bg-sky-200"
                      min="0"
                      :max="roundNumber(year.value, `parameter-${parameter.identifier}-${year.key}-range`, parameter.parameters.unit)"
                      :step="roundNumber(year.value, `parameter-${parameter.identifier}-${year.key}-range`) / 100"
                      v-model.number="year.value"
                      @change="checkEnergyCarrierValues"
                    />
                  </div>
                  <div>
                    <VueNumberFormat
                      :value="year.value"
                      class="bg-sky-50 border border-sky-300 text-sky-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                      placeholder="0"
                      :id="`parameter-${parameter.identifier}-${year.key}-input`"
                      :options="{precision: 2}"
                      @change="(e: Event) => {
                        year.value = parseFloat((e.target as HTMLInputElement).value.replace(',', ''));
                        if (parameter.parameters.id_parameter === 16) checkEnergyCarrierValues();
                      }"
                    />
                  </div>
                </div>
              </div>
              <div
                v-if="[43, 45].indexOf(parameter.parameters.id_parameter as number) > -1"
                class="p-2 text-sm text-center bg-sky-100 rounded-b-xl text-sky-500"
              >
                <button @click="useRenovationRate = !(useRenovationRate ?? false)">
                  <ArrowsRightLeftIcon
                    class="h-4 w-4 mt-[-3px] inline mr-1"
                  ></ArrowsRightLeftIcon>
                  Switch to <span class="italic font-bold">{{ useRenovationRate ? "affected dwellings" : "annual renovation rate" }}</span>
                </button>
                <InformationCircleIcon
                  @click="openModal('renovation')"
                  class="h-5 w-5 ml-1 cursor-pointer inline mt-[-3px]"
                ></InformationCircleIcon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
