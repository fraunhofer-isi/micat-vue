<script setup lang="ts">
import { ref } from 'vue';
import {
  UserGroupIcon,
  XCircleIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  PresentationChartBarIcon,
  CursorArrowRaysIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';
import type { CategoryInterface } from "@/types";

defineProps(['results']);

const icons = {
  UserGroupIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  PresentationChartBarIcon
};
const categories: { [key: string]: CategoryInterface } = {
  "quantification": {
    icon: "UserGroupIcon",
    title: "Quantification",
    subtitle: "physical values",
    measurements: [
      {
        subcategory: "Social",
        title: "Avoided premature mortality due to air pollution",
        identifier: "reductionOfAirPollution"
      },
      {
        subcategory: "Social",
        title: "Avoided lost working days due to air pollution",
        identifier: "reductionOfAirPollutionS"
      },
      {
        subcategory: "Social",
        title: "Energy poverty",
        identifier: "reductionOfEnergyPoverty"
      },
    ],
  },
  "monetization": {
    icon: "CurrencyEuroIcon",
    title: "Monetization",
    subtitle: "monetary values",
  },
  "aggregation": {
    icon: "BanknotesIcon",
    title: "Aggregation",
    subtitle: "monetary values per year",
  },
  "cba": {
    icon: "PresentationChartBarIcon",
    title: "Cost-benefit analysis",
    subtitle: "cost effectiveness",
  }
};
const activeCategory = ref<string>(Object.keys(categories)[0]);
const activeMeasurement = ref<string>(Object.values(categories)[0].measurements[0].identifier);
</script>

<template>
  <div class="max-w-screen-xl mx-auto pt-5 pb-10">
    <a href="#" @click="$emit('close')" class="text-sm text-sky-700 dark:text-sky-300">zurück zu den Eingaben</a>
    <div class="rounded-3xl border border-gray-300 dark:border-gray-300 my-3 relative">
      <div @click="$emit('close')" class="bg-white dark:bg-blue-950 rounded-full p-1 absolute top-[-20px] right-[-10px] cursor-pointer">
        <XCircleIcon class="text-sky-700 dark:text-sky-300 h-9 w-9"></XCircleIcon>
      </div>
      <div class="flex">
        <div class="bg-sky-800 h-full rounded-l-3xl">
          <div
            class="flex items-center pl-7 pr-16 py-5 cursor-pointer"
            @click="activeCategory = key"
            :class="{
              'text-white': activeCategory !== key,
              'text-sky-900': activeCategory === key,
              'bg-white': activeCategory === key,
              'rounded-tl-3xl': activeCategory === key && i === 0,
              'rounded-bl-3xl': activeCategory === key && i === Object.keys(categories).length - 1,
            }"
            v-for="([key, category], i) in Object.entries(categories)"
            v-bind:key="`category-${key}`"
          >
            <div>
              <component :is="icons[category.icon]" class="h-5 w-5 mr-5"></component>
            </div>
            <div>
              <span class="font-bold">{{ category.title }}</span><br />
              <span>{{ category.subtitle }}</span>
            </div>
          </div>
        </div>
        <div>
          <div class="bg-orange-600 rounded-br-3xl pl-1 border-l-2 border-white">
            <div
              class="flex items-center pl-5 pr-3 py-3 cursor-pointer text-sm rounded-bl-3xl"
              @click="activeMeasurement = measurement.identifier"
              :class="{
                'text-white': activeMeasurement !== measurement.identifier,
                'text-orange-800': activeMeasurement === measurement.identifier,
                'bg-white': activeMeasurement === measurement.identifier,
                'rounded-br-3xl': activeMeasurement === measurement.identifier && i === categories[activeCategory].measurements.length - 1,
              }"
              v-for="(measurement, i) in categories[activeCategory].measurements"
              v-bind:key="`measurement-${measurement.identifier}`"
            >
              <span v-if="measurement.subcategory" class="italic mr-3">{{ measurement.subcategory }}</span>
              <span class="font-bold mr-8 grow">{{ measurement.title }}</span>
              <CheckIcon v-if="activeMeasurement == measurement.identifier" class="h-5 w-5"></CheckIcon>
              <CursorArrowRaysIcon v-else class="h-5 w-5"></CursorArrowRaysIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
