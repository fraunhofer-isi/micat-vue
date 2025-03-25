<!--
© 2025 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# MICAT

[**MICAT**](https://micatool.eu) – **M**ultiple **I**mpacts **C**alculation **T**ool – is a project that develops a comprehensive approach to estimate Multiple Impacts of Energy Efficiency (MI-EE) by co-creating a free, easy-to-use, scientifically sound online tool.

For more **open source** software provided by [**Fraunhofer ISI**](https://www.isi.fraunhofer.de/) see https://github.com/fraunhofer-isi.

## Documentation

- Online: https://fraunhofer-isi.github.io/micat

- As \*.pdf: https://fraunhofer-isi.github.io/micat/latex/micat.pdf

- Project: https://micatool.eu

## micat-vue

This project contains a front-end for MICAT, based on [vue.js](https://vuejs.org/).

The web page is published at: https://app.micatool.eu.

For the back-end see [micat](https://github.com/fraunhofer-isi/micat).

## Licenses

This project is free and open source software:

- It is licensed under the GNU Affero General Public License v3 or later (AGPLv3+) - see [LICENSE.md](./LICENSE.md).
- It uses third-party open source modules, see [package.json](./micat/package.json) and [THIRDPARTY.md](./THIRDPARTY.md).

## Badges

Click on some badge to navigate to the corresponding **quality assurance** workflow:

### Formatting & linting

[![lint](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/lint.yml/badge.svg)](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/lint.yml) Checks code formatting with [ESlint](https://eslint.org/)

### Test coverage

[![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/fhg-isi/4bb6f7ce335564341b0181db14bdc98f/raw/micat-vue_coverage.json)](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/coverage.yml) Determines test coverage with [vitest](https://vitest.dev/guide/coverage.html)

### License compliance

[![license_check](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/license_check.yml/badge.svg)](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/license_check.yml) Checks license compatibility with [license-checker](https://github.com/davglass/license-checker)

[![reuse_annotate](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/reuse_annotate.yml/badge.svg)](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/reuse_annotate.yml) Creates copyright & license annotations with [reuse](https://git.fsfe.org/reuse/tool)

[![reuse compliance](https://api.reuse.software/badge/github.com/fraunhofer-isi/micat-vue)](https://api.reuse.software/info/github.com/fraunhofer-isi/micat-vue) Checks for REUSE compliance with [reuse](https://git.fsfe.org/reuse/tool)

### Dependency updates & security checks

[![renovate](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/renovate.yml/badge.svg)](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/renovate.yml) Updates dependencies with [renovate](https://github.com/renovatebot/renovate)

[![CodeQL](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/fraunhofer-isi/micat-vue/actions/workflows/github-code-scanning/codeql) Discovers vulnerabilities with [CodeQL](https://codeql.github.com/)

## Usage

### Development information

#### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

#### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Ensure that an instance of the back_end is running

micat-vue requires the back_end API to be up and running,
for example at: http://micatool-dev.eu/

### Project Setup

Install dependencies with node package manager:

```sh
cd micat
npm install
```

#### Enviroment variables

For local development make sure to use the .env.local file. Currently it has to contain the following variables:

- VITE_API_URL: The URL of the backend.
- VITE_MURE_API_URL: The URL of the ODYSSEE-MURE API. ODYSSEE provides statistical data of past energy savings. MURE provides predefined policies and measures with provided energy savings. Users can build their own suitable use case or scenario with their own values and receive a comprehensive multiple impact analysis.
- VITE_MURE_PASSWORD: Password to access the ODYSSEE-MURE API.
- VITE_MURE_USERNAME: Username to access the ODYSSEE-MURE API.

```sh
cp .env.sample .env.local
```

.env.production is only used in production builds (see below).

### Compile and Hot-Reload for Development

```sh
npm run dev
```

- Ctrl click on the link that is shown in the console or open Google Chrome and paste the url, for example:

`http://localhost:5173/`

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

NOTE: Currently, tests are not available.

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

NOTE: Currently, tests are not available.

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Notes

<p><a href="https://www.isi.fraunhofer.de/en/publishing-notes.html">PUBLISHING NOTES</a></p>

This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No. 101000132.

<img src="https://raw.githubusercontent.com/fraunhofer-isi/.github/refs/heads/main/eu_flag.jpg" alt="eu_flag" width="100px"/>
