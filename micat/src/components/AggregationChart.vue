<!--
© 2024 - 2025 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import { computed } from "vue";
import { chartColours } from "@/defaults";
import { formatter, labelFormatter, scientificFormatter } from "@/helpers";
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

// Legend
const getOrCreateLegendList = (chart: any, id: any) => {
  const legendContainer = document.getElementById(id);
  if (!legendContainer) {
    return;
  }
  let listContainer = legendContainer.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = "0";
    listContainer.style.padding = "0";

    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};
const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart: any, args: any, options: any) {
    const ul = getOrCreateLegendList(chart, options.containerID);
    ul!.style.flexWrap = 'wrap';
    ul!.style.marginBottom = '1rem';
    
    if (!ul) {
      return;
    }

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const items: Array<any> = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach(item => {
      const li = document.createElement('li');
      li.style.alignItems = 'center';
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.flexDirection = 'row';
      li.style.marginLeft = '10px';
      li.style.marginLeft = '20px';

      li.onclick = () => {
        const {type} = chart.config;
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index);
        } else {
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
        }
        chart.update();
      };

      // Color box
      const boxSpan = document.createElement('span');
      boxSpan.style.background = item.fillStyle;
      boxSpan.style.borderColor = item.strokeStyle;
      boxSpan.style.borderWidth = item.lineWidth + 'px';
      boxSpan.style.display = 'inline-block';
      boxSpan.style.flexShrink = '0';
      boxSpan.style.height = '10px';
      boxSpan.style.marginRight = '5px';
      boxSpan.style.width = '10px';

      // Text
      const textContainer = document.createElement('p');
      textContainer.style.color = item.fontColor;
      textContainer.style.margin = "0px";
      textContainer.style.padding = "0px";
      textContainer.style.fontSize = "10px";
      textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

      const text = document.createTextNode(item.text);
      textContainer.appendChild(text);

      li.appendChild(boxSpan);
      li.appendChild(textContainer);
      ul.appendChild(li);
    });
  }
};

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
            label += context.parsed.y < 1 && context.parsed.y >= 0 ? scientificFormatter.format(context.parsed.y) : labelFormatter.format(context.parsed.y);
          }
          return label;
        },
      },
    },
    htmlLegend: {
      containerID: `aggregation-legend-${programIdx}`,
    },
      legend: {
      display: false,
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
    const factor = 70 / session.programs.length;
    measurements.forEach((measurement, i) => {
      const color = chartColours[i];
      const aggregationData: ResultInterface = JSON.parse(JSON.stringify(result.data[measurement.identifier]));
      if (measurement.identifier === 'reductionOfEnergyCost') {
        const labels = [...new Set(aggregationData.rows.map(row => row[1]))];
        labels.forEach((label, iL) => {
          const values = new Array(session.years.length).fill(0);
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
            borderColor: `rgb(${chartColoursAggregation[label][0]}, ${chartColoursAggregation[label][1]}, ${chartColoursAggregation[label][2]})`,
            backgroundColor: `rgb(${chartColoursAggregation[label][0]}, ${chartColoursAggregation[label][1]}, ${chartColoursAggregation[label][2]})`,
            stack: `stack-reductionOfEnergyCost`,
          });
        });
      } else {
        const values = new Array(session.years.length).fill(0);
        aggregationData.rows.forEach(row => {
          row.splice(0, 1);
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
      }
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
      :plugins="[htmlLegendPlugin]"
    />
  </div>  
</template>
