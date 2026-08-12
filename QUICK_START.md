# Quick Start

## Setup (5 minutes)

### 1. Init Git Repo
```bash
cd pinterest-clone
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/pinterest-board.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to GitHub repo **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Save

### 3. Add Your Pins
Replace `data/example-pins.csv` with your own CSV:

```csv
title,description,image,link,source,category,tags
Sunset,Golden hour,https://...,https://...,Source,landscape,nature sunset golden
Coffee,Cozy cafe,https://...,https://...,Source,design,coffee minimalist
```

### 4. Deploy
```bash
git add data/
git commit -m "Add pins"
git push
```

GitHub Actions auto-builds. Site live in 2-3 minutes at:
```
https://YOUR-USERNAME.github.io/pinterest-board/
```

## CSV Format

**Required columns:**
- `title` — Pin heading
- `image` — Image URL (must be `https://...`)

**Optional columns:**
- `description` — Short text
- `link` — Click destination
- `source` — Attribution
- `category` — Single category per pin
- `tags` — Space or comma-separated: `tag1 tag2 tag3`

## Features

- **15 pins per page** — eliminates 1-2GB memory issue
- **Pagination** — auto-generated page links
- **Tags** — clickable filter badges
- **Categories** — dropdown filter
- **Search** — real-time text search
- **Responsive** — 5 cols → 2 cols mobile
- **Fast** — <1s page load, sub-10MB total

## Monitoring

After push, check:
1. **Actions tab** — build status
2. **Deployments** → **github-pages** — live URL
3. **Pages** (Settings) — site URL

Done! No further setup needed. Just push CSVs to auto-deploy.
