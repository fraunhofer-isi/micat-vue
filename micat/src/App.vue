<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ref, provide } from 'vue';
import { RouterView } from 'vue-router';
import NotificationBox from "@/components/NotificationBox.vue";
import type { HelpTextInterface } from "@/types";
import {InformationCircleIcon} from "@heroicons/vue/24/outline";

// Variables
const helpTexts: HelpTextInterface = {
  'timeframe': {
    'title': 'Time frame',
    'text': 'This relates to when the measure is implemented and also affects which data is used.<br />' +
      'For completed programs, please use <strong>PAST</strong>. Thereby, the calculations mainly rely on measured values from the past, predominantly stemming from Eurostat.<br />' +
      'For current or future programs, please use <strong>FUTURE</strong>. As a result, data from PRIMES\' EU Reference Scenario 2020 is used, which constitute projected values.',
    'type': 'help'
  },
  'region': {
    'title': 'Region',
    'text': 'This selects which Member State\'s (or EU27) default values are used in calculations. In case of a country, it is also possible to merely assess a region or municipality in it. Then, absolute default values (i.e. GDP, energy consumption) are scaled using population data.',
    'type': 'help'
  },
  'unit': {
    'title': 'Unit',
    'text': 'This allows to input the energy savings in different units. This does not have an effect on the result\'s units. Moreover, changing this setting after entering values does not convert them.',
    'type': 'help'
  },
  'years': {
    'title': 'Time frame',
    'text': 'Here, you can select the years for which you want to provide data. Between these, the tool calculates linear interpolations.',
    'type': 'help'
  },
  'subsector': {
    'title': 'Subsector',
    'text': 'This determines the sector or subsector, the program is carried out in. More details about the available (sub-)sectors are available <a class="font-bold" href="https://doc.micatool.eu/indices/indices_description.html#id-sector-and-id-subsector" target="_blank">here</a>.',
    'type': 'help'
  },
  'improvement': {
    'title': 'Improvement',
    'text': 'This specifies which improvements are part of the program. Each improvement type bundles measures that similarly affect multiple impacts (i.e. building envelope encompasses window replacements as well as wall or roof insulations). More details about the available improvements are available <a class="font-bold" href="https://doc.micatool.eu/indices/indices_description.html#id-action-type" target="_blank"></a>',
    'type': 'help'
  },
  'energy-price-sensitivity': {
    'title': 'Energy price sensitivity',
    'text': 'This setting allows to apply a multiplier to all energy costs calculated within the tool. As price shocks tend to come unannounced, this can help to simply counteract inaccurate price projections.',
    'type': 'help'
  },
  'investments-sensitivity': {
    'title': 'Investments sensitivity',
    'text': 'This setting allows to apply a multiplier to the investment costs used in the cost-benefit analysis. However, this does not affect the prior calculation of multiple impacts scaling with investments (i.e. GDP, employments, and energy poverty in case the number of affected dwellings has not been specified).',
    'type': 'help'
  },
  'discount-rate': {
    'title': 'Discount rate',
    'text': 'This allows to adjust the discount rate in the cost-benefit analysis, which specifies what interest rate is assumed for alternative investment possibilities. Thus, it allows to compare the expected return on investment of energy efficiency with the default expected across the economy. However, this setting does not affect indicator calculations which might have some underlying discount rate assumptions (i.e. capitalisation rate for asset values or coefficients for GDP).',
    'type': 'help'
  },
  'cba-year': {
    'title': 'Year',
    'text': 'Please select the desired year for which the calculation of the marginal cost curves is to be carried out.',
    'type': 'help'
  },
  'beta': {
    'title': 'Beta version',
    'text': 'This is an early version of the MICAT tool. Accordingly, errors may still occur due to unforeseen events, which will be corrected as soon as possible. For questions and comments, please send us an email to <a href="mailto:frederic.berger@isi.fraunhofer.de" class="font-bold">frederic.berger@isi.fraunhofer.de</a>.',
    'type': 'help'
  },
  'global-parameters': {
    'title': 'Global parameters',
    'text': 'tba',
    'type': 'help'
  },
  'parameters': {
    'title': 'Advanced parameters',
    'text': 'tba',
    'type': 'help'
  },
  'renovation': {
    'title': 'Annual renovation rate',
    'text': 'tba',
    'type': 'help'
  },
  // Global parameters
  'FuelSplitCoefficient': {
    'title': 'Fuel Split Coefficient',
    'text': 'tba',
    'type': 'help'
  },
  'EnergyPrice': {
    'title': 'Energy Price',
    'text': 'tba',
    'type': 'help'
  },
  'ElectricityGeneration': {
    'title': 'Electricity Generation',
    'text': 'tba',
    'type': 'help'
  },
  'HeatGeneration': {
    'title': 'Heat Generation',
    'text': 'tba',
    'type': 'help'
  },
  'MonetisationFactors': {
    'title': 'Monetisation Factors',
    'text': 'tba',
    'type': 'help'
  },
};

const showModal = ref<Boolean>(false);
const modalTitle = ref<String>('');
const modalText = ref<String>('');
const modalType = ref<String>('help');

// Functions
const openModal = (key: string) => {
  modalTitle.value = helpTexts[key].title;
  modalText.value = helpTexts[key].text;
  modalType.value = helpTexts[key].type;
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
};

// Provide & Inject
provide('modal', {
  showModal,
  modalTitle,
  modalText,
  modalType,
  openModal,
  closeModal
})
</script>

<template>
  <div class="bg-white dark:bg-blue-950 min-h-full">
    <header>
      <nav>
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-4">
          <div class="flex items-center">
            <a href="/">
              <img src="@/assets/logo_sm.png" class="h-10 mr-3" alt="MICAT Logo" />
            </a>
            <button
              class="rounded-full bg-sky-800 text-white text-sm px-2 py-1 font-bold"
              @click="openModal('beta')"
            >
              beta
              <InformationCircleIcon class="h-5 w-5 ml-1 inline mt-[-2px]"></InformationCircleIcon>
            </button>
          </div>
          <div class="w-full md:w-auto">
            <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-blue-900 md:dark:bg-blue-950">
              <li>
                <a href="https://micatool.eu/" target="_blank" class="block py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sky-700 md:p-0 dark:text-white md:dark:hover:text-sky-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent">Project</a>
              </li>
              <li>
                <a href="https://doc.micatool.eu/" target="_blank" class="block py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sky-700 md:p-0 dark:text-white md:dark:hover:text-sky-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent">Documentation</a>
              </li>
              <li>
                <a href="https://micatool.eu/micat-project-en/data-protection/" target="_blank" class="block py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sky-700 md:p-0 dark:text-white md:dark:hover:text-sky-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent">Data protection</a>
              </li>
              <li>
                <a href="https://micatool.eu/micat-project-en/publishing-notes/" target="_blank" class="block py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sky-700 md:p-0 dark:text-white md:dark:hover:text-sky-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent">Publishing notes</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <RouterView />

    <NotificationBox></NotificationBox>
  </div>
  <div class="bg-blue-800 p-2 text-xs text-blue-400">
    <div class="max-w-screen-xl flex items-center justify-between mx-auto">
      <div>© 2023 Fraunhofer-Gesellschaft e.V., München &middot; SPDX-License-Identifier: AGPL-3.0-or-later</div>
      <div class="flex max-w-[450px] items-center">
        <img src="@/assets/Flag_of_Europe.svg" class="h-8 mr-3" alt="Flag of Europe" />
        This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No. 101000132.
      </div>
    </div>
  </div>
</template>
