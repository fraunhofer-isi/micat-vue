<!--
© 2024 - 2026 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { onMounted, ref, inject, computed } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import type { SubsectorInterface, ModalInjectInterface } from '@/types';
import { defaultModalInject } from '@/defaults';

interface ScenarioEERow {
  id: number;
  sector: string;
  name: string;
  values: { [key: string]: number | null };
  selected: boolean;
  disabled: boolean;
}

interface ScenarioRESRow {
  id: number;
  technology: string;
  values: { [key: string]: number | null };
  selected: boolean;
}

export interface ScenarioSelectionData {
  years: number[];
  eeRows: ScenarioEERow[];
  resRows: ScenarioRESRow[];
}

const props = defineProps<{
  subsectors: Array<SubsectorInterface>;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', data: ScenarioSelectionData): void;
}>();

const { openModal } = inject<ModalInjectInterface>('modal') || defaultModalInject;

const loading = ref<boolean>(true);
const error = ref<string>('');
const years = ref<number[]>([]);
const eeRows = ref<ScenarioEERow[]>([]);
const resRows = ref<ScenarioRESRow[]>([]);

const sectors = computed(() => {
  const sectorSet = new Set(eeRows.value.map((r) => r.sector));
  return Array.from(sectorSet);
});

const eeRowsBySector = computed(() => {
  const grouped: { [key: string]: ScenarioEERow[] } = {};
  for (const row of eeRows.value) {
    if (!grouped[row.sector]) grouped[row.sector] = [];
    grouped[row.sector].push(row);
  }
  return grouped;
});

const selectedEERows = computed(() => eeRows.value.filter((r) => r.selected));
const selectedRESRows = computed(() => resRows.value.filter((r) => r.selected));

const hasSelection = computed(() => {
  return selectedEERows.value.length > 0 || selectedRESRows.value.length > 0;
});

defineExpose({ hasSelection });

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}scenarios`);
    const data = await response.json();

    // Parse EE data
    const eeHeaders: string[] = data.energy_efficiency.headers;
    const yearHeaders = eeHeaders.filter((h) => /^\d{4}$/.test(h));
    years.value = yearHeaders.map((y) => parseInt(y));

    for (const row of data.energy_efficiency.rows) {
      const values: { [key: string]: number | null } = {};
      let allNull = true;
      for (const yearStr of yearHeaders) {
        const idx = eeHeaders.indexOf(yearStr);
        values[yearStr] = row[idx];
        if (row[idx] !== null) allNull = false;
      }
      eeRows.value.push({
        id: row[0],
        sector: row[1],
        name: row[2],
        values,
        selected: false,
        disabled: allNull
      });
    }

    // Parse RES data
    const resHeaders: string[] = data.renewables.headers;
    const resYearHeaders = resHeaders.filter((h) => /^\d{4}$/.test(h));

    for (const row of data.renewables.rows) {
      const values: { [key: string]: number | null } = {};
      for (const yearStr of resYearHeaders) {
        const idx = resHeaders.indexOf(yearStr);
        values[yearStr] = row[idx];
      }
      resRows.value.push({
        id: row[0],
        technology: row[1],
        values,
        selected: false
      });
    }

    emitUpdate();
  } catch (e) {
    error.value = 'Failed to load scenario data. Please ensure the backend is running.';
  } finally {
    loading.value = false;
  }
});

const toggleEERow = (row: ScenarioEERow) => {
  if (props.readonly || row.disabled) return;
  row.selected = !row.selected;
  emitUpdate();
};

const toggleRESRow = (row: ScenarioRESRow) => {
  if (props.readonly) return;
  row.selected = !row.selected;
  emitUpdate();
};

const toggleAllEE = (sector: string) => {
  if (props.readonly) return;
  const rows = eeRowsBySector.value[sector];
  const enabledRows = rows.filter((r) => !r.disabled);
  const allSelected = enabledRows.every((r) => r.selected);
  enabledRows.forEach((r) => (r.selected = !allSelected));
  emitUpdate();
};

const toggleAllRES = () => {
  if (props.readonly) return;
  const allSelected = resRows.value.every((r) => r.selected);
  resRows.value.forEach((r) => (r.selected = !allSelected));
  emitUpdate();
};

const emitUpdate = () => {
  emit('update', {
    years: years.value,
    eeRows: eeRows.value.filter((r) => r.selected),
    resRows: resRows.value.filter((r) => r.selected)
  });
};

const formatValue = (val: number | null): string => {
  if (val === null) return '–';
  if (val === 0) return '0';
  return Math.round(val).toLocaleString('en');
};
</script>

<template>
  <div role="status" v-if="loading" class="p-5 text-center">
    <svg
      aria-hidden="true"
      class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span class="sr-only">Loading...</span>
  </div>
  <div v-else-if="error" class="p-5 text-center text-red-600 dark:text-red-400">
    {{ error }}
  </div>
  <div
    v-else
    class="relative px-8 py-8 mb-5 border border-gray-300 rounded-3xl dark:border-gray-400"
  >
    <div class="absolute top-[-14px] left-0 w-full text-center">
      <span class="inline-block px-4 italic font-bold bg-white dark:bg-blue-950 dark:text-white">
        Select measures from SEED-MICAT Scenario
      </span>
    </div>

    <div class="flex items-center mb-4">
      <span class="text-sm font-semibold dark:text-white">Methodology</span>
      <InformationCircleIcon
        @click="openModal('scenario-info')"
        class="inline w-6 h-6 ml-2 cursor-pointer dark:text-white"
      ></InformationCircleIcon>
    </div>

    <!-- Readonly summary (after Start) -->
    <div v-if="readonly">
      <div v-for="sector in sectors" :key="`ro-${sector}`" class="mb-3">
        <template
          v-if="selectedEERows.filter((r) => r.sector === sector).length > 0"
        >
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400">{{ sector }}</h3>
          <ul class="ml-1">
            <li
              v-for="row in selectedEERows.filter((r) => r.sector === sector)"
              :key="`ro-ee-${row.id}`"
              class="text-sm font-bold text-gray-800 dark:text-gray-200"
            >
              {{ row.name }}
            </li>
          </ul>
        </template>
      </div>
      <div v-if="selectedRESRows.length > 0" class="mb-3">
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400">Renewables</h3>
        <ul class="ml-1">
          <li
            v-for="row in selectedRESRows"
            :key="`ro-res-${row.id}`"
            class="text-sm font-bold text-gray-800 dark:text-gray-200"
          >
            {{ row.technology }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Interactive selection (home stage) -->
    <template v-else>
      <!-- Energy Efficiency -->
      <div class="mb-6" v-for="sector in sectors" :key="sector">
        <div class="flex items-center mb-2">
          <h3 class="text-sm font-bold dark:text-white">{{ sector }}</h3>
          <button
            class="ml-3 text-xs underline text-sky-600 dark:text-sky-400"
            @click="toggleAllEE(sector)"
          >
            {{
              eeRowsBySector[sector].filter((r) => !r.disabled).every((r) => r.selected)
                ? 'Deselect all'
                : 'Select all'
            }}
          </button>
        </div>
        <div class="space-y-1">
          <label
            v-for="row in eeRowsBySector[sector]"
            :key="`ee-${row.id}`"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer"
            :class="{
              'bg-sky-50 dark:bg-sky-900/30': row.selected && !row.disabled,
              'opacity-40 cursor-not-allowed': row.disabled,
              'hover:bg-gray-50 dark:hover:bg-gray-800': !row.disabled && !row.selected
            }"
            @click.prevent="toggleEERow(row)"
          >
            <input
              type="checkbox"
              :checked="row.selected"
              :disabled="row.disabled"
              class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300"
              @click.stop="toggleEERow(row)"
            />
            <span class="flex-1 dark:text-gray-200">{{ row.name }}</span>
            <span class="text-xs text-gray-400" v-if="!row.disabled">
              {{ formatValue(row.values['2030']) }} ktoe (2030)
            </span>
            <span class="text-xs italic text-gray-400" v-else>no data</span>
          </label>
        </div>
      </div>

      <!-- Renewables -->
      <div>
        <div class="flex items-center mb-2">
          <h3 class="text-sm font-bold dark:text-white">Renewables</h3>
          <button
            class="ml-3 text-xs underline text-sky-600 dark:text-sky-400"
            @click="toggleAllRES()"
          >
            {{ resRows.every((r) => r.selected) ? 'Deselect all' : 'Select all' }}
          </button>
        </div>
        <div class="space-y-1">
          <label
            v-for="row in resRows"
            :key="`res-${row.id}`"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer"
            :class="{
              'bg-sky-50 dark:bg-sky-900/30': row.selected,
              'hover:bg-gray-50 dark:hover:bg-gray-800': !row.selected
            }"
            @click.prevent="toggleRESRow(row)"
          >
            <input
              type="checkbox"
              :checked="row.selected"
              class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300"
              @click.stop="toggleRESRow(row)"
            />
            <span class="flex-1 dark:text-gray-200">{{ row.technology }}</span>
            <span class="text-xs text-gray-400">
              {{ formatValue(row.values['2030']) }} MW (2030)
            </span>
          </label>
        </div>
      </div>
    </template>
  </div>
</template>
