<script setup lang="ts">
import { inject } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const { showModal, openModal } = inject('showModal')
const countries = fetch(`${import.meta.env.VITE_API_URL}id_region`)
// const countries = {
//   "headers": [
//     "id",
//     "label",
//     "description"
//   ],
//   "rows": [
//     [
//       0,
//       "European Union",
//       "EU27_2020"
//     ],
//     [
//       1,
//       "Austria",
//       "AT"
//     ],
//     [
//       2,
//       "Belgium",
//       "BE"
//     ],
//     [
//       3,
//       "Cyprus",
//       "CY"
//     ],
//     [
//       4,
//       "Czech Republic",
//       "CZ"
//     ],
//     [
//       5,
//       "Germany",
//       "DE"
//     ],
//     [
//       6,
//       "Denmark",
//       "DK"
//     ],
//     [
//       7,
//       "Estonia",
//       "EE"
//     ],
//     [
//       8,
//       "Greece",
//       "EL"
//     ],
//     [
//       9,
//       "Finland",
//       "FI"
//     ],
//     [
//       10,
//       "France",
//       "FR"
//     ],
//     [
//       11,
//       "Croatia",
//       "HR"
//     ],
//     [
//       12,
//       "Hungary",
//       "HU"
//     ],
//     [
//       13,
//       "Ireland",
//       "IE"
//     ],
//     [
//       14,
//       "Italy",
//       "IT"
//     ],
//     [
//       15,
//       "Latvia",
//       "LV"
//     ],
//     [
//       16,
//       "Lithuania",
//       "LT"
//     ],
//     [
//       17,
//       "Luxembourg",
//       "LU"
//     ],
//     [
//       18,
//       "Malta",
//       "MT"
//     ],
//     [
//       19,
//       "Netherlands",
//       "NL"
//     ],
//     [
//       20,
//       "Poland",
//       "PL"
//     ],
//     [
//       21,
//       "Portugal",
//       "PT"
//     ],
//     [
//       22,
//       "Slovakia",
//       "SK"
//     ],
//     [
//       23,
//       "Slovenia",
//       "SI"
//     ],
//     [
//       24,
//       "Spain",
//       "ES"
//     ],
//     [
//       25,
//       "Sweden",
//       "SE"
//     ],
//     [
//       26,
//       "Romania",
//       "RO"
//     ],
//     [
//       27,
//       "Bulgaria",
//       "BG"
//     ]
//   ]
// }
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
        <h1 class="text-4xl text-gray-900 dark:text-white font-bold leading-normal">Assess the impacts of energy efficiency projects</h1>
        <p class="mt-6 text-lg font-light text-gray-900 dark:text-white">Select a suitable scenario from the world of energy efficiency, optionally add your own values and receive a comprehensive analysis for your region.</p>
      </div>
      <div class="col">
        <div class="rounded-3xl border border-gray-400 relative px-8 py-8">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block font-bold italic bg-white dark:bg-blue-950 text-gray-900 dark:text-white px-4">Select your use case</span>
          </div>
          <div class="grid grid-cols-2 items-center">
            <!-- time frame -->
            <div>
              <label for="timeframe" class="text-gray-900 dark:text-white text-sm">Time frame</label>
              <InformationCircleIcon @click="openModal('timeframe')" class="h-6 w-6 ml-2 cursor-pointer inline text-gray-900 dark:text-white"></InformationCircleIcon>
            </div>
            <div>
              <label for="timeframe" class="inline-flex items-center rounded-md cursor-pointer dark:text-gray-800">
                <input id="timeframe" type="checkbox" class="hidden peer">
                <span class="leading-3 px-8 pt-4 pb-3 rounded-l-full dark:bg-sky-600 dark:text-white peer-checked:text-sky-900 peer-checked:dark:bg-white text-center"><span class="uppercase font-bold">past</span><br><span class="text-sm">(ex-post)</span></span>
                <span class="leading-3 px-8 pt-4 pb-3 rounded-r-full dark:bg-white text-sky-900 peer-checked:dark:bg-sky-600 peer-checked:dark:text-white text-center"><span class="uppercase font-bold">future</span><br><span class="text-sm">(ex-ante)</span></span>
              </label>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="mt-8">
              <label for="region" class="text-gray-900 dark:text-white text-sm">Region</label>
              <InformationCircleIcon @click="openModal('region')" class="h-6 w-6 ml-2 cursor-pointer inline text-gray-900 dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8">
              <select id="region" class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
                  <option v-for="(country, i) in countries.rows" :value="country[0]" :selected="i === 0">{{ country[1] }}</option>
              </select>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="mt-8">
              <label for="unit" class="text-gray-900 dark:text-white text-sm">Unit</label>
              <InformationCircleIcon @click="openModal('unit')" class="h-6 w-6 ml-2 cursor-pointer inline text-gray-900 dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8">
              <select id="unit" class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
                  <option v-for="(unit, i) in units.rows" :value="unit[0]" :selected="i === 0">{{ unit[1] }}</option>
              </select>
            </div>
            <!-- end unit -->
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
