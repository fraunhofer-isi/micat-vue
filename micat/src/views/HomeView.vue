<script setup async lang="ts">
import { inject, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import type { ModalInjectInterface, StageInjectInterface, RegionsInterface } from "@/types";
import { defaultModalInject, defaultStageInject } from "@/defaults";

const { openModal } = inject<ModalInjectInterface>('modal') || defaultModalInject
const { stage, stages } = inject<StageInjectInterface>('stage') || defaultStageInject
let regions: Ref<Array<Array<number | string>>> = ref([]);

const units = {
  1: "ktoe (tonne of oil equivalent)",
  2: "MJ (Megajoule)",
  3: "GJ (Gigajoule)",
  4: "MWh (Energy quantity per hour)",
}

const future = ref<Boolean>(false);
const region = ref<Number>(0);
const municipality = ref<Boolean>(false);
const inhabitants = ref<Number>(100000);
const unit = ref<Number>(1);
onMounted(async () => {
  const response: Response = await fetch(`${import.meta.env.VITE_API_URL}id_region`);
  const data: RegionsInterface = await response.json();
  regions.value = data.rows;
})
</script>

<template>
  <main>
    <div class="grid grid-cols-2 max-w-screen-xl mx-auto mt-[15vh]">
      <div class="col pr-[7rem]" v-if="stage === stages.home">
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
                <input id="timeframe" type="checkbox" class="hidden peer" v-model="future">
                <span class="leading-3 pl-9 pr-8 pt-4 pb-3 rounded-l-full bg-sky-600 text-white peer-checked:text-sky-900 peer-checked:bg-white text-center"><span class="uppercase font-bold">past</span><br><span class="text-sm">(ex-post)</span></span>
                <span class="leading-3 pl-8 pr-9 pt-4 pb-3 rounded-r-full dark:bg-white text-sky-900 peer-checked:bg-sky-600 peer-checked:text-white text-center"><span class="uppercase font-bold">future</span><br><span class="text-sm">(ex-ante)</span></span>
              </label>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="mt-8">
              <label for="region" class="dark:text-white text-sm">Region</label>
              <InformationCircleIcon @click="openModal('region')" class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8">
              <select
                  id="region"
                  class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                  v-model="region"
              >
                  <option v-for="(region, i) in regions" v-bind:key="`region-${i}`" :value="region[0]">{{ region[1] }}</option>
              </select>
              <div v-if="region !== 0">
                <div class="flex items-center mb-2 mt-3">
                    <input v-model="municipality" id="municipality-1" type="radio" :value="false" name="municipality" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="default-radio-1" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Whole country</label>
                </div>
                <div class="flex items-center">
                    <input v-model="municipality" id="municipality-2" type="radio" :value="true" name="municipality" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="default-radio-2" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Municipality with <input type="text" id="inhabitants" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-1.5 py-0.5 inline dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 max-w-[65px]" v-model="inhabitants"> inhabitants</label>
                </div>
              </div>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="mt-8">
              <label for="unit" class="dark:text-white text-sm">Unit</label>
              <InformationCircleIcon @click="openModal('unit')" class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8">
              <select
                  id="unit"
                  class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                  v-model="unit"
              >
                  <option v-for="[key, value] in Object.entries(units)" v-bind:key="`unit-${key}`" :value="key">{{ value }}</option>
              </select>
            </div>
            <!-- end unit -->
          </div>
        </div>
        <button
          class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full uppercase"
          @click="stage = stages.full"
          v-if="stage === stages.home"
        >
          Start
        </button>
        <a
          class="border border-sky-500 text-sky-500 hover:border-sky-600 hover:text-sky-600  hover:dark:border-sky-400 hover:dark:text-sky-400 font-bold py-2 px-8 rounded-full uppercase ml-3"
          href="https://fraunhofer-isi.github.io/micat"
          target="_blank"
          v-if="stage === stages.home"
        >
          Learn more
        </a>
      </div>
    </div>
  </main>
</template>
