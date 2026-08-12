// Toast notification helper
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Get URL parameters
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    tag: params.get('tag'),
    category: params.get('category'),
    search: params.get('search'),
  };
}

// Update URL without page reload
function updateURL(tag = '', category = '') {
  const url = new URL(window.location);
  if (tag) url.searchParams.set('tag', tag);
  else url.searchParams.delete('tag');
  if (category) url.searchParams.set('category', category);
  else url.searchParams.delete('category');
  window.history.pushState({}, '', url);
}

// Filter logic (client-side, only for current page)
const categoryFilter = document.getElementById('category-filter');
const tagFilter = document.getElementById('tag-filter');
const searchInput = document.getElementById('search-input');
const resetBtn = document.getElementById('reset-filters');
const clearBtn = document.getElementById('clear-filters');
const pins = document.querySelectorAll('.pin');

// Load filters from URL
const urlParams = getURLParams();
if (categoryFilter && urlParams.category) {
  categoryFilter.value = urlParams.category;
}
if (tagFilter && urlParams.tag) {
  tagFilter.value = urlParams.tag;
}
if (searchInput && urlParams.search) {
  searchInput.value = urlParams.search;
}

// Filter pins
function applyFilters() {
  const selectedCategory = categoryFilter?.value || '';
  const selectedTag = tagFilter?.value || '';
  const searchQuery = searchInput?.value.toLowerCase().trim() || '';

  let visibleCount = 0;

  pins.forEach((pin) => {
    const pinCategory = pin.querySelector('.pin-category')?.textContent.trim() || '';
    const pinTags = Array.from(pin.querySelectorAll('.tag')).map(t => t.textContent.trim());
    const pinText = `${pin.querySelector('.pin-title')?.textContent || ''} ${pin.querySelector('.pin-description')?.textContent || ''}`.toLowerCase();

    const matchCategory = !selectedCategory || pinCategory === selectedCategory;
    const matchTag = !selectedTag || pinTags.includes(selectedTag);
    const matchSearch = !searchQuery || pinText.includes(searchQuery);

    if (matchCategory && matchTag && matchSearch) {
      pin.classList.remove('hidden');
      visibleCount++;
    } else {
      pin.classList.add('hidden');
    }
  });

  // Show/hide buttons
  if (clearBtn) clearBtn.style.display = selectedCategory || selectedTag || searchQuery ? 'block' : 'none';
  if (resetBtn) resetBtn.style.display = selectedCategory || selectedTag ? 'block' : 'none';

  if (visibleCount === 0 && (selectedCategory || selectedTag || searchQuery)) {
    showToast('no pins match your filters', 2000);
  }
}

// Event listeners
if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    updateURL(tagFilter?.value || '', categoryFilter.value);
    applyFilters();
  });
}

if (tagFilter) {
  tagFilter.addEventListener('change', () => {
    updateURL(tagFilter.value, categoryFilter?.value || '');
    applyFilters();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    applyFilters();
  });
}

// Clear filters
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    applyFilters();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (categoryFilter) categoryFilter.value = '';
    if (tagFilter) tagFilter.value = '';
    updateURL('', '');
    applyFilters();
  });
}

// Click tag/category to filter
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tag')) {
    e.preventDefault();
    const tagName = e.target.textContent.trim();
    if (tagFilter) {
      tagFilter.value = tagName;
      tagFilter.dispatchEvent(new Event('change'));
    }
  }

  if (e.target.classList.contains('pin-category')) {
    e.preventDefault();
    const catName = e.target.textContent.trim();
    if (categoryFilter) {
      categoryFilter.value = catName;
      categoryFilter.dispatchEvent(new Event('change'));
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInput) searchInput.focus();
  }

  // Escape to clear search
  if (e.key === 'Escape') {
    if (searchInput && searchInput.value) {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
    }
  }
});

// Apply initial filters
applyFilters();

console.log('📌 Pinterest board loaded with filters');
