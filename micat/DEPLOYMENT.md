<!--
© 2024 Fraunhofer-Gesellschaft e.V., München

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Deployment instructions
1. Build the static website
```
npm run build
```
2. Sync frontend files
```
rsync -a --delete dist/* micat:/usr/share/nginx/html/micat
```
