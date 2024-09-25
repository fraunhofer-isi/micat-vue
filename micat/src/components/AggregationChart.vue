<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

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
const chartColoursAggregation: Array<string> = [
  "rgb(68,178,47)",
  "rgb(162,243,149)",
  "rgb(16,94,0)",
  "rgb(150,178,47)",
  "rgb(200,217,136)",
  "rgb(110,138,8)",
  "rgb(72,89,9)",
];
const aggregationChartOptions: any = {
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
      containerID: 'aggregation-legend',
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
};

// Computed
const aggregationChartData: any = computed(() => {
  const datasets: Array<DatasetInterface> = [];
  let measurements = props.categories.monetization.measurements
  measurements = measurements.concat(props.categories.quantification.measurements.filter(measurement => measurement.identifier === "impactOnGrossDomesticProduct"));
  measurements.forEach((measurement, i) => {
    const aggregationData: ResultInterface = JSON.parse(JSON.stringify(session.results[measurement.identifier]));
    if (measurement.identifier === 'reductionOfEnergyCost') {
      aggregationData.rows.filter(row => row[0] === 1).map(row => row[1]).forEach((label, iL) => {
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
          borderColor: chartColoursAggregation[iL],
          backgroundColor: chartColoursAggregation[iL],
          stack: `stack-reductionOfEnergyCost`,
        });
      });
    } else {
      const values = new Array(session.years.length).fill(0);
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
    labels: session.years,
    datasets,
  }
});
</script>

<template>
  <div class="p-4 my-5 text-white rounded-lg bg-sky-600 mx-7">
    <h3 class="mb-2 font-bold text-md">Overview</h3>
    <div class="text-sm text-sky-200">This tab shows an overview of the monetised indicators for the selected years. All values are in €.</div>
  </div>
  <div id="aggregation-legend"></div>
  <Bar
    id="chart-aggregation"
    :options="aggregationChartOptions"
    :data="aggregationChartData"
    :plugins="[htmlLegendPlugin]"
  /> 
</template>
