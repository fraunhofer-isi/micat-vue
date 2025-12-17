<!--
© 2024 - 2025 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue';
import { computedAsync } from '@vueuse/core'
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
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, type ChartDataset } from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels, { type Context } from 'chartjs-plugin-datalabels';
import type {
  CategoriesInterface,
  MeasurementInterface,
  ResultInterface,
  ModalInjectInterface,
  CbaResultInterface,
  ParameterCategory,
  CbaData,
} from "@/types";
import { defaultModalInject, chartColours, units } from "@/defaults";
import AggregationChart from "@/components/AggregationChart.vue";
import { formatter, labelFormatter, labelFormatterSmall, restructureParameters } from "@/helpers";
import {
  Parameters,
  SavingsInterpolation,
} from "@/cba.js";
import { useSessionStore } from "@/stores/session";
import router from "@/router";

const session = useSessionStore();
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, ChartDataLabels);

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
    subtitle: "Physical values",
    subcategories: ["Social", "Economic", "Environmental"],
    measurements: [
      {
        subcategory: "Social",
        title: "Health effects linked to reduced air pollution",
        description: '<p class="mb-2"> This indicator assesses the number of avoided premature death cases and hospitalisations thanks to energy efficiency measures and the resulting decline in air pollution levels. It is based on IIASA\'s GAINS model, taking air pollution reductions, national health data, and other factors into account. </p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_AP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfMortalityMorbidity",
        yAxis: "Reduction in casualties"
      },
      {
        subcategory: "Social",
        title: "Avoided lost working days due to air pollution",
        description: '<p class="mb-2"> This indicator assesses the number of prevented lost working days due to health benefits of energy efficiency measures and a resulting decline in air pollution levels. It is based on IIASA\'s GAINS model, taking air pollution reductions, national health data, and other factors into account. </p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/lost_work_days.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfLostWorkDays",
        yAxis: "Avoided absences in days"
      },
      {
        subcategory: "Social",
        title: "Alleviation of energy poverty (M/2)",
        description: '<p class="mb-2"> This indicator shows how energy efficiency improvement actions in the residential sector can help lift people out of energy poverty according to the M/2 metric. M/2 defines households whose energy expenditure is below half the national median value as energy poor, assuming an inability to spend more due to financial constraints. To calculate the impact, disaggregated national energy poverty gap values (i.e., the differences between the average energy expenses of energy poor households grouped in deciles and the energy poverty threshold) are com-pared to the expected energy cost savings, taking lifetimes, subsidy rates, average rent of energy poor households, and other parameters into account. To account for the fact that low energy expenditure can also reflect a high level of energy efficiency in a dwelling, the gaps are calculated only for households in the lower five income deciles. </p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/energy_poverty.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Alleviation-of-energy-poverty.pdf">PDF</a>.</p>',
        identifier: "alleviationOfEnergyPoverty2M",
        yAxis: "People lifted out of energy poverty"
      },
      {
        subcategory: "Social",
        title: "Alleviation of energy poverty (2M)",
        description: '<p class="mb-2"> This indicator shows how energy efficiency improvement actions in the residential sector can help lift people out of energy poverty according to the 2M metric. 2M defines households as energy poor, whose share of energy expenditure in in-come is more than twice the national median value, assuming a very bad build-ing quality requiring excessive heating. To calculate the impact, disaggregated national energy poverty gap values (i.e., the differences between the average energy expenses of energy poor households grouped in deciles and the needed amount to lower the share in income below the energy poverty threshold) are compared to the expected energy cost savings, taking lifetimes, subsidy rates, aver-age rent of energy poor households, and other parameters into account. </p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/energy_poverty.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Alleviation-of-energy-poverty.pdf">PDF</a>.</p>',
        identifier: "alleviationOfEnergyPovertyM2",
        yAxis: "People lifted out of energy poverty"
      },
      {
        subcategory: "Social",
        title: "Avoided asthma cases",
        description: '<p class="mb-2">Inter alia, health impacts linked to improved indoor climate are assessed by looking at the reduction in asthma cases. To do so, assumptions regarding the share of renovations occurring in damp and mouldy buildings as well as the share of renovations constituting medium and deep renovations are made. As defaults, the projected rates in PRIMES and the current national prevalence of damp and mould buildings are being used. Finally, a national coefficient describing the number of disability-adjusted life years lost per damp or mould building has been calculated from past data as impact factor.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_IC.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Avoided-burden-of-Asthma.pdf">PDF</a>.</p>',
        identifier: "reductionInDisabilityAdjustedLifeYears",
        yAxis: "Reduction in disability adjusted life years"
      },
      {
        subcategory: "Social",
        title: "Reduction in excess cold weather mortality",
        description: '<p class="mb-2">Energy efficiency improvements in the residential sector can tackle the issue of excess cold weather mortality, which occurs when indoor temperature is below adequate levels. This phenomenon is often linked to inferior building states and residents\' financial inability to heat their dwelling adequately. The calculation is inter alia based on the national prevalence of excess cold weather mortality, the measure\'s focus on the relevant energy poor target group, and the depth of the implemented renovations.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_IC.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Reduced-or-avoided-excess-cold-weather-mortality-due-to-energy-efficiency-improvements-in-the-residential-building-sector.pdf">PDF</a>.</p>',
        identifier: "avoidedExcessColdWeatherMortality",
        yAxis: "Reduction in casualties"
      },
      {
        subcategory: "Economic",
        title: "Impact on energy intensity",
        description: '<p class="mb-2">Energy intensity describes the amount of energy necessary to generate a unit of gross domestic product (GDP) in an economy. This graph shows the effect energy efficiency has in reducing it. It is calculated by dividing gross available energy by GDP. The scenario with measures is compared to a scenario without measures populated with past data from Eurostat (ex-post) and projections from PRIMES (ex-ante).</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/energy_intensity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Energy-Intensity.pdf">PDF</a>.</p>',
        identifier: "energyIntensity",
        yAxis: "Change in ktoe / M€"
      },
      {
        subcategory: "Economic",
        title: "Impact on import dependence",
        description: '<p class="mb-2">This indicator displays the change in import dependence, the imported share of a resource, for the three main fossil fuels. The change is shown in percent points, comparing the measure to a baseline provided by Eurostat data (ex-post) and PRIMES projections (ex-ante). The underlying assumption is that energy savings would merely reduce energy imports rather than domestic production.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/import_dependence.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Import-dependency.pdf">PDF</a>.</p>',
        identifier: "reductionOfImportDependency",
        yAxis: "Reduction in %-points"
      },
      {
        subcategory: "Economic",
        title: "Impact on gross domestic product",
        description: '<p class="mb-2">Energy efficiency measures stimulate added value and increase the gross domestic product (GDP) in economies, which is shown in this indicator. In this case, merely added value linked to the additional investments are considered, whereas potential decreases in additional employments linked to reduced demand of fossil fuels are not taken into account. The calculation uses assumptions from the PRIMES model to adjust coefficients stemming from Eurostat\'s FIGARO input-output tables, which are then multiplied with investment costs. The result represents the added value generated by the assessed measures in a given year.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/GDP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Impact-on-GDP.pdf">PDF</a>.</p>',
        identifier: "impactOnGrossDomesticProduct",
        yAxis: "Added value in €"
      },
      {
        subcategory: "Economic",
        title: "Additional employments",
        description: '<p class="mb-2">Apart from purely behavioural measures, energy efficiency improvements entail additional employments, which are shown in this indicator. In this case, merely additional employments linked to the additional investments are considered, whereas potential job losses linked to reduced demand of fossil fuels are not taken into account. The calculation uses assumptions from the PRIMES model to generate coefficients, which are then multiplied with investment costs. The result represents the additional years of full-time employments generated by the assessed measures in a given year.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/employment_effects.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Employment-effects.pdf">PDF</a>.</p>',
        identifier: "additionalEmployment",
        yAxis: "Additional full-time employment years"
      },
      {
        subcategory: "Economic",
        title: "Added asset value of buildings",
        description: '<p class="mb-2">A variety of studies has found a positive impact of energy efficiency on the real estate value of buildings. This indicator shows the additional value of commercial, office, and residential buildings. The calculation is based on the capitalisation rates for real estate investments in residential and tertiary buildings, which stem from surveys among actors in the property market.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/asset_value.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Impact-on-the-asset-value-of-commercial-buildings.pdf">PDF</a>.</p>',
        identifier: "addedAssetValueOfBuildings",
        yAxis: "Value in €"
      },
      // {
      //   subcategory: "Economic",
      //   title: "Turnover of energy efficiency goods",
      //   description: '<p class="mb-2">Typically, materials essential for energy efficiency in buildings are produced locally. As such, the turnover of energy efficiency goods is an indicator describing the benefit to this specific industry sector. The calculation is based on data from two national case studies.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/turnover_of_EE_goods.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Turnover-of-energy-efficiency-goods.pdf">PDF</a>.</p>',
      //   identifier: "turnoverOfEnergyEfficiencyGoods",
      //   yAxis: "Value in €"
      // },
      {
        subcategory: "Economic",
        title: "Reduction of additionally needed generation capacity",
        description: '<p class="mb-2">As a consequence of energy efficiency measures, fewer new supply-side capacities need to be installed. Assuming that new capacities would alternatively be renewable energies, this indicator assesses the avoided generation capacity. The utilisation factors are calculated from Eurostat\'s Complete Energy Balances (for ex-post) and PRIMES EU Reference Scenario 2020 (for ex-ante).</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/avoided_additional_capacity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Avoided-additional-energy-generation-capacity.pdf">PDF</a>.</p>',
        identifier: "reductionOfAdditionalCapacitiesInGrid",
        yAxis: "Reduction in MW"
      },
      {
        subcategory: "Environmental",
        title: "Primary savings by energy carrier",
        description: '<p class="mb-2">This indicator describes the energy saved in terms of primary energy carriers with the proposed measures. The conversion processes necessary for the generation of electricity, heat, and hydrogen and synthetic fuels (assumed to be hydrogen generated from electricity) are taken into account. The energy mix of these conversion processes comes from past data from Eurostat and projections from PRIMES.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/PEC_FEC_savings.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-Energy-cost-savings.pdf">PDF</a>.</p>',
        identifier: "energySaving",
        yAxis: "Value in ktoe"
      },
      {
        subcategory: "Environmental",
        title: "Reduction in air pollution",
        description: '<p class="mb-2">This graph shows the reductions in air pollutants due to energy efficiency measures. The calculation uses coefficients originating from IIASA\'s GAINS model, taking into account the specific emissions of energy carriers in different sectors and subsectors.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/reduction_AP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-Reduction-in-air-pollution-emissions.pdf">PDF</a>.</p>',
        identifier: "reductionOfAirPollution",
        yAxis: "Reduction in kt"
      },
      {
        subcategory: "Environmental",
        title: "Reduction in greenhouse gas emissions",
        description: '<p class="mb-2">This indicator assesses the greenhouse gas emission reductions entailed by the examined measures. As one of the central drivers for energy efficiency efforts, this indicator is central in related discussions, supporting the narrative of energy efficiency improvements helping to tackle climate change. Building on IIASA\'s GAINS model, this indicator merely takes carbon dioxide emissions into account, not considering other greenhouse gases such as methane or nitrous oxide. As such, the result can be considered a conservative approximation for overall greenhouse gas emissions.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/reduction_GHG.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-GHG-savings-savings-of-direct-carbon-emissions.pdf">PDF</a>.</p>',
        identifier: "reductionOfGreenHouseGasEmission",
        yAxis: "Reduction in ktCO2"
      },
      {
        subcategory: "Environmental",
        title: "Impact on RES targets",
        description: '<p class="mb-2">This indicator examines how energy efficiency can support in achieving the target share of energy originating from renewable energy sources (RES) stated in the Renewable Energy Directive (RED). By reducing the overall energy consumption, the share of renewable energy carriers is increased, assuming the energy savings affect non-renewable energy sources.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/impact_res_targets.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-impacts-on-RES-targets.pdf">PDF</a>.</p>',
        identifier: "renewableEnergyDirectiveTargets",
        yAxis: "Change in RES share in %-points"
      }
    ],
  },
  "monetization": {
    icon: "CurrencyEuroIcon",
    title: "Monetisation",
    subtitle: "Monetary values",
    subcategories: [],
    measurements: [
      {
        title: "Reduction of energy costs",
        description: '<p class="mb-2">This indicator describes the reduction in energy costs for end users to be expected from energy saving measures. It is calculated from final energy savings, differentiating between energy carriers and sectors, taking lower taxes and rates for commerce and industry into account. In case the energy mix has not been specified in the measure specific parameters, it is calculated from Eurostat (ex-post) and PRIMES (ex-ante) data, accounting for the higher prevalence of certain energy carriers in specific improvement actions.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/energy_cost.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-Energy-cost-savings.pdf">PDF</a>.</p>',
        identifier: "reductionOfEnergyCost",
        yAxis: "Savings in €"
      },
      {
        title: "Reduction of greenhouse gas emissions",
        description: '<p class="mb-2">This graph displays the monetary benefits associated with reduced greenhouse gas emissions. The costs of greenhouse gas emissions can be monetised in several ways, inter alia with the costs of carbon in carbon certificate schemes such as the EU Emission Trading System (ETS), the cost of removal or the cost of avoidance for future generations. The MICATool uses societal costs of carbon as a calculation basis, which are calculated in line with common evaluation methodologies by the German Federal Environmental Agency.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/reduction_GHG.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-GHG-savings-savings-of-direct-carbon-emissions.pdf">PDF</a>.</p>',
        identifier: "reductionOfGreenHouseGasEmissionMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Health effects linked to reduced air pollution",
        description: '<p class="mb-2">This graph shows the monetary impacts of air pollution by attributing cases of premature deaths with statistical costs. As basis for the monetisation, the World Health Organisation\'s figures for country-specific Value of Statistical Life (VSL) are used.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_AP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfMortalityMorbidityMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Avoided asthma cases",
        description: '<p class="mb-2">In order to monetise the impact of improved air quality on asthma cases, the value of a disability-adjusted life year (DALY), as provided by the WHO is used as factor.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_IC.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Avoided-burden-of-Asthma.pdf">PDF</a>.</p>',
        identifier: "reductionInDisabilityAdjustedLifeYearsMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Avoided excess cold winter mortality",
        description: '<p class="mb-2">The monetary impact of avoided excess cold winter mortality is evaluated with the use of statistical figures provided by the WHO regarding the value of statistical life (VSL).</p><p> The fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Reduced-or-avoided-excess-cold-weather-mortality-due-to-energy-efficiency-improvements-in-the-residential-building-sector.pdf">PDF</a>.</p>',
        identifier: "avoidedExcessColdWeatherMortalityMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Avoided lost working days due to air pollution",
        description: '<p class="mb-2">This graph shows the avoided costs linked to lost working days. They can be monetised using the WHO coefficients for the national value of lost working days.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/lost_work_days.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfLostWorkDaysMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Impact on RES targets",
        description: '<p class="mb-2">The impact of energy efficiency on renewable energy source (RES) targets (specified in the EU Renewable Energy Directive (RED)) is assessed by calculating the costs of achieving the same objective through the acquisition of statistical transfers of RES. Thereby, underachieving Member States can statistically buy other Member States\' statistical overachievement towards their target. A monetisation factor has been calculated from past public statistical transfers of RES.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/Impact_RES_targets.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-impacts-on-RES-targets.pdf">PDF</a>.</p>',
        identifier: "impactOnResTargetsMonetization",
        yAxis: "Value in €"
      },
      // {
      //   title: "Reduction of additional capacities",
      //   description: '<p class="mb-2">The reduction of necessary investments in additional capacities is monetised by looking at the specific investment costs of the main renewable energy sources, solar, onshore wind, and offshore wind. Their costs are weighted using their national prevalence, with data being an average of values from a 2016 IRENA study and a study commissioned by the European Commission (Tsiropoulos I, Tarvydas, D, Zucker 2017).</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/avoided_additional_capacity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-impacts-on-RES-targets.pdf">PDF</a>.</p>',
      //   identifier: "reductionOfAdditionalCapacitiesInGridMonetization",
      //   yAxis: "Value in €"
      // },
      {
        title: "Impact on gross domestic product",
        description: '<p class="mb-2">Energy efficiency measures stimulate added value and increase the gross domestic product (GDP) in economies, which is shown in this indicator. The calculation uses assumptions from the PRIMES model to adjust coefficients stemming from Eurostat\'s FIGARO input-output tables, which are then multiplied with investment costs. The result represents the added value generated by the assessed measures in a given year.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/GDP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Impact-on-GDP.pdf">PDF</a>.</p>',
        identifier: "impactOnGrossDomesticProduct",
        yAxis: "Added value in M€"
      },
      {
        title: "Added asset value of buildings",
        description: '<p class="mb-2">A variety of studies has found a positive impact of energy efficiency on the real estate value of buildings. This indicator shows the additional value of commercial, office, and residential buildings. The calculation is based on the capitalisation rates for real estate investments in residential and tertiary buildings, which stem from surveys among actors in the property market.</p><p><em><strong>Risk of double counting:</strong> Selecting this indicator and "Reduction in energy costs" constitutes double counting, as the increase in asset value captures buyers\' future energy cost savings.</em></p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/asset_value.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Impact-on-the-asset-value-of-commercial-buildings.pdf">PDF</a>.</p>',
        identifier: "addedAssetValueOfBuildings",
        yAxis: "Value in €"
      }
    ]
  },
  "aggregation": {
    icon: "BanknotesIcon",
    title: "Overview",
    subtitle: "Overview of all monetary values",
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
    title: "Weighted annuity",
    slug: "weightedAnnuity",
  },
  {
    title: "Net present value",
    slug: "netPresentValue",
  },
  {
    title: "Levelised costs of energy savings",
    slug: "LCOE",
  },
  {
    title: "Levelised costs of carbon dioxide",
    slug: "LCOCO2",
  },
  {
    title: "Cost-benefit ratio",
    slug: "CBR",
  },
];

// Refs
const activeCategory = ref<string>(Object.keys(categories)[0]);
const activeSubcategory = ref<string>(Object.values(categories)[0].subcategories[0]);
const activeMeasurement = ref<MeasurementInterface>(Object.values(categories)[0].measurements[0]);
const activeIndicators = ref<Array<string>>(categories.monetization.measurements.filter(m => ['addedAssetValueOfBuildings', 'impactOnGrossDomesticProduct'].indexOf(m.identifier) === -1).map(measurement => measurement.identifier));
const indicatorInfo = ref<string>('');
const indicatorInfoTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null);
const energyPriceSensitivity = ref<number>(100);
const investmentsSensitivity = ref<number>(100);
const discountRate = ref<number>(3);
const cbaYear = ref<string>(session.years[0].toString());
const activeCbaResult = ref<string>(cbaResults[0].slug);

// Computed
const data = computed<ResultInterface[]>(() => {
  return activeMeasurement.value ? JSON.parse(JSON.stringify(session.results.map(result => result.data[activeMeasurement.value.identifier]))) : [];
});
const hasMultipleMeasures = computed(() => data.value.length > 1 || data.value[0].idColumnNames.indexOf('id_measure') > -1);
const chartLabels = computed(() => {
  // Get labels
  const labels: Array<string> = [];
  if (activeMeasurement.value) {
    const identifiers = data.value[0].idColumnNames.filter(identifier => identifier !== 'id_measure');
    if (identifiers.length > 0) {
      data.value[0].rows.forEach(row => {
        if (identifiers.length === 1 && identifiers[0] === 'label') labels.push(row[0]);
        else if (!hasMultipleMeasures.value || row[0] === 1) labels.push(row[hasMultipleMeasures.value ? 1: 0]);
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
        display: data.value.length > 1 || chartLabels.value.filter(label => label !== 'id_measure').length > 0,
        position: 'bottom',
      },
      datalabels: {
        display: (context: Context) => {
          return context.datasetIndex >= context.chart.data.datasets.length - data.value.length;
        },
        formatter: (value: number, context: Context) => {
          const index = context.dataIndex;
          const datasetsPerProgram = context.chart.data.datasets.length / data.value.length;
          let total = value || 0;
          if (datasetsPerProgram > 1) {
            const datasetIndex = context.datasetIndex;
            const programIndex = datasetIndex % data.value.length;
            total = context.chart.data.datasets.filter((_, index) => index % data.value.length === programIndex).reduce((sum, dataset) => {
              const dataValue = dataset.data[index] as number;
              return sum + dataValue;
            }, 0);
          }
          if (total === 0) return '';
          return total < 1 ? labelFormatterSmall.format(total) : labelFormatter.format(total);
        },
        anchor: function (context: Context) {
          const value = context.dataset.data[context.dataIndex];
          return typeof value === 'number' && value >= 0 ? 'end' : 'start';
        },
        align: function (context: Context) {
          const value = context.dataset.data[context.dataIndex];
          return typeof value === 'number' && value >= 0 ? 'end' : 'start';
        },
        font: {
          weight: 'normal',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';

            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y < 1 && context.parsed.y >= 0 ? labelFormatterSmall.format(context.parsed.y) : labelFormatter.format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: false,
          text: 'Years'
        },
      },
      y: {
        stacked: true,
        grace: '10%',
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
  const datasets: ChartDataset[] = [];
  chartLabels.value.forEach((label, i) => {
    const factor = 70 / session.programs.length;
    const color = chartColours[i];
    data.value.forEach((program, iP) => {
      const dataset = {
        label: label === 'id_measure' ? session.programs[iP].name : data.value.length > 1 ? `${label} (${session.programs[iP].name})` : label,
        data: new Array(program.yearColumnNames.length).fill(0),
        borderColor: `rgb(${color[0] + iP * factor}, ${color[1] + iP * factor}, ${color[2] + iP * factor})`,
        backgroundColor: `rgb(${color[0] + iP * factor}, ${color[1] + iP * factor}, ${color[2] + iP * factor})`,
        stack: `stack-${iP}`,
      };
      program.rows.forEach(row => {
        if (isNaN(row[0]) && session.programs.length > 1) row.unshift(0); // Somehow the index is missing
        if (row[hasMultipleMeasures.value ? 1 : 0] === label || label === 'id_measure') {
          const values = structuredClone(row);
          values.splice(0, hasMultipleMeasures.value && label !== 'id_measure' ? 2 : 1);
          values.forEach((measure, iM) => {
            // Sum up measurements and check if it's a percentage value
            dataset.data[iM] += activeMeasurement.value.yAxis.indexOf('%') > -1 ? measure * 100 : measure;
          });
        }
      });
      // Check if program has less years than the session and fill up with null values
      // Find out which years are missing in program.yearColumnNames
      session.years.forEach((year, iY) => {
        if (program.yearColumnNames.indexOf(year.toString()) === -1) {
          // Find the index where to insert the null value
          program.yearColumnNames.find((dataYear, iDY) => {
            if (parseInt(dataYear) > year) {
              dataset.data.splice(iY, 0, null);
              return true;
            }
            // If it's the last year, push the null value at the end
            if (iDY === program.yearColumnNames.length - 1) {
              dataset.data.push(null);
            }
          });
        }
      });
      datasets.push(dataset);
    }); 
  });
  return {
    labels: session.years.map(year => year.toString()),
    datasets: datasets
  };
});
const interpolatedSavingsData = computed(() => {
  return SavingsInterpolation.annualSavingsInterpolation(session.payload);
});
const interpolatedYears = computed(() => {
  return Parameters.yearsFromSavingsData(interpolatedSavingsData.value);
});
const cbaData: Ref<Array<CbaData>> = computedAsync(
  async () => {
    /** FUNCTIONS */

    /**
     * Compute NΔE_{m,y} for a series of years.
     *
     * @param {number[]} delta - array of ΔE_{m,y} (total annual savings),
     *                            ordered by year (index 0 = first year).
     * @param {number} LTm - average lifetime (positive integer).
     * @returns {number[]} newSavings - array of NΔE_{m,y} values (same length as deltaE).
     */
    function computeNewSavings(delta: number[], LTm: number): number[] {
      const n = delta.length;
      const newSavings = new Array(n).fill(0);  

      for (let y = 0; y < n; y++) {
        // sum of previous up to LTm newSavings values
        let sumPrev = 0;
        for (let i = 1; i <= LTm; i++) {
          const idx = y - i;
          if (idx < 0) break; // no earlier year available
          sumPrev += newSavings[idx];
        }
        newSavings[y] = delta[y] - sumPrev;
      }

      return newSavings;
    }

    /**
     * Compute NΔinv_{m,y} for a series of years.
     *
     * @param {number[]} deltaInv - array of Δinv_{m,y} (total annual investments),
     *                              ordered by year (index 0 = first year).
     * @returns {number[]} newInv - array of NΔinv_{m,y} values.
     */
    function computeNewInvestments(deltaInv: number[]): number[] {
      const n = deltaInv.length;
      const newInv = new Array(n).fill(0);

      for (let y = 0; y < n; y++) {
        if (y === 0) {
          // First year has no previous value, so NΔinv = Δinv
          newInv[y] = deltaInv[y];
        } else {
          newInv[y] = deltaInv[y] - deltaInv[y - 1];
        }
      }

      return newInv;
    }

    /**
     * Compute scaled indicator ΔMI_{m,y} for all years.
     *
     * Formula:
     * ΔMI_{m,y} = (MI_{m,i} / ΔE_{m,i}) * NΔE_{m,y}
     *
     * @param {number} MI_base - MI_{m,i}, indicator value in the base (Stützjahr) year.
     * @param {number} deltaE_base - ΔE_{m,i}, total annual savings in the base year.
     * @param {number[]} newSavings - array of NΔE_{m,y} values (new annual savings per year).
     * @returns {number[]} scaledIndicators - ΔMI_{m,y} per year.
     */
    function computeScaledIndicators(MI_base: number, deltaE_base: number, newSavings: number): number {
      if (deltaE_base === 0 || MI_base === 0 || newSavings === 0) {
        return 0;
      }
      return MI_base / deltaE_base * newSavings;
    }

    /**
     * Computes discounted annual one-time impacts.
     *
     * For each annual impact I_m,i in the array:
     *   dI/dGDP = I * CRF
     *
     * @param values - Array of annual values
     * @param DR - Discount rate (e.g., 0.03 for 3%)
     * @param LT - Measure lifetime in years
     * @returns Array of discounted annual values
     */
    function discountedAnnualValues(
      values: number[],
      CRF: number
    ): number[] {
      return values.map(I => I * CRF);
    }

    /**
     * Calculates the weighted annuity A_m.
     *
     * Formula:
     * A_m = ( Σ_i [ A[i] * Σ_{y = y(i-1)+1 to y(i)} newSavings[y] ] )
     *       / ( Σ_y newSavings[y] )
     *
     * @param A - Annuity values per stated year i
     * @param years - Actual calendar year of each stated year index (same length as A)
     * @param newSavings - Map or record of new annual savings per calendar year
     * @returns Weighted annuity A_m
     */
    function calculateWeightedAnnuity(
      A: number[],
      years: number[],
      newSavings: Record<number, number>,
      startingYear: number
    ): number {
      let numerator = 0;
      let denominator = 0;

      // Precompute denominator: total new savings over all years
      for (const y in newSavings) {
        denominator += newSavings[y];
      }

      // Sum per-annuity weighted contributions
      for (let i = 0; i < A.length; i++) {
        const currentYear = years[i];
        // The first year needs to sum up all values from starting year to current year
        const prevYear = i === 0 ? startingYear - 1 : years[i - 1];

        // Sum new savings from prevYear+1 through currentYear
        let savingsSum = 0;
        for (let y = prevYear + 1; y <= currentYear; y++) {
          savingsSum += newSavings[y] ?? 0;
        }

        numerator += A[i] * savingsSum;
      }

      if (denominator === 0) return 0;

      return numerator / denominator;
    }

    /**
     * Compute LCOE/LCOCO2 as:
     *   LCOE_m = - (A_m * N_{m,y}) / (sum_y NΔE_{m,y})
     *
     * Returns a number. Throws on invalid input (denominator zero or non-finite).
     */
    function computeLevelisedCosts(annuity: number, annualSavings: number[]): number {
      const years = annualSavings.length;
      const totalSavings = annualSavings.reduce((a, b) => a + b, 0);

      return -(annuity * years) / totalSavings;
    }

    /** CALCULATION */

    const data = [];

    for (const results of session.results) {
      const deltaE = [...results.data['totalAnnualEnergySavings'].rows[0]];
      deltaE.shift(); // remove measure identifier
      const deltaCO2 = [...results.data['totalAnnualCO2Savings'].rows[0]];
      deltaCO2.shift(); // remove measure identifier
      const investmentCosts = [...results.data['investmentCosts'].rows[0]];
      investmentCosts.shift(); // remove measure identifier
      const LTm = results.data['lifetime']?.rows[0][1]; // average lifetime
      const newEnergySavings = computeNewSavings(deltaE, LTm);
      const newCO2Savings = computeNewSavings(deltaCO2, LTm);
      const newInvestments = computeNewInvestments(investmentCosts);
      const GDP = [...results.data['impactOnGrossDomesticProduct'].rows[0]];
      GDP.shift(); // remove measure identifier
      const years = results.data['subsidyRate'].yearColumnNames;
      const fullYears = results.data['totalAnnualEnergySavings'].yearColumnNames;
      const startingYear = parseInt(fullYears[0]);
      const DR = discountRate.value / 100
      const CRFFactor = Math.pow(1 + DR, LTm);
      const CRF = (DR * CRFFactor) / (CRFFactor - 1);

      // Map newEnergySavings and newInvestments to years
      const newEnergySavingsByYear: {[year: string]: number} = {};
      const newInvestmentsByYear: {[year: string]: number} = {};
      fullYears.forEach((year, i) => {
        newEnergySavingsByYear[year] = newEnergySavings[i];
        newInvestmentsByYear[year] = newInvestments[i];
      });

      // Sum up all indicators ΔMI_{m,y}
      const totalIndicatorsByYear: {[year: string]: number} = {};
      const indicators = categories.monetization.measurements.filter(measurement => activeIndicators.value.indexOf(measurement.identifier) > -1);
      indicators.forEach((indicator, i) => {
        if (["impactOnGrossDomesticProduct", "addedAssetValueOfBuildings"].indexOf(indicator.identifier) > -1) {
          return;
        }
        const data: ResultInterface = JSON.parse(JSON.stringify(results.data[indicator.identifier]));
        if (indicator.identifier === 'reductionOfEnergyCost') {
          data.rows.filter(row => row[0] === 1).map(row => row[1]).forEach((label, iL) => {
            data.rows.filter(row => row[1] === label).forEach(row => {
              // Remove first columns to get only year values
              row.splice(0, 2);
              row.forEach((value, iY) => {
                // Scale the original value according to new energy savings
                const baseYear = years[iY];
                const deltaE_base = deltaE[0]; // ΔE_{m,i} in base year
                const MI_base = value; // MI_{m,i} in base year
                totalIndicatorsByYear[baseYear] = (totalIndicatorsByYear[baseYear] || 0) + computeScaledIndicators(MI_base, deltaE_base, newEnergySavingsByYear[baseYear]);
              });
            });
          });
        } else {
          data.rows.forEach(row => {
            // Remove first columns to get only year values
            row.splice(0, 1);
            row.forEach((value, iY) => {
              // Scale the original value according to new energy savings
              const baseYear = years[iY];
              const deltaE_base = deltaE[0]; // ΔE_{m,i} in base year
              const MI_base = value; // MI_{m,i} in base year
              totalIndicatorsByYear[baseYear] = (totalIndicatorsByYear[baseYear] || 0) + computeScaledIndicators(MI_base, deltaE_base, newEnergySavingsByYear[baseYear]);
            });
          });
        }
      });
      const totalIndicators: number[] = years.map(year => totalIndicatorsByYear[year]);

      const discountedNewInvestments = discountedAnnualValues(newInvestments, CRF);
      // Consider investment sensitivity
      for (let i = 0; i < discountedNewInvestments.length; i++) {
        discountedNewInvestments[i] *= (investmentsSensitivity.value / 100);
      }
      const discountedGDP = discountedAnnualValues(GDP, CRF);
      // If GDP is not selected, use null values
      if (activeIndicators.value.indexOf('impactOnGrossDomesticProduct') === -1) discountedGDP.fill(0);

      const annuity = Array.from({ length: years.length }, (_, i) => discountedNewInvestments[i] - discountedGDP[i] - totalIndicators[i]);
      // Consider energy price sensitivity
      for (let i = 0; i < annuity.length; i++) {
        annuity[i] *= (energyPriceSensitivity.value / 100);
      }
      const weightedAnnuity = calculateWeightedAnnuity(
        annuity,
        years.map(y => parseInt(y)),
        newEnergySavingsByYear,
        startingYear
      );
      const netPresentValue = 0 - weightedAnnuity / CRF;
      const LCOE = computeLevelisedCosts(Math.abs(weightedAnnuity), newEnergySavings);
      const CBR = Array.from({ length: years.length }, (_, i) => 0 - (discountedNewInvestments[i] / (discountedGDP[i] - totalIndicators[i])));
      const LCOCO2 = computeLevelisedCosts(Math.abs(weightedAnnuity), newCO2Savings);

      console.log("LTm", LTm);
      console.log("years", years);
      console.log("CRF", CRF);
      console.log("newEnergySavings", newEnergySavingsByYear);
      console.log("newCO2Savings", newCO2Savings);
      console.log("newInvestments", newInvestmentsByYear);
      console.log("discountedNewInvestments", discountedNewInvestments);
      console.log("discountedGDP", discountedGDP);
      console.log("annuity", annuity);

      data.push({
        name: results.name,
        years: years,
        weightedAnnuity: weightedAnnuity,
        netPresentValue: netPresentValue,
        LCOE: LCOE,
        CBR: CBR,
        LCOCO2: LCOCO2,
        parameters: {
          discountRate: discountRate.value / 100,
          energyPriceSensitivity: energyPriceSensitivity.value / 100,
          investmentsSensitivity: investmentsSensitivity.value / 100,
        },
      });
    }

    return data;
  },
  [], // initial state
)

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
  if (activeIndicators.value.length === 1 && index !== -1) {
    // At least one indicator must be selected
    return;
  }
  if (index === -1) {
    activeIndicators.value.push(identifier);
  } else {
    activeIndicators.value.splice(index, 1);
  }
}
const selectCbaResult = (slug: string) => {
  activeCbaResult.value = slug;
}
const clearIndicatorInfoTimeout = () => {
  if (indicatorInfoTimeoutId.value) {
    clearTimeout(indicatorInfoTimeoutId.value);
    indicatorInfoTimeoutId.value = null;
  }
}
const removeIndicatorInfo = () => {
  clearIndicatorInfoTimeout();
  indicatorInfoTimeoutId.value = setTimeout(() => {
    indicatorInfo.value = '';
  }, 2000);
}
const exportResults = () => {
  // Check if all programs have a unit name; if not, set it
  session.programs.forEach(program => {
    if (!program.unitName || !units.hasOwnProperty(program.unitName)) {
      program.unitName = units[program.unit].name;
    }
  });
  fetch(`${import.meta.env.VITE_API_URL}export-results`, {
    method: "POST",
    body: JSON.stringify({
      results: session.results,
      categories,
      cbaData: cbaData.value,
      years: session.years,
      region: session.region,
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
      <div>
        <InformationCircleIcon
          @click="openModal('export')"
          class="inline w-6 h-6 ml-2 mr-2 cursor-pointer dark:text-white"
        ></InformationCircleIcon>
        <button
          class="py-2 pl-3 pr-4 mr-8 text-xs font-bold text-white uppercase bg-orange-400 rounded-full hover:bg-orange-500 dark:bg-sky-600 dark:hover:bg-sky-700"
          @click="exportResults()"
        >
          <ArrowDownTrayIcon class="h-5 w-5 mt-[-3px] inline text-white"></ArrowDownTrayIcon>
          Export
        </button>
      </div>
    </div>
    <div class="relative my-3 bg-white border border-gray-300 rounded-3xl">
      <div @click="router.push({ name: 'home' });" class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-sky-700 dark:text-sky-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-sky-800 rounded-l-3xl">
          <div
            class="flex items-center cursor-pointer pl-7"
            @click="selectCategory(key)"
            :class="{
              'text-white': activeCategory !== key,
              'text-sky-900': activeCategory === key,
              'bg-white': activeCategory === key,
              'hover:text-sky-700': activeCategory === key,
              'hover:bg-sky-900': activeCategory !== key,
              'rounded-tl-3xl': i === 0,
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
                class="px-4 py-2 ml-5 text-sm font-bold"
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
                v-for="measurement in categories[activeCategory].measurements.filter(measurement => (!measurement.subcategory || measurement.subcategory === activeSubcategory) && measurement.identifier !== 'changeInUnitCostsOfProduction' && (measurement.identifier !== 'changeInSupplierDiversityByEnergyEfficiencyImpact'))"
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
            <Bar
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
        <div v-if="activeCategory === 'cba'">
          <div class="flex">
            <div class="self-start pl-2 border-l border-white bg-sky-600 rounded-br-3xl">
              <h3 class="p-2 font-bold bg-white text-sky-600">Indicators</h3>
              <div
                class="flex items-center py-3 pl-4 pr-2 text-sm cursor-pointer"
                @click="toggleIndicator(measurement.identifier)"
                @mouseover="indicatorInfo = measurement.description; clearIndicatorInfoTimeout();"
                @mouseleave="removeIndicatorInfo"
                :class="{
                  'text-white': activeIndicators.indexOf(measurement.identifier) === -1,
                  'text-sky-800': activeIndicators.indexOf(measurement.identifier) > -1,
                  'bg-sky-100': activeIndicators.indexOf(measurement.identifier) > -1,
                  'hover:text-sky-600': activeIndicators.indexOf(measurement.identifier) > -1,
                  'hover:bg-sky-700': activeIndicators.indexOf(measurement.identifier) === -1,
                  'rounded-br-3xl': i === categories['monetization'].measurements.length || activeIndicators.indexOf(measurement.identifier) === -1
                }"
                v-for="(measurement, i) in categories['monetization'].measurements"
                v-bind:key="`measurement-cba-${measurement.identifier}`"
              >
                <span class="mr-8 font-bold grow whitespace-nowrap">{{ measurement.title }}</span>
                <CheckIcon v-if="activeIndicators.indexOf(measurement.identifier) > -1" class="w-5 h-5"></CheckIcon>
                <CursorArrowRaysIcon v-else class="w-5 h-5"></CursorArrowRaysIcon>
              </div>
            </div>
            <div class="relative flex-wrap">
              <div
                v-html="indicatorInfo"
                @mouseenter="clearIndicatorInfoTimeout()"
                @mouseleave="removeIndicatorInfo()"
                class="absolute p-4 text-sm text-white rounded-lg bg-sky-600 top-5 left-5"
                :class="{
                  'hidden': !indicatorInfo,
                }"
              ></div>
              <div class="p-4 mx-5 my-5 text-sm text-white bg-orange-600 rounded-lg">
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
            
              <div class="flex flex-wrap" v-if="cbaData">
                <div v-for="(programResults, i) in cbaData" :key="`program-${i}`" class="p-3 mx-5 mt-3 mb-2 rounded-lg bg-gray-50">
                  <h3 class="mb-2 font-bold text-md max-w-[450px]">{{ programResults.name }}</h3>
                  <div
                    v-for="result in cbaResults"
                    v-bind:key="`cba-${result.slug}`"
                    class="rounded-xl bg-white border border-sky-600 max-w-[450px] self-start mb-2"
                  >
                    <div class="flex items-center px-4 py-2 text-sm text-white justify-items-start bg-sky-600 rounded-t-xl">
                      <span class="grow">{{ result.title }}</span>
                      <InformationCircleIcon
                        @click="openModal(`cba-${result.slug}`)"
                        class="inline w-6 h-6 ml-2 cursor-pointer"
                      ></InformationCircleIcon>
                      <span class="px-2 py-1 ml-2 bg-white rounded-xl text-sky-600">{{ result.slug === 'CBR' ? 'absolute' : '€' }}</span>
                    </div>
                    <div class="p-4" v-if="result.slug === 'CBR'">
                      <div
                        class="flex gap-2"
                        v-for="(year, index) in programResults.years"
                        :key="`cba-cbr-year-${index}`"
                      >
                        <div class="text-gray-700 col">{{ year }}</div>
                        <div class="text-gray-300 col">{{ formatter.format(programResults[result.slug][index]) }}</div>
                        <span class="font-bold col">{{ labelFormatter.format(programResults[result.slug][index]) }}</span>
                      </div>
                    </div>
                    <div class="p-4" v-else>
                      <div class="text-gray-300">{{ formatter.format(programResults[result.slug]) }}</div>
                      <span class="font-bold">{{ labelFormatter.format(programResults[result.slug]) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
