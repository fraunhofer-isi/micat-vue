<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import {
  UserGroupIcon,
  XCircleIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  PresentationChartBarIcon,
  CursorArrowRaysIcon,
  CheckIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, type ChartDataset, type ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns';
import type {
  CategoriesInterface,
  MeasurementInterface,
  ResultInterface,
  ModalInjectInterface,
  CbaResultInterface,
  CbaData,
} from "@/types";
import { defaultModalInject, chartColours } from "@/defaults";
import AggregationChart from "@/components/AggregationChart.vue";
import CbaSection from "@/components/CbaSection.vue";
import { formatter, labelFormatter, scientificFormatter } from "@/helpers";
import {
  DataStructures,
  Parameters,
  SavingsInterpolation,
  NetPresentValue,
  CostBenefitRatio,
  FundingEfficiency,
  MarginalCostCurves,
  CostBenefitAnalysisFacility,
  LevelisedCosts,
  convert,
  Interpolation,
} from "@/cba.js";
import { useSessionStore } from "@/stores/session";
import router from "@/router";

const session = useSessionStore();
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale);

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
    subcategories: ["Social", "Economic", "Ecologic"],
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
        title: "Alleviation of energy poverty (2M)",
        description: "This indicator shows how energy efficiency improvement actions in the residential sector can help lift people out of energy poverty. In order to calculate it, national energy poverty gaps for affected deciles (gap between the energy expenses of the decile and the energy poverty threshold) are compared to the expected energy cost savings, taking lifetimes, subsidy rates, average rent of energy poor households, and many more parameters into account.",
        identifier: "alleviationOfEnergyPoverty2M",
        yAxis: "People lifted out of energy poverty"
      },
      {
        subcategory: "Social",
        title: "Alleviation of energy poverty (2/M)",
        description: "This indicator shows how energy efficiency improvement actions in the residential sector can help lift people out of energy poverty. In order to calculate it, national energy poverty gaps for affected deciles (gap between the energy expenses of the decile and the energy poverty threshold) are compared to the expected energy cost savings, taking lifetimes, subsidy rates, average rent of energy poor households, and many more parameters into account.",
        identifier: "alleviationOfEnergyPovertyM2",
        yAxis: "People lifted out of energy poverty"
      },
      {
        subcategory: "Social",
        title: "Health indoor climate (Asthma)",
        description: '<p class="mb-2">For now, health impacts linked to improved indoor climate are assessed by looking at the reduction in asthma cases.\n' +
          'To do so, assumptions regarding the share of renovations occurring in damp and mouldy buildings as well as the share\n' +
          'of renovations constituting medium and deep renovations. As defaults, the projected rates in PRIMES and the current\n' +
          'national prevalence of damp and mould buildings are being used. Finally, a national coefficient describing the number of\n' +
          'disability-adjusted life years lost per damp or mould building has been calculated from past data as impact factor.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_IC.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/micat-project-wAssets/docs/publications/factsheets/Social-impact-Avoided-burden-of-Asthma.pdf">PDF</a>.</p>',
        identifier: "reductionInDisabilityAdjustedLifeYears",
        yAxis: "Reduction in disability adjusted life years"
      },
      {
        subcategory: "Social",
        title: "Indoor health II",
        description: "More information will follow shortly.",
        identifier: "avoidedExcessColdWeatherMortality",
        yAxis: "Avoided excess cold weather mortality"
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
        description: '<p class="mb-2">This indicator relies on the <a class="font-bold" target="_blank" href="https://en.wikipedia.org/wiki/Herfindahl%E2%80%93Hirschman_index">Herfindahl-Hirschman index</a>,\n' +
          'a measure of market concentration. Since PRIMES does not provide any projections for the future supplier landscape of\n' +
          'fossil fuels, current Eurostat values since the invasion of Ukraine are used for the calculation of ex-ante results,\n' +
          'whereas past Eurostat figures are used for ex-post examination. Furthermore, the assumption is that energy savings\n' +
          'result in a lower import from the largest supplier.</p><p>More details on the methodology are shown on the related <a class="font-bold" target="_blank" href="https://doc.micatool.eu/economic_indicators/supplier_diversity.html">equations page</a> and the <a class="font-bold" target="_blank" href="https://micatool.eu/micat-project-wAssets/docs/publications/factsheets/Economic-impacts-Aggregated-energy-security-supply-diversity.pdf">fact sheet</a>.</p>',
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
        description: "More information will follow shortly.",
        identifier: "reductionOfAdditionalCapacitiesInGrid",
        yAxis: "Reduction in ktoe"
      }
    ],
  },
  "monetization": {
    icon: "CurrencyEuroIcon",
    title: "Monetization",
    subtitle: "monetary values",
    subcategories: [],
    measurements: [
      {
        title: "Reduction of energy costs",
        description: "This indicator describes the reduction in energy costs for end users to be expected from energy saving measures. It is calculated from final energy savings, differentiating between energy carriers and sectors, taking lower taxes and rates for commerce and industry into account. In case the energy mix has not been specified in the measure specific parameters, it is calculated from Eurostat and PRIMES data, accounting for the higher prevalence of certain energy carriers in specific improvement actions.",
        identifier: "reductionOfEnergyCost",
        yAxis: "Savings in M€"
      },
      {
        title: "Premature deaths due to air pollution",
        description: "This graph shows the monetary impacts of air pollution by attributing cases of premature deaths with statistical costs. As basis for the monetisation, the World Health Organisation's figures for country-specific Value of Statistical Life (VSL) are used.",
        identifier: "reductionOfMortalityMorbidityMonetization",
        yAxis: "Value in M€"
      },
      {
        title: "Avoided lost working days due to air pollution",
        description: "Lost working days can be considered a proxy to examine cases of morbidity (although excluding certain groups, such as children, unemployed, etc.). This indicator shows the reduction of lost working days linked to air pollution. Based on IIASA's GAINS model, it takes air pollution data and societal aspects, such as employment and national health levels, into account.",
        identifier: "reductionOfLostWorkDaysMonetization",
        yAxis: "Value in M€"
      },
      {
        title: "Reduction of greenhouse gas emissions",
        description: "This graph displays the monetary benefits associated with reduced greenhouse gas emissions. The costs of greenhouse gas emissions can be monetised in several ways, inter alia with the costs of carbon in carbon certificate schemes such as the EU Emission Trading System (ETS), the cost of removal or the cost of avoidance for future generations. The MICATool uses societal costs of carbon as a calculation basis, which are calculated in line with common evaluation methodologies by the German Federal Environmental Agency.",
        identifier: "reductionOfGreenHouseGasEmissionMonetization",
        yAxis: "Value in M€"
      },
      {
        title: "Impact on RES targets",
        description: "This indicator examines how energy efficiency can support in achieving the target share of energy originating from renewable energy sources (RES) stated in the Renewable Energy Directive (RED). By reducing the overall energy consumption, the share of renewable energy carriers is increased, assuming the energy savings mainly affect non-renewable energy sources.",
        identifier: "impactOnResTargetsMonetization",
        yAxis: "Value in M€"
      },
      {
        title: "Reduction of additional capacities",
        description: "As a consequence of energy efficiency measures, fewer new supply-side capacities need to be installed. Assuming that new capacities would alternatively be renewable energies, this indicator assesses the avoided generation capacity.",
        identifier: "reductionOfAdditionalCapacitiesInGridMonetization",
        yAxis: "Value in M€"
      },
      {
        title: "Health indoor climate (Asthma)",
        description: '<p class="mb-2">For now, health impacts linked to improved indoor climate are assessed by looking at the reduction in asthma cases.\n' +
          'To do so, assumptions regarding the share of renovations occurring in damp and mouldy buildings as well as the share\n' +
          'of renovations constituting medium and deep renovations. As defaults, the projected rates in PRIMES and the current\n' +
          'national prevalence of damp and mould buildings are being used. Finally, a national coefficient describing the number of\n' +
          'disability-adjusted life years lost per damp or mould building has been calculated from past data as impact factor.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_IC.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/micat-project-wAssets/docs/publications/factsheets/Social-impact-Avoided-burden-of-Asthma.pdf">PDF</a>.</p>',
        identifier: "reductionInDisabilityAdjustedLifeYearsMonetization",
        yAxis: "Value in M€"
      },
      {
        title: "Indoor health II",
        description: "More information will follow shortly.",
        identifier: "avoidedExcessColdWeatherMortalityMonetization",
        yAxis: "Value in M€"
      }
    ]
  },
  "aggregation": {
    icon: "BanknotesIcon",
    title: "Aggregation",
    subtitle: "monetary values per year",
    subcategories: [],
    measurements: []
  },
  "cba": {
    icon: "PresentationChartBarIcon",
    title: "Cost-benefit analysis",
    subtitle: "cost effectiveness",
    subcategories: [],
    measurements: []
  }
};
const cbaResults: Array<CbaResultInterface> = [
  {
    title: "Cost benefit analysis facility",
    slug: "costBenefitAnalysisFacility",
  },
  {
    title: "Net present value",
    slug: "netPresentValue",
  },
  {
    title: "Cost benefit ratio",
    slug: "costBenefitRatio",
  },
  {
    title: "Levelised costs",
    slug: "levelisedCosts",
  },
  {
    title: "Funding efficiency",
    slug: "fundingEfficiency",
  },
  {
    title: "Marginal cost curves",
    slug: "marginalCostCurves",
  },
];

// Refs
const activeCategory = ref<string>(Object.keys(categories)[0]);
const activeSubcategory = ref<string>(Object.values(categories)[0].subcategories[0]);
const activeMeasurement = ref<MeasurementInterface>(Object.values(categories)[0].measurements[0]);
const activeIndicators = ref<Array<string>>(categories.monetization.measurements.concat(categories.quantification.measurements.filter(m => m.identifier === 'reductionOfAirPollution')).map(measurement => measurement.identifier));
const indicatorInfo = ref<string>('');
const energyPriceSensitivity = ref<number>(100);
const investmentsSensitivity = ref<number>(100);
const discountRate = ref<number>(3);
const cbaYear = ref<string>(session.years[0].toString());
const activeCbaResult = ref<string>(cbaResults[0].slug);

// Computed
const data = computed<ResultInterface>(() => {
  return activeMeasurement.value ? JSON.parse(JSON.stringify(session.results[activeMeasurement.value.identifier])) : {};
});
const hasMultipleMeasures = computed(() => data.value.idColumnNames.indexOf('id_measure') > -1);
const chartLabels = computed(() => {
  // Get labels
  const labels: Array<string> = [];
  if (activeMeasurement.value) {
    const identifiers = data.value.idColumnNames.filter(identifier => identifier !== 'id_measure');
    if (identifiers.length > 0) {
      data.value.rows.forEach(row => {
        if (!hasMultipleMeasures.value || row[0] === 1) labels.push(row[hasMultipleMeasures.value ? 1: 0]);
      });
    }
    if (hasMultipleMeasures.value && labels.length === 0) labels.push('id_measure');
  }
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
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';

            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y < 1 && context.parsed.y >= 0 ? scientificFormatter.format(context.parsed.y) : labelFormatter.format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Years'
        },
        type: 'time',
        time: {
            unit: 'year'
        }
      },
      y: {
        ticks: {
          callback: (label: number | string) => typeof label === "number" ? label < 1 && label >= 0 ? scientificFormatter.format(label) : formatter.format(label) : label,
        },
        title: {
          display: true,
          text: activeMeasurement.value ? activeMeasurement.value.yAxis : ""
        }
      }
    }
  };
})
const chartData = computed(() => {
  const datasets: ChartDataset[] = [];
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
});
const interpolatedSavingsData = computed(() => {
  return SavingsInterpolation.annualSavingsInterpolation(session.payload);
});
const interpolatedYears = computed(() => {
  return Parameters.yearsFromSavingsData(interpolatedSavingsData.value);
});
const cbaData = computed(() => {
  const indicators: {[key: string]: boolean} = {};
  for (const measurement of categories['monetization'].measurements.concat(categories['quantification'].measurements.filter(m => m.identifier === "reductionOfAirPollution"))) {
    indicators[measurement.identifier] = activeIndicators.value.indexOf(measurement.identifier) > -1;
  }

  const userOptions = {
    'parameters': {
      'energyPriceSensivity': energyPriceSensitivity.value,
      'investmentsSensivity': investmentsSensitivity.value,
      'discountRate': discountRate.value,
      'year': cbaYear.value,
    },
    indicators
  }
  const results: CbaData = DataStructures.prepareResultDataStructure();
  const indicatorData = convert(session.results);
  results.supportingYears = session.years;
  results.years = interpolatedYears.value;

  for (const measure of interpolatedSavingsData.value.measures) {
    const measureSpecificResults = DataStructures.prepareMeasureSpecificResultsDataStructure(measure.id);
    const measureSpecificParameters = Parameters.measureSpecificParameters(
      measure,
      indicatorData,
      userOptions
    );
    measureSpecificParameters.subsidyRate = Interpolation.annualLinearInterpolation(measureSpecificParameters.subsidyRate);

    for (const year of results.years) {
      const annualMeasureSpecificParameters =
        Parameters.annualMeasureSpecificParameters(year, measure);
      // Do not change the calculation order, because a calculation depends on the results of the previous one(s)!
      CostBenefitAnalysisFacility.calculateCostBenefitAnalysisFacility(
        measureSpecificParameters,
        annualMeasureSpecificParameters,
        measureSpecificResults,
        userOptions
      );
      NetPresentValue.calculateNetPresentValue(
        measureSpecificParameters,
        annualMeasureSpecificParameters,
        measureSpecificResults,
        userOptions
      );
      CostBenefitRatio.calculateCostBenefitRatio(
        measureSpecificParameters,
        annualMeasureSpecificParameters,
        measureSpecificResults,
        userOptions
      );
      LevelisedCosts.calculateLevelisedCosts(
        measureSpecificParameters,
        annualMeasureSpecificParameters,
        measureSpecificResults,
        userOptions
      );
      FundingEfficiency.calculateFundingEfficiency(
        measureSpecificParameters,
        annualMeasureSpecificParameters,
        measureSpecificResults,
        userOptions
      );
      MarginalCostCurves.calculateMarginalCostCurves(
        measureSpecificParameters,
        annualMeasureSpecificParameters,
        measureSpecificResults,
        userOptions
      );
    }

    DataStructures.appendMeasureSpecificResults(
      measureSpecificResults,
      results
    );
  }
  return results;
});

// Functions
const selectCategory = (category: string) => {
  activeCategory.value = category;
  activeMeasurement.value = categories[activeCategory.value].measurements.filter(measurement => !measurement.subcategory || measurement.subcategory === activeSubcategory.value)[0];
};
const selectSubcategory = (subcategory: string) => {
  activeSubcategory.value = subcategory;
  activeMeasurement.value = categories[activeCategory.value].measurements.filter(measurement => !measurement.subcategory || measurement.subcategory === activeSubcategory.value)[0];
};
const toggleIndicator = (identifier: string) => {
  const index = activeIndicators.value.indexOf(identifier);
  if (index === -1) {
    activeIndicators.value.push(identifier);
  } else {
    activeIndicators.value.splice(index, 1);
  }
}
const selectCbaResult = (slug: string) => {
  activeCbaResult.value = slug;
}
const exportResults = () => {
  fetch(`${import.meta.env.VITE_API_URL}export-results`, {
    method: "POST",
    body: JSON.stringify({
      results: session.results,
      categories,
      cbaData: cbaData.value,
      years: session.years,
      programs: session.programs,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(res => res.blob()).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'MICAT_results.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    // window.location.assign(url);
  });
};

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject
</script>

<template>
  <div class="max-w-screen-xl pt-5 pb-10 mx-auto">
    <div class="flex justify-between">
      <a href="#" @click="router.push({ name: 'home' });" class="text-sm text-sky-700 dark:text-sky-300">back to the entries</a>
      <button
        class="py-2 pl-3 pr-4 mr-8 text-xs font-bold text-white uppercase bg-orange-400 rounded-full hover:bg-orange-500 dark:bg-sky-600 dark:hover:bg-sky-700"
        @click="exportResults()"
      >
        <ArrowDownTrayIcon class="h-5 w-5 mt-[-3px] inline text-white"></ArrowDownTrayIcon>
        Export
      </button>
    </div>
    <div class="relative my-3 bg-white border border-gray-300 rounded-3xl">
      <div @click="router.push({ name: 'home' });" class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-sky-700 dark:text-sky-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-sky-800 rounded-l-3xl min-w-[325px] self-stretch">
          <div
            class="flex items-center cursor-pointer pl-7"
            @click="selectCategory(key)"
            :class="{
              'text-white': activeCategory !== key,
              'text-sky-900': activeCategory === key,
              'bg-white': activeCategory === key,
              'hover:text-sky-700': activeCategory === key,
              'hover:bg-sky-900': activeCategory !== key,
              'rounded-tl-3xl': activeCategory === key && i === 0,
              'rounded-bl-3xl': activeCategory === key && i === Object.keys(categories).length - 1,
              'pr-16': !category.subcategories,
            }"
            v-for="([key, category], i) in Object.entries(categories)"
            v-bind:key="`category-${key}`"
          >
            <div>
              <component :is="icons[category.icon]" class="w-5 h-5 mr-5"></component>
            </div>
            <div class="py-5 grow">
              <span class="font-bold">{{ category.title }}</span><br />
              <span>{{ category.subtitle }}</span>
            </div>
            <div v-if="category.subcategories">
              <div
                v-for="(subcategory, i) in category.subcategories"
                v-bind:key="`subcategory-${key}-${i}`"
                class="px-4 py-2 text-sm font-bold"
                :class="{
                  'text-white': activeSubcategory !== subcategory,
                  'text-sky-700': activeSubcategory === subcategory,
                  'bg-gradient-to-r from-sky-600 to-sky-700 hover:bg-gradient-to-r hover:from-sky-600 hover:to-sky-700': activeSubcategory !== subcategory,
                  'bg-white hover:bg-sky-100': activeSubcategory === subcategory,
                  'rounded-tl-2xl': i === 0,
                  'rounded-bl-2xl': i === category.subcategories.length - 1,
                }"
                @click="selectSubcategory(subcategory)"
              >
                {{ subcategory }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="['quantification', 'monetization'].indexOf(activeCategory) > -1">
          <div class="flex">
            <div class="self-start pl-1 bg-orange-600 border-l border-white rounded-br-3xl">
              <div
                class="flex items-center py-4 pl-5 pr-3 text-sm cursor-pointer rounded-bl-3xl"
                @click="activeMeasurement = measurement"
                :class="{
                  'text-white': activeMeasurement.identifier !== measurement.identifier,
                  'text-orange-800': activeMeasurement.identifier === measurement.identifier,
                  'bg-white': activeMeasurement.identifier === measurement.identifier,
                  'hover:text-orange-700': activeMeasurement.identifier === measurement.identifier,
                  'hover:bg-orange-700': activeMeasurement.identifier !== measurement.identifier,
                  'hover:rounded-br-3xl': activeMeasurement.identifier !== measurement.identifier
                }"
                v-for="measurement in categories[activeCategory].measurements.filter(measurement => !measurement.subcategory || measurement.subcategory === activeSubcategory)"
                v-bind:key="`measurement-${measurement.identifier}`"
              >
                <span class="mr-8 font-bold grow whitespace-nowrap">{{ measurement.title }}</span>
                <CheckIcon v-if="activeMeasurement.identifier === measurement.identifier" class="w-5 h-5"></CheckIcon>
                <CursorArrowRaysIcon v-else class="w-5 h-5"></CursorArrowRaysIcon>
              </div>
            </div>
            <div>
              <div class="p-4 text-white rounded-lg bg-sky-600 mx-7 my-7">
                <h3 class="mb-2 font-bold text-md">{{ activeMeasurement.title }}</h3>
                <div class="text-sm text-sky-200" v-html="activeMeasurement.description"></div>
              </div>
            </div>
          </div>
          <div class="px-10 py-5">
            <!-- @vue-ignore -->
            <Line
              class="w-full max-w-[100%]"
              id="chart"
              :options="(chartOptions as any)"
              :data="(chartData as ChartData<'line'>)"
            />
          </div>
        </div>
        <div v-else-if="activeCategory === 'aggregation'" class="w-full max-w-full p-7">
          <AggregationChart :categories="categories"></AggregationChart>
        </div>
        <div v-if="activeCategory === 'cba'" class="w-full">
          <div class="flex w-full">
            <div class="self-start pl-2 border-l border-white bg-sky-600 rounded-br-3xl">
              <h3 class="p-2 font-bold bg-white text-sky-600">Indicators</h3>
              <div
                class="flex items-center py-4 pl-5 pr-3 text-sm cursor-pointer"
                @click="toggleIndicator(measurement.identifier)"
                @mouseover="indicatorInfo = measurement.description;"
                @mouseleave="indicatorInfo = '';"
                :class="{
                  'text-white': activeIndicators.indexOf(measurement.identifier) === -1,
                  'text-sky-800': activeIndicators.indexOf(measurement.identifier) > -1,
                  'bg-sky-100': activeIndicators.indexOf(measurement.identifier) > -1,
                  'hover:text-sky-600': activeIndicators.indexOf(measurement.identifier) > -1,
                  'hover:bg-sky-700': activeIndicators.indexOf(measurement.identifier) === -1,
                  'rounded-br-3xl': i === categories['monetization'].measurements.length || activeIndicators.indexOf(measurement.identifier) === -1
                }"
                v-for="(measurement, i) in categories['monetization'].measurements.concat(categories['quantification'].measurements.filter(m => m.identifier === 'reductionOfAirPollution'))"
                v-bind:key="`measurement-cba-${measurement.identifier}`"
              >
                <span class="mr-8 font-bold grow whitespace-nowrap">{{ measurement.title }}</span>
                <CheckIcon v-if="activeIndicators.indexOf(measurement.identifier) > -1" class="w-5 h-5"></CheckIcon>
                <CursorArrowRaysIcon v-else class="w-5 h-5"></CursorArrowRaysIcon>
              </div>
            </div>
            <div class="grow">
              <div class="p-4 text-sm text-white bg-orange-600 rounded-lg mx-7 my-7">
                <h3 class="mb-2 font-bold">Parameters</h3>
                <div class="flex gap-5 mt-2">
                  <div>
                    <label for="energy-price-sensitivity" class="text-sm dark:text-white">Energy price sensitivity</label>
                    <InformationCircleIcon
                      @click="openModal('energy-price-sensitivity')"
                      class="inline w-6 h-6 ml-2 cursor-pointer"
                    ></InformationCircleIcon>
                  </div>
                  <div class="grow">
                    <input
                      type="range"
                      class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                      min="50"
                      max="200"
                      step="1"
                      v-model="energyPriceSensitivity"
                      id="energy-price-sensitivity"
                    />
                  </div>
                  <div>
                    <div class="text-sm text-orange-300">{{ energyPriceSensitivity }} %</div>
                  </div>
                </div>
                <div class="flex gap-5 mt-2">
                  <div>
                    <label for="investments-sensitivity" class="text-sm dark:text-white">Investments sensitivity</label>
                    <InformationCircleIcon
                      @click="openModal('investments-sensitivity')"
                      class="inline w-6 h-6 ml-2 cursor-pointer"
                    ></InformationCircleIcon>
                  </div>
                  <div class="grow">
                    <input
                      type="range"
                      class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                      min="50"
                      max="200"
                      step="1"
                      v-model="investmentsSensitivity"
                      id="investments-sensitivity"
                    />
                  </div>
                  <div>
                    <div class="text-sm text-orange-300">{{ investmentsSensitivity }} %</div>
                  </div>
                </div>
                <div class="flex gap-5 mt-2">
                  <div>
                    <label for="discount-rate" class="text-sm dark:text-white">Discount rate</label>
                    <InformationCircleIcon
                      @click="openModal('discount-rate')"
                      class="inline w-6 h-6 ml-2 cursor-pointer"
                    ></InformationCircleIcon>
                  </div>
                  <div class="grow">
                    <input
                      type="range"
                      class="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                      min="0"
                      max="20"
                      step="1"
                      v-model="discountRate"
                      id="discount-rate"
                    />
                  </div>
                  <div>
                    <div class="text-sm text-orange-300">{{ discountRate }} %</div>
                  </div>
                </div>
              </div>
              <div
                v-html="indicatorInfo"
                class="p-4 text-sm text-white rounded-lg bg-sky-600 mx-7 my-7"
                :class="{
                  'hidden': !indicatorInfo,
                }"
              ></div>
            </div>
          </div>
          <div class="px-10 py-5">
            <div class="relative my-3 bg-white border border-gray-300 rounded-3xl">
              <div class="flex">
                <div
                  class="bg-orange-700 rounded-l-3xl self-stretch text-white min-w-[235px]"
                >
                  <div
                    class="px-4 py-2 text-sm font-bold cursor-pointer"
                    :class="{
                      'rounded-tl-3xl': iC === 0,
                      'bg-opacity-5': iC === 0 && activeCbaResult !== result.slug,
                      'bg-opacity-10': iC === 1 && activeCbaResult !== result.slug,
                      'bg-opacity-20': iC === 2 && activeCbaResult !== result.slug,
                      'bg-opacity-25': iC === 3 && activeCbaResult !== result.slug,
                      'bg-opacity-30': iC === 4 && activeCbaResult !== result.slug,
                      'bg-opacity-40': iC === 5 && activeCbaResult !== result.slug,
                      'bg-opacity-50': iC === 6 && activeCbaResult !== result.slug,
                      'bg-opacity-60': iC === 7 && activeCbaResult !== result.slug,
                      'text-orange-700': activeCbaResult === result.slug,
                      'bg-white': activeCbaResult === result.slug,
                      'bg-orange-300': activeCbaResult !== result.slug,
                    }"
                    v-for="(result, iC) in cbaResults"
                    v-bind:key="`cba-${result.slug}`"
                    @click="selectCbaResult(result.slug)"
                  >
                    {{ result.title }}
                  </div>
                </div>
                <div class="p-5 grow">
                  <div class="flex items-center gap-5 mb-6" v-if="activeCbaResult === 'marginalCostCurves'">
                    <div>
                      <label for="cba-year" class="text-sm dark:text-white">Year</label>
                      <InformationCircleIcon
                        @click="openModal('cba-year')"
                        class="inline w-6 h-6 ml-2 cursor-pointer"
                      ></InformationCircleIcon>
                    </div>
                    <div class="grow">
                      <select
                        id="cba-year"
                        class="py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-white appearance-none focus:outline-none focus:ring-0 focus:border-gray-200 max-w-[100px]"
                        v-model="cbaYear"
                      >
                        <option
                          v-for="year in interpolatedYears" v-bind:key="year" :value="year"
                          :selected="year == cbaYear"
                        >
                          {{ year }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <CbaSection
                    :activeCbaResult="activeCbaResult"
                    :data="cbaData"
                    :year="cbaYear"
                  ></CbaSection>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
