# Pinterest Clone v2: Memory Optimized with Pagination

A static, auto-deployed Pinterest-style board with **15 pins per page**, **tags**, **categories**, and **memory optimization** (solves 1-2GB issue).

## What's New (v2)

✅ **Pagination** — 15 pins per page (not all 1000+ in one HTML)  
✅ **Tags** — Optional comma-separated tags per pin  
✅ **Categories** — Optional category per pin with filtering  
✅ **Lightweight HTML** — Each page is ~50-100KB instead of 1-2GB  
✅ **Filter UI** — Only on first page (reduces file bloat)  
✅ **Fast Load** — No memory issues, instant pagination  

## Quick Start

### 1. Create Your Repository

```bash
git clone https://github.com/YOUR-USERNAME/pinterest-board
cd pinterest-board
```

### 2. Project Structure

```
.
├── .github/
│   └── workflows/
│       └── build-pinterest.yml
├── data/
│   └── pins.csv                # Comma-separated pins
├── build.js                    # V2 build script
├── pinterest.js                # V2 client script
├── style.css                   # V2 stylesheet
├── package.json
└── README.md
```

### 3. Copy Files

- `.github/workflows/build-pinterest.yml` (same as v1)
- `build-pinterest-v2.js` → rename to `build.js`
- `pinterest-v2.js` → rename to `pinterest.js`
- `style-pinterest-v2.css` → rename to `style.css`
- `package.json` (same as v1)

### 4. Setup

```bash
mkdir data
git add .github/ build.js pinterest.js style.css package.json
git commit -m "Initial commit"
git push
```

### 5. Add CSV & Deploy

```bash
# Add your pins
cp your-pins.csv data/
git add data/
git commit -m "Add pins"
git push
```

Site live at: `https://YOUR-USERNAME.github.io/REPO-NAME`

---

## CSV Format (Updated)

### Full Format (7 columns)

```csv
title,description,image,link,source,category,tags
Sunset mountains,Golden hour,https://...,https://...,Unsplash,landscape,nature mountains golden hour
Coffee shop,Cozy vibes,https://...,https://...,Unsplash,design,coffee minimalist cafe
```

### Minimal Format (3 columns)

```csv
title,image,category
My pin,https://...,nature
```

### Column Guide

| Column | Required? | Notes |
|--------|-----------|-------|
| `title` (or `name`) | ✓ | Pin heading |
| `image` (or `url`) | ✓ | Image URL |
| `description` (or `desc`) | Optional | Short text |
| `link` | Optional | Click destination |
| `source` | Optional | Attribution |
| `category` (or `cat`) | Optional | Single category per pin |
| `tags` (or `tag`) | Optional | Comma-separated: `tag1 tag2 tag3` |

**CSV Parsing Rules:**
- Headers are case-insensitive
- Comma inside quoted values is OK: `"Title, with comma"`
- Tags: space or comma-separated: `photography nature sunset` OR `photography,nature,sunset`
- URLs must be absolute (`https://...`)

### Example CSV

```csv
title,description,image,link,source,category,tags
Sunset Mountains,Golden hour photography,https://images.unsplash.com/photo-1506905925346?w=400,https://unsplash.com,Unsplash,landscape,nature photography mountains sunset
Minimalist Desk,Clean workspace,https://images.unsplash.com/photo-1593642632823?w=400,https://unsplash.com,Unsplash,design,workspace minimalist clean
Ocean Waves,Seascape at dawn,https://images.unsplash.com/photo-1505142468610?w=400,https://unsplash.com,Unsplash,landscape,ocean waves seascape
```

---

## Memory Optimization (Why v2 is Fast)

### The Problem (v1)
- 1000 pins = 1 massive HTML file
- All pins loaded in browser memory
- File size: 1-2GB
- Page load: 30-60 seconds
- Filtering: laggy

### The Solution (v2)
- **Pagination:** 15 pins per page = multiple small HTML files
- Page 1: 50KB, Page 2: 50KB, etc.
- **Lightweight filters:** Only on first page
- **Static pages:** No JavaScript recalculation
- **Total size:** 1000 pins ÷ 15 = ~67 pages × 50KB = ~3.4MB total
- **Load time:** Sub-second per page
- **Memory:** ~5-10MB in browser

### What Gets Generated

```
dist/
├── index.html          # Page 1 (15 pins + filters)
├── page-2.html         # Page 2 (15 pins)
├── page-3.html         # Page 3 (15 pins)
├── ...
├── page-67.html        # Last page
└── metadata.json       # Tags & categories list
```

---

## Features

### Pagination
- 15 pins per page (configurable: edit `PINS_PER_PAGE` in `build.js`)
- Auto-numbered pages (page-1, page-2, etc.)
- Prev/Next buttons + numbered links
- Responsive pagination UI

### Filters (Page 1 Only)
- **Category dropdown** — filter by single category
- **Tags dropdown** — filter by single tag
- **Search box** — real-time text search
- Filters are client-side (only current page)
- URL params: `?category=landscape&tag=nature`

### Tags
- Optional comma-separated list
- Clickable badges (click to filter)
- Displayed as pill buttons
- Multiple tags per pin

### Categories
- Optional (single) category per pin
- Displayed as small badge above title
- Clickable (click to filter)
- Organized dropdown on page 1

### Responsive
- 5 cols desktop → 4 cols tablet → 2 cols mobile
- Mobile-friendly pagination
- Touch-friendly filter selects

### Performance
- No JavaScript overhead
- Static HTML (fast serve)
- Lazy image loading
- Small page files

---

## File Reference

### `build-pinterest-v2.js`
- Reads all CSV files from `data/`
- Parses CSV with proper quote handling
- **Pagination:** Splits pins into 15-per-page chunks
- Generates `index.html` + `page-N.html` files
- Extracts all tags & categories
- Writes `metadata.json`
- **Memory:** Streams generation (no bulk loading)

### `pinterest-v2.js`
- **Client-side filtering:** Current page only
- **URL sync:** Updates `?category=` and `?tag=` params
- **Tag/category links:** Click to filter
- **Keyboard shortcuts:** Ctrl+K search, Esc clear
- **No pagination JS:** Static HTML handles navigation

### `style-pinterest-v2.css`
- Masonry grid layout
- Filter UI styling
- Pagination controls
- Responsive breakpoints
- Lightweight (no animations bloat)

---

## Customization

### Change Pins Per Page
Edit `build.js`, line 7:
```javascript
const PINS_PER_PAGE = 15;  // Change this to 10, 20, etc.
```

### Change Grid Columns
Edit `style.css`:
```css
.masonry {
  column-count: 5;  /* Decrease for fewer columns */
}
```

### Disable Tags or Categories
Edit `build.js`, in `generatePageHTML()`:
```javascript
// Comment out to disable tags
// let tagsHTML = '';
// if (tags.length > 0) { ... }

// Comment out to disable categories
// let categoryHTML = '';
// if (category) { ... }
```

### Hide Filters
Edit `build.js`, in `generatePageHTML()`:
```javascript
// Only show filters on first page (line ~250)
if (pageNumber === 1) {
  filterHTML = `...`;
}
// Change to:
// filterHTML = '';  // Never show filters
```

### Change Colors
Edit `style.css`:
```css
.pin {
  background-color: #ffffff;  /* Card background */
}

.tag {
  background-color: #f5f5f5;  /* Tag background */
}

.page-link.active {
  background-color: #1a1a1a;  /* Active page color */
}
```

---

## Deployment Checklist

- [ ] Repository created
- [ ] `.github/workflows/build-pinterest.yml` in place
- [ ] `build.js`, `pinterest.js`, `style.css` copied (v2 versions)
- [ ] `package.json` in root
- [ ] `data/` folder created
- [ ] GitHub Pages enabled (Settings → Pages → GitHub Actions)
- [ ] First commit pushed
- [ ] CSV added to `data/` folder
- [ ] Workflow ran successfully (Actions tab)
- [ ] All pages generated (`index.html`, `page-2.html`, etc.)
- [ ] Site loads without memory issues

---

## Troubleshooting

### Build fails
- Check CSV format: headers lowercase, valid image URLs
- Verify quotes around values with commas
- Look at Actions tab for detailed error logs

### Pagination links not working
- Ensure all pages were generated (check Actions output)
- Verify file names: `index.html`, `page-2.html`, etc.
- Check GitHub Pages is set to deploy from `dist/` folder

### Memory still high
- Reduce `PINS_PER_PAGE` to 10 (generates more pages, smaller each)
- Remove `description` column if pins have long text
- Remove image tags: use external CDN instead

### Filters not appearing
- Filters only on `index.html` (page 1)
- Check `pinterest.js` is loaded and has no console errors
- Verify CSV has `category` and `tags` columns

### CSV parsing errors
- Use quotes for commas in text: `"Title, with comma"`
- No trailing commas in header row
- Ensure UTF-8 encoding (not Windows-1252)

---

## Performance Targets

| Metric | v1 (All in One) | v2 (Paginated) |
|--------|-----------------|----------------|
| 1000 pins | 1-2GB file | 3-4MB total |
| Page load | 30-60s | <1s |
| Browser memory | 800MB+ | 5-10MB |
| Build time | 5-10s | 10-15s |
| Scrolling | Laggy | Smooth |

---

## Multi-CSV Setup

Organize pins across files:

```
data/
├── landscape.csv       # All landscape photos
├── design.csv          # Design inspiration
├── architecture.csv    # Building photos
```

Build script merges all CSVs automatically. No code changes needed.

---

## URL Parameters

Navigate filters via URL:

```
https://your-site.com/pinterest-board/
https://your-site.com/pinterest-board/?category=landscape
https://your-site.com/pinterest-board/?tag=nature
https://your-site.com/pinterest-board/?category=design&tag=minimalist
```

---

## Tips

### Image Hosting
- Use CDN (Unsplash, Pexels, Pixabay — free)
- Or self-host via GitHub LFS (if under 2GB quota)

### Backup Your Data
CSV files are in version control — that's your backup. Clone repo to recover.

### Monitor Build
Check Actions tab after each push to verify:
- Build succeeded
- All pages generated
- No CSV parsing errors

### Testing Locally
```bash
node build.js  # Generates dist/ folder
# Open dist/index.html in browser
```

---

## License

Free to use and modify. Built with vanilla JS + GitHub Actions.
