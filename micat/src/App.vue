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
    'text': 'These parameters define the context in which the assessed measures take place. Inter alia, this concerns energy prices, the energy mix used in electricity and heat generation, the employed monetisation factors or the energy mix in certain sectors and subsectors. Thus, these settings apply to all measures, unless specified otherwise in measures\' advanced parameters.<br /><br />The region and years for which these values can be input reflects the selection of <strong>Region</strong> and years in the prompt <strong>Time frame</strong>, respectively.<br /><br /><strong>Important:</strong> Please note, that any changes are lost if you change the given region or time frame.',
    'type': 'help'
  },
  'parameters': {
    'title': 'Advanced parameters',
    'text': '<strong>Important:</strong> Please note, that any changes are lost if you change the given region or time frame.',
    'type': 'help'
  },
  'renovation': {
    'title': 'Annual renovation rate',
    'text': 'tba',
    'type': 'help'
  },
  // Global parameters
  'FuelSplitCoefficient': {
    'title': 'Energy mix coefficient',
    'text': 'These parameters describe which energy carriers are used in the different available sectors and subsectors and there percentage in the energy mix. These values are used to calculate the affected energy mixes for the different selectable improvement actions. Thus, altering these figures changes the proposed default energy mix for the measures selected in the related sector. Yet, it is still possible to alter the affected energy mix for a measure in the measures\' advanced parameters.<br /><br />For ex-post evaluations, default values stem from Eurostat\'s complete energy balances. For ex-ante evaluations, the values are provided from e3modelling\'s EU Reference Scenario 2020, computed with their PRIMES model.<br /><br />Since some default values are confidential, the respective fields might be blank. Nonetheless, you have the possibility to input your own value, which overrides the database\'s default value.',
    'type': 'help'
  },
  'EnergyPrice': {
    'title': 'Energy prices',
    'text': 'These parameters specify the costs of different energy carriers per kiloton of oil equivalent (ktoe). This data stems from a wide range of sources, oftentimes adjusted to account for projected price developments. Since some default values are confidential, the respective fields might be blank. Nonetheless, you have the possibility to input your own value, which overrides the database\'s default value.',
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
    'text': 'These parameters specify the monetary value used for the monetisation of impacts. Some of these values are year-dependent, while others are considered constant over time.',
    'type': 'help'
  },
  'Valueofalifeyear': {
    'title': 'Value of a Life Year',
    'text': 'This factor is based on the World Health Organization\'s (WHO) publication of Value of a Life Year (VOLY) factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of years of reduced lifetime.',
    'type': 'help'
  },
  'Valueofastatisitcallife': {
    'title': 'Value of Statistical Life',
    'text': 'This factor is based on the World Health Organization\'s (WHO) publication of Value of Statistical Life (VSL) factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of premature deaths.',
    'type': 'help'
  },
  'Valueofalostworkday': {
    'title': 'Value of a lost work day',
    'text': 'This factor is based on the World Health Organization\'s (WHO) publication of Value of work loss days (WLD) factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of absences from work, for instance due to illness.',
    'type': 'help'
  },
  'CostpertonofemittedCO2': {
    'title': 'Cost of CO2-emissions',
    'text': 'The valuation of the cost of CO2 emissions is based on societal costs of carbon emissions, including all costs to alleviate their consequences. However, no discounting of the opportunity to emit CO2 for future generations is included in the provided default figure. The latter as well as a figure including generational discounting are calculated by the <a class="font-bold" href="https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen#klimakosten-von-treibhausgas-emissionen" target="_blank">German Federal Environmental Agency (UBA)</a>.<br /><br />Alternatively, one could also use the market price of emission rights traded within the EU Emission Trading Scheme, the European Union\'s cap and trade scheme for carbon dioxide emissions. Inter alia, current prices can be found on the <a class="font-bold" href="https://www.eex.com/en/market-data/environmentals/spot" target="_blank">European Energy Exchange\'s (EEX) website</a>.',
    'type': 'help'
  },
  'CostofstatisticaltransferofRES': {
    'title': 'Cost of statistical transfer of RES',
    'text': 'The monetisation of energy efficiency\'s contribution to Renewable Energy Source (RES) targets as defined in the Renewable Energy Directive (RED) is done via statistical transfer costs. A statistical transfer is the administrative on paper purchase of a quantity of renewable energy by an underachieving European Member State from another Member State that has overachieved its target. As such, no physical energy is transferred, merely the right to account the renewable energy consumption is transferred between Member States.<br /><br />The provided default cost per ktoe is calculated as average of negotiated and published statistical transfer of RES deals between Member States.',
    'type': 'help'
  },
  'InvestmentcostsofPV': {
    'title': 'Investment costs of PV',
    'text': 'tba',
    'type': 'help'
  },
  'Investmentcostsofonshorewind': {
    'title': 'Investment costs of onshore wind',
    'text': 'tba',
    'type': 'help'
  },
  'Investmentcostsofoffshorewind': {
    'title': 'Investment costs of offshore wind',
    'text': 'tba',
    'type': 'help'
  },
  // Advanced parameters
  'advanced-parameters-40': {
    'title': 'Investment costs',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-35': {
    'title': 'Average subsidy rate',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-36': {
    'title': 'Average technology lifetime',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-1': {
    'title': 'Share of electricity among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-2': {
    'title': 'Share of oil among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-3': {
    'title': 'Share of coal among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-4': {
    'title': 'Share of gas among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-5': {
    'title': 'Share of biomass and waste among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-6': {
    'title': 'Share of heat among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-16-7': {
    'title': 'Share of H2 and e-fuels among affected',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-1': {
    'title': 'Share of electricity among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-2': {
    'title': 'Share of oil among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-3': {
    'title': 'Share of coal among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-4': {
    'title': 'Share of gas among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-5': {
    'title': 'Share of biomass and waste among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-6': {
    'title': 'Share of heat among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-17-7': {
    'title': 'Share of H2 and e-fuels among removed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-1': {
    'title': 'Share of electricity among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-2': {
    'title': 'Share of oil among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-3': {
    'title': 'Share of coal among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-4': {
    'title': 'Share of gas among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-5': {
    'title': 'Share of biomass and waste among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-6': {
    'title': 'Share of heat among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-18-7': {
    'title': 'Share of H2 and e-fuels among installed',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-1': {
    'title': 'Efficiency of removed electricity',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-2': {
    'title': 'Efficiency of removed oil',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-3': {
    'title': 'Efficiency of removed coal',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-4': {
    'title': 'Efficiency of removed gas',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-5': {
    'title': 'Efficiency of removed biomass and waste',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-6': {
    'title': 'Efficiency of removed heat',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-14-7': {
    'title': 'Efficiency of removed H2 and e-fuels',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-1': {
    'title': 'Efficiency of installed electricity',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-2': {
    'title': 'Efficiency of installed oil',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-3': {
    'title': 'Efficiency of installed coal',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-4': {
    'title': 'Efficiency of installed gas',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-5': {
    'title': 'Efficiency of installed biomass and waste',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-6': {
    'title': 'Efficiency of installed heat',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-15-7': {
    'title': 'Efficiency of installed H2 and e-fuels',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-45': {
    'title': 'Number of affected dwellings',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-42': {
    'title': 'Energy poverty targetednes',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-43': {
    'title': 'Annual renovation rate',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-32': {
    'title': 'Total dwelling stock',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-31': {
    'title': 'Average number of households per building',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-29': {
    'title': 'Average rent of energy poor households',
    'text': 'tba',
    'type': 'help'
  },
  'advanced-parameters-34': {
    'title': 'Average renovation rent premium',
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
  <div class="min-h-full bg-white dark:bg-blue-950">
    <header>
      <nav>
        <div class="flex flex-wrap items-center justify-between max-w-screen-xl py-4 mx-auto">
          <div class="flex items-center">
            <a href="/">
              <img src="@/assets/logo_sm.png" class="h-10 mr-3" alt="MICAT Logo" />
            </a>
            <button
              class="px-2 py-1 text-sm font-bold text-white rounded-full bg-sky-800"
              @click="openModal('beta')"
            >
              beta
              <InformationCircleIcon class="h-5 w-5 ml-1 inline mt-[-2px]"></InformationCircleIcon>
            </button>
          </div>
          <div class="w-full md:w-auto">
            <ul class="flex flex-col p-4 mt-4 font-medium rounded-lg md:p-0 bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-blue-900 md:dark:bg-blue-950">
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
  <div class="p-2 text-xs text-blue-400 bg-blue-800">
    <div class="flex items-center justify-between max-w-screen-xl mx-auto">
      <div>© 2023 Fraunhofer-Gesellschaft e.V., München &middot; SPDX-License-Identifier: AGPL-3.0-or-later</div>
      <div class="flex max-w-[450px] items-center">
        <img src="@/assets/Flag_of_Europe.svg" class="h-8 mr-3" alt="Flag of Europe" />
        This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No. 101000132.
      </div>
    </div>
  </div>
</template>
