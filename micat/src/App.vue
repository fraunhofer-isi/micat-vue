<script setup lang="ts">
import { ref, provide } from 'vue';
import { RouterView } from 'vue-router';
import NotificationBox from "@/components/NotificationBox.vue";
import type { HelpTextInterface } from "@/types";

// Variables
const helpTexts: HelpTextInterface = {
  'timeframe': {
    'title': 'Time frame',
    'text': 'tba',
    'type': 'help'
  },
  'region': {
    'title': 'Region',
    'text': 'tba',
    'type': 'help'
  },
  'unit': {
    'title': 'Unit',
    'text': 'tba',
    'type': 'help'
  },
  'years': {
    'title': 'Time frame',
    'text': 'tba',
    'type': 'help'
  },
  'subsector': {
    'title': 'Subsector',
    'text': 'tba',
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
  <div class="bg-white dark:bg-blue-950 min-h-full">
    <header>
      <nav>
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-4">
          <a href="/" class="flex items-center">
              <img src="@/assets/logo_sm.png" class="h-10 mr-3" alt="MICAT Logo" />
          </a>
          <div class="w-full md:w-auto">
            <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-blue-900 md:dark:bg-blue-950">
              <li>
                <a href="https://micatool.eu/" target="_blank" class="block py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sky-700 md:p-0 dark:text-white md:dark:hover:text-sky-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent">Project</a>
              </li>
              <li>
                <a href="https://fraunhofer-isi.github.io/micat" target="_blank" class="block py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sky-700 md:p-0 dark:text-white md:dark:hover:text-sky-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent">Documentation</a>
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
</template>
