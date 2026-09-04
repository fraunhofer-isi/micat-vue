<!--
© 2024 - 2026 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import { ref, computed } from "vue";
import { chartColours } from "@/defaults";
import { formatter, labelFormatter, labelFormatterSmall } from "@/helpers";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type {
  CategoriesInterface,
  DatasetInterface,
  ResultInterface,
  CbaData
} from "@/types";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const props = defineProps<{
  categories: CategoriesInterface,
  cbaData: Array<CbaData>,
}>()

// Variables
const viewMode = ref<'perYear' | 'annuitized'>('perYear');
const excludedIdentifiers = ['addedAssetValueOfBuildings'];

// Consistent color per indicator, independent of sorting/filtering in either view
const measurementColors = computed(() => {
  const map: {[identifier: string]: string} = {};
  props.categories.monetization.measurements.forEach((m, i) => {
    const c = chartColours[i];
    map[m.identifier] = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  });
  return map;
});

const perYearLegendGroups = computed(() => {
  const measurements = props.categories.monetization.measurements.filter(
    measurement => excludedIdentifiers.indexOf(measurement.identifier) === -1
  );
  return {
    oneTime: measurements.filter(m => m.impactTiming === 'oneTime'),
    recurring: measurements.filter(m => m.impactTiming !== 'oneTime'),
  };
});

const perYearChartOptions: any = {
  plugins: {
    title: { display: false, text: 'MICAT - Aggregation' },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += context.parsed.y < 1 && context.parsed.y >= 0 ? labelFormatterSmall.format(context.parsed.y) : labelFormatter.format(context.parsed.y);
          }
          return label;
        },
      },
    },
    legend: { display: false },
    datalabels: {
      display: (context: any) => {
        const datasetsInSameStack = context.chart.data.datasets.filter((d: any) => d.stack === context.dataset.stack);
        const lastInStack = datasetsInSameStack[datasetsInSameStack.length - 1];
        return context.chart.data.datasets[context.datasetIndex] === lastInStack;
      },
      formatter: (value: number, context: any) => {
        const stack = context.dataset.stack;
        const total = context.chart.data.datasets
          .filter((d: any) => d.stack === stack)
          .reduce((sum: number, d: any) => sum + (d.data[context.dataIndex] || 0), 0);
        if (total === 0) return '';
        return total < 1 && total >= 0 ? labelFormatterSmall.format(total) : labelFormatter.format(total);
      },
      anchor: 'end',
      align: 'end',
      font: { weight: 'normal' },
    }
  },
  responsive: true,
  interaction: { intersect: false },
  scales: {
    x: { stacked: true },
    y: {
      stacked: true,
      ticks: {
        callback: (label: number | string) => typeof label === "number" ? formatter.format(label) : label,
      },
    }
  }
};

const annuitizedChartOptions: any = {
  plugins: {
    title: { display: false, text: 'MICAT - Annuitized' },
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const value = context.parsed.y;
          return `${context.label}: ${value < 0 ? '-' : ''}${labelFormatter.format(Math.abs(value))} €/year`;
        },
      },
    },
    datalabels: { display: () => false }
  },
  responsive: true,
  interaction: { intersect: false },
  scales: {
    x: { ticks: { autoSkip: false, maxRotation: 30 } },
    y: {
      ticks: {
        callback: (label: number | string) => typeof label === "number" ? formatter.format(label) : label,
      },
      title: { display: true, text: 'Annuity-equivalent value (€/year)' },
    }
  }
};

// Computed
const perYearChartData: any = computed(() => {
  const results: Array<{labels: Array<number>, datasets: Array<DatasetInterface>}> = [];
  session.results.forEach((result) => {
    const datasets: Array<DatasetInterface> = [];
    const measurements = props.categories.monetization.measurements
      .filter(measurement => excludedIdentifiers.indexOf(measurement.identifier) === -1)
      .slice()
      .sort((a, b) => {
        const order = (m: typeof a) => m.impactTiming === 'oneTime' ? 0 : 1;
        return order(a) - order(b);
      });
    measurements.forEach((measurement) => {
      const color = measurementColors.value[measurement.identifier];
      const aggregationData: ResultInterface = JSON.parse(JSON.stringify(result.data[measurement.identifier]));
      const values = new Array(session.years.length).fill(0);
      aggregationData.rows.forEach(row => {
        if (measurement.identifier === "reductionOfEnergyCost") {
          row.splice(0, 2);
        } else {
          row.splice(0, 1);
        }
        row.forEach((measure, iM) => {
          values[iM] += measure;
        });
      });
      datasets.push({
        label: measurement.title,
        data: values,
        borderColor: color,
        backgroundColor: color,
        stack: measurement.impactTiming === 'oneTime' ? 'one-time' : 'recurring',
      });
    });
    results.push({
      labels: session.years,
      datasets,
    });
  });
  return results;
});

const annuitizedChartData: any = computed(() => {
  const results: Array<{labels: Array<string>, datasets: Array<DatasetInterface>}> = [];
  session.results.forEach((result, iP) => {
    const cba = props.cbaData[iP];
    const measurements = props.categories.monetization.measurements.filter(
      measurement => excludedIdentifiers.indexOf(measurement.identifier) === -1 && measurement.identifier !== "impactOnGrossDomesticProduct"
    );

    const labels: string[] = ['Investments', 'Impact on GDP'];
    const values: number[] = [cba?.investmentAnnuity || 0, cba?.gdpAnnuity || 0];
    const colors: string[] = ['rgb(140, 140, 140)', measurementColors.value['impactOnGrossDomesticProduct']];

    measurements.forEach(m => {
      labels.push(m.title);
      values.push((cba?.indicatorAnnuities?.[m.identifier]) || 0);
      colors.push(measurementColors.value[m.identifier]);
    });

    const netAnnuity = values.reduce((sum, v) => sum + v, 0);
    labels.push('Net annual benefit');
    values.push(netAnnuity);
    colors.push('rgb(20, 20, 20)');

    results.push({
      labels,
      datasets: [{
        label: 'Annuity-equivalent value',
        data: values,
        backgroundColor: colors,
        borderColor: colors,
      }],
    });
  });
  return results;
});

const chartData = computed(() => viewMode.value === 'annuitized' ? annuitizedChartData.value : perYearChartData.value);
const chartOptions = computed(() => viewMode.value === 'annuitized' ? annuitizedChartOptions : perYearChartOptions);
</script>

<template>
  <div class="p-4 my-5 text-white rounded-lg bg-sky-600 mx-7">
    <h3 class="mb-2 font-bold text-md">Overview</h3>
    <div class="text-sm text-sky-200">This tab shows an overview of the monetised indicators. "Per year" splits one-time impacts (e.g. GDP effects) and annually recurring impacts into two stacked bars per year. "Annuitized" shows the lifetime-annualised equivalent value of investments, GDP and each recurring indicator, plus the resulting net annual benefit (as selected and adjusted in the cba module). All values are in €.</div>
  </div>
  <div class="inline-flex rounded-full border border-sky-600 overflow-hidden mx-7 mb-3 text-sm">
    <button
      class="px-4 py-1.5"
      :class="viewMode === 'perYear' ? 'bg-sky-600 text-white' : 'bg-white text-sky-600'"
      @click="viewMode = 'perYear'"
    >Per year</button>
    <button
      class="px-4 py-1.5"
      :class="viewMode === 'annuitized' ? 'bg-sky-600 text-white' : 'bg-white text-sky-600'"
      @click="viewMode = 'annuitized'"
    >Annuitized</button>
  </div>
   <div v-if="viewMode === 'perYear'" class="flex flex-wrap gap-x-6 gap-y-2 mx-7 mb-4 text-xs text-gray-600">
    <div class="flex flex-wrap items-center gap-3">
      <span class="font-semibold text-gray-800">One-time</span>
      <span v-for="m in perYearLegendGroups.oneTime" :key="`legend-onetime-${m.identifier}`" class="flex items-center gap-1">
        <span class="inline-block w-2.5 h-2.5 rounded-sm" :style="{ backgroundColor: measurementColors[m.identifier] }"></span>
        {{ m.title }}
      </span>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="font-semibold text-gray-800">Recurring</span>
      <span v-for="m in perYearLegendGroups.recurring" :key="`legend-recurring-${m.identifier}`" class="flex items-center gap-1">
        <span class="inline-block w-2.5 h-2.5 rounded-sm" :style="{ backgroundColor: measurementColors[m.identifier] }"></span>
        {{ m.title }}
      </span>
    </div>
  </div>
  <div v-for="(program, i) in session.programs" :key="`program-${i}`" class="p-4 my-5 rounded-lg bg-gray-50 mx-7">
    <h3 class="mb-2 font-bold text-md">{{ program.name }}</h3>
    <div :id="`aggregation-legend-${i}`"></div>
    <Bar
      :id="`chart-aggregation-${i}`"
      :options="chartOptions"
      :data="chartData[i]"
    />
  </div>
</template>
