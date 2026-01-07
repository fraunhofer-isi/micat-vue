// © 2024 - 2026 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// @ts-ignore: TS7016
import VueNumberFormat from 'vue-number-format'

import App from './App.vue'
import router from './router'

export const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueNumberFormat, {prefix: '', decimal: '.', thousand: ',', precision: 0})

app.mount('#app')

