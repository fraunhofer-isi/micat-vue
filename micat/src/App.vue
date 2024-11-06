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
    'text': 'This selects which Member State\'s (or EU27) default values are used in calculations. In case of a country, it is also possible to merely assess a region or municipality in it. Then, absolute default values (i.e. GDP, energy consumption) are scaled using population data. More information about the selection and impact of the geographic area can be found <a class="font-bold" href="https://doc.micatool.eu/user_interface/geography.html" target="_blank">here</a>.',
    'type': 'help'
  },
  'unit': {
    'title': 'Unit',
    'text': 'This allows to input the energy savings in different units. This does not have an effect on the result\'s units. Moreover, changing this setting after entering values does not convert them.',
    'type': 'help'
  },
  'years': {
    'title': 'Time frame',
    'text': 'Here, you can select the years for which you want to provide data. Between these, the tool interpolates value linearly.',
    'type': 'help'
  },
  'programs': {
    'title': 'Programmes',
    'text': 'A programme represents a policy or a group of measures, which you can name here. It can encompass several improvement actions across different sectors, it might also merely relate to a single improvement action within one sector.',
    'type': 'help'
  },
  'subsector': {
    'title': 'Subsector selection',
    'text': 'This determines the sector or subsector, the program is carried out in. More details about the available (sub-)sectors are available <a class="font-bold" href="https://doc.micatool.eu/indices/indices_description.html#id-sector-and-id-subsector" target="_blank">here</a>. Furthermore, help on how to decompose a measure into different sectors and improvement actions can be found <a class="font-bold" href="https://doc.micatool.eu/user_interface/specifying_subsector_action.html" target="_blank">here</a>.',
    'type': 'help'
  },
  'improvement': {
    'title': 'Improvement action selection',
    'text': 'This specifies which improvement actions are part of the program. Each improvement action type bundles measures that similarly affect multiple impacts (i.e. building envelope encompasses window replacements as well as wall or roof insulations). More details about the available improvement actions are available <a class="font-bold" href="https://doc.micatool.eu/indices/indices_description.html#id-action-type" target="_blank">here</a>. Furthermore, help on how to decompose a measure into different sectors and improvement actions can be found <a class="font-bold" href="https://doc.micatool.eu/user_interface/specifying_subsector_action.html" target="_blank">here</a>.',
    'type': 'help'
  },
  'savings': {
    'title': 'How to specify energy savings',
    'text': 'Please enter the energy savings associated with the selected improvement action as <a class="font-bold" href="https://doc.micatool.eu/user_interface/energy_savings_input.html#total-annual-savings" target="_blank">total annual savings</a> in the unit selected in the "Options" section.',
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
    'text': 'The MICATool is still a work in progress, with functions frequently being added or altered. Accordingly, errors may still occur at times, which will be corrected as soon as possible. If this happens or you have other general questions and comments, please send us an email to <a href="mailto:frederic.berger@isi.fraunhofer.de" class="font-bold">frederic.berger@isi.fraunhofer.de</a>.',
    'type': 'help'
  },
  'global-parameters': {
    'title': 'Global parameters',
    'text': 'These parameters define the context in which the assessed measures take place. Inter alia, this concerns energy prices, the energy mix used in electricity and heat generation, the employed monetisation factors or the energy mix in certain sectors and subsectors. Thus, these settings apply to all measures, unless specified otherwise in measures\' advanced parameters.<br /><br />The region and years for which these values can be input reflects the selection of <strong>Region</strong> and years in the prompt <strong>Time frame</strong>, respectively.<br /><br /><strong>Important:</strong> Please note, that any changes are lost if you change the given region or time frame.',
    'type': 'help'
  },
  'parameters': {
    'title': 'Advanced parameters',
    'text': 'These parameters merely pertain to the corresponding measure. More information can be found <a class="font-bold" href="https://doc.micatool.eu/user_interface/user_interface_description.html#measure-specific-parameters" target="_blank">here</a>. <br /><br /><strong>Important:</strong> Please note, that any changes are lost if you change the given region, time frame, subsector or improvement.',
    'type': 'help'
  },
  'renovation': {
    'title': 'Switch between number of affected dwellings and annual renovation rate',
    'text': 'This switch allows to swap the standard input of number of affected dwellings by the provision of an annual renovation rate (which is then multiplied with the total number of dwellings). Thus, this switch allows you to choose the input that suits your data and needs.',
    'type': 'help'
  },
  // Global parameters
  'FuelSplitCoefficient': {
    'title': 'Energy mix coefficient',
    'text': 'These parameters describe which energy carriers are used in the different available sectors and subsectors and there percentage in the energy mix. These values are used to calculate the affected energy mixes for the different selectable improvement actions. Thus, altering these figures changes the proposed default energy mix for the measures selected in the related sector. Yet, it is still possible to alter the affected energy mix for a measure in the measures\' advanced parameters. How this impacts assumed energy mixes is described in more detail <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html" target="_blank">here</a>.<br /><br /><i>For ex-post evaluations, default values stem from Eurostat\'s complete energy balances. For ex-ante evaluations, the values are provided from e3modelling\'s EU Reference Scenario 2020, computed with their PRIMES model.</i><br /><br />Since some default values are confidential, the respective fields might be blank. Nonetheless, you have the possibility to input your own value, which overrides the database\'s default value.',
    'type': 'help'
  },
  'EnergyPrice': {
    'title': 'Energy prices',
    'text': 'These parameters specify the costs of different energy carriers per kiloton of oil equivalent (ktoe). This data stems from a wide range of sources, oftentimes adjusted to account for projected price developments. <br /><br /><i>For ex-post evaluations, default values have been compiled by e3m. For ex-ante evaluations, past values are projected into the future using the price development projections from the IEA\'s World Energy Outlook.</i><br /><br />Since some default values are confidential, the respective fields might be blank. Nonetheless, you have the possibility to input your own value, which overrides the database\'s default value.',
    'type': 'help'
  },
  'ElectricityGeneration': {
    'title': 'Electricity Generation',
    'text': 'This specifies the average amounts of the different primary energy carriers to generate one unit of electricity. Given the typically low efficiency of thermal power plants, the sum of final energy carriers\' factors can significantly surpass 1. The sum of the given values across all energy carriers is therefore equal to the average primary energy factor for the electricity generation. How this impacts assumed energy mixes and how these values are calculated is described in more detail <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html" target="_blank">here</a>.<br /><br /><i>For ex-post measures, these values are calculated from Eurostat\'s Complete Energy Balances. For ex-ante, the calculation is based on results from the EU Reference Scenario 2020 modelled using PRIMES.</i>',
    'type': 'help'
  },
  'HeatGeneration': {
    'title': 'Heat Generation',
    'text': 'This specifies the average amounts of the different primary energy carriers to generate one unit of heat. Given transformation losses in heat generation, the sum of final energy carriers\' factors can surpass 1.  The sum of the given values across all energy carriers is therefore equal to the average primary energy factor for the heat generation. How this impacts assumed energy mixes is described in more detail <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html" target="_blank">here</a>.<br /><br /><i>For ex-post measures, these values are calculated from Eurostat\'s Complete Energy Balances. For ex-ante, the calculation is based on results from the EU Reference Scenario 2020 modelled using PRIMES.</i>',
    'type': 'help'
  },
  'MonetisationFactors': {
    'title': 'Monetisation Factors',
    'text': 'These parameters specify the monetary value used for the monetisation of impacts. Some of these values are year-dependent, while others are considered constant over time.',
    'type': 'help'
  },
  'Valueofalifeyear': {
    'title': 'Value of a Life Year',
    'text': 'This factor is based on the <i>World Health Organization\'s (WHO)</i> publication of Value of a Life Year (VOLY) factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of years of reduced lifetime.',
    'type': 'help'
  },
  'Valueofastatisitcallife': {
    'title': 'Value of Statistical Life',
    'text': 'This factor is based on the <i>World Health Organization\'s (WHO)</i> publication of Value of Statistical Life (VSL) factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of premature deaths.',
    'type': 'help'
  },
  'Valueofalostworkday': {
    'title': 'Value of a lost work day',
    'text': 'This factor is based on the <i>World Health Organization\'s (WHO)</i> publication of Value of work loss days factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of absences from work, for instance due to illness.',
    'type': 'help'
  },
  'Hospitalisationmonetisation': {
    'title': 'Hospitalisation Monetisation',
    'text': 'This factor is based on the <i>World Health Organization\'s (WHO)</i> publication of Hospital Admission cost factors for European countries within their 2018 Carbon Reduction Benefits on Health Tool (CaRBonH). It describes the social costs of additional hospital admissions.',
    'type': 'help'
  },
  'CostpertonofemittedCO2': {
    'title': 'Cost of CO2-emissions',
    'text': 'The valuation of the cost of CO2 emissions is based on societal costs of carbon emissions, including all costs to alleviate their consequences. However, no discounting of the opportunity to emit CO2 for future generations is included in the provided default figure. The latter as well as a figure including generational discounting are calculated by the <i><a class="font-bold" href="https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen#klimakosten-von-treibhausgas-emissionen" target="_blank">German Federal Environmental Agency (UBA)</a></i>.<br /><br />Alternatively, one could also use the market price of emission rights traded within the EU Emission Trading Scheme, the European Union\'s cap and trade scheme for carbon dioxide emissions. However, these costs would not constitute the cost of eliminating all societal damages of carbon emissions. Inter alia, current emission allowance prices can be found on the <a class="font-bold" href="https://www.eex.com/en/market-data/environmentals/spot" target="_blank">European Energy Exchange\'s (EEX) website</a>.',
    'type': 'help'
  },
  'CostofstatisticaltransferofRES': {
    'title': 'Cost of statistical transfer of RES',
    'text': 'The monetisation of energy efficiency\'s contribution to Renewable Energy Source (RES) targets as defined in the Renewable Energy Directive (RED) is done via statistical transfer costs. A statistical transfer is the administrative on paper purchase of a quantity of renewable energy by an underachieving European Member State from another Member State that has overachieved its target. As such, no physical energy is transferred, merely the right to account the renewable energy production and consumption is transferred between Member States.<br /><br />The provided default cost is calculated as average of negotiated and published statistical transfer of RES deals between Member States, as shown in the <i><a class="font-bold" href="https://micatool.eu/seed-micat-project-wAssets/docs/publications/factsheets/Environmental-impact-impacts-on-RES-targets.pdf" target="_blank">corresponding fact sheet</a>.',
    'type': 'help'
  },
  'InvestmentcostsofPV': {
    'title': 'Investment costs of PV',
    'text': 'Average investment costs for the installation of 1MW of photovoltaics.<br /><br /><i>The data is an average of values from a 2016 IRENA study and a study commissioned by the European Commission (Tsiropoulos I, Tarvydas, D, Zucker 2017).</i>',
    'type': 'help'
  },
  'Investmentcostsofonshorewind': {
    'title': 'Investment costs of onshore wind',
    'text': 'Average investment costs for the installation of 1MW of onshore wind energy.<br /><br /><i>The data is an average of values from a 2016 IRENA study and a study commissioned by the European Commission (Tsiropoulos I, Tarvydas, D, Zucker 2017).</i>',
    'type': 'help'
  },
  'Investmentcostsofoffshorewind': {
    'title': 'Investment costs of offshore wind',
    'text': 'Average investment costs for the installation of 1MW of offshore wind energy.<br /><br /><i>The data is an average of values from a 2016 IRENA study and a study commissioned by the European Commission (Tsiropoulos I, Tarvydas, D, Zucker 2017).</i>',
    'type': 'help'
  },
  // Advanced parameters
  'advanced-parameters-40': {
    'title': 'Investment costs',
    'text': 'This figure specifies the triggered investments (which correspond to the total capital costs of the measure, rather than merely the subsidised or remaining costs) linked to the input energy savings. They should be input in total investments of the measure up to that point in time.<br /><br /><i>The default coefficients stem from analysis of past data and model runs carried out by e3m.</i>',
    'type': 'help'
  },
  'advanced-parameters-35': {
    'title': 'Average subsidy rate',
    'text': 'This input specifies the average share of investment costs covered by subsidies.<br /><br /><i>The default coefficient is a general expert guess looking at typical funding programmes.</i>',
    'type': 'help'
  },
  'advanced-parameters-36': {
    'title': 'Average technology lifetime',
    'text': 'This value specifies for how long the implemented improvement actions last.<br /><br /><i>Default values are deduced from standard data compiled by the European Committee for Standardization (CEN).</i>',
    'type': 'help'
  },
  'advanced-parameters-16-1': {
    'title': 'Share of electricity among affected',
    'text': 'This value specifies the share of final energy carrier electricity among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-16-2': {
    'title': 'Share of oil among affected',
    'text': 'This value specifies the share of final energy carrier oil among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-16-3': {
    'title': 'Share of coal among affected',
    'text': 'This value specifies the share of final energy carrier coal among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-16-4': {
    'title': 'Share of gas among affected',
    'text': 'This value specifies the share of final energy carrier gas among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-16-5': {
    'title': 'Share of biomass and waste among affected',
    'text': 'This value specifies the share of final energy carrier biomass and waste among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-16-6': {
    'title': 'Share of heat among affected',
    'text': 'This value specifies the share of final energy carrier heat among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-16-7': {
    'title': 'Share of H2 and e-fuels among affected',
    'text': 'This value specifies the share of final energy carrier H2 and e-fuels among all energy carriers saved by the implemented improvement action. Instead of %, the values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br />When provided, this overrides the default value, calculated following <a class="font-bold" href="https://doc.micatool.eu/energy_mix/energy_mix_description.html#calculation-of-final-energy-mix" target="_blank">this logic</a>. <i>The data feeding this calculation stem from Eurostat\'s Complete Energy Balances for ex-post and from PRIMES\' EU Reference Scenario 2020 for ex-ante, as well as a range of past model runs, to account for the specific improvement action and how its energy mix typically relates to the subsectoral energy mix</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-1': {
    'title': 'Share of electricity among removed',
    'text': 'This input specifies the share of electricity among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of electricity saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-2': {
    'title': 'Share of oil among removed',
    'text': 'This input specifies the share of oil among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of oil saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-3': {
    'title': 'Share of coal among removed',
    'text': 'This input specifies the share of coal among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of coal saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-4': {
    'title': 'Share of gas among removed',
    'text': 'This input specifies the share of gas among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of gas saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-5': {
    'title': 'Share of biomass and waste among removed',
    'text': 'This input specifies the share of biomass and waste among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of biomass and waste saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-6': {
    'title': 'Share of heat among removed',
    'text': 'This input specifies the share of heat among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of heat saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-17-7': {
    'title': 'Share of H2 and e-fuels among removed',
    'text': 'This input specifies the share of H2 and e-fuels among the removed energy carriers in the course of the fuel switch. The share refers to the quantity of H2 and e-fuels saved, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-1': {
    'title': 'Share of electricity among installed',
    'text': 'This input specifies the share of electricity among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of electricity that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-2': {
    'title': 'Share of oil among installed',
    'text': 'This input specifies the share of oil among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of oil that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-3': {
    'title': 'Share of coal among installed',
    'text': 'This input specifies the share of coal among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of coal that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-4': {
    'title': 'Share of gas among installed',
    'text': 'This input specifies the share of gas among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of gas that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-5': {
    'title': 'Share of biomass and waste among installed',
    'text': 'This input specifies the share of biomass and waste among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of biomass and waste that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-6': {
    'title': 'Share of heat among installed',
    'text': 'This input specifies the share of heat among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of heat that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-18-7': {
    'title': 'Share of H2 and e-fuels among installed',
    'text': 'This input specifies the share of H2 and e-fuels among the newly installed energy carriers in the course of the fuel switch. The share refers to the quantity of H2 and e-fuels that was installed, not the number of heaters or machines. Instead of %, values can also be entered as shares or absolute values if this is easier, as long as you remain consistent.<br /><br /><i>When provided, this overrides the default value, which is an expert guess based on the analysis of several typical measures</i>.',
    'type': 'help'
  },
  'advanced-parameters-14-1': {
    'title': 'Efficiency of removed electricity',
    'text': 'This value specifies the assumed efficiency of the removed technologies using electricity. For heat pumps, the efficiency corresponds to the coefficient of performance (COP), since ambient heat is not considered an energy carrier in this methodology.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-14-2': {
    'title': 'Efficiency of removed oil',
    'text': 'This value specifies the assumed efficiency of the removed technologies using oil.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-14-3': {
    'title': 'Efficiency of removed coal',
    'text': 'This value specifies the assumed efficiency of the removed technologies using coal.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-14-4': {
    'title': 'Efficiency of removed gas',
    'text': 'This value specifies the assumed efficiency of the removed technologies using gas.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-14-5': {
    'title': 'Efficiency of removed biomass and waste',
    'text': 'This value specifies the assumed efficiency of the removed technologies using biomass and waste.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-14-6': {
    'title': 'Efficiency of removed heat',
    'text': 'This value specifies the assumed efficiency of the removed technologies using heat.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-14-7': {
    'title': 'Efficiency of removed H2 and e-fuels',
    'text': 'This value specifies the assumed efficiency of the removed technologies using H2 and e-fuels.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-1': {
    'title': 'Efficiency of installed electricity',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using electricity. For heat pumps, the efficiency corresponds to the coefficient of performance (COP), since ambient heat is not considered an energy carrier in this methodology.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-2': {
    'title': 'Efficiency of installed oil',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using oil.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-3': {
    'title': 'Efficiency of installed coal',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using coal.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-4': {
    'title': 'Efficiency of installed gas',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using gas.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-5': {
    'title': 'Efficiency of installed biomass and waste',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using biomass and waste.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-6': {
    'title': 'Efficiency of installed heat',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using heat.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-15-7': {
    'title': 'Efficiency of installed H2 and e-fuels',
    'text': 'This value specifies the assumed efficiency of the newly installed technologies using H2 and e-fuels.<br /><br /><i>The efficiency figures are expert guesses by Fraunhofer ISI based on the <a class="font-bold" href="https://ens.dk/en/our-services/technology-catalogues" target="_blank">Danish Energy Agency\'s Technology Catalogues</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-45': {
    'title': 'Number of affected dwellings',
    'text': 'This figure represents the number of different dwellings affected by the input measure.<br /><br /><i>By default, this figure is calculated from input energy savings, using coefficients drawn from analysis of past data by e3m.</i>',
    'type': 'help'
  },
  'advanced-parameters-42': {
    'title': 'Energy poverty target',
    'text': 'This figure specifies the share of the generated energy savings achieved among energy poor households.<br /><br /><i>By default, the national energy poverty prevalence in terms of households unable to keep their home adequately warm as reported in the <a class="font-bold" href="https://ec.europa.eu/eurostat/web/microdata/european-union-statistics-on-income-and-living-conditions/" target="_blank">EU Statistics on Income and Living Conditions (EU-SILC)</a> is used.</i>',
    'type': 'help'
  },
  'advanced-parameters-43': {
    'title': 'Annual renovation rate',
    'text': 'This value states which share of the dwelling stock is renovated annually. It represents an alternative input to the number of affected dwellings and is then multiplied with the national or local dwelling stock (depending on the selection of the geographical area).<br /<br /><i>The default value is based on PRIMES projections.</i>.',
    'type': 'help'
  },
  'advanced-parameters-32': {
    'title': 'Total dwelling stock',
    'text': 'The total dwelling stock represents the number of dwellings in the investigated region. When you are a local level, the national dwelling stock is scaled down in line with population figures.<br /><br /><i>The dwelling stock have been collected by the Wuppertal Institute and stems from the <a class="font-bold" href="https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficient-buildings/eu-building-stock-observatory_en" target="_blank">EU Building Stock Observatory</a>.</i>',
    'type': 'help'
  },
  'advanced-parameters-31': {
    'title': 'Average number of households per building',
    'text': 'This value specifies the average number of households per building.<br /><br /><i>By default, data provided by the <a class="font-bold" href="https://www.hotmaps-project.eu/" target="_blank">Hotmaps Project</a> is used.</i>',
    'type': 'help'
  },
  'advanced-parameters-29': {
    'title': 'Average rent of energy poor households',
    'text': 'This figure specifies the average amount energy poor households spend on rent.<br /><br /><i>By default, national data from the <a class="font-bold" href="https://ec.europa.eu/eurostat/web/microdata/household-budget-survey" target="_blank">EU Household Budget Survey (HBS)</a> is used</i>.',
    'type': 'help'
  },
  'advanced-parameters-34': {
    'title': 'Average renovation rent premium',
    'text': 'This value determines the average rent increase (in percent of the investment sum) for tenants following a major renovation.<br /><br /><i>The default value stems from a Wuppertal Institute analysis of past data, although data availability is quite scarce.</i>',
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
