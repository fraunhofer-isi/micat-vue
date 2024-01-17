<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# MICAT
[**MICAT**](https://micatool.eu) – **M**ultiple **I**mpacts **C**alculation **T**ool – is a project that develops a comprehensive approach to estimate Multiple Impacts of Energy Efficiency (MI-EE) by co-creating a free, easy-to-use, scientifically sound online tool.

For more **open source** software provided by [**Fraunhofer ISI**](https://www.isi.fraunhofer.de/) see https://github.com/fraunhofer-isi.

## Documentation

* Online: https://fraunhofer-isi.github.io/micat

* As *.pdf: https://fraunhofer-isi.github.io/micat/latex/micat.pdf

* Project: https://micatool.eu

## micat-vue

This project contains a front-end for MICAT, based on [vue.js](https://vuejs.org/).

For the back-end see [micat](https://github.com/fraunhofer-isi/micat).

Deployment page: https://app.micatool.eu

## Licenses

This project is free and open source software:

* It is licensed under the GNU Affero General Public License v3 or later (AGPLv3+) - see [LICENSE.md](./LICENSE.md).
* It uses third-party open source modules, see [package.jsonl](./micat/package.json) and [THIRDPARTY.md](./THIRDPARTY.md).

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

### Ensure that an instance of the back_end is running

micat-vue requires the back_end API to be up and running, 
for example at: http://micatool-dev.eu/

### Install dependencies

* Install dependencies with node package manager:

`cd micat`

`npm install`


### Start 

* Run vue.js application in development mode from within `micat` folder:

`npm run dev`   

* Open Google Chrome and go to following url:

`http://localhost:3000/`


## Notes

<p><a href="https://www.isi.fraunhofer.de/en/publishing-notes.html">PUBLISHING NOTES</a></p>

![eu-flag](https://micatool.eu/micat-project-wAssets/img/weblication/wThumbnails/eu-flag-2c3b0581-543393bb@97ll.png)

This project has received funding from the European Union’s Horizon 2020  research and innovation programme under grant agreement No. 101000132.
