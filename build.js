#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = 'data';
const DIST_DIR = 'dist';
const PINS_PER_PAGE = 15;

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Parse CSV file with proper quote handling
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    console.warn(`⚠️  CSV file is empty: ${filePath}`);
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const pins = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle quoted CSV values
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length === 0 || !values[0]) continue;

    const pin = {};
    headers.forEach((header, idx) => {
      pin[header] = values[idx] || '';
    });

    // Validate required fields
    if (pin.image || pin.url) {
      pins.push(pin);
    }
  }

  return pins;
}

// Read all CSV files from data folder
function getAllPins() {
  const allPins = [];

  if (!fs.existsSync(DATA_DIR)) {
    console.log('ℹ️  No data/ folder found. Creating empty board.');
    return allPins;
  }

  const files = fs.readdirSync(DATA_DIR);
  const csvFiles = files.filter(f => f.endsWith('.csv'));

  if (csvFiles.length === 0) {
    console.log('ℹ️  No CSV files found in data/');
    return allPins;
  }

  for (const file of csvFiles) {
    const filePath = path.join(DATA_DIR, file);
    console.log(`📖 Reading ${file}...`);
    const pins = parseCSV(filePath);
    allPins.push(...pins);
  }

  return allPins;
}

// Sanitize HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Parse tags (comma-separated)
function parseTags(tagString) {
  if (!tagString) return [];
  return tagString
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

// Extract all unique tags and categories
function extractMetadata(pins) {
  const tags = new Set();
  const categories = new Set();

  pins.forEach(pin => {
    const pinTags = parseTags(pin.tags || pin.tag || '');
    pinTags.forEach(t => tags.add(t));

    const category = (pin.category || pin.cat || '').trim();
    if (category) categories.add(category);
  });

  return {
    tags: Array.from(tags).sort(),
    categories: Array.from(categories).sort(),
  };
}

// Generate pagination
function generatePaginationHTML(currentPage, totalPages) {
  if (totalPages <= 1) return '';

  let html = '<div class="pagination">';

  // Previous
  if (currentPage > 1) {
    html += `<a href="page-${currentPage - 1}.html" class="page-link">← prev</a>`;
  } else {
    html += '<span class="page-link disabled">← prev</span>';
  }

  // Page numbers
  const maxLinks = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxLinks / 2));
  let endPage = Math.min(totalPages, startPage + maxLinks - 1);
  if (endPage - startPage < maxLinks - 1) {
    startPage = Math.max(1, endPage - maxLinks + 1);
  }

  if (startPage > 1) {
    html += `<a href="page-1.html" class="page-link">1</a>`;
    if (startPage > 2) html += '<span class="page-link disabled">...</span>';
  }

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      html += `<span class="page-link active">${i}</span>`;
    } else {
      html += `<a href="page-${i}.html" class="page-link">${i}</a>`;
    }
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += '<span class="page-link disabled">...</span>';
    html += `<a href="page-${totalPages}.html" class="page-link">${totalPages}</a>`;
  }

  // Next
  if (currentPage < totalPages) {
    html += `<a href="page-${currentPage + 1}.html" class="page-link">next →</a>`;
  } else {
    html += '<span class="page-link disabled">next →</span>';
  }

  html += '</div>';
  return html;
}

// Generate single page HTML
function generatePageHTML(pageNumber, pins, totalPages, metadata, filteredTags = [], filteredCategory = '') {
  const startIdx = (pageNumber - 1) * PINS_PER_PAGE;
  const endIdx = startIdx + PINS_PER_PAGE;
  const pagePins = pins.slice(startIdx, endIdx);

  const pinsHTML = pagePins
    .map((pin, idx) => {
      const image = escapeHtml(pin.image || pin.url || '');
      const title = escapeHtml(pin.title || pin.name || 'Untitled');
      const description = escapeHtml(pin.description || pin.desc || '');
      const link = escapeHtml(pin.link || pin.source_url || '#');
      const source = escapeHtml(pin.source || '');
      const tags = parseTags(pin.tags || pin.tag || '');
      const category = escapeHtml(pin.category || pin.cat || '');

      let tagsHTML = '';
      if (tags.length > 0) {
        tagsHTML = `<div class="pin-tags">
          ${tags.map(t => `<a href="?tag=${encodeURIComponent(t)}" class="tag">${escapeHtml(t)}</a>`).join('')}
        </div>`;
      }

      let categoryHTML = '';
      if (category) {
        categoryHTML = `<a href="?category=${encodeURIComponent(category)}" class="pin-category">${category}</a>`;
      }

      return `
    <div class="pin" data-index="${idx}">
      <div class="pin-image-wrapper">
        <img src="${image}" alt="${title}" loading="lazy" onerror="this.classList.add('error')" />
      </div>
      <div class="pin-content">
        ${categoryHTML}
        <h3 class="pin-title">${title}</h3>
        ${description ? `<p class="pin-description">${description}</p>` : ''}
        ${tagsHTML}
        ${source ? `<p class="pin-source">${source}</p>` : ''}
        ${link !== '#' ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="pin-link">view →</a>` : ''}
      </div>
    </div>
  `;
    })
    .join('');

  // Build filter UI (only on first page to reduce file size)
  let filterHTML = '';
  if (pageNumber === 1) {
    filterHTML = `
    <div class="filters">
      <div class="filter-group">
        <label for="category-filter">category:</label>
        <select id="category-filter">
          <option value="">all</option>
          ${metadata.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
      </div>
      
      <div class="filter-group">
        <label for="tag-filter">tag:</label>
        <select id="tag-filter">
          <option value="">all</option>
          ${metadata.tags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
        </select>
      </div>

      <button id="reset-filters" class="reset-btn" style="display: none;">reset</button>
    </div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pinterest Board${pageNumber > 1 ? ` - Page ${pageNumber}` : ''}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <div class="header-content">
      <h1>📌 Board</h1>
      <p class="subtitle">${pins.length} pin${pins.length !== 1 ? 's' : ''}</p>
    </div>
    <div class="header-actions">
      <input 
        type="text" 
        id="search-input" 
        placeholder="search pins..." 
        class="search-box"
      />
      <button id="clear-filters" class="clear-btn" style="display: none;">clear</button>
    </div>
  </header>

  ${pageNumber === 1 ? filterHTML : ''}

  <main>
    ${
      pagePins.length === 0
        ? '<p class="empty-state">no pins found. try adjusting your filters.</p>'
        : `<div class="masonry" id="masonry">${pinsHTML}</div>`
    }
  </main>

  ${generatePaginationHTML(pageNumber, totalPages)}

  <footer>
    <p><a href="https://github.com">github</a> • page ${pageNumber} of ${totalPages}</p>
  </footer>

  <script src="pinterest.js"></script>
</body>
</html>`;

  return html;
}

// Main
(async () => {
  try {
    console.log('📌 Building Pinterest board...');
    const allPins = getAllPins();
    console.log(`✅ Loaded ${allPins.length} pin(s)`);

    if (allPins.length === 0) {
      // Create empty board
      const html = generatePageHTML(1, [], 1, { tags: [], categories: [] });
      const htmlPath = path.join(DIST_DIR, 'index.html');
      fs.writeFileSync(htmlPath, html);
      console.log(`📝 Wrote ${htmlPath}`);
      console.log('✨ Build complete!');
      return;
    }

    // Extract metadata
    const metadata = extractMetadata(allPins);
    console.log(`📏 Found ${metadata.tags.length} tags, ${metadata.categories.length} categories`);

    // Generate pages
    const totalPages = Math.ceil(allPins.length / PINS_PER_PAGE);
    console.log(`📄 Generating ${totalPages} page(s)...`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const html = generatePageHTML(pageNum, allPins, totalPages, metadata);
      const fileName = pageNum === 1 ? 'index.html' : `page-${pageNum}.html`;
      const filePath = path.join(DIST_DIR, fileName);
      fs.writeFileSync(filePath, html);
      console.log(`  ✓ ${fileName}`);
    }

    // Write metadata as JSON (lightweight)
    const metaPath = path.join(DIST_DIR, 'metadata.json');
    const metaData = {
      totalPins: allPins.length,
      totalPages,
      pinsPerPage: PINS_PER_PAGE,
      tags: metadata.tags,
      categories: metadata.categories,
    };
    fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2));
    console.log(`📋 Wrote ${metaPath}`);

    console.log('✨ Build complete!');
  } catch (err) {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
  }
})();
