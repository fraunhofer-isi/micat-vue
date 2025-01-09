<!--
© 2024 - 2025 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup async lang="ts">
import {onBeforeMount} from 'vue';
import ResultsOverlay from "@/components/ResultsOverlay.vue";
import { useSessionStore } from "@/stores/session";
import router from "@/router";

const session = useSessionStore();

// Lifecycle
onBeforeMount(async () => {
  if (Object.keys(session.results).length == 0) router.push({name: 'home'});
});
</script>

<template>
  <main>
    <ResultsOverlay v-if="Object.keys(session.results).length > 0"></ResultsOverlay>
  </main>
</template>
