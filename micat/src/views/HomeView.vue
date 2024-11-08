<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup async lang="ts">
import {inject, onMounted, reactive, ref, watch} from 'vue';
import type {Ref} from 'vue';
import { watchPausable } from '@vueuse/core';
import router from "@/router";
import { storeToRefs } from 'pinia';
import {
  InformationCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  PresentationChartBarIcon,
  AdjustmentsVerticalIcon, 
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/vue/24/outline';
import type {
  ModalInjectInterface,
  ProgramInterface,
  SubsectorInterface,
  ImprovementValueInterface,
  PayloadInterface,
  PayloadMeasureInterface,
  PayloadParameterInterface,
  PayloadParameterEntryInterface,
  SelectedImprovementInterface,
  ImprovementInterface,
} from "@/types";
import { defaultImprovement, defaultModalInject, defaultProgram, stages, units } from "@/defaults";
import { useSessionStore } from "@/stores/session";
import GlobalParametersOverlay from "@/components/GlobalParametersOverlay.vue";
import ParametersOverlay from "@/components/ParametersOverlay.vue";
import MureSelection from "@/components/MureSelection.vue";

const session = useSessionStore();

// Variables
const improvementParameterMapping: { [key: number]: string } = {
  14: "finalParameters",
  15: "finalParameters",
  16: "finalParameters",
  17: "finalParameters",
  18: "finalParameters",
  29: "parameters",
  31: "parameters",
  32: "parameters",
  34: "parameters",
  35: "parameters",
  36: "constants",
  40: "parameters",
  42: "parameters",
  43: "parameters",
  45: "parameters",
};

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject

// Session
const { years, stage, seedInfo } = storeToRefs(session);
const programs = reactive<Array<ProgramInterface>>(session.programs);

// Refs
const loading = ref<boolean>(false);
let regions: Ref<Array<Array<number | string>>> = ref([]);
let subsectors: Ref<Array<SubsectorInterface>> = ref([]);
const getNewYears = () => {
  let newYears = [];
  if (session.future) {
    newYears = [...Array(51).keys()].map(delta => 2000 + delta);
  } else {
    const currentYear = new Date().getFullYear();
    const range = currentYear - 2000 - 2;
    newYears = [...Array(range).keys()].map(delta => currentYear - 3 - delta);
  }
  return newYears.filter(newYear => years.value.indexOf(newYear) == -1);
};
const newYears = ref<Array<number>>(getNewYears());
const newYearSelected = ref<number>(newYears.value[0]);
const showGlobalParametersOverlay = ref<boolean>(false);
const showParametersOverlay = ref<boolean>(false);
const selectedImprovement = ref<SelectedImprovementInterface>({internalId: 0});
const error = ref<string>("");
const fileUpload = ref<HTMLInputElement | null>(null);

// Watchers
watch(programs, (programs) => {  
  session.updatePrograms(programs);
});
watch(() => session.future, (future) => {
  session.updateFuture(future);
  resetYears();
  // If the time frame changes, we need to reset parameters
  session.updateGlobalParameters({});
  session.updateParameters({});
});
watch(() => session.mure, (mure) => {
  session.updateMure(mure);
  if (session.mure) updateMureData();
});
watch(() => session.odyssee, (odyssee) => {
  session.updateOdyssee(odyssee);
});
watch(() => session.region, (region) => {
  session.updateRegion(region);
  // If the region is changed, we need to reset parameters
  session.updateGlobalParameters({});
  session.updateParameters({});
});
watch(() => session.municipality, (municipality) => {
  session.updateMunicipality(municipality);
});
const unitWatcher = watchPausable(() => session.unit, (unit, oldUnit) => {
 session.updateUnit(unit);
 convertValues(unit, oldUnit);
});
watch(() => session.inhabitants, (inhabitants) => {
  session.updateInhabitants(inhabitants);
});
watch(stage, (stage: number) => {
  session.updateStage(stage);
});

// Lifecycle
onMounted(async () => {
  // When travelling back from results, we need to re-assign the stage and years
  stage.value = parseInt(localStorage.getItem("stage") || stages.home.toString());
  years.value = JSON.parse(localStorage.getItem("years")!) || [];
  // id_region
  const responseRegion: Response = await fetch(`${import.meta.env.VITE_API_URL}id_region`);
  const dataRegion: { rows: Array<[id: number, name: string]> } = await responseRegion.json();
  regions.value = dataRegion.rows;

  // id_subsector
  // Get all database tables related to subsectors and descendants
  const responseSubsector: Response = await fetch(`${import.meta.env.VITE_API_URL}id_subsector`);
  const dataSubsector: { rows: Array<[id: number, name: string]> } = await responseSubsector.json();
  const responseImprovements: Response = await fetch(`${import.meta.env.VITE_API_URL}id_action_type`);
  const dataImprovements: {
    rows: Array<[id: number, name: string, name2: string]>
  } = await responseImprovements.json();
  const responseMapping: Response = await fetch(`${import.meta.env.VITE_API_URL}mapping__subsector__action_type`);
  const dataMapping: {
    rows: Array<[id: number, idSubsector: number, idImprovement: number]>
  } = await responseMapping.json();

  const improvements: {
    [key: number]: { id: number, subsectors: Array<number>, name: string, label: string, values: ImprovementValueInterface }
  } = {};
  dataImprovements.rows.forEach(improvement => {
    improvements[improvement[0]] = {
      id: improvement[0],
      label: improvement[1],
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
  subsectors.value.sort((a, b) => a.name.localeCompare(b.name))

  // Create internal IDs for improvements
  programs.forEach(program => {
    program.improvements.forEach(improvement => {
      if (!improvement.internalId) improvement.internalId = getInternalId();
    });
  });

  if (session.mure) updateMureData();
})

// Functions
const convertValues = (unitId: number, oldUnitId: number) => {
  // Functions to convert all given energy savings in case of unit changes
  const unit = units[unitId];
  const oldUnit = units[oldUnitId];
  programs.forEach(program => {
    program.improvements.forEach(improvement => {
      Object.keys(improvement.values).forEach(key => {
        if (oldUnit.symbol === 'ktoe') {
          improvement.values[key] *= unit.factor;
        } else {
          // convert back to ktoe
          improvement.values[key] /= oldUnit.factor;
          if (unit.symbol !== 'ktoe') improvement.values[key] *= unit.factor;
        }
      });
    });
  });
  session.updatePrograms(programs);
};
const updateImprovementValues = () => {
  programs.forEach(program => {
    program.improvements.forEach(improvement => {
      Object.keys(improvement.values).forEach(key => {
        if (years.value.indexOf(parseInt(key)) === -1) {
          delete improvement.values[key];
        }
      });
      years.value.forEach(year => {
        if (!improvement.values[year.toString()]) {
          improvement.values[year.toString()] = 0;
        }
      });
    });
  });
  session.updatePrograms(programs);
};
const addYear = () => {
  years.value.push(newYearSelected.value);
  years.value.sort();
  session.updateYears(years.value);
  session.years = years.value;
  newYears.value = newYears.value.filter(newYear => newYear !== newYearSelected.value);
  newYearSelected.value = newYears.value[0];
  // If the time frame changes, we need to reset parameters
  session.updateGlobalParameters({});
  session.updateParameters({});  
  updateImprovementValues();
};
const removeYear = (year: number) => {
  if (years.value.length > 2) {
    // Keep at least two years
    years.value = years.value.filter(x => x !== year);
    session.updateYears(years.value);
    session.years = years.value;
    newYears.value.push(year);
    newYears.value.sort();
    // If the time frame changes, we need to reset parameters
    session.updateGlobalParameters({});
    session.updateParameters({});
    updateImprovementValues();
  }
};
const resetYears = () => {
  // Check if there are valid years defined. If not add default ones.
  let currentYear = new Date().getFullYear();
  if (session.future) {
    // We allow to let users test with already running actions
    // Filter out years before 2000
    years.value = years.value.filter(year => year >= 2000);
    if (years.value.length == 0) {
      // Round up to nearest 5
      const nextValidYear = Math.ceil(currentYear / 5) * 5;
      years.value = [nextValidYear, nextValidYear + 5, nextValidYear + 10];
    }
  } else {
    // We allow to let users test with already running actions
    // Filter out years before 2000
    years.value = years.value.filter(year => year <= currentYear - 2 && year >= 2000);
    if (years.value.length == 0) {
      // Round down to nearest 5
      const nextValidYear = Math.floor(currentYear / 5) * 5;
      years.value = [nextValidYear - 10, nextValidYear - 5, nextValidYear];
    }
  }
  newYears.value = getNewYears();
  newYearSelected.value = newYears.value[0];
  
  session.updateYears(years.value);
  session.years = years.value;
  updateImprovementValues();
};
const addProgram = () => {
  const clone = JSON.parse(JSON.stringify(defaultProgram));
  clone.name = `Program ${programs.length + 1}`
  programs.push(clone);
  session.updatePrograms(programs);
}
const reset = () => {
  session.reset();
  router.go(0);
}
const removeProgram = (i: number) => {
  if (programs.length >= 2) {
    programs.splice(i, 1);
    session.updatePrograms(programs);
  }
}
const getInternalId = () => {
  let ids: Array<number> = [];
  programs.forEach(program => {
    ids = ids.concat(program.improvements.filter(improvement => typeof improvement.internalId !== 'undefined').map(improvement => improvement.internalId as number));
  });
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};
const copyImprovement = (program: ProgramInterface, i: number) => {
  const newImprovement = JSON.parse(JSON.stringify(program.improvements[i]));
  newImprovement.internalId = getInternalId();
  program.improvements.push(newImprovement);
}
const addImprovement = (program: ProgramInterface) => {
  const newImprovement = JSON.parse(JSON.stringify(defaultImprovement));
  newImprovement.internalId = getInternalId();
  program.improvements.push(newImprovement);
}
const removeImprovement = (program: ProgramInterface, i: number) => {
  if (program.improvements.length >= 2) {
    program.improvements.splice(i, 1);
  }
}
const getSubsectorImprovements = (subsectorId: number) => {
  if (!subsectorId || subsectors.value.length === 0) return [];
  return subsectors.value.filter(subsector => subsector.id === subsectorId)[0].improvements;
}
const setSeedInfo = (value: boolean) => {
  seedInfo.value = value;
  session.updateSeedInfo(value);
};
const getGlobalParametersPayload = () => {
  const results: PayloadParameterInterface = {};
  for (const [category, subsectors] of Object.entries(session.globalParameters)) {
    results[category] = [];
    for (const [subsector, factors] of Object.entries(subsectors)) {
      for (const [factor, values] of Object.entries(factors)) {
        for (const value of values) {
          if (value.value === null) continue;
          if (category === 'MonetisationFactors') {
            const existingResult: PayloadParameterEntryInterface | undefined = results[category].find(result => {
              return result['index'] === parseInt(factor);
            });
            if (existingResult) {
              existingResult[value.key] = value.value;
            } else {
              const data = {
                'index': parseInt(factor),
                [value.key === 0 ? 'Value' : value.key]: value.value,
                'identifier': session.monetisationFactorMapping[parseInt(factor)],
              }
              results[category].push(data);
            }
          } else {
            const carrierKey = ['ElectricityGeneration', 'HeatGeneration'].indexOf(category) > -1 ? 'id_primary_energy_carrier' : 'id_final_energy_carrier';
            const existingResult: PayloadParameterEntryInterface | undefined = results[category].find(result => {
              if (['ElectricityGeneration', 'HeatGeneration'].indexOf(category) === -1) {
                return result['id_subsector'] === parseInt(subsector) && result[carrierKey] === value.key;
              } else {
                return result[carrierKey] === value.key;
              }
            });
            if (existingResult && value.value !== null) {
              existingResult[factor] = category === 'FuelSplitCoefficient' ? value.value / 100 : value.value;
            } else if (value.value !== null) {
              const data = {
                [carrierKey]: value.key,
                [factor]: category === 'FuelSplitCoefficient' ? value.value / 100 : value.value,
              }
              if (['ElectricityGeneration', 'HeatGeneration'].indexOf(category) === -1) data['id_subsector'] = parseInt(subsector);
              results[category].push(data);
            }
          }
        }
      }
    }
  }
  return results;
}
const showParameters = (data: ImprovementInterface, programIndex: number) => {
  const selectedProgram = session.programs[programIndex];
  selectedImprovement.value = {
    internalId: data && data.internalId ? data.internalId : 0,
    name: data.name, 
    subsector: selectedProgram.subsectorName, 
    subsectorId: selectedProgram.subsector, 
    program: selectedProgram.name, 
    data,
  };
  
  showParametersOverlay.value = true;
};
const analyze = async () => {
  loading.value = true;
  const url = `${import.meta.env.VITE_API_URL}indicator_data?id_mode=${session.future ? 2 : 4}&id_region=${session.region}`
  const payload: PayloadInterface = {
    "measures": [],
    "parameters": getGlobalParametersPayload(),
  }
  if (session.municipality) payload["population"] = session.inhabitants;
  let i = 1;
  let errors = '';
  programs.forEach(program => {
    if (!program.subsector) {
      errors += `Please select a subsector for <em>${program.name}</em>.<br />`;
      return;
    }
    program.improvements.forEach(improvement => {
      if (!improvement.id) {
        errors += `<em>${program.name}</em> has invalid improvements.<br />`;
        return;
      }

      // Prepare parameters
      const parameters: Array<{ [key: string]: number }> = [];
      const finalParameters: Array<{ [key: string]: number }> = [];
      const constants: Array<{ [key: string]: number }> = [];
      if (improvement.internalId) {
        const improvementParameters = session.parameters[improvement.internalId];
        if (improvementParameters) {
          // parameters are only present if they have been edited
          const keys: Array<string> = ["main", "fuelSwitch", "residential"];
          keys.forEach(key => {
            if (!improvementParameters[key]) return;
            improvementParameters[key].forEach(parameter => {
              const result: { [key: string]: number } = {"id_parameter": parameter.parameters.id_parameter as number};
              // Filter out residential parameters, depending on the usage of the annual renovation rate
              if (parameter.parameters.id_parameter === 45 && session.useRenovationRate || [32, 43].indexOf(parameter.parameters.id_parameter as number) > -1 && !session.useRenovationRate) return;
              parameter.years.forEach(yearData => result[yearData.key] = yearData.value);
              if (improvementParameterMapping[result["id_parameter"]] === 'parameters') {
                parameters.push(result);
              } else if (improvementParameterMapping[result["id_parameter"]] === 'finalParameters') {
                result["id_final_energy_carrier"] = parameter.parameters.id_final_energy_carrier as number;
                finalParameters.push(result);
              } else if (improvementParameterMapping[result["id_parameter"]] === 'constants') {
                result["value"] = parameter.parameters.constants as number;
                constants.push(result);
              }
            });
          });
        }
      }
      const improvementData: PayloadMeasureInterface = {
        "id": i,
        "savings": {
          "details": {
            "parameters": parameters,
            "finalParameters": finalParameters,
            "constants": constants,
          },
          "id_measure": i,
          "id_subsector": program.subsector,
          "id_action_type": improvement.id,
        },
      };
      years.value.forEach(year => {
        const value = improvement.values[year.toString()];
        const factor = units[session.unit].factor
        improvementData.savings[year.toString()] = value ? value * 1 / factor : 0;
      });
      payload.measures.push(improvementData);
      i++;
    });
  });

  if (errors.length > 0) {
    session.results = {};
    error.value = `<h2 class="mt-1 font-bold">We are sorry. Your inputs are invalid.</h2><p class="text-sm">${errors}</p>`;
    loading.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(payload),
  });
  session.updatePayload(payload);
  const data = await response.json();
  if (Object.prototype.hasOwnProperty.call(data, 'error')) {
    session.results = {};
    error.value = `<h2 class="mt-1 font-bold">We are sorry. Your request could not be processed.</h2><p class="text-sm"><em>Details:</em> ${data.error.arg0}<br />Please get in touch.</p>`;
    loading.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    error.value = '';
    session.results = data;
    loading.value = false;
    router.push({ name: 'results' });
  }
}
const programChanged = (program: ProgramInterface, i: number, subsectorId: number) => {
  program.improvements.forEach(improvement => {
    improvement.id = 0;
  });
  const name = subsectors.value.filter(subsector => subsector.id === subsectorId)[0].name;
  program.subsectorName = name;
  programs[i] = program;
  session.updatePrograms(programs);
  // If the sub sector changes, we need to reset parameters
  session.updateParameters({});
  
}
const improvementChanged = (program: ProgramInterface, i: number, improvementId: number) => {
  const name = getSubsectorImprovements(program.subsector).filter(improvement => improvement.id === improvementId)[0].name;
  program.improvements.filter(improvement => improvement.id === improvementId).forEach(improvement => {
    improvement.name = name;
  });
  programs[i] = program;
  session.updatePrograms(programs);
  // If the improvement changes, we need to reset parameters
  session.updateParameters({});
}
const percentageDistributionChanged = (percentage: number, program: ProgramInterface, i: number) => {
  if (percentage < 0 || percentage > 100) return;
  // Set value for changed improvement
  session.years.forEach(year => {
    const amount = program.mureTotal![year] * percentage / 100;
    program.improvements[i].values[year] = amount;
  });
  program.improvements[i].percentage = percentage;
}

const exportInput = () => {
  const blob = new Blob([JSON.stringify({
      future: session.future,
      region: session.region,
      municipality: session.municipality,
      inhabitants: session.inhabitants,
      unit: session.unit,
      years: years.value,
      programs: programs,
      globalParameters: session.globalParameters,
      parameters: session.parameters,
      useRenovationRate: session.useRenovationRate,
      subsectorMapping: session.subsectorMapping,
      carrierMapping: session.carrierMapping,
      monetisationFactorMapping: session.monetisationFactorMapping,
      seedInfo: seedInfo.value,

  })], { type: "text/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  const date = new Date();
  a.download = `MICAT_inputs_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};
const importInput = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files === null) return;
  const file = target.files[0];
  target.value = '';
  
  const data = JSON.parse(await file.text());
  session.future = data.future;
  session.region = data.region;
  session.municipality = data.municipality;
  session.inhabitants = data.inhabitants;
  years.value = data.years;
  session.updateYears(data.years);
  session.years = years.value;
  Object.assign(programs, data.programs);
  session.updatePrograms(data.programs);
  session.updateSubsectorMapping(data.subsectorMapping);
  session.updateCarrierMapping(data.carrierMapping);
  session.updateMonetisationFactorMapping(data.monetisationFactorMapping);
  session.updateUseRenovationRate(data.useRenovationRate);
  setSeedInfo(data.seedInfo);

  // Pause watcher to avoid unit conversion
  // Unfortunatly, the resume function is taking effect immediately, so we need to postpone it.
  unitWatcher.pause();
  session.unit = data.unit;
  setTimeout(() => {
    unitWatcher.resume();

    // Updates on parameters need to be delayed, too, otherwise they will be overwritten by watcher functions
    session.updateGlobalParameters(data.globalParameters);
    session.updateParameters(data.parameters);
  }, 500);
};
const updateMureData = () => {
  // If MURE data is used, set unit to PJ, if ODYSSEE data is used, set unit to ktoe
  session.unit = session.odyssee ? 1 : 5;
  // Use ex-ante for MURE and ex-post for ODYSSEE only
  session.future = !session.odyssee;
};
const start = () => {
  stage.value = stages.full;
  if (!session.mure) {
    years.value = []; 
    resetYears();
  }
};
</script>

<template>
  <main>
    <GlobalParametersOverlay v-if="showGlobalParametersOverlay" @close="showGlobalParametersOverlay = false;"></GlobalParametersOverlay>
    <ParametersOverlay v-else-if="showParametersOverlay" :improvement="selectedImprovement" :years="session.years" @close="showParametersOverlay = false;"></ParametersOverlay>
    <div v-else class="grid grid-cols-5 lg:grid-cols-10 gap-8 max-w-screen-xl mx-auto pt-[15vh] pb-[20vh]">
      <div class="col col-span-5 pr-[7rem]" v-if="stage === stages.home">
        <h1 class="text-4xl font-bold leading-normal dark:text-white">Assess the impacts of energy efficiency
          projects</h1>
        <p class="mt-6 text-lg font-light dark:text-white">Select a suitable scenario from the world of energy
          efficiency, optionally add your own values and receive a comprehensive analysis for your region.</p>
      </div>
      <div
        class="relative col"
        :class="{
            'col-span-4': stage === stages.full,
            'col-span-5': stage === stages.home,
          }"
      >
        <div v-if="seedInfo" class="absolute inset-[-1rem] z-10 bg-white/80 dark:bg-blue-950/80 transition-opacity min-h-full">
          <div class="absolute w-full transform -translate-y-1/2 top-1/2">
            <div class="flex items-center justify-center min-h-full p-2 text-center sm:p-0">
              <div class="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                <div class="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div
                      class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-sky-100"
                    >
                      <ExclamationTriangleIcon class="w-6 h-6 text-sky-600" aria-hidden="true" />
                    </div>
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 class="text-base font-semibold leading-6 text-gray-900">Important information</h3>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500">Due to structural changes with the MICATool, linked to the move from the MICAT to the SEED MICAT project, unexpected bugs and results might occur. We are genuinely sorry for the inconvenience and are working hard on fixing these issues. In case you have any questions or remarks, please contact us at <a class="font-bold" href="mailto:frederic.berger@isi.fraunhofer.de">frederic.berger@isi.fraunhofer.de</a>.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="px-4 py-3 bg-gray-50 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" class="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white bg-gray-600 border-0 rounded-md shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto focus:border-0 focus:outline-none" @click="setSeedInfo(false)">Sure</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MureSelection v-if="session.mure" :subsectors="subsectors" :regions="regions"></MureSelection>
        <div v-else class="relative px-8 py-8 mb-5 border border-gray-300 rounded-3xl dark:border-gray-400">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block px-4 italic font-bold bg-white dark:bg-blue-950 dark:text-white">
              <span v-if="stage === stages.home">Select your use case</span>
              <span v-else>Options</span>
            </span>
          </div>
          <div class="grid items-center grid-cols-5">
            <!-- time frame -->
            <div class="col-span-2">
              <label for="timeframe" class="text-sm dark:text-white">Time frame</label>
              <InformationCircleIcon
                @click="openModal('timeframe')"
                class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div class="col-span-3">
              <div
                class="inline-flex items-center border rounded-full cursor-pointer dark:text-gray-800 border-sky-600 dark:border-0"
              >
                <span 
                  class="pt-4 pb-3 pl-8 leading-3 text-center rounded-l-full pr-7"
                  :class="{
                    'bg-sky-600 text-white': !session.future,
                    'bg-white text-gray-400': session.future,
                  }"
                  @click="session.future = false"
                >
                  <span class="font-bold uppercase">past</span>
                  <br>
                  <span class="text-sm">(ex-post)</span>
                </span>
                <span
                  class="pt-4 pb-3 pr-8 leading-3 text-center rounded-r-full pl-7"
                  :class="{
                    'dark:bg-white text-gray-400': !session.future,
                    'bg-sky-600 text-white': session.future,
                  }"
                  @click="session.future = true"
                >
                  <span class="font-bold uppercase">future</span>
                  <br>
                  <span class="text-sm">(ex-ante)</span>
                </span>
              </div>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="col-span-2 mt-8">
              <label for="region" class="text-sm dark:text-white">Region</label>
              <InformationCircleIcon
                @click="openModal('region')"
                class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div class="col-span-3 mt-8">
              <select
                id="region"
                class="block py-2.5 px-0 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="session.region"
              >
                <option v-for="(region, i) in regions" v-bind:key="`region-${i}`" :value="region[0]">{{
                    region[1]
                  }}
                </option>
              </select>
              <div v-if="session.region !== 0">
                <div class="flex items-center mt-3 mb-2">
                  <input v-model="session.municipality" id="municipality-1" type="radio" :value="false" name="municipality"
                         class="w-4 h-4 bg-gray-100 border-gray-300 text-sky-600 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="municipality-1" class="ml-2 text-xs font-medium text-gray-500 dark:text-gray-300">Whole
                    country</label>
                </div>
                <div class="flex items-center">
                  <input v-model="session.municipality" id="municipality-2" type="radio" :value="true" name="municipality"
                         class="w-4 h-4 bg-gray-100 border-gray-300 text-sky-600 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="municipality-2" class="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">Municipality
                    with <VueNumberFormat
                      :value="session.inhabitants"
                      class="bg-gray-50 border border-gray-300 text-gray-500 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[80px]"
                      id="inhabitants"
                      @change="(e: Event) => session.updateInhabitants(parseInt((e.target as HTMLInputElement).value.replace(',', '')))"
                    ></VueNumberFormat> <span v-if="stage === stages.home">inhabitants</span><span
                      v-else>inhab.</span></label>
                </div>
              </div>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="col-span-2 mt-8">
              <label for="unit" class="text-sm dark:text-white">Unit</label>
              <InformationCircleIcon
                @click="openModal('unit')"
                class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div class="col-span-3 mt-8">
              <select
                id="unit"
                class="block py-2.5 px-0 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="session.unit"
              >
                <option v-for="[key, value] in Object.entries(units)" v-bind:key="`unit-${key}`" :value="key">{{
                    value.name
                  }}
                </option>
              </select>
            </div>
            <!-- end unit -->
          </div>
        </div>
        <button
          class="px-8 py-2 font-bold text-white uppercase bg-orange-500 rounded-full hover:bg-orange-600 disabled:bg-orange-600 disabled:text-orange-500"
          @click="start();"
          v-if="stage === stages.home"
          :disabled="session.mure && (session.mureCategory === 0 || session.mureCountry === 0 || (!session.odyssee && session.mureMeasurement === 0))"
        >
          Start
        </button>
        <a
          class="px-8 py-2 ml-3 font-bold uppercase border rounded-full border-sky-500 text-sky-500 hover:border-sky-600 hover:text-sky-600 hover:dark:border-sky-400 hover:dark:text-sky-400"
          href="https://doc.micatool.eu"
          target="_blank"
          v-if="stage === stages.home"
        >
          Learn more
        </a>
        <div class="relative mt-10 text-xs text-center" v-if="stage === stages.home">
          <div class="absolute top-[-8px] w-full">
            <p class="inline-block px-4 bg-white dark:bg-blue-950 dark:text-white">
              <span v-if=" session.mure">or use your own inputs</span>
              <span v-else>or select predefined values from the <a class="font-bold" href="https://www.odyssee-mure.eu/" target="_blank">ODYSSEE-MURE</a> project</span>
            </p>
          </div>
          <hr class="mb-5 border-gray-200 dark:border-sky-900" />
          
          <button
            v-if="!session.mure || !session.odyssee"
            class="px-6 py-1 mx-1 font-bold uppercase border rounded-full border-sky-600 text-sky-600 hover:border-sky-700 hover:text-sky-700 hover:dark:border-sky-500 hover:dark:text-sky-500"
            @click="session.mure = !session.mure;"
          >
            {{ session.mure && !session.odyssee ? 'Deselect MURE' : 'Start with MURE' }}
          </button>
          <button
            v-if="!session.mure || session.odyssee"
            class="px-6 py-1 mx-1 font-bold uppercase border rounded-full border-sky-600 text-sky-600 hover:border-sky-700 hover:text-sky-700 hover:dark:border-sky-500 hover:dark:text-sky-500"
            @click="session.mure = !session.mure; session.odyssee = !session.odyssee;"
          >
            {{ session.mure && session.odyssee ? 'Deselect ODYSSEE' : 'Start with ODYSSEE' }}
          </button>
        </div>
        <div class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mt-[3rem]"
             v-if="stage === stages.full">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block px-4 italic font-bold bg-white dark:bg-blue-950 dark:text-white">
              Time frame
              <InformationCircleIcon
                @click="openModal('years')"
                class="inline w-6 h-6 ml-1 cursor-pointer dark:text-white"
              ></InformationCircleIcon>
            </span>
          </div>
          <div class="flex flex-wrap">
            <div v-for="year in years" v-bind:key="year.toString()" class="mr-4 rounded-full whitespace-nowrap mb-7">
              <span class="px-2 py-2 text-center text-white border rounded-l-full bg-sky-600 border-sky-600">
                {{ year }}
              </span>
              <span class="px-2 py-2 text-center border rounded-r-full dark:bg-white text-sky-900 border-sky-600">
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
              class="py-2.5 px-0 w-full text-sm text-gray-500 bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 max-w-[100px]"
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
              class="inline ml-5 cursor-pointer h-7 w-7 text-sky-700 dark:text-white"
            ></PlusCircleIcon>
          </div>
        </div>
        <div class="mt-5" v-if="!session.resetted && stage !== stages.home">
          <button
            class="py-2 pl-2 pr-3 mr-2 text-xs font-bold text-white uppercase bg-gray-500 rounded-full hover:bg-gray-600"
            @click="reset()"
          >
            <XCircleIcon class="h-5 w-5 mt-[-3px] inline text-white"></XCircleIcon>
            Reset
          </button>
          <button
            class="py-2 pl-2 pr-3 mr-2 text-xs font-bold text-white uppercase bg-gray-500 rounded-full hover:bg-gray-600"
            @click="exportInput()"
          >
            <ArrowDownTrayIcon class="h-5 w-5 mt-[-3px] inline text-white"></ArrowDownTrayIcon>
            Save
          </button>
          <button
            class="py-2 pl-2 pr-3 mr-2 text-xs font-bold text-white uppercase bg-gray-500 rounded-full hover:bg-gray-600"
            @click="fileUpload!.click();"
          >
            <ArrowUpTrayIcon class="h-5 w-5 mt-[-3px] inline text-white"></ArrowUpTrayIcon>
            <input ref="fileUpload" type="file" accept="application/json" class="hidden" @change="importInput" />
            Import
          </button>
          <button
            class="py-2 pl-2 pr-3 text-xs font-bold text-white uppercase bg-gray-500 rounded-full hover:bg-gray-600"
            @click="showGlobalParametersOverlay = true;"
          >
            <AdjustmentsVerticalIcon class="h-5 w-5 mt-[-3px] inline text-white"></AdjustmentsVerticalIcon>
            Parameters
          </button>
           <InformationCircleIcon
              @click="openModal('global-parameters')"
              class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
            ></InformationCircleIcon>
        </div>
      </div>
      <div
        class="relative col-span-6 col"
        v-if="stage === stages.full"
      >
        <div v-if="seedInfo" class="absolute inset-[-1rem] z-10 bg-white/80 dark:bg-blue-950/80 transition-opacity min-h-full"></div>
        <div
          v-if="error"
          class="flex p-4 text-red-800 border-t-4 border-red-300 mb-7 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800 rounded-2xl"
          role="alert"
        >
          <ExclamationCircleIcon class="w-8 h-8"></ExclamationCircleIcon>
          <div class="ml-3 font-medium">
            <div v-html="error"></div>
          </div>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            aria-label="Close"
            @click="error = '';"
          >
            <span class="sr-only">Dismiss</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
        <div
          v-if="Object.keys(session.results).length > 0"
          class="flex p-4 text-green-800 border-t-4 border-green-300 cursor-pointer mb-7 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800 rounded-2xl"
          role="alert"
          @click="router.push({ name: 'results' });"
        >
          <PresentationChartBarIcon class="w-8 h-8"></PresentationChartBarIcon>
          <div class="ml-3 font-medium">
            <h2 class="mt-1 font-bold">Results are ready.</h2>
            <p class="text-sm">Click here to open the results again.</p>
          </div>
        </div>
        <div
          class="relative px-8 py-8 mb-8 border border-gray-300 rounded-3xl dark:border-gray-400"
          v-for="(program, i) in programs"
          v-bind:key="`program-${i}`"
        >
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block pl-4 pr-3 bg-white dark:bg-blue-950 dark:text-white">
              <div class="flex items-center">
                <input
                  type="text"
                  :id="`program-name-${i}`"
                  class="bg-gray-50 border border-gray-300 text-sky-900 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[185px]"
                  v-model="program.name"
                  maxlength="25"
                >
                <TrashIcon
                  v-if="programs.length >= 2"
                  @click="removeProgram(i)"
                  class="inline w-5 h-5 ml-3 text-red-700 cursor-pointer"
                ></TrashIcon>
                <InformationCircleIcon
                  @click="openModal('programs')"
                  class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
                ></InformationCircleIcon>
              </div>
            </span>
          </div>
          <div class="flex items-center gap-8">
            <div>
              <label :for="`subsector-${i}`" class="text-sm dark:text-white">Subsector</label>
              <InformationCircleIcon
                @click="openModal('subsector')"
                class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div>
              <div class="relative inline-block text-left">
                <div>
                  <button 
                    type="button" 
                    class="inline-flex gap-2 block py-2.5 px-0 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 pr-2"
                    :id="`subsector-button-${i}`" 
                    aria-expanded="false" 
                    aria-haspopup="true"
                    @click="program.showSubsectorMenu = !program.showSubsectorMenu"
                  >
                    {{ program.subsectorName || 'Select subsector' }}
                    <svg class="w-5 h-5 -mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div 
                  class="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[40vh] overflow-y-auto"
                  v-show="program.showSubsectorMenu"
                  role="menu" 
                  aria-orientation="vertical" 
                  :aria-labelledby="`subsector-button-${i}`" 
                  tabindex="-1"
                >
                  <div class="py-1" role="none">
                    <a 
                      href="#" 
                      class="block px-4 py-2 text-sm font-bold text-gray-700" 
                      role="menuitem" 
                      tabindex="-1"
                      :id="`subsector-${i}-${subsector.id}`" 
                      v-for="subsector in subsectors.filter(s => s.name.toLowerCase().includes('average'))" 
                      v-bind:key="`subsector-${i}-${subsector.id}`"
                      @click="program.subsector = (subsector.id as number); program.showSubsectorMenu = false; programChanged(program, i, program.subsector!)"
                    >
                      {{ subsector.name }}
                    </a>
                  </div>
                  <div class="py-1" role="none">
                    <a 
                      href="#" 
                      class="block px-4 py-2 text-sm text-gray-700" 
                      role="menuitem" 
                      tabindex="-1"
                      :id="`subsector-${i}-${subsector.id}`" 
                      v-for="subsector in subsectors.filter(s => !s.name.toLowerCase().includes('average'))" 
                      v-bind:key="`subsector-${i}-${subsector.id}`"
                      @click="program.subsector = (subsector.id as number); program.showSubsectorMenu = false; programChanged(program, i, program.subsector!)"
                    >
                      {{ subsector.name }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid items-center grid-cols-2 gap-5 mt-8" v-if="program.subsector">
            <div
              class="relative mb-2 border rounded-3xl"
              :class="{
                'border-gray-300': improvement.id,
                'dark:border-gray-400': improvement.id,
                'border-red-300': !improvement.id,
                'dark:border-red-400': !improvement.id,
              }"
              v-for="(improvement, improvementIndex) in program.improvements"
              v-bind:key="`improvement-${i}-${improvement.id}`"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <select
                    :id="`improvement-${i}-${improvement.id}`"
                    class="block py-2.5 pl-0 pr-8 w-full text-sm bg-white dark:bg-blue-950 border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                    :class="{
                      'border-gray-200': improvement.id,
                      'dark:text-gray-200': improvement.id,
                      'dark:border-gray-200': improvement.id,
                      'border-red-400': !improvement.id,
                      'dark:text-red-400': !improvement.id,
                      'dark:border-red-200': !improvement.id,
                    }"
                    v-model="improvement.id"
                    @change="improvementChanged(program, i, improvement.id!)"
                  >
                    <option value="0" selected disabled>Select improvement</option>
                    <option
                      v-for="improvementSelection in getSubsectorImprovements(program.subsector)"
                      v-bind:key="`improvement-selection-${i}-${improvementSelection.id}`"
                      :value="improvementSelection.id"
                      :title="improvementSelection.name"
                    >
                      {{ improvementSelection.label }}
                    </option>
                  </select>
                  <InformationCircleIcon
                    @click="openModal('improvement')"
                    class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
                  ></InformationCircleIcon>
                </div>
                <div class="flex items-center">
                  <div>
                    <div v-for="year in years" v-bind:key="year.toString()" class="mt-5 mb-5 rounded-full whitespace-nowrap">
                      <span class="px-2 py-2 text-center text-white border rounded-l-full bg-sky-600 border-sky-600">{{
                          year
                        }}</span>
                      <span class="px-2 py-2 text-center border rounded-r-full dark:bg-white text-sky-900 border-sky-600">
                        <VueNumberFormat
                          :value="improvement.values[year]"
                          :name="`improvement-value-${improvement.id}-${year}`"
                          class="bg-white border-0 text-gray-500 rounded-lg focus:ring-0 focus:border-0 px-1.5 py-0.5 inline max-w-[120px]"
                          placeholder="0"
                          :id="`improvement-value-${improvement.id}-${year}`"
                          @change="(e: Event) => improvement.values[year] = parseInt((e.target as HTMLInputElement).value.replace(',', ''))"
                          :options="{precision: session.unit === 5 ? 6 : 0}"
                        />
                      </span>
                      <span class="p-2 text-xs leading-4 text-gray-400 dark:text-slate-500">{{ units[session.unit].symbol }}</span>
                    </div>
                  </div>
                  <div>
                    <InformationCircleIcon
                      @click="openModal('savings')"
                      class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
                    ></InformationCircleIcon>
                  </div>
                </div>
              </div>
              <div class="px-6 py-3 text-sm text-center text-gray-400 dark:text-slate-300" v-if="session.mure">
                <span>Percentage distribution</span>
                <input
                  :value="improvement.percentage"
                  type="number"
                  class="bg-gray-50 border border-gray-300 text-sky-900 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 mx-2"
                  min="0"
                  max="100"
                  @change="(e: Event) => percentageDistributionChanged(parseInt((e.target as HTMLInputElement).value), program, improvementIndex)"
                >
                <span class="text-gray-400 dark:text-slate-500">%</span>         
              </div>
              <div class="px-6 py-3 text-center bg-orange-200 border-t border-gray-200 dark:bg-sky-200">
                <button
                  class="py-2 pl-3 pr-4 text-xs font-bold text-white uppercase rounded-full"
                  :class="{
                    'cursor-not-allowed bg-gray-400 hover:bg-gray-400 dark:bg-gray-400 dark:hover:bg-gray-400': improvement.id === 0 || Object.entries(improvement.values).filter(([key, val]) => years.includes(parseInt(key))).reduce((partialSum, [k, v]) => partialSum + v, 0) === 0,
                    'bg-orange-400 hover:bg-orange-500 dark:bg-sky-400 dark:hover:bg-sky-500': improvement.id !== 0 && Object.entries(improvement.values).filter(([key, val]) => years.includes(parseInt(key))).reduce((partialSum, [k, v]) => partialSum + v, 0) > 0,
                  }"
                  @click="showParameters(improvement, i)"
                  :disabled="improvement.id === 0 || Object.entries(improvement.values).filter(([key, val]) => years.includes(parseInt(key))).reduce((partialSum, [k, v]) => partialSum + v, 0) === 0"
                >
                  <AdjustmentsVerticalIcon class="h-5 w-5 mt-[-3px] inline text-white"></AdjustmentsVerticalIcon>
                  Advanced
                </button>
                 <InformationCircleIcon
                    @click="openModal('parameters')"
                    class="inline w-6 h-6 ml-2 text-orange-400 cursor-pointer dark:text-sky-400"
                 ></InformationCircleIcon>
              </div>
              <div
                class="px-6 py-3 text-center border-t border-gray-200 bg-blue-50 dark:bg-blue-900 rounded-b-3xl"
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
              class="inline text-gray-300 cursor-pointer h-7 w-7 dark:text-white"
            ></PlusCircleIcon>
          </div>
        </div>
        <div class="mb-5 text-center" v-if="!session.mure">
          <button
            class="py-2 pl-3 pr-4 text-xs font-bold text-white uppercase bg-gray-500 rounded-full hover:bg-gray-600"
            @click="addProgram()"
          >
            <PlusCircleIcon class="h-5 w-5 mt-[-2px] inline text-white"></PlusCircleIcon>
            Add program
          </button>
        </div>
        <div
          class="sticky bottom-0 text-center"
        >
          <div class="flex justify-center p-4 mx-2" style="backdrop-filter: blur(2px);">
            <button
              class="px-8 py-2 text-xl font-bold uppercase rounded-full bg-amber-300 hover:bg-amber-400"
              @click="analyze()"
              ref="analyzeButton"
              :disabled="loading"
            >
              <div role="status" v-if="loading">
                  <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <span class="sr-only">Loading...</span>
              </div>
              <span v-else>Analyse</span>
            </button>
            <button
              class="ml-3 text-xs font-semibold bg-transparent dark:text-gray-400"
              @click="reset()"
              :disabled="loading"
            ><XCircleIcon class="h-5 w-5 mt-[-3px] inline dark:text-gray-400"></XCircleIcon> back to start</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
