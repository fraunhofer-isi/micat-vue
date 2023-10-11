<script setup lang="ts">
import { Line } from "vue-chartjs";
import { computed } from "vue";
import { chartColours } from "@/defaults";
import type {
  CbaCategoriesInterface,
  CbaData,
  DatasetInterface,
  MarginalSavingsCostCurve,
  NewEnergySaving
} from "@/types";
import { formatter } from "@/helpers";

const props = defineProps<{
  activeCbaResult?: string,
  data: CbaData
}>()
const titleMapping: {[key: string]: string} = {
  newEnergySavings: "New energy savings",
  newInvestments: "New investments",
}
const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      title: {
        text: 'MICAT',
        display: false
      },
      legend: {
        display: true
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
          text: "€"
        }
      }
    }
  };
})
const chartData = computed(() => {
  const categories: CbaCategoriesInterface = {};
  Object.entries(props.data).forEach(([category, charts]) => {
    if (['supportingYears', 'years'].indexOf(category) > -1) return;
    categories[category] = [];
    Object.entries(charts).forEach(([title, measurements]) => {
      const datasets: Array<DatasetInterface> = [];
      (measurements as Array<NewEnergySaving | MarginalSavingsCostCurve>).forEach((measurement, i: number) => {
        datasets.push({
          label: measurement.id_measure.toString(),
          data: Object.values(measurement.data),
          borderColor: chartColours[i],
          backgroundColor: chartColours[i],
        });
      });
      categories[category].push({
        title: title,
        data: {
          labels: props.data.years,
          datasets: datasets
        }
      });
    });
  });
  console.log(categories)
  return categories;
})
</script>

<template>
  <div
    v-for="[category, charts] of Object.entries(chartData)"
    v-bind:key="`cba-chart-${category}`"
  >
    <div v-if="activeCbaResult === category">
      <div
        v-for="chart in charts"
        v-bind:key="`cba-chart-${chart.title}`"
      >
        <h3 class="font-bold mb-2 text-center">{{ titleMapping[chart.title] }}</h3>
        <!-- @vue-ignore -->
        <Line
          class="w-full max-w-[100%] mb-9"
          :id="`cba-chart-${chart.title}`"
          :options="chartOptions"
          :data="chart.data"
        />
      </div>
    </div>
  </div>
</template>
