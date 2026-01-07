<!--
© 2024 - 2026 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import { computed } from "vue";
import { chartColours } from "@/defaults";
import { formatter, labelFormatter, labelFormatterSmall } from "@/helpers";
import type {
  CategoriesInterface,
  DatasetInterface,
  ResultInterface
} from "@/types";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const props = defineProps<{
  categories: CategoriesInterface,
}>()

// Variables
const chartColoursAggregation: {[key: string]: number[]} = {
  'Electricity': [68,178,47],
  'Oil': [162,243,149],
  'Coal': [16,94,0],
  'Gas': [150,178,47],
  'Biomass and Waste': [200,217,136],
  'Heat': [110,138,8],
  'H2 and e-fuels': [72,89,9],
};

const getAggregationChartOptions: any = (programIdx: number) => ({
  plugins: {
    title: {
      display: false,
      text: 'MICAT - Aggregation'
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
    legend: {
      display: true,
    },
    datalabels: {
      display: () => {
        return false;
      }
    }  
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
        callback: (label: number | string) => typeof label === "number" ? label < 1 && label >= 0 ? formatter.format(label) : formatter.format(label) : label,
      },
    }
  }
});

// Computed
const aggregationChartData: any = computed(() => {
  const results: Array<{labels: Array<number>, datasets: Array<DatasetInterface>}> = [];
  session.results.forEach((result, iP) => {
    const datasets: Array<DatasetInterface> = [];
    const measurements = props.categories.monetization.measurements.filter(measurement => measurement.identifier !== "addedAssetValueOfBuildings");
    measurements.forEach((measurement, i) => {
      const color = chartColours[i];
      const aggregationData: ResultInterface = JSON.parse(JSON.stringify(result.data[measurement.identifier]));
      const values = new Array(session.years.length).fill(0);
      aggregationData.rows.forEach(row => {
        if (measurement.identifier === "reductionOfEnergyCost") {
          row.splice(0, 2);
        } else {
          row.splice(0, 1);
        }
        row.forEach((measure, iM) => {
          // Sum up measurements; impacts on gross domestic product are in million €
          values[iM] += measure;
        });
      });
      datasets.push({
        label: measurement.title,
        data: values,
        borderColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        stack: `stack-${i}`,
      });
    });
    results.push({
      labels: session.years,
      datasets,
    });
  });
  return results;
});
</script>

<template>
  <div class="p-4 my-5 text-white rounded-lg bg-sky-600 mx-7">
    <h3 class="mb-2 font-bold text-md">Overview</h3>
    <div class="text-sm text-sky-200">This tab shows an overview of the monetised indicators for the selected years. All values are in €.</div>
  </div>
  <div v-for="(program, i) in session.programs" :key="`program-${i}`" class="p-4 my-5 rounded-lg bg-gray-50 mx-7">
    <h3 class="mb-2 font-bold text-md">{{ program.name }}</h3>
    <div :id="`aggregation-legend-${i}`"></div>
    <Bar
      :id="`chart-aggregation-${i}`"
      :options="getAggregationChartOptions(i)"
      :data="aggregationChartData[i]"
    />
  </div>  
</template>
