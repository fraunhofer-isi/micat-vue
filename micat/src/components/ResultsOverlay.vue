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
} from '@heroicons/vue/24/outline';
import { Bar, Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import type {
  CategoriesInterface,
  MeasurementInterface,
  ResultInterface,
  DatasetInterface,
  ModalInjectInterface,
  CbaResultInterface,
  CbaData,
} from "@/types";
import { defaultModalInject, chartColours } from "@/defaults";
import CbaSection from "@/components/CbaSection.vue";
import { formatter } from "@/helpers";
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

const session = useSessionStore();
const props = defineProps(['results', 'years', 'factor']);
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const chartColoursAggregation: Array<string> = [
  "rgb(68,178,47)",
  "rgb(162,243,149)",
  "rgb(16,94,0)",
  "rgb(150,178,47)",
  "rgb(200,217,136)",
  "rgb(110,138,8)",
  "rgb(72,89,9)",
];
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
        title: "Energy poverty",
        description: "This indicator shows how energy efficiency improvement actions in the residential sector can help lift people out of energy poverty. In order to calculate it, national energy poverty gaps for affected deciles (gap between the energy expenses of the decile and the energy poverty threshold) are compared to the expected energy cost savings, taking lifetimes, subsidy rates, average rent of energy poor households, and many more parameters into account.",
        identifier: "reductionOfEnergyPoverty",
        yAxis: "People lifted out of energy poverty"
      },
      {
        subcategory: "Social",
        title: "Health indoor climate (Asthma)",
        description: "",
        identifier: "reductionInDisabilityAdjustedLifeYears",
        yAxis: "Reduction in disability adjusted life years"
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
        title: "Reduction in disability adjusted life years",
        description: "",
        identifier: "reductionInDisabilityAdjustedLifeYearsMonetization",
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
const energyPriceSensitivity = ref<number>(100);
const investmentsSensitivity = ref<number>(100);
const discountRate = ref<number>(3);
const cbaYear = ref<string>(props.years[0].toString());
const activeCbaResult = ref<string>(cbaResults[0].slug);

// Variables
const aggregationChartOptions: any = {
  plugins: {
    title: {
      display: false,
      text: 'MICAT - Aggregation'
    },
  },
  responsive: true,
  interaction: {
    intersect: false,
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
        callback: (label: number | string) => typeof label === "number" ? formatter.format(label) : label,
      },
    }
  }
};

// Computed
const aggregationChartData: any = computed(() => {
  const datasets: Array<DatasetInterface> = [];
  let measurements = categories.monetization.measurements
  measurements = measurements.concat(categories.quantification.measurements.filter(measurement => measurement.identifier === "impactOnGrossDomesticProduct"));
  measurements.forEach((measurement, i) => {
    const aggregationData: ResultInterface = JSON.parse(JSON.stringify(props.results[measurement.identifier]));
    if (measurement.identifier === 'reductionOfEnergyCost') {
      aggregationData.rows.filter(row => row[0] === 1).map(row => row[1]).forEach((label, iL) => {
        const values = new Array(props.years.length).fill(0);
        aggregationData.rows.filter(row => row[1] === label).forEach(row => {
          row.splice(0, 2);
          row.forEach((measure, iM) => {
            // Sum up measurements
            values[iM] += measure;
          });
        });
        datasets.push({
          label: label,
          data: values,
          borderColor: chartColoursAggregation[iL],
          backgroundColor: chartColoursAggregation[iL],
          stack: `stack-reductionOfEnergyCost`,
        });
      });
    } else {
      const values = new Array(props.years.length).fill(0);
      aggregationData.rows.forEach(row => {
        row.splice(0, 1);
        row.forEach((measure, iM) => {
          // Sum up measurements
          values[iM] += measure;
        });
      });
      datasets.push({
        label: measurement.title,
        data: values,
        borderColor: chartColours[i],
        backgroundColor: chartColours[i],
        stack: `stack-${i}`,
      });
    }
  });
  return {
    labels: props.years,
    datasets,
  }
});
const data = computed<ResultInterface>(() => {
  return activeMeasurement.value ? JSON.parse(JSON.stringify(props.results[activeMeasurement.value.identifier])) : {};
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
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Years'
        }
      },
      y: {
        ticks: {
          callback: (label: number | string) => typeof label === "number" ? formatter.format(label) : label,
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
  const indicatorData = convert(props.results);
  results.supportingYears = props.years;
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

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject
</script>

<template>
  <div class="max-w-screen-xl mx-auto pt-5 pb-10">
    <a href="#" @click="$emit('close')" class="text-sm text-sky-700 dark:text-sky-300">back to the entries</a>
    <div class="rounded-3xl border border-gray-300 my-3 relative bg-white">
      <div @click="$emit('close')" class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-sky-700 dark:text-sky-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-sky-800 rounded-l-3xl min-w-[325px] self-stretch">
          <div
            class="flex items-center pl-7 cursor-pointer"
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
              <component :is="icons[category.icon]" class="h-5 w-5 mr-5"></component>
            </div>
            <div class="py-5 grow">
              <span class="font-bold">{{ category.title }}</span><br />
              <span>{{ category.subtitle }}</span>
            </div>
            <div v-if="category.subcategories">
              <div
                v-for="(subcategory, i) in category.subcategories"
                v-bind:key="`subcategory-${key}-${i}`"
                class="py-2 px-4 text-sm font-bold"
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
            <div class="bg-orange-600 rounded-br-3xl pl-1 border-l border-white self-start">
              <div
                class="flex items-center pl-5 pr-3 py-4 cursor-pointer text-sm rounded-bl-3xl"
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
            <!-- @vue-ignore -->
            <Line
              class="w-full max-w-[100%]"
              id="chart"
              :options="chartOptions"
              :data="chartData"
            />
          </div>
        </div>
        <div v-else-if="activeCategory === 'aggregation'" class="w-full max-w-full p-7">
          <Bar
            id="chart-aggregation"
            :options="aggregationChartOptions"
            :data="aggregationChartData"
          />
        </div>
        <div v-if="activeCategory === 'cba'" class="w-full">
          <div class="flex w-full">
            <div class="bg-sky-600 rounded-br-3xl pl-2 border-l border-white self-start">
              <h3 class="bg-white font-bold p-2 text-sky-600">Indicators</h3>
              <div
                class="flex items-center pl-5 pr-3 py-4 cursor-pointer text-sm"
                @click="toggleIndicator(measurement.identifier)"
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
                <span class="font-bold mr-8 grow whitespace-nowrap">{{ measurement.title }}</span>
                <CheckIcon v-if="activeIndicators.indexOf(measurement.identifier) > -1" class="h-5 w-5"></CheckIcon>
                <CursorArrowRaysIcon v-else class="h-5 w-5"></CursorArrowRaysIcon>
              </div>
            </div>
            <div class="grow">
              <div class="bg-orange-600 text-white mx-7 my-7 p-4 text-sm rounded-lg">
                <h3 class="font-bold mb-2">Parameters</h3>
                <div class="flex mt-2 gap-5">
                  <div>
                    <label for="energy-price-sensitivity" class="dark:text-white text-sm">Energy price sensitivity</label>
                    <InformationCircleIcon
                      @click="openModal('energy-price-sensitivity')"
                      class="h-6 w-6 ml-2 cursor-pointer inline"
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
                    <div class="text-sm text-orange-300">{{ energyPriceSensitivity }}%</div>
                  </div>
                </div>
                <div class="flex mt-2 gap-5">
                  <div>
                    <label for="investments-sensitivity" class="dark:text-white text-sm">Investments sensitivity</label>
                    <InformationCircleIcon
                      @click="openModal('investments-sensitivity')"
                      class="h-6 w-6 ml-2 cursor-pointer inline"
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
                    <div class="text-sm text-orange-300">{{ investmentsSensitivity }}%</div>
                  </div>
                </div>
                <div class="flex mt-2 gap-5">
                  <div>
                    <label for="discount-rate" class="dark:text-white text-sm">Discount rate</label>
                    <InformationCircleIcon
                      @click="openModal('discount-rate')"
                      class="h-6 w-6 ml-2 cursor-pointer inline"
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
                    <div class="text-sm text-orange-300">{{ discountRate }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-10 py-5">
            <div class="rounded-3xl border border-gray-300 my-3 relative bg-white">
              <div class="flex">
                <div
                  class="bg-orange-700 rounded-l-3xl self-stretch text-white min-w-[235px]"
                >
                  <div
                    class="py-2 px-4 text-sm font-bold cursor-pointer"
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
                <div class="grow p-5">
                  <div class="flex gap-5 items-center mb-6" v-if="activeCbaResult === 'marginalCostCurves'">
                    <div>
                      <label for="cba-year" class="dark:text-white text-sm">Year</label>
                      <InformationCircleIcon
                        @click="openModal('cba-year')"
                        class="h-6 w-6 ml-2 cursor-pointer inline"
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
