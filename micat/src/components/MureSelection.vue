<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import { storeToRefs } from 'pinia';
import {useSessionStore} from "@/stores/session";
import type {
  MureCategoryInterface,
  MureCountryInterface,
  MureMeasurementInterface,
  SubsectorInterface,
} from "@/types";
import { stages, mureSubsectorMapping } from "@/defaults";

const props = defineProps<{
  subsectors: Array<SubsectorInterface>,
}>()

const session = useSessionStore();
let categories: Array<MureCategoryInterface> = [];
let countries: Array<MureCountryInterface> = [];

// Refs
const loading = ref<boolean>(true);
const { mureCategory, mureCountry, mureMeasurement, mureData, years } = storeToRefs(session);
const measurements = ref<Array<MureMeasurementInterface>>([]);

// Lifecycle
onMounted(async () => {
  await getCategories();
  await getCountries();
  if (mureCategory.value && mureCountry.value) {
    await getMeasurements();
  }
});

// Functions
const getToken = async () => {
  const response = await fetch(`${import.meta.env.VITE_MURE_API_URL}login_check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "username": import.meta.env.VITE_MURE_USERNAME,
      "password": import.meta.env.VITE_MURE_PASSWORD,
    }),
  });
  const data = await response.json();
  session.mureToken = {
    token: data.token,
    expires: Date.now() + 1000 * 60 * 60,
  };
  session.updateMureToken(session.mureToken);
};
const getCategories = async () => {
  loading.value = true;
  if (!Object.prototype.hasOwnProperty.call(session.mureToken, 'token') || session.mureToken.expires < Date.now()) {
    // Refresh token
    await getToken();
  }
  const response = await fetch(`${import.meta.env.VITE_MURE_API_URL}categories`, {
    headers: {
      "Authorization": `Bearer ${session.mureToken?.token}`,
    },
  });
  const data = await response.json();
  // Do not show "General cross-cutting" category
  categories = data["hydra:member"].filter((category: MureCategoryInterface) => category.id !== 1);
  loading.value = false;
};
const getCountries = async () => {
  loading.value = true;
  if (!Object.prototype.hasOwnProperty.call(session.mureToken, 'token') || session.mureToken.expires < Date.now()) {
    // Refresh token
    await getToken();
  }
  const response = await fetch(`${import.meta.env.VITE_MURE_API_URL}countries`, {
    headers: {
      "Authorization": `Bearer ${session.mureToken?.token}`,
    },
  });
  const data = await response.json();
  countries = data["hydra:member"];
  loading.value = false;
};
const getMeasurements = async () => {
  loading.value = true;
  if (!Object.prototype.hasOwnProperty.call(session.mureToken, 'token') || session.mureToken.expires < Date.now()) {
    // Refresh token
    await getToken();
  }
  const response = await fetch(`${import.meta.env.VITE_MURE_API_URL}measures?category.id=${mureCategory.value}&country.id=${mureCountry.value}`, {
    headers: {
      "Authorization": `Bearer ${session.mureToken?.token}`,
    },
  });
  const data = await response.json();
  measurements.value = data["hydra:member"];
  measurements.value.map((measurement: MureMeasurementInterface) => {
    const id = measurement["@id"].split("/").pop();
    if (id) measurement.id = parseInt(id);
    return measurement;
  });
  loading.value = false;
};
const getMeasurementDetails = async () => {
  loading.value = true;
  if (!Object.prototype.hasOwnProperty.call(session.mureToken, 'token') || session.mureToken.expires < Date.now()) {
    // Refresh token
    await getToken();
  }
  const response = await fetch(`${import.meta.env.VITE_MURE_API_URL}measures/${mureMeasurement.value}`, {
    headers: {
      "Authorization": `Bearer ${session.mureToken?.token}`,
    },
  });
  const data = await response.json();
  mureData.value = data;
  
  // Set years
  if (mureData.value.targetedEndUses[0].cumulativeAnnualSavings.length == 1) {
    years.value = [2020, parseInt(mureData.value.targetedEndUses.filter((x) => x.cumulativeAnnualSavings.length > 0)[0].cumulativeAnnualSavings[0].year)];
  } else {
    years.value = mureData.value.targetedEndUses.filter((x) => x.cumulativeAnnualSavings.length > 0)[0].cumulativeAnnualSavings.map((savings: any) => parseInt(savings.year));
  }
  session.updateYears(years.value);
  // Set subsector for programs and values
  const programs = session.programs;
  programs.forEach(program => {
    program.improvements.forEach(improvement => {
      program.subsector = mureSubsectorMapping[session.mureCategory];
      const name = props.subsectors.filter(subsector => subsector.id === program.subsector)[0].name;
      program.subsectorName = name;
      Object.keys(improvement.values).forEach(key => {
        if (years.value.indexOf(parseInt(key)) === -1) {
          delete improvement.values[key];
        }
      });
      years.value.forEach(year => {
        const value = mureData.value.targetedEndUses.filter((x) => x.cumulativeAnnualSavings.length > 0)[0].cumulativeAnnualSavings.find((savings: any) => savings.year === year.toString());
        if (typeof value === "undefined") {
          improvement.values[year.toString()] = 0;
        } else {
          improvement.values[year.toString()] = value.calculatedPj ? value.calculatedPj * 1000000 : value.pj ? value.pj * 1000000 : 0;
        }
      });
    });
  });
  session.updatePrograms(programs);
  loading.value = false;
};

// Watchers
watch(mureCategory, (mureCategory) => {  
  session.updateMureCategory(mureCategory);
  getMeasurements();
});
watch(mureCountry, (mureCountry) => {  
  session.updateMureCountry(mureCountry);
  getMeasurements();
});
watch(mureMeasurement, (mureMeasurement) => {  
  session.updateMureMeasurement(mureMeasurement);
  getMeasurementDetails();
});
</script>

<template>
  <div role="status" v-if="loading" class="p-5 text-center">
      <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span class="sr-only">Loading...</span>
  </div>
  <div v-else class="relative px-8 py-8 mb-5 border border-gray-300 rounded-3xl dark:border-gray-400">
    <div class="absolute top-[-14px] left-0 w-full text-center">
      <span class="inline-block px-4 italic font-bold bg-white dark:bg-blue-950 dark:text-white">
        <span>ODYSEE-MURE</span>
      </span>
    </div>
    <div class="grid items-center grid-cols-5">
      <div class="col-span-2">
        <label for="category" class="text-sm dark:text-white">Sector</label>
      </div>
      <div class="col-span-3">
        <select
          id="category"
          class="block py-2.5 px-0 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
          v-model="mureCategory"
          v-if="session.stage === stages.home"
        >
          <option disabled value="">Select a sector</option>
          <option v-for="category in categories" v-bind:key="`category-${category.id}`" :value="category.id">{{
              category.label
            }}
          </option>
        </select>
        <span class="text-sm font-bold text-gray-200" v-else>{{ categories.find(c => c.id === mureCategory)?.label }}</span>
      </div>
      <div class="col-span-2">
        <label for="country" class="text-sm dark:text-white">Country</label>
      </div>
      <div class="col-span-3">
        <select
          id="country"
          class="block py-2.5 px-0 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
          v-model="mureCountry"
          v-if="session.stage === stages.home"
        >
          <option disabled value="">Select a country</option>
          <option v-for="country in countries" v-bind:key="`country-${country.id}`" :value="country.id">{{
              country.name
            }}
          </option>
        </select>
        <span class="text-sm font-bold text-gray-200" v-else>{{ countries.find(c => c.id === mureCountry)?.name }}</span>
      </div>
      <div class="col-span-2" v-if="mureCategory && mureCountry">
        <label for="measurement" class="text-sm dark:text-white">Measurement</label>
      </div>
      <div class="col-span-3" v-if="mureCategory && mureCountry">
        <select
          id="measurement"
          class="block py-2.5 px-0 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
          v-model="mureMeasurement"
          v-if="session.stage === stages.home"
        >
          <option disabled value="">Select a measurement</option>
          <option v-for="measurement in measurements" v-bind:key="`country-${measurement.id}`" :value="measurement.id">{{
              measurement.title
            }}
          </option>
        </select>
        <span class="text-sm font-bold text-gray-200" v-else>{{ measurements.find(m => m.id === mureMeasurement)?.title }}</span>
      </div>
    </div>  
  </div>
</template>
