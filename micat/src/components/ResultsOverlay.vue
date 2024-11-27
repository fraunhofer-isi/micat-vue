<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

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
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, type ChartDataset, type ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns';
import type {
  CategoriesInterface,
  MeasurementInterface,
  ResultInterface,
  ModalInjectInterface,
  CbaResultInterface,
} from "@/types";
import { defaultModalInject, chartColours, units } from "@/defaults";
import AggregationChart from "@/components/AggregationChart.vue";
import { formatter, labelFormatter, scientificFormatter, restructureParameters } from "@/helpers";
import {
  Parameters,
  SavingsInterpolation,
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
    subtitle: "Physical values",
    subcategories: ["Social", "Economic", "Environmental"],
    measurements: [
      {
        subcategory: "Social",
        title: "Avoided premature mortality due to air pollution",
        description: '<p class="mb-2"> This indicator assesses the number of avoided premature death cases thanks to energy efficiency measures and the resulting decline in air pollution levels. It is based on IIASA\'s GAINS model, taking air pollution reductions, national health data, and other factors into account. </p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_AP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfMortalityMorbidity",
        yAxis: "Reduction in casualties"
      },
      {
        subcategory: "Social",
        title: "Avoided lost working days due to air pollution",
        description: '<p class="mb-2"> This indicator assesses the number of prevented lost working days due to energy efficiency measures and the resulting decline in air pollution levels. It is based on IIASA\'s GAINS model, taking air pollution reductions, national health data, and other factors into account. </p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/lost_work_days.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
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
        description: '<p class="mb-2">Energy intensity describes the amount of energy necessary to generate a unit of gross domestic product (GDP) in an economy. This graph shows the effect energy efficiency has in reducing it. It is calculated by dividing gross available energy by GDP. The scenario with measures is compared to a scenario populated with past data from Eurostat (ex-post) and projections from PRIMES (ex-ante).</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/energy_intensity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Energy-Intensity.pdf">PDF</a>.</p>',
        identifier: "energyIntensity",
        yAxis: "Energy intensity in toe / M€"
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
        description: '<p class="mb-2">Apart from purely behavioural measures, energy efficiency improvements entail additional employments, which are shown in this indicator. In this case, merely additional employments linked to the additional investments are considered, whereas potential decreases in added value linked to reduced demand of fossil fuels are not taken into account. The calculation uses assumptions from the PRIMES model to generate coefficients, which are then multiplied with investment costs. The result represents the additional years of full-time employments generated by the assessed measures in a given year.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/employment_effects.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Employment-effects.pdf">PDF</a>.</p>',
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
      {
        subcategory: "Economic",
        title: "This indicator is obsolete",
        description: '<p class="mb-2">This indicator is obsolete.</p>',
        identifier: "changeInUnitCostsOfProduction",
        yAxis: "Value in € / €"
      },
      {
        subcategory: "Economic",
        title: "Turnover of energy efficiency goods",
        description: '<p class="mb-2">Typically, materials essential for energy efficiency in buildings are produced locally. As such, the turnover of energy efficiency goods is an indicator describing the benefit to this specific industry sector. The calculation is based on data from two national case studies.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/turnover_of_EE_goods.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Turnover-of-energy-efficiency-goods.pdf">PDF</a>.</p>',
        identifier: "turnoverOfEnergyEfficiencyGoods",
        yAxis: "Value in €"
      },
      {
        subcategory: "Economic",
        title: "Change in supplier diversity by energy efficiency impact",
        description: '<p class="mb-2">This indicator relies on the <a class="font-bold" target="_blank" href="https://en.wikipedia.org/wiki/Herfindahl%E2%80%93Hirschman_index">Herfindahl-Hirschman Index</a>, a measure of market concentration. Since PRIMES does not provide any projections for the future supplier landscape of fossil fuels, this indicator is not in use for ex-ante calculations, whereas past Eurostat figures are used for ex-post examination. Furthermore, the assumption is that energy savings result in reduced imports from the largest supplier.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/supplier_diversity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impacts-Aggregated-energy-security-supply-diversity.pdf">PDF</a>.</p>',
        identifier: "changeInSupplierDiversityByEnergyEfficiencyImpact",
        yAxis: "Change in supplier diversity in %"
      },
      {
        subcategory: "Economic",
        title: "Reduction of additionally needed generation capacity",
        description: '<p class="mb-2">As a consequence of energy efficiency measures, fewer new supply-side capacities need to be installed. Assuming that new capacities would alternatively be renewable energies, this indicator assesses the avoided generation capacity. The utilisation factors are calculated from Eurostat\'s Complete Energy Balances (for ex-post) and PRIMES EU Reference Scenario 2020 (for ex-ante).</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/avoided_additional_capacity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Avoided-additional-energy-generation-capacity.pdf">PDF</a>.</p>',
        identifier: "reductionOfAdditionalCapacitiesInGrid",
        yAxis: "Reduction in MW"
      },
      {
        subcategory: "Environmental",
        title: "Primary savings by fuel",
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
        title: "Premature deaths due to air pollution",
        description: '<p class="mb-2">This graph shows the monetary impacts of air pollution by attributing cases of premature deaths with statistical costs. As basis for the monetisation, the World Health Organisation\'s figures for country-specific Value of Statistical Life (VSL) are used.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/health_AP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfMortalityMorbidityMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Avoided lost working days due to air pollution",
        description: '<p class="mb-2">This graph shows the avoided costs linked to lost working days. They can be monetised using the WHO coefficients for the national value of lost working days.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/social_indicators/lost_work_days.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Social-impact-Human-health-due-to-reduced-air-pollution.pdf">PDF</a>.</p>',
        identifier: "reductionOfLostWorkDaysMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Reduction of greenhouse gas emissions",
        description: '<p class="mb-2">This graph displays the monetary benefits associated with reduced greenhouse gas emissions. The costs of greenhouse gas emissions can be monetised in several ways, inter alia with the costs of carbon in carbon certificate schemes such as the EU Emission Trading System (ETS), the cost of removal or the cost of avoidance for future generations. The MICATool uses societal costs of carbon as a calculation basis, which are calculated in line with common evaluation methodologies by the German Federal Environmental Agency.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/reduction_GHG.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-GHG-savings-savings-of-direct-carbon-emissions.pdf">PDF</a>.</p>',
        identifier: "reductionOfGreenHouseGasEmissionMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Impact on RES targets",
        description: '<p class="mb-2">The impact of energy efficiency on RES targets is assessed by calculating the costs of achieving the same objective through the acquisition of statistical transfers of RES. Thereby, underachieving Member States can statistically buy other Member States\' statistical overachievement towards their target. A monetisation factor has been calculated from past public statistical transfers of RES.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/ecologic_indicators/Impact_RES_targets.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-impacts-on-RES-targets.pdf">PDF</a>.</p>',
        identifier: "impactOnResTargetsMonetization",
        yAxis: "Value in €"
      },
      {
        title: "Reduction of additional capacities",
        description: '<p class="mb-2">The reduction of necessary investments in additional capacities is monetised by looking at the specific investment costs of the main renewable energy sources, solar, onshore wind, and offshore wind. Their costs are weighted using their national prevalence, with data being an average of values from a 2016 IRENA study and a study commissioned by the European Commission (Tsiropoulos I, Tarvydas, D, Zucker 2017).</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/avoided_additional_capacity.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-impacts-on-RES-targets.pdf">PDF</a>.</p>',
        identifier: "reductionOfAdditionalCapacitiesInGridMonetization",
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
        title: "Impact on gross domestic product",
        description: '<p class="mb-2">Energy efficiency measures stimulate added value and increase the gross domestic product (GDP) in economies, which is shown in this indicator. The calculation uses assumptions from the PRIMES model to adjust coefficients stemming from Eurostat\'s FIGARO input-output tables, which are then multiplied with investment costs. The result represents the added value generated by the assessed measures in a given year.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/GDP.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Impact-on-GDP.pdf">PDF</a>.</p>',
        identifier: "impactOnGrossDomesticProduct",
        yAxis: "Added value in M€"
      },
      {
        title: "Added asset value of buildings",
        description: '<p class="mb-2">A variety of studies has found a positive impact of energy efficiency on the real estate value of buildings. This indicator shows the additional value of commercial, office, and residential buildings. The calculation is based on the capitalisation rates for real estate investments in residential and tertiary buildings, which stem from surveys among actors in the property market.</p><p>The equations can be found <a target="_blank" class="font-bold" href="https://doc.micatool.eu/economic_indicators/asset_value.html">here</a>, the fact sheet can be downloaded as <a target="_blank" class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Economic-impact-Impact-on-the-asset-value-of-commercial-buildings.pdf">PDF</a>.</p>',
        identifier: "addedAssetValueOfBuildings",
        yAxis: "Value in M€"
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
  // {
  //   title: "Cost benefit analysis facility",
  //   slug: "costBenefitAnalysisFacility",
  // },
  {
    title: "Net present value",
    slug: "netPresentValue",
  },
  // {
  //   title: "Annual energy costs",
  //   slug: "annualEnergyCosts",
  // },
  // {
  //   title: "Annual multiple impacts",
  //   slug: "annualMultipleImpacts",
  // },
  // {
  //   title: "Cost benefit ratio",
  //   slug: "costBenefitRatio",
  // },
  // {
  //   title: "Levelised costs",
  //   slug: "levelisedCosts",
  // },
  // {
  //   title: "Funding efficiency",
  //   slug: "fundingEfficiency",
  // },
  // {
  //   title: "Marginal cost curves",
  //   slug: "marginalCostCurves",
  // },
];

// Refs
const activeCategory = ref<string>(Object.keys(categories)[0]);
const activeSubcategory = ref<string>(Object.values(categories)[0].subcategories[0]);
const activeMeasurement = ref<MeasurementInterface>(Object.values(categories)[0].measurements[0]);
const activeIndicators = ref<Array<string>>(categories.monetization.measurements.filter(m => ['addedAssetValueOfBuildings', 'impactOnGrossDomesticProduct'].indexOf(m.identifier) === -1).map(measurement => measurement.identifier));
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
const cbaData: Ref<{ [key: string]: number }> = computedAsync(
  async () => {
    // AMI_(m,y)
    let annualMultipleImpacts = 0
    // AEC_(m,y)
    let annualEnergyCosts = 0;

    // inv_(m,y)
    let investments = 0;
    // EC_(m,y)
    let reductionOfEnergyCost = 0;
    // MI_(m,y)
    let totalIndicators = 0;
    // RAC_(m,y)
    let reductionOfAdditionalCapacities = 0;

    // Sum up MI_(m,y) and EC_(m,y)
    const measurements = categories.monetization.measurements.filter(measurement => activeIndicators.value.indexOf(measurement.identifier) > -1);
    measurements.forEach((measurement, i) => {
      const data: ResultInterface = JSON.parse(JSON.stringify(session.results[measurement.identifier]));
      if (measurement.identifier === 'reductionOfEnergyCost') {
        data.rows.filter(row => row[0] === 1).map(row => row[1]).forEach((label, iL) => {
          data.rows.filter(row => row[1] === label).forEach(row => {
            // Sum up values from last year only
            reductionOfEnergyCost += row[row.length - 1];
          });
        });
      } else if (measurement.identifier === 'reductionOfAdditionalCapacitiesInGridMonetization') {
        data.rows.forEach(row => {
          reductionOfAdditionalCapacities += row[row.length - 1];
        });
      } else {
        data.rows.forEach(row => {
          totalIndicators += row[row.length - 1];
        });
      }
    });

    // DR
    const dr = discountRate.value ? discountRate.value / 100 : 0;
    // ICS
    const ics = investmentsSensitivity.value / 100;
    // ECS
    const ecs = energyPriceSensitivity.value / 100;

    for (const program of session.programs) {
      for (const improvement of program.improvements) {
        // Get investment costs (inv_(m,y)) and average technology lifetime (LT_m), if not present
        if (!session.parameters.hasOwnProperty(improvement.internalId!)) {
          const body = {
            "id": improvement.internalId,
            "active": true,
            "subsector": {
              "id": program.subsector,
            },
            "action_type": {
            "id": improvement.id,
            },
            "details": {},
            "unit": {
              // "name": "kilotonne of oil equivalent",
              "symbol": units[session.unit].symbol,
              "factor": units[session.unit].factor
            }
          };
          
          const responseParameters: Response = await fetch(
            `${import.meta.env.VITE_API_URL}json_measure?id_mode=${session.future ? 2 : 4}&id_region=${session.region}&id_subsector=${program.subsector}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({...improvement.values, ...body})
            },
          );
          session.parameters[improvement.internalId!] = restructureParameters(program.subsector, improvement.name!, await responseParameters.json())
          session.updateParameters(session.parameters);
        }
        // Calculate AMI_(m,y) and AEC_(m,y)
        const parameters = session.parameters[improvement.internalId!];
        let averageTechnologyLifetime: string | number = 0;
        investments += parameters.main.find(parameter => parameter.parameters.id_parameter === 40)!.years.at(-1)!.value;
        averageTechnologyLifetime = parameters.main.find(parameter => parameter.parameters.id_parameter === 36)?.parameters.constants || 0;
        for (const t of [...Array(averageTechnologyLifetime).keys()]) {
          const divider =  (1 + dr) ** t;
          annualMultipleImpacts += totalIndicators / divider;
          annualEnergyCosts += reductionOfEnergyCost / divider;
        }
      }
    }
    return {
      "annualMultipleImpacts": annualMultipleImpacts,
      "annualEnergyCosts": annualEnergyCosts,
      // NPV_m
      // Investments are in million €
      "netPresentValue":  -investments * 1000000 * ics + annualEnergyCosts * ecs + annualMultipleImpacts + reductionOfAdditionalCapacities,
    };
    // const indicators: {[key: string]: boolean} = {};
    // for (const measurement of categories['monetization'].measurements.concat(categories['quantification'].measurements.filter(m => m.identifier === "reductionOfAirPollution")).filter(measurement => measurement.identifier !== "addedAssetValueOfBuildings" && measurement.identifier !== "impactOnGrossDomesticProduct")) {
    //   if (activeIndicators.value.indexOf(measurement.identifier) > -1) indicators[measurement.identifier] = true;
    // }
    // const userOptions = {
    //   'parameters': {
    //     'energyPriceSensivity': energyPriceSensitivity.value,
    //     'investmentsSensivity': investmentsSensitivity.value,
    //     'discountRate': discountRate.value,
    //     'year': cbaYear.value,
    //   },
    //   indicators
    // }
    
    // const results: CbaData = DataStructures.prepareResultDataStructure();
    // const indicatorData = convert(session.results);
    // results.supportingYears = session.years;
    // results.years = interpolatedYears.value;

    // for (const measure of interpolatedSavingsData.value.measures) {
    //   const measureSpecificResults = DataStructures.prepareMeasureSpecificResultsDataStructure(measure.id);
    //   const measureSpecificParameters = Parameters.measureSpecificParameters(
    //     measure,
    //     indicatorData,
    //     userOptions
    //   );
    //   measureSpecificParameters.subsidyRate = Interpolation.annualLinearInterpolation(measureSpecificParameters.subsidyRate);

    //   for (const year of results.years) {
    //     const annualMeasureSpecificParameters =
    //       Parameters.annualMeasureSpecificParameters(year, measure);
    //     // Do not change the calculation order, because a calculation depends on the results of the previous one(s)!
    //     CostBenefitAnalysisFacility.calculateCostBenefitAnalysisFacility(
    //       measureSpecificParameters,
    //       annualMeasureSpecificParameters,
    //       measureSpecificResults,
    //       userOptions
    //     );
    //     NetPresentValue.calculateNetPresentValue(
    //       measureSpecificParameters,
    //       annualMeasureSpecificParameters,
    //       measureSpecificResults,
    //       userOptions
    //     );
    //     CostBenefitRatio.calculateCostBenefitRatio(
    //       measureSpecificParameters,
    //       annualMeasureSpecificParameters,
    //       measureSpecificResults,
    //       userOptions
    //     );
    //     LevelisedCosts.calculateLevelisedCosts(
    //       measureSpecificParameters,
    //       annualMeasureSpecificParameters,
    //       measureSpecificResults,
    //       userOptions
    //     );
    //     FundingEfficiency.calculateFundingEfficiency(
    //       measureSpecificParameters,
    //       annualMeasureSpecificParameters,
    //       measureSpecificResults,
    //       userOptions
    //     );
    //     MarginalCostCurves.calculateMarginalCostCurves(
    //       measureSpecificParameters,
    //       annualMeasureSpecificParameters,
    //       measureSpecificResults,
    //       userOptions
    //     );
    //   }

    //   DataStructures.appendMeasureSpecificResults(
    //     measureSpecificResults,
    //     results
    //   );
    // }
  },
  { annualMultipleImpacts: 0, annualEnergyCosts: 0, netPresentValue: 0 }, // initial state
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
                v-for="measurement in categories[activeCategory].measurements.filter(measurement => (!measurement.subcategory || measurement.subcategory === activeSubcategory) && measurement.identifier !== 'changeInUnitCostsOfProduction' && (!session.future || measurement.identifier !== 'changeInSupplierDiversityByEnergyEfficiencyImpact'))"
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
                <div
                  v-for="result in cbaResults"
                  v-bind:key="`cba-${result.slug}`"
                  class="rounded-xl bg-white border border-sky-600 mt-2 mb-5 mx-5 max-w-[450px] self-start"
                >
                  <div class="flex items-center px-4 py-2 text-sm text-white justify-items-start bg-sky-600 rounded-t-xl">
                    <span class="grow">{{ result.title }}</span>
                    <InformationCircleIcon
                      @click="openModal(`cba-${result.slug}`)"
                      class="inline w-6 h-6 ml-2 cursor-pointer"
                    ></InformationCircleIcon>
                    <span class="px-2 py-1 ml-2 bg-white rounded-xl text-sky-600">absolute</span>
                  </div>
                  <div class="p-4">
                    <div class="text-gray-300">{{ formatter.format(cbaData[result.slug]) }}</div>
                    <span class="font-bold">{{ labelFormatter.format(cbaData[result.slug]) }}</span>
                  </div>
                </div>  
                <!-- <div class="relative my-3 bg-white border border-gray-300 rounded-3xl">
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
                    </div>
                  </div>
                </div> -->
              </div>
            </div>  
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
