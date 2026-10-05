const groupsRoot = document.querySelector('#product-groups');
const categoriesRoot = document.querySelector('#categories');
const searchInput = document.querySelector('#search');
const count = document.querySelector('#item-count');
let products = [];
let activeCategory = 'All the good stuff';
const productLanguages = new Map();
try {
  const savedLanguages = JSON.parse(localStorage.getItem('pearl-product-search-languages') || '{}');
  Object.entries(savedLanguages).forEach(([id, language]) => { if (language === 'ml') productLanguages.set(id, 'ml'); });
} catch {}

function localizedGoogleHref(sourceUrl, product, language = 'en') {
  const petType = (product.category || '').replace(/^For\s+/i, '');
  const query = [product.title, petType].filter(Boolean).join(' ');
  const url = new URL(sourceUrl || 'https://www.google.com/search');
  if (!url.searchParams.has('q')) url.searchParams.set('q', query);
  url.searchParams.set('hl', language);
  if (language === 'ml') url.searchParams.set('lr', 'lang_ml');
  else url.searchParams.delete('lr');
  return url.href;
}

function googleSearchHref(product, language = 'en') {
  return localizedGoogleHref(product.googleSearchUrl, product, language);
}

function displayProduct(product, language) {
  return language === 'ml' && product.ml ? { ...product, ...product.ml } : product;
}

function showProductFromHash() {
  const sectionId = decodeURIComponent(location.hash.slice(1));
  if (!sectionId || !products.some(product => product.sectionId === sectionId)) {
    document.body.classList.remove('product-focus');
    return;
  }
  activeCategory = 'All the good stuff';
  document.body.classList.add('product-focus');
  renderCategories();
  renderProducts();
  requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ block: 'start' }));
}

function renderCategories() {
  const categories = ['All the good stuff', ...new Set(products.map(item => item.category))];
  categoriesRoot.replaceChildren(...categories.map(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-chip${category === activeCategory ? ' is-active' : ''}`;
    button.textContent = category;
    button.setAttribute('aria-pressed', String(category === activeCategory));
    button.addEventListener('click', () => { activeCategory = category; renderCategories(); renderProducts(); });
    return button;
  }));
}

function makeProductCard(product) {
  const selectedLanguage = productLanguages.get(product.id) || 'en';
  const localizedProduct = displayProduct(product, selectedLanguage);
  const article = document.createElement('section');
  article.className = 'product-card';
  article.id = product.sectionId;
  article.dataset.category = product.category;
  const visual = document.createElement('div');
  visual.className = `product-visual ${product.color || 'mint'}`;
  const tag = document.createElement('span'); tag.className = 'product-tag'; tag.textContent = localizedProduct.tag || localizedProduct.category;
  const copyLink = document.createElement('button');
  copyLink.type = 'button';
  copyLink.className = 'copy-product-link';
  copyLink.setAttribute('aria-label', `Copy direct link to ${product.title}`);
  copyLink.title = 'Copy product link';
  copyLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';
  copyLink.addEventListener('click', async () => {
    const directUrl = new URL(location.href);
    directUrl.hash = product.sectionId;
    try {
      await navigator.clipboard.writeText(directUrl.href);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = directUrl.href;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.append(fallback);
      fallback.select();
      try { document.execCommand('copy'); } catch {}
      fallback.remove();
    }
    copyLink.classList.add('is-copied');
    copyLink.setAttribute('aria-label', `Product link copied for ${product.title}`);
    window.setTimeout(() => {
      copyLink.classList.remove('is-copied');
      copyLink.setAttribute('aria-label', `Copy direct link to ${product.title}`);
    }, 1800);
  });
  const emoji = document.createElement('span'); emoji.className = 'product-emoji'; emoji.setAttribute('aria-hidden', 'true'); emoji.textContent = product.emoji || '♡';
  if (product.image) {
    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = localizedProduct.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => image.replaceWith(emoji), { once: true });
    visual.append(tag, copyLink, image);
  } else {
    visual.append(tag, copyLink, emoji);
  }
  const details = document.createElement('div'); details.className = 'product-details';
  const category = document.createElement('p'); category.className = 'product-category'; category.textContent = localizedProduct.category;
  const title = document.createElement('h3'); title.textContent = localizedProduct.title;
  const titleRow = document.createElement('div'); titleRow.className = 'product-title-row';
  const description = document.createElement('p'); description.className = 'product-description'; description.textContent = localizedProduct.description;
  const link = document.createElement('a'); link.className = 'product-link'; link.href = googleSearchHref(product, selectedLanguage); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = selectedLanguage === 'ml' ? 'Google-ൽ തിരയുക' : 'Search on Google'; link.setAttribute('aria-label', `Search Google for ${localizedProduct.title} in ${selectedLanguage === 'ml' ? 'Malayalam' : 'English'} (opens in a new tab)`);
  const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; link.append(arrow);
  const actions = document.createElement('div'); actions.className = 'product-actions';
  const languageToggle = document.createElement('button'); languageToggle.className = 'product-language-toggle'; languageToggle.type = 'button'; languageToggle.setAttribute('aria-pressed', String(selectedLanguage === 'ml'));
  languageToggle.textContent = selectedLanguage === 'ml' ? 'മല' : 'EN';
  languageToggle.setAttribute('aria-label', `Google search language for ${product.title}: ${selectedLanguage === 'ml' ? 'Malayalam' : 'English'}. Activate to switch languages`);
  languageToggle.addEventListener('click', () => {
    const nextLanguage = (productLanguages.get(product.id) || 'en') === 'en' ? 'ml' : 'en';
    productLanguages.set(product.id, nextLanguage);
    try { localStorage.setItem('pearl-product-search-languages', JSON.stringify(Object.fromEntries(productLanguages))); } catch {}
    renderProducts();
  });
  titleRow.append(title, languageToggle);
  actions.append(link);
  details.append(category, titleRow, description, actions); article.append(visual, details);
  return article;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const focusedSectionId = document.body.classList.contains('product-focus') ? decodeURIComponent(location.hash.slice(1)) : '';
  const filtered = products.filter(item => (!focusedSectionId || item.sectionId === focusedSectionId) && (activeCategory === 'All the good stuff' || item.category === activeCategory) && `${item.title} ${item.description} ${item.category}`.toLocaleLowerCase().includes(query));
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'lovely find' : 'lovely finds'}`;
  if (!filtered.length) {
    const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = 'No matches just yet. Try another search or category.'; groupsRoot.replaceChildren(empty); return;
  }
  const categoryOrder = [...new Set(filtered.map(item => item.category))];
  const groups = categoryOrder.map((category, index) => {
    const section = document.createElement('section'); section.className = 'product-group';
    const heading = document.createElement('div'); heading.className = 'group-heading';
    const title = document.createElement('h3'); title.textContent = category;
    const anchor = document.createElement('span'); anchor.className = 'group-index'; anchor.textContent = String(index + 1).padStart(2, '0');
    heading.append(title, anchor);
    const grid = document.createElement('div'); grid.className = 'product-grid';
    filtered.filter(item => item.category === category).forEach(item => grid.append(makeProductCard(item)));
    section.append(heading, grid); return section;
  });
  groupsRoot.replaceChildren(...groups);
}

searchInput.addEventListener('input', renderProducts);
fetch('products.json?v=4').then(response => { if (!response.ok) throw new Error('Could not load product list'); return response.json(); })
  .then(data => {
    products = (data.products || []).filter(item => item && item.title && item.description && item.category && item.sectionId);
    renderCategories(); renderProducts();
    showProductFromHash();
  })
  .catch(() => { groupsRoot.innerHTML = '<p class="empty-state">Our product list could not load. Please refresh the page in a moment.</p>'; count.textContent = ''; });

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
}

window.addEventListener('hashchange', () => {
  showProductFromHash();
});
