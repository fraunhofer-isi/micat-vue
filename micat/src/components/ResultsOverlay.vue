<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  UserGroupIcon,
  XCircleIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  PresentationChartBarIcon,
  CursorArrowRaysIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import type {CategoriesInterface, MeasurementInterface, ResultInterface, DatasetInterface} from "@/types";

const props = defineProps(['results']);
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const data = computed<ResultInterface>(() => JSON.parse(JSON.stringify(props.results[activeMeasurement.value.identifier])))
const chartColours: Array<string> = [
  "rgb(252,107,32)",
  "rgb(7,89,133)",
  "rgb(246,218,10)",
  "rgb(45,192,204)",
  "rgb(244,122,32)",
  "rgb(31,149,178)",
];
const hasMultipleMeasures = computed(() => data.value.idColumnNames.indexOf('id_measure') > -1);
const chartLabels = computed(() => {
  // Get labels
  const labels: Array<string> = [];
  const identifiers = data.value.idColumnNames.filter(identifier => identifier !== 'id_measure');
  if (identifiers.length > 0) {
    data.value.rows.forEach(row => {
      if (!hasMultipleMeasures.value || row[0] === 1) labels.push(row[hasMultipleMeasures.value ? 1: 0]);
    });
  }
  if (hasMultipleMeasures.value && labels.length === 0) labels.push('id_measure');
  return labels;
});
const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      title: {
        text: 'MICAT',
        display: false
      },
      legend: {
        display: chartLabels.value.filter(label => label !== 'id_measure').length > 0
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Years'
        }
      },
      y: {
        title: {
          display: true,
          text: activeMeasurement.value.yAxis
        }
      }
    },
  };
})
const chartData = computed(() => {
  const datasets: Array<DatasetInterface> = [];
  chartLabels.value.forEach((label, i) => {
    const dataset = {
      label: label === 'id_measure' ? '' : label,
      data: new Array(data.value.yearColumnNames.length).fill(0),
      borderColor: chartColours[i],
      backgroundColor: chartColours[i],
    };
    data.value.rows.forEach(row => {
      if (row[hasMultipleMeasures.value ? 1 : 0] === label || label === 'id_measure') {
        row.splice(0, hasMultipleMeasures.value && label !== 'id_measure' ? 2 : 1);
        row.forEach((measure, iM) => {
          // Sum up measurements and check if it's a percentage value
          dataset.data[iM] += activeMeasurement.value.yAxis.indexOf('%') > -1 ? measure * 100 : measure;
        });
      }
    });
    datasets.push(dataset);
  });
  return {
    labels: data.value.yearColumnNames,
    datasets: datasets
  };
})
const icons: any = {
  UserGroupIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  PresentationChartBarIcon
};
const categories: CategoriesInterface = {
  "quantification": {
    icon: "UserGroupIcon",
    title: "Quantification",
    subtitle: "physical values",
    measurements: [
      {
        subcategory: "Social",
        title: "Avoided premature mortality due to air pollution",
        description: "This indicator assesses the avoided number of premature death cases thanks to energy efficiency measures resulting in declining air pollution levels. It is based on IIASA's GAINS model, taking air pollution reductions, national health data, and other factors into account.",
        identifier: "reductionOfMortalityMorbidity",
        yAxis: "Reduction in casualties"
      },
      {
        subcategory: "Social",
        title: "Avoided lost working days due to air pollution",
        description: "This indicator assesses the avoided number of premature death cases thanks to energy efficiency measures resulting in declining air pollution levels. It is based on IIASA's GAINS model, taking air pollution reductions, national health data, and other factors into account.",
        identifier: "reductionOfLostWorkDays",
        yAxis: "Avoided absences in days"
      },
      {
        subcategory: "Social",
        title: "Energy poverty",
        description: "This indicator shows how energy efficiency improvement actions in the residential sector can help lift people out of energy poverty. In order to calculate it, national energy poverty gaps for affected deciles (gap between the energy expenses of the decile and the energy poverty threshold) are compared to the expected energy cost savings, taking lifetimes, subsidy rates, average rent of energy poor households, and many more parameters into account.",
        identifier: "reductionOfEnergyPoverty",
        yAxis: "People lifted out of energy poverty"
      },
      {
        subcategory: "Economic",
        title: "Impact on energy intensity",
        description: "Energy intensity describes the amount of energy necessary to generate a unit of gross domestic product (GDP) in a given economy. This graph shows the effect energy efficiency has in reducing it. It is calculated by dividing gross available energy by GDP. The scenario with measures is compared to a scenario populated with past data from Eurostat and projections from PRIMES.",
        identifier: "energyIntensity",
        yAxis: "Energy intensity in ktoe / €"
      },
      {
        subcategory: "Economic",
        title: "Impact on import dependency",
        description: "This indicator displays the change in import dependency, the imported share of a resource, for the three main fossil fuels. The change is shown in percent points, comparing the measure to a baseline provided by Eurostat data and PRIMES projections. The underlying assumption is that energy savings would merely reduce energy imports rather than domestic production.",
        identifier: "reductionOfImportDependency",
        yAxis: "Reduction in %-points"
      },
      {
        subcategory: "Economic",
        title: "Impact on gross domestic product",
        description: "Energy efficiency measures stimulate added value and increase the gross domestic product (GDP) in economies, which is shown in this indicator. The calculation uses assumptions from the PRIMES model to adjust coefficients stemming from Eurostat's FIGARO input-output tables, which are then multiplied with investment costs. The result represents the cumulative added value generated by the assessed measures by a given year.",
        identifier: "impactOnGrossDomesticProduct",
        yAxis: "Added value in M€"
      },
      {
        subcategory: "Economic",
        title: "Additional employments",
        description: "Apart from purely behavioural measures, energy efficiency improvements entail additional employments, which are shown in this indicator. The calculation uses assumptions from the PRIMES model to generate coefficients, which are then multiplied with investment costs. The result represents the cumulative additional years of full-time employments generated by the assessed measures by a given year.",
        identifier: "additionalEmployment",
        yAxis: "Additional full-time employment years"
      },
      {
        subcategory: "Economic",
        title: "Added asset value of buildings",
        description: "A variety of studies has found a positive impact of energy efficiency on the real estate value of buildings. This indicator shows the additional value of commercial, office, and residential buildings. The calculation is based on the capitalisation rates for real estate investments in residential and tertiary buildings, which stem from surveys among actors in the property market.",
        identifier: "addedAssetValueOfBuildings",
        yAxis: "Value in M€"
      },
      {
        subcategory: "Economic",
        title: "Change in unit costs of production",
        description: "This indicator describes how the unit costs of production change as a consequence of energy efficiency. As such, it is an indicator for the competitiveness of an industry sector. This indicator is still a work in progress and is lacking some essential data.",
        identifier: "changeInUnitCostsOfProduction",
        yAxis: "Value in € / €"
      },
      {
        subcategory: "Economic",
        title: "Turnover of energy efficiency goods",
        description: "Typically, materials essential for energy efficiency in buildings are produced locally. As such, the turnover of energy efficiency goods is an indicator describing the benefit to this specific industry sector. The calculation is based on data from two national case studies.",
        identifier: "turnoverOfEnergyEfficiencyGoods",
        yAxis: "Value in €"
      },
      {
        subcategory: "Economic",
        title: "Change in supplier diversity by energy efficiency impact",
        description: "",
        identifier: "changeInSupplierDiversityByEnergyEfficiencyImpact",
        yAxis: "Value in €"
      },
      {
        subcategory: "Ecologic",
        title: "Primary savings by fuel",
        description: "This indicator describes the energy saved in terms of primary energy carriers with the proposed measures. The conversion processes necessary for the generation of hydrogen and synthetic fuels, electricity, and heat are taken into account. The energy mix of these conversion processes comes from past data from Eurostat and projections from PRIMES.",
        identifier: "energySaving",
        yAxis: "Value in €"
      },
      {
        subcategory: "Ecologic",
        title: "Reduction in air pollution",
        description: "This graph shows the reductions in air pollutants due to energy efficiency measures. The calculation uses coefficients originating from IIASA's GAINS model, taking into account the specific emissions of energy carriers in different sectors and subsectors.",
        identifier: "reductionOfAirPollution",
        yAxis: "Reduction in kt"
      },
      {
        subcategory: "Ecologic",
        title: "Reduction in greenhouse gas emissions",
        description: "This indicator assesses the greenhouse gas emission reductions entailed by the examined measures. As one of the central drivers for energy efficiency efforts, this indicator is central in the related discussion, supporting the narrative of energy efficiency improvements helping to tackle climate change. Building on IIASA's GAINS model, this indicator merely takes carbon dioxide emissions into account, not considering other greenhouse gases such as methane or nitrous oxide. As such, the result can be considered a conservative approximation for overall greenhouse gas emissions.",
        identifier: "reductionOfGreenHouseGasEmission",
        yAxis: "Reduction in ktCO2"
      },
      {
        subcategory: "Ecologic",
        title: "Impact on RES targets",
        description: "This indicator examines how energy efficiency can support in achieving the target share of energy originating from renewable energy sources (RES) stated in the Renewable Energy Directive (RED). By reducing the overall energy consumption, the share of renewable energy carriers is increased, assuming the energy savings mainly affect non-renewable energy sources.",
        identifier: "renewableEnergyDirectiveTargets",
        yAxis: "Change in share in %-points"
      },
      {
        subcategory: "Ecologic",
        title: "Reduction of additional capacities in grid",
        description: "",
        identifier: "reductionOfAdditionalCapacitiesInGrid",
        yAxis: "Reduction in ktoe"
      }
    ],
  },
  "monetization": {
    icon: "CurrencyEuroIcon",
    title: "Monetization",
    subtitle: "monetary values",
    measurements: []
  },
  "aggregation": {
    icon: "BanknotesIcon",
    title: "Aggregation",
    subtitle: "monetary values per year",
    measurements: []
  },
  "cba": {
    icon: "PresentationChartBarIcon",
    title: "Cost-benefit analysis",
    subtitle: "cost effectiveness",
    measurements: []
  }
};
const activeCategory = ref<string>(Object.keys(categories)[0]);
const activeMeasurement = ref<MeasurementInterface>(Object.values(categories)[0].measurements[0]);
</script>

<template>
  <div class="max-w-screen-xl mx-auto pt-5 pb-10">
    <a href="#" @click="$emit('close')" class="text-sm text-sky-700 dark:text-sky-300">zurück zu den Eingaben</a>
    <div class="rounded-3xl border border-gray-300 my-3 relative bg-white">
      <div @click="$emit('close')" class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-sky-700 dark:text-sky-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-sky-800 rounded-l-3xl min-w-[325px] self-stretch">
          <div
            class="flex items-center pl-7 pr-16 py-5 cursor-pointer"
            @click="activeCategory = key"
            :class="{
              'text-white': activeCategory !== key,
              'text-sky-900': activeCategory === key,
              'bg-white': activeCategory === key,
              'rounded-tl-3xl': activeCategory === key && i === 0,
              'rounded-bl-3xl': activeCategory === key && i === Object.keys(categories).length - 1,
            }"
            v-for="([key, category], i) in Object.entries(categories)"
            v-bind:key="`category-${key}`"
          >
            <div>
              <component :is="icons[category.icon]" class="h-5 w-5 mr-5"></component>
            </div>
            <div>
              <span class="font-bold">{{ category.title }}</span><br />
              <span>{{ category.subtitle }}</span>
            </div>
          </div>
        </div>
        <div>
          <div class="flex">
            <div class="bg-orange-600 rounded-br-3xl pl-1 border-l border-white self-start">
              <div
                class="flex items-center pl-5 pr-3 py-4 cursor-pointer text-sm rounded-bl-3xl"
                @click="activeMeasurement = measurement"
                :class="{
                  'text-white': activeMeasurement.identifier !== measurement.identifier,
                  'text-orange-800': activeMeasurement.identifier === measurement.identifier,
                  'bg-white': activeMeasurement.identifier === measurement.identifier
                }"
                v-for="measurement in categories[activeCategory].measurements"
                v-bind:key="`measurement-${measurement.identifier}`"
              >
                <span v-if="measurement.subcategory" class="italic mr-3">{{ measurement.subcategory }}</span>
                <span class="font-bold mr-8 grow whitespace-nowrap">{{ measurement.title }}</span>
                <CheckIcon v-if="activeMeasurement.identifier === measurement.identifier" class="h-5 w-5"></CheckIcon>
                <CursorArrowRaysIcon v-else class="h-5 w-5"></CursorArrowRaysIcon>
              </div>
            </div>
            <div>
              <div class="bg-sky-600 text-white mx-7 my-7 p-4 text-sm rounded-lg">
                <h3 class="font-bold mb-2">{{ activeMeasurement.title }}</h3>
                <p>{{ activeMeasurement.description }}</p>
              </div>
            </div>
          </div>
          <div class="px-10 py-5">
            <Line
              class="w-full max-w-[100%]"
              id="chart"
              :options="chartOptions"
              :data="chartData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
