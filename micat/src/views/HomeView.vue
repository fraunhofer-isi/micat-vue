<script setup async lang="ts">
import { inject, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import type { CountryInterface, ModalInjectInterface } from "@/types";
import { defaultModalInject } from "@/defaults";

const { openModal } = inject<ModalInjectInterface>('showModal') || defaultModalInject
let countries: Ref<Array<Array<number | string>>> = ref([]);

onMounted(async () => {
  const response: Response = await fetch(`${import.meta.env.VITE_API_URL}id_region`);
  const data = await response.json();
  countries.value = data.rows;
})

const units = {
  "headers": [
    "id",
    "label",
    "description"
  ],
  "rows": [
    [
        1,
        "ktoe (tonne of oil equivalent)"
    ],
    [
        2,
        "MJ (Megajoule)"
    ],
  ]
}
</script>

<template>
  <main>
    <div class="grid grid-cols-2 max-w-screen-xl mx-auto mt-[15vh]">
      <div class="col pr-[7rem]">
        <h1 class="text-4xl dark:text-white font-bold leading-normal">Assess the impacts of energy efficiency projects</h1>
        <p class="mt-6 text-lg font-light dark:text-white">Select a suitable scenario from the world of energy efficiency, optionally add your own values and receive a comprehensive analysis for your region.</p>
      </div>
      <div class="col">
        <div class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mb-5">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block font-bold italic bg-white dark:bg-blue-950 dark:text-white px-4">Select your use case</span>
          </div>
          <div class="grid grid-cols-2 items-center">
            <!-- time frame -->
            <div>
              <label for="timeframe" class="dark:text-white text-sm">Time frame</label>
              <InformationCircleIcon @click="openModal('timeframe')" class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div>
              <label for="timeframe" class="inline-flex items-center rounded-full cursor-pointer dark:text-gray-800 border border-sky-600 dark:border-0">
                <input id="timeframe" type="checkbox" class="hidden peer">
                <span class="leading-3 px-8 pt-4 pb-3 rounded-l-full bg-sky-600 text-white peer-checked:text-sky-900 peer-checked:bg-white text-center"><span class="uppercase font-bold">past</span><br><span class="text-sm">(ex-post)</span></span>
                <span class="leading-3 px-8 pt-4 pb-3 rounded-r-full dark:bg-white text-sky-900 peer-checked:bg-sky-600 peer-checked:text-white text-center"><span class="uppercase font-bold">future</span><br><span class="text-sm">(ex-ante)</span></span>
              </label>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="mt-8">
              <label for="region" class="dark:text-white text-sm">Region</label>
              <InformationCircleIcon @click="openModal('region')" class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8">
              <select id="region" class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
                  <option v-for="(country, i) in countries" v-bind:key="`country-${i}`" :value="country[0]" :selected="i === 0">{{ country[1] }}</option>
              </select>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="mt-8">
              <label for="unit" class="dark:text-white text-sm">Unit</label>
              <InformationCircleIcon @click="openModal('unit')" class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8">
              <select id="unit" class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
                  <option v-for="(unit, i) in units.rows" v-bind:key="`unit-${i}`" :value="unit[0]" :selected="i === 0">{{ unit[1] }}</option>
              </select>
            </div>
            <!-- end unit -->
          </div>
        </div>
        <button class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full uppercase">
          Start
        </button>
        <a
          class="border border-sky-500 hover:border-sky-600 text-sky-500 hover:text-sky-600 font-bold py-2 px-8 rounded-full uppercase ml-3"
          href="https://fraunhofer-isi.github.io/micat"
          target="_blank"
        >
          Learn more
        </a>
      </div>
    </div>
  </main>
</template>
