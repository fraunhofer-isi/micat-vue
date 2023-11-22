<script setup lang="ts">
import {onMounted, ref} from "vue";
import { XCircleIcon } from '@heroicons/vue/24/outline';
import {useSessionStore} from "@/stores/session";
import type {ParameterEntry, Parameters, PayloadParameterEntryInterface} from "@/types";

const session = useSessionStore();

// Refs
const activeCategory = ref<string>("");
const loading = ref<boolean>(true);

// Variables
const rangeIndex: {[key: string]: number} = {};

// Lifecycle
onMounted(async () => {
  if (Object.keys(session.parameters).length == 0) {
    await getParameters();
  }
  activeCategory.value = Object.keys(session.parameters)[0];
  loading.value = false;
});

// Functions
const getParameters = async () => {
  loading.value = true;
  const responseParameters: Response = await fetch(
    `${import.meta.env.VITE_API_URL}json_measure?id_mode=${session.future ? 4 : 2}&id_region=${session.region}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "2000": 0,
        "2010": 0,
        "2015": 0,
        "2020": 10,
        "2025": 20,
        "2030": 30,
        "id": 1,
        "row_number": 1,
        "active": true,
        "subsector": {
          "id": 1,
          "label": "Average agriculture",
          "_description": "Agriculture, forestry & fishing"
        },
        "action_type": {
         "id": 8,
         "label": "Cross-cutting technologies",
         "_description": "Energy-efficient electric cross-cutting technologies"
        },
        "details": {},
        "unit": {
          "name": "kilotonne of oil equivalent",
          "symbol": "ktoe",
          "factor": 1
        }
      })
    },
  );
  const results = await responseParameters.json();
  const restructuredResults: Parameters = {};
  const yearRegex = /^[0-9]+$/;
  for (const [category, dataSet] of Object.entries(results)) {
    if (category === 'context') continue;
    // Add category key, if it doesn't exist yet
    if (!restructuredResults[category]) restructuredResults[category] = [];
    for (const data of (dataSet as Array<PayloadParameterEntryInterface>)) {
      const entry: ParameterEntry = {years: [], parameters: {}};
      for (const [key, v] of Object.entries((data as {[key: string]: number | string}))) {
        const value: number = (v as number);
        if (yearRegex.test(key)) {
          entry.years.push({key, value});
        } else {
          entry.parameters[key] = value;
        }
      }
      restructuredResults[category].push(entry);
    }
  }
  session.parameters = restructuredResults;
  /*
  {
    "main": [
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 10,
            "2025": 20,
            "2030": 30,
            "id_parameter": null,
            "id_final_energy_carrier": null,
            "label": "Energy savings",
            "unit": "ktoe",
            "importance": "mandatory",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 23067294.1018785,
            "2025": 46134588.203757,
            "2030": 69201882.3056355,
            "id_parameter": 40,
            "id_final_energy_carrier": null,
            "label": "Investment costs",
            "unit": "€",
            "importance": "mandatory",
            "constants": null
        },
        {
            "2000": 30,
            "2010": 30,
            "2015": 30,
            "2020": 30,
            "2025": 30,
            "2030": 30,
            "id_parameter": 35,
            "id_final_energy_carrier": null,
            "label": "Average subsidy rate",
            "unit": "%",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": null,
            "2010": null,
            "2015": null,
            "2020": null,
            "2025": null,
            "2030": null,
            "id_parameter": 36,
            "id_final_energy_carrier": null,
            "label": "Average technology lifetime",
            "unit": "years",
            "importance": "optional",
            "constants": 8
        },
        {
            "2000": 1,
            "2010": 1,
            "2015": 1,
            "2020": 1,
            "2025": 1,
            "2030": 1,
            "id_parameter": 16,
            "id_final_energy_carrier": 1,
            "label": "Share of electricity among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 16,
            "id_final_energy_carrier": 2,
            "label": "Share of oil among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 16,
            "id_final_energy_carrier": 3,
            "label": "Share of coal among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 16,
            "id_final_energy_carrier": 4,
            "label": "Share of gas among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 16,
            "id_final_energy_carrier": 5,
            "label": "Share of biomass and waste among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 16,
            "id_final_energy_carrier": 6,
            "label": "Share of heat among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 16,
            "id_final_energy_carrier": 7,
            "label": "Share of H2 and e-fuels among affected",
            "unit": "absolute, %, or share",
            "importance": "recommended",
            "constants": null
        }
    ],
    "fuelSwitch": [
        {
            "2000": 10000,
            "2010": 10000,
            "2015": 10000,
            "2020": 10000,
            "2025": 10000,
            "2030": 10000,
            "id_parameter": 17,
            "id_final_energy_carrier": 1,
            "label": "Share of electricity among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 30000,
            "2010": 30000,
            "2015": 30000,
            "2020": 30000,
            "2025": 30000,
            "2030": 30000,
            "id_parameter": 17,
            "id_final_energy_carrier": 2,
            "label": "Share of oil among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 7000,
            "2010": 7000,
            "2015": 7000,
            "2020": 7000,
            "2025": 7000,
            "2030": 7000,
            "id_parameter": 17,
            "id_final_energy_carrier": 3,
            "label": "Share of coal among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 50000,
            "2010": 50000,
            "2015": 50000,
            "2020": 50000,
            "2025": 50000,
            "2030": 50000,
            "id_parameter": 17,
            "id_final_energy_carrier": 4,
            "label": "Share of gas among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 30000,
            "2010": 30000,
            "2015": 30000,
            "2020": 30000,
            "2025": 30000,
            "2030": 30000,
            "id_parameter": 17,
            "id_final_energy_carrier": 5,
            "label": "Share of biomass and waste among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 17,
            "id_final_energy_carrier": 6,
            "label": "Share of heat among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 17,
            "id_final_energy_carrier": 7,
            "label": "Share of H2 and e-fuels among removed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 60,
            "2010": 60,
            "2015": 60,
            "2020": 60,
            "2025": 60,
            "2030": 60,
            "id_parameter": 18,
            "id_final_energy_carrier": 1,
            "label": "Share of electricity among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 18,
            "id_final_energy_carrier": 2,
            "label": "Share of oil among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 18,
            "id_final_energy_carrier": 3,
            "label": "Share of coal among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 10,
            "2010": 10,
            "2015": 10,
            "2020": 10,
            "2025": 5,
            "2030": 5,
            "id_parameter": 18,
            "id_final_energy_carrier": 4,
            "label": "Share of gas among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 10,
            "2010": 10,
            "2015": 10,
            "2020": 10,
            "2025": 10,
            "2030": 5,
            "id_parameter": 18,
            "id_final_energy_carrier": 5,
            "label": "Share of biomass and waste among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 20,
            "2010": 20,
            "2015": 20,
            "2020": 20,
            "2025": 20,
            "2030": 25,
            "id_parameter": 18,
            "id_final_energy_carrier": 6,
            "label": "Share of heat among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 5,
            "2030": 5,
            "id_parameter": 18,
            "id_final_energy_carrier": 7,
            "label": "Share of H2 and e-fuels among installed",
            "unit": "absolute, %, or share",
            "importance": "recommended"
        },
        {
            "2000": 1,
            "2010": 1,
            "2015": 1,
            "2020": 1,
            "2025": 1,
            "2030": 1,
            "id_parameter": 14,
            "id_final_energy_carrier": 1,
            "label": "Efficiency of removed electricity",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.736,
            "2010": 0.736,
            "2015": 0.736,
            "2020": 0.736,
            "2025": 0.736,
            "2030": 0.744,
            "id_parameter": 14,
            "id_final_energy_carrier": 2,
            "label": "Efficiency of removed oil",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.4,
            "2010": 0.4,
            "2015": 0.4,
            "2020": 0.4,
            "2025": 0.48,
            "2030": 0.544,
            "id_parameter": 14,
            "id_final_energy_carrier": 3,
            "label": "Efficiency of removed coal",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.792,
            "2010": 0.792,
            "2015": 0.792,
            "2020": 0.792,
            "2025": 0.792,
            "2030": 0.8,
            "id_parameter": 14,
            "id_final_energy_carrier": 4,
            "label": "Efficiency of removed gas",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.668,
            "2010": 0.668,
            "2015": 0.668,
            "2020": 0.668,
            "2025": 0.684,
            "2030": 0.704,
            "id_parameter": 14,
            "id_final_energy_carrier": 5,
            "label": "Efficiency of removed biomass and waste",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.792,
            "2010": 0.792,
            "2015": 0.792,
            "2020": 0.792,
            "2025": 0.792,
            "2030": 0.794,
            "id_parameter": 14,
            "id_final_energy_carrier": 6,
            "label": "Efficiency of removed heat",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.792,
            "2010": 0.792,
            "2015": 0.792,
            "2020": 0.792,
            "2025": 0.792,
            "2030": 0.8,
            "id_parameter": 14,
            "id_final_energy_carrier": 7,
            "label": "Efficiency of removed H2 and e-fuels",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 3.025,
            "2010": 3.025,
            "2015": 3.025,
            "2020": 3.025,
            "2025": 3.175,
            "2030": 3.325,
            "id_parameter": 15,
            "id_final_energy_carrier": 1,
            "label": "Efficiency of installed electricity",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.92,
            "2010": 0.92,
            "2015": 0.92,
            "2020": 0.92,
            "2025": 0.92,
            "2030": 0.93,
            "id_parameter": 15,
            "id_final_energy_carrier": 2,
            "label": "Efficiency of installed oil",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.5,
            "2010": 0.5,
            "2015": 0.5,
            "2020": 0.5,
            "2025": 0.6,
            "2030": 0.68,
            "id_parameter": 15,
            "id_final_energy_carrier": 3,
            "label": "Efficiency of installed coal",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.99,
            "2010": 0.99,
            "2015": 0.99,
            "2020": 0.99,
            "2025": 0.99,
            "2030": 1,
            "id_parameter": 15,
            "id_final_energy_carrier": 4,
            "label": "Efficiency of installed gas",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.835,
            "2010": 0.835,
            "2015": 0.835,
            "2020": 0.835,
            "2025": 0.855,
            "2030": 0.88,
            "id_parameter": 15,
            "id_final_energy_carrier": 5,
            "label": "Efficiency of installed biomass and waste",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.99,
            "2010": 0.99,
            "2015": 0.99,
            "2020": 0.99,
            "2025": 0.99,
            "2030": 0.9925,
            "id_parameter": 15,
            "id_final_energy_carrier": 6,
            "label": "Efficiency of installed heat",
            "unit": "absolute, %, or share",
            "importance": "optional"
        },
        {
            "2000": 0.99,
            "2010": 0.99,
            "2015": 0.99,
            "2020": 0.99,
            "2025": 0.99,
            "2030": 1,
            "id_parameter": 15,
            "id_final_energy_carrier": 7,
            "label": "Efficiency of installed H2 and e-fuels",
            "unit": "absolute, %, or share",
            "importance": "optional"
        }
    ],
    "residential": [
        {
            "2000": 0,
            "2010": 0,
            "2015": 0,
            "2020": 0,
            "2025": 0,
            "2030": 0,
            "id_parameter": 45,
            "label": "Number of affected dwellings",
            "unit": "absolute",
            "importance": "recommended"
        },
        {
            "2000": 7.5372464933,
            "2010": 7.5064568054,
            "2015": 7.46015646,
            "2020": 7.4138561146,
            "2025": 7.3855596194,
            "2030": 7.3572631242,
            "id_parameter": 42,
            "label": "Energy poverty targetednes ",
            "unit": "%",
            "importance": "optional"
        },
        {
            "2000": 23754205.51982583,
            "2010": 23924812.46237311,
            "2015": 23968007.16277976,
            "2020": 24011201.8631864,
            "2025": 24062569.76836053,
            "2030": 24113937.67353465,
            "id_parameter": 32,
            "label": "Total dwelling stock",
            "unit": "absolute",
            "importance": "optional"
        },
        {
            "2000": null,
            "2010": null,
            "2015": null,
            "2020": null,
            "2025": null,
            "2030": null,
            "id_parameter": 43,
            "label": "Annual renovation rate",
            "unit": "%",
            "importance": "alternative to 1"
        },
        {
            "2000": 2.7910192859,
            "2010": 2.7957430319,
            "2015": 2.7937031776,
            "2020": 2.7916633234,
            "2025": 2.7905592406,
            "2030": 2.7894551579,
            "id_parameter": 31,
            "label": "Average number of households per building",
            "unit": "absolute",
            "importance": "optional"
        },
        {
            "2000": 3786.2989095585,
            "2010": 3835.0575411653,
            "2015": 3857.204751368,
            "2020": 3879.3519615708,
            "2025": 3899.888507181,
            "2030": 3920.4250527912,
            "id_parameter": 29,
            "label": "Average rent of energy poor households",
            "unit": "€",
            "importance": "optional"
        },
        {
            "2000": 8,
            "2010": 8,
            "2015": 8,
            "2020": 8,
            "2025": 8,
            "2030": 8,
            "id_parameter": 34,
            "label": "Average renovation rent premium",
            "unit": "% of rent",
            "importance": "optional"
        }
    ]
}
  * */
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
  activeCategory.value = Object.keys(session.parameters)[0];
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
              'rounded-bl-3xl': activeCategory === categoryName && i === Object.keys(session.parameters).length - 1,
            }"
            v-for="(categoryName, i) in Object.keys(session.parameters)"
            v-bind:key="`parameter-${i}`"
          >
            <div class="py-3 grow font-bold capitalize whitespace-nowrap">{{ categoryName.replace(/([A-Z])/g, ' $1') }}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 px-5 py-2" v-if="activeCategory">
          <div
            v-for="parameter in session.parameters[activeCategory]"
            v-bind:key="`parameter-${parameter.parameters.id_parameter}`"
            class="block rounded-xl bg-white border border-orange-600 m-5 max-w-[450px]">
            <div
              class="bg-orange-600 rounded-t-xl text-white px-4 py-2">
              {{ parameter.parameters.label }}
            </div>
            <div class="p-4">
              <div
                v-for="year in parameter.years"
                v-bind:key="`parameter-${parameter.parameters.id_parameter}-${year.key}`"
                class="grid gap-2 py-1 items-center grid-cols-3"
              >
                <div class="text-orange-600 font-bold text-xs">{{ year.key }}</div>
                <div>
                  <input
                    :id="`parameter-${parameter.parameters.id_parameter}-${year.key}-range`"
                    type="range"
                    class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
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
                    class="bg-orange-50 border border-orange-300 text-orange-600 mx-2 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline"
                    v-model.number="year.value"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
