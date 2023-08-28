# Deployment instructions
1. Build the static website
```
npm run build
```
2. Sync frontend files
```
rsync -a --delete dist/* micat:/usr/share/nginx/html/micat
```
