const groupsRoot = document.querySelector('#product-groups');
const categoriesRoot = document.querySelector('#categories');
const searchInput = document.querySelector('#search');
const count = document.querySelector('#item-count');
let products = [];
let activeCategory = 'All the good stuff';

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

function safeExternalLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '#';
  } catch { return '#'; }
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
  const article = document.createElement('section');
  article.className = 'product-card';
  article.id = product.sectionId;
  article.dataset.category = product.category;
  const visual = document.createElement('div');
  visual.className = `product-visual ${product.color || 'mint'}`;
  const tag = document.createElement('span'); tag.className = 'product-tag'; tag.textContent = product.tag || product.category;
  const emoji = document.createElement('span'); emoji.className = 'product-emoji'; emoji.setAttribute('aria-hidden', 'true'); emoji.textContent = product.emoji || '♡';
  visual.append(tag, emoji);
  const details = document.createElement('div'); details.className = 'product-details';
  const category = document.createElement('p'); category.className = 'product-category'; category.textContent = product.category;
  const title = document.createElement('h3'); title.textContent = product.title;
  const description = document.createElement('p'); description.className = 'product-description'; description.textContent = product.description;
  const link = document.createElement('a'); link.className = 'product-link'; link.href = safeExternalLink(product.link); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Learn more with Wikipedia'; link.setAttribute('aria-label', `Learn more about ${product.title} with Wikipedia (opens in a new tab)`);
  const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; link.append(arrow);
  const actions = document.createElement('div'); actions.className = 'product-actions';
  const qrLink = document.createElement('button'); qrLink.className = 'copy-link-button'; qrLink.type = 'button'; qrLink.textContent = 'Copy QR link'; qrLink.setAttribute('aria-label', `Copy direct link to ${product.title}`);
  qrLink.addEventListener('click', async () => {
    const directUrl = new URL(location.href);
    directUrl.hash = product.sectionId;
    try {
      await navigator.clipboard.writeText(directUrl.href);
      qrLink.textContent = 'Link copied!';
      window.setTimeout(() => { qrLink.textContent = 'Copy QR link'; }, 1800);
    } catch {
      window.prompt('Copy this direct product link for your QR code:', directUrl.href);
    }
  });
  actions.append(link, qrLink);
  details.append(category, title, description, actions); article.append(visual, details);
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
fetch('products.json').then(response => { if (!response.ok) throw new Error('Could not load product list'); return response.json(); })
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
