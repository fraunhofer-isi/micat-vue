<script setup async lang="ts">
import {inject, onMounted, ref, watch} from 'vue';
import type {Ref} from 'vue';
import {
  InformationCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/24/outline';
import type {
  ModalInjectInterface,
  StageInjectInterface,
  ProgramInterface,
  SubsectorInterface, ImprovementValueInterface
} from "@/types";
import {defaultImprovement, defaultModalInject, defaultProgram, defaultStageInject} from "@/defaults";

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject
const {stage, stages} = inject<StageInjectInterface>('stage') || defaultStageInject

// Variables
let regions: Ref<Array<Array<number | string>>> = ref([]);
let subsectors: Ref<Array<SubsectorInterface>> = ref([]);
const units = {
  1: "ktoe (tonne of oil equivalent)",
  2: "MJ (Megajoule)",
  3: "GJ (Gigajoule)",
  4: "MWh (Energy quantity per hour)",
}
const future = ref<boolean>(false);
const region = ref<number>(0);
const municipality = ref<boolean>(false);
const inhabitants = ref<number>(100000);
const unit = ref<number>(1);
let currentYear = Math.floor(new Date().getFullYear() / 5) * 5;
const years = ref<Array<number>>([currentYear - 10, currentYear - 5, currentYear]);
const newYears = ref<Array<number>>([...Array(30).keys()].map(delta => currentYear - delta).filter(newYear => years.value.indexOf(newYear) == -1));
const newYearSelected = ref<number>(newYears.value[0]);
const programs = ref<Array<ProgramInterface>>([structuredClone(defaultProgram)]);

// Watchers
watch(future, async (newFuture, oldFuture) => {
  // Check if there are valid years defined. If not add default ones.
  currentYear = new Date().getFullYear();
  if (newFuture) {
    // Filter out years from the past
    years.value = years.value.filter(year => year >= currentYear);
    if (years.value.length == 0) {
      // Round up to nearest 5
      const nextValidYear = Math.ceil(currentYear / 5) * 5;
      years.value = [nextValidYear, nextValidYear + 5, nextValidYear + 10];
      newYears.value = [...Array(30).keys()].map(delta => currentYear + delta).filter(newYear => years.value.indexOf(newYear) == -1);
    }
  } else {
    // Filter out years from the past
    years.value = years.value.filter(year => year <= currentYear);
    if (years.value.length == 0) {
      // Round down to nearest 5
      const nextValidYear = Math.floor(currentYear / 5) * 5;
      years.value = [nextValidYear - 10, nextValidYear - 5, nextValidYear];
      newYears.value = [...Array(30).keys()].map(delta => currentYear - delta).filter(newYear => years.value.indexOf(newYear) == -1);
    }
  }
})

// Lifecycle
onMounted(async () => {
  // id_region
  const responseRegion: Response = await fetch(`${import.meta.env.VITE_API_URL}id_region`);
  const dataRegion: { rows: Array<[id: number, name: string]> } = await responseRegion.json();
  regions.value = dataRegion.rows;

  // id_subsector
  // Get all database tables related to subsectors and descendants
  const responseSubsector: Response = await fetch(`${import.meta.env.VITE_API_URL}id_subsector`);
  const dataSubsector: { rows: Array<[id: number, name: string]> } = await responseSubsector.json();
  const responseImprovements: Response = await fetch(`${import.meta.env.VITE_API_URL}id_action_type`);
  const dataImprovements: { rows: Array<[id: number, name: string, name2: string]> } = await responseImprovements.json();
  const responseMapping: Response = await fetch(`${import.meta.env.VITE_API_URL}mapping__subsector__action_type`);
  const dataMapping: { rows: Array<[id: number, idSubsector: number, idImprovement: number]> } = await responseMapping.json();

  const improvements: { [key: number]: { id: number, subsectors: Array<number>, name: string, values: ImprovementValueInterface }} = {};
  dataImprovements.rows.forEach(improvement => {
    improvements[improvement[0]] = {
      id: improvement[0],
      name: improvement[2],
      values: {},
      subsectors: []
    };
  });
  dataMapping.rows.forEach(mapping => {
    improvements[mapping[2]].subsectors.push(mapping[1]);
  });
  dataSubsector.rows.forEach(subsector => {
    subsectors.value.push({
      id: subsector[0],
      name: subsector[1],
      improvements: Object.values(improvements).filter(improvement => improvement.subsectors.indexOf(subsector[0]) > -1)
    });
  });
})

// Functions
const addYear = () => {
  years.value.push(newYearSelected.value);
  years.value.sort();
  newYears.value = newYears.value.filter(newYear => newYear !== newYearSelected.value);
  newYearSelected.value = newYears.value[0];
};
const removeYear = (year: number) => {
  if (years.value.length > 2) {
    // Keep at least two years
    years.value = years.value.filter(x => x !== year);
    newYears.value.push(year);
    newYears.value.sort();
  }
};
const addProgram = () => {
  const clone = structuredClone(defaultProgram);
  clone.name = `Program ${programs.value.length + 1}`
  programs.value.push(clone);
}
const removeProgram = (i: number) => {
  if (programs.value.length >= 2) {
    programs.value.splice(i, 1);
  }
}
const copyImprovement = (program: ProgramInterface, i: number) => {
  program.improvements.push({ ...program.improvements[i] });
}
const addImprovement = (program: ProgramInterface) => {
  program.improvements.push(defaultImprovement);
}
const removeImprovement = (program: ProgramInterface, i: number) => {
  if (program.improvements.length >= 2) {
    program.improvements.splice(i, 1);
  }
}
const getSubsectorImprovements = (subsectorId: number) => {
  if (!subsectorId) return [];
  return subsectors.value.filter(subsector => subsector.id === subsectorId)[0].improvements;
}
const analyze = () => {
  console.log(programs.value);
}
</script>

<template>
  <main>
    <div class="grid grid-cols-5 lg:grid-cols-10 gap-8 max-w-screen-xl mx-auto pt-[15vh] pb-[20vh]">
      <div class="col col-span-5 pr-[7rem]" v-if="stage === stages.home">
        <h1 class="text-4xl dark:text-white font-bold leading-normal">Assess the impacts of energy efficiency
          projects</h1>
        <p class="mt-6 text-lg font-light dark:text-white">Select a suitable scenario from the world of energy
          efficiency, optionally add your own values and receive a comprehensive analysis for your region.</p>
      </div>
      <div
          class="col"
          :class="{
            'col-span-4': stage === stages.full,
            'col-span-5': stage === stages.home,
          }"
      >
        <div class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mb-5">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block font-bold italic bg-white dark:bg-blue-950 dark:text-white px-4">
              <span v-if="stage === stages.home">Select your use case</span>
              <span v-else>Options</span>
            </span>
          </div>
          <div class="grid grid-cols-5 items-center">
            <!-- time frame -->
            <div class="col-span-2">
              <label for="timeframe" class="dark:text-white text-sm">Time frame</label>
              <InformationCircleIcon @click="openModal('timeframe')"
                                     class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="col-span-3">
              <label for="timeframe"
                     class="inline-flex items-center rounded-full cursor-pointer dark:text-gray-800 border border-sky-600 dark:border-0">
                <input id="timeframe" type="checkbox" class="hidden peer" v-model="future">
                <span
                    class="leading-3 pl-8 pr-7 pt-4 pb-3 rounded-l-full bg-sky-600 text-white peer-checked:text-sky-900 peer-checked:bg-white text-center"><span
                    class="uppercase font-bold">past</span><br><span class="text-sm">(ex-post)</span></span>
                <span
                    class="leading-3 pl-7 pr-8 pt-4 pb-3 rounded-r-full dark:bg-white text-sky-900 peer-checked:bg-sky-600 peer-checked:text-white text-center"><span
                    class="uppercase font-bold">future</span><br><span class="text-sm">(ex-ante)</span></span>
              </label>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="mt-8 col-span-2">
              <label for="region" class="dark:text-white text-sm">Region</label>
              <InformationCircleIcon @click="openModal('region')"
                                     class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8 col-span-3">
              <select
                  id="region"
                  class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                  v-model="region"
              >
                <option v-for="(region, i) in regions" v-bind:key="`region-${i}`" :value="region[0]">{{
                    region[1]
                  }}
                </option>
              </select>
              <div v-if="region !== 0">
                <div class="flex items-center mb-2 mt-3">
                  <input v-model="municipality" id="municipality-1" type="radio" :value="false" name="municipality"
                         class="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="default-radio-1" class="ml-2 text-xs font-medium text-gray-500 dark:text-gray-300">Whole
                    country</label>
                </div>
                <div class="flex items-center">
                  <input v-model="municipality" id="municipality-2" type="radio" :value="true" name="municipality"
                         class="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="default-radio-2" class="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">Municipality
                    with <input type="number" id="inhabitants"
                                class="bg-gray-50 border border-gray-300 text-gray-500 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[80px]"
                                v-model="inhabitants"> <span v-if="stage === stages.home">inhabitants</span><span v-else>inhab.</span></label>
                </div>
              </div>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="mt-8 col-span-2">
              <label for="unit" class="dark:text-white text-sm">Unit</label>
              <InformationCircleIcon @click="openModal('unit')"
                                     class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8 col-span-3">
              <select
                  id="unit"
                  class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                  v-model="unit"
              >
                <option v-for="[key, value] in Object.entries(units)" v-bind:key="`unit-${key}`" :value="key">{{
                    value
                  }}
                </option>
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
        <div class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mt-[3rem]"
             v-if="stage === stages.full">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block font-bold italic bg-white dark:bg-blue-950 dark:text-white px-4">
              Time frame
              <InformationCircleIcon
                  @click="openModal('years')"
                  class="h-6 w-6 ml-1 cursor-pointer inline dark:text-white"
              ></InformationCircleIcon>
            </span>
          </div>
          <div class="flex flex-wrap">
            <div v-for="year in years" v-bind:key="year.toString()" class="whitespace-nowrap rounded-full mr-4 mb-7">
              <span class="px-2 py-2 rounded-l-full bg-sky-600 text-white text-center border-sky-600 border">{{ year }}</span>
              <span class="px-2 py-2 rounded-r-full dark:bg-white text-sky-900 text-center border-sky-600 border">
                <TrashIcon
                    @click="removeYear(year)"
                    class="mt-[-3px] h-5 w-5 inline"
                    :class="{
                      'text-red-200': years.length <= 2,
                      'text-red-700': years.length > 2,
                      'cursor-pointer': years.length > 2,
                    }"
                ></TrashIcon>
              </span>
            </div>
          </div>
          <div class="mt-2">
            <select
                id="new-year"
                class="py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 max-w-[100px]"
                v-model="newYearSelected"
            >
              <option
                  v-for="newYear in newYears" v-bind:key="newYear.toString()" :value="newYear"
                  :selected="newYear === newYearSelected"
              >
                {{ newYear }}
              </option>
            </select>
            <PlusCircleIcon
                @click="addYear()"
                class="h-7 w-7 ml-5 cursor-pointer inline text-sky-700 dark:text-white"
            ></PlusCircleIcon>
          </div>
        </div>
      </div>
      <div
          class="col col-span-6"
          v-if="stage === stages.full"
      >
        <div
            class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mb-5"
            v-for="(program, i) in programs"
            v-bind:key="`program-${i}`"
        >
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block bg-white dark:bg-blue-950 dark:text-white px-4">
              <input
                  type="text"
                  :id="`program-name-${i}`"
                  class="bg-gray-50 border border-gray-300 text-sky-900 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[85px]"
                  v-model="program.name"
              >
              <TrashIcon
                  v-if="programs.length >= 2"
                  @click="removeProgram(i)"
                  class="ml-3 h-5 w-5 inline cursor-pointer text-red-700"
              ></TrashIcon>
            </span>
          </div>
          <div class="flex items-center gap-8">
            <div>
              <label :for="`subsector-${i}`" class="dark:text-white text-sm">Subsector</label>
              <InformationCircleIcon
                  @click="openModal('subsector')"
                  class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div>
              <select
                  :id="`subsector-${i}`"
                  class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                  v-model="program.subsector"
              >
                <option value="0" selected disabled>Select subsector</option>
                <option v-for="subsector in subsectors" v-bind:key="`subsector-${i}-${subsector.id}`" :value="subsector.id">
                  {{ subsector.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-3 mt-8 gap-5 items-center">
            <div
              class="rounded-3xl border border-gray-300 dark:border-gray-400 relative mb-2"
              v-for="(improvement, improvementIndex) in program.improvements"
              v-bind:key="`improvement-${i}-${improvement.id}`"
            >
              <div class="p-6">
                <select
                    :id="`improvement-${i}-${improvement.id}`"
                    class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                    v-model="improvement.id"
                >
                  <option value="0" selected disabled>Select improvement</option>
                  <option v-for="improvementSelection in getSubsectorImprovements(program.subsector)" v-bind:key="`improvement-selection-${i}-${improvementSelection.id}`" :value="improvementSelection.id">
                    {{ improvementSelection.name }}
                  </option>
                </select>
              </div>
              <div
                class="border-t border-gray-300 dark:border-gray-400 px-6 py-3 text-center bg-blue-50 dark:bg-blue-900 rounded-b-3xl"
              >
                <DocumentDuplicateIcon
                    @click="copyImprovement(program, improvementIndex)"
                    class="mt-[-3px] h-5 w-5 inline mx-1 cursor-pointer text-orange-500 dark:text-orange-400"
                ></DocumentDuplicateIcon>
                <TrashIcon
                    @click="removeImprovement(program, improvementIndex)"
                    class="mt-[-3px] h-5 w-5 inline mx-1 cursor-pointer text-red-700 dark:text-red-400"
                    v-if="program.improvements.length >= 2"
                ></TrashIcon>
              </div>
            </div>
            <PlusCircleIcon
                @click="addImprovement(program)"
                class="h-7 w-7 cursor-pointer inline text-gray-300 dark:text-white"
            ></PlusCircleIcon>
          </div>
        </div>
        <div class="text-center mb-5">
          <button
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 pl-3 pr-4 rounded-full uppercase text-xs"
            @click="addProgram()"
          >
            <PlusCircleIcon class="h-5 w-5 mt-[-2px] inline text-white"></PlusCircleIcon>
            Add program
          </button>
        </div>
        <button
            class="bg-amber-300 hover:bg-amber-400 font-bold py-2 px-8 rounded-full uppercase"
            @click="analyze()"
        >
          Analyze
        </button>
      </div>
    </div>
  </main>
</template>
