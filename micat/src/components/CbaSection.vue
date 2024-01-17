<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { Line } from "vue-chartjs";
import { Chart as ChartJS } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation';
import { computed } from "vue";
import { chartColours } from "@/defaults";
import type {
  CbaCategoriesInterface,
  CbaData, CbaDataInterface,
  DatasetInterface,
  MarginalSavingsCostCurve,
  NewEnergySaving
} from "@/types";
import { formatter } from "@/helpers";

ChartJS.register(annotationPlugin);
const props = defineProps<{
  activeCbaResult?: string,
  data: CbaData,
  year: string
}>()
const titleMapping: {[key: string]: string} = {
  newEnergySavings: "New energy savings",
  newInvestments: "New investments",
  costBenefitRatios: "Cost benefit ratios",
  benefitCostRatios: "Benefit cost ratios",
  fundingEfficiencyOfEnergySavings: "Funding efficiency of energy savings",
  fundingEfficiencyOfCo2Reductions: "Funding efficiency of CO2 reductions",
  levelisedCostsOfSavedEnergies: "Levelised costs of saved energies",
  levelisedCostsOfSavedCo2: "Levelised costs of saved CO2",
  marginalEnergySavingsCostCurves: "Marginal energy savings cost curves",
  marginalCo2SavingsCostCurves: "Marginal CO2 savings cost curves",
  netPresentValues: "Net present values",
  annuatisedMultipleImpacts: "Annuatised multiple impacts",
  annuatisedEnergyCosts: "Annuatised energy costs",
  annuatisedCo2Emissions: "Annuatised CO2 emissions",
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
});
let chartUpdateTimeout: any;
const updateChart = (chart: any, timeout: number) => {
  clearTimeout(chartUpdateTimeout);
  chartUpdateTimeout = setTimeout(() => {
    chart.update();
  }, timeout);
};
const MarginalCostCurvesChartOptions = (data: CbaDataInterface, title: string) => {
  const annotations: Array<{x: number; y: number; label: string}> = [];
  let sumX: number = 0;
  let valuesY: Array<number> = [];
  data.datasets.forEach((set) => {
    annotations.push({x: set.data[props.year].x, y: set.data[props.year].y, label: set.label});
    sumX += set.data[props.year].x;
    valuesY.push(set.data[props.year].y);
  });
  return {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: sumX,
        ticks: {
          callback: (label: number | string) => typeof label === "number" ? formatter.format(label) : label,
        },
        title: {
          display: true,
          text: title === 'marginalEnergySavingsCostCurves' ? "Totally generated energy savings" : "Totally generated CO2 savings"
        }
      },
      y: {
        type: 'linear',
        min: 0,
        max: Math.max(...valuesY),
        ticks: {
          callback: (label: number | string) => typeof label === "number" ? formatter.format(label) : label,
        },
        title: {
          display: true,
          text: "Levelised costs of saved CO2"
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      annotation: {
        annotations: annotations.reduce(
          ({lastXMax, result}, xy, idx) => {
            // Construct the box
            const xMin = lastXMax;
            const xMax = xMin + xy.x;
            const yMin = xy.x < 0 ? xy.y : 0;
            const yMax = xy.y > 0 ? xy.y : 0;
            (result as any)[`box${idx}`] = {
              type: 'box',
              xMin,
              xMax,
              yMin,
              yMax,
              backgroundColor: chartColours[idx],
              borderColor: '#fff',
              z: 1,
              label: {
                color: '#000',
                display: true,
                content: xy.label,
              },
              enter(ctx: any) {
                ctx.chart.options.plugins.annotation.annotations[`label${idx}`].display = true;
                updateChart(ctx.chart, 50);
              },
              leave(ctx: any) {
                ctx.chart.options.plugins.annotation.annotations[`label${idx}`].display = false;
                updateChart(ctx.chart, 1000);
              }
            };
            // Construct the line & label
            (result as any)[`label${idx}`] = {
              type: 'label',
              display: false,
              xValue: (xMax + xMin) / 2,
              yValue: yMax,
              color: '#000',
              backgroundColor: '#fff',
              borderRadius: 10,
              textAlign: 'left',
              position: 'start',
              z: 2,
              content: [`Costs: ${formatter.format(xy.y)}`, `Savings: ${formatter.format(xy.x)}`],
              font: {
                size: 10,
                weight: 'bold'
              }
            };
            return {lastXMax: xMax, result};
          },
          {lastXMax: 0, result:{}} as {lastXMax: number, result: any},
        ).result,
      },
    },
  };
};
const chartData = computed(() => {
  const categories: CbaCategoriesInterface = {};
  Object.entries(props.data).forEach(([category, charts]) => {
    if (['supportingYears', 'years'].indexOf(category) > -1) return;
    categories[category] = [];
    Object.entries(charts).forEach(([title, measurements]) => {
      const datasets: Array<DatasetInterface> = [];
      let labels: Array<string>;
      if (category === 'marginalCostCurves') {
        labels = [];
      } else {
        labels = props.data.years;
      }
      (measurements as Array<NewEnergySaving | MarginalSavingsCostCurve>).forEach((measurement, i: number) => {
        let data;
        if (category === 'marginalCostCurves') {
          data = measurement.data;
        } else {
          data = Object.values(measurement.data);
        }
        datasets.push({
          label: measurement.id_measure.toString(),
          data: data,
          borderColor: chartColours[i],
          backgroundColor: chartColours[i],
        });
      });
      categories[category].push({
        title: title,
        data: {
          labels: labels,
          datasets: datasets
        }
      });
    });
  });
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
        <h3 class="font-bold mb-2 text-center">
          {{ titleMapping[chart.title] }}
          <span v-if="category === 'marginalCostCurves'">for {{ props.year }}</span>
        </h3>
        <Line
          class="w-full max-w-[100%] mb-9"
          v-if="category === 'marginalCostCurves'"
          :id="`cba-chart-${chart.title}`"
          :options="(MarginalCostCurvesChartOptions(chart.data, chart.title) as any)"
          :data="(chart.data as any)"
        />
        <Line
          v-else
          class="w-full max-w-[100%] mb-9"
          :id="`cba-chart-${chart.title}`"
          :options="chartOptions"
          :data="(chart.data as any)"
        />
      </div>
    </div>
  </div>
</template>
