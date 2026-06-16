// ======================================================
// BOTTOM NAVBAR — Navegação inferior mobile
// ======================================================
import { navigate, getParams } from '../router.js';
import { getCartCount, getFavorites, on } from '../store.js';

const NAV_ITEMS = [
  { path: '/', label: 'Início', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { path: '/search', label: 'Buscar', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
  { path: '/favorites', label: 'Favoritos', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, badge: 'fav' },
  { path: '/cart', label: 'Carrinho', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`, badge: 'cart' },
  { path: '/my-orders', label: 'Pedidos', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>` },
];

let navEl = null;

export function renderNavbar() {
  if (navEl) return;
  navEl = document.createElement('nav');
  navEl.className = 'app-navbar hide-desktop';
  navEl.id = 'app-navbar';
  updateNavbar();
  document.body.appendChild(navEl);

  on('cartChange', updateNavbar);
  on('favsChange', updateNavbar);
  window.addEventListener('hashchange', updateNavbar);
}

function updateNavbar() {
  if (!navEl) return;
  const { path } = getParams();
  const cartCount = getCartCount();
  const favCount = getFavorites().length;

  navEl.innerHTML = NAV_ITEMS.map(item => {
    const active = path === item.path || (item.path === '/' && path === '');
    let badgeHtml = '';
    if (item.badge === 'cart' && cartCount > 0) badgeHtml = `<span class="nav-badge">${cartCount > 9 ? '9+' : cartCount}</span>`;
    if (item.badge === 'fav' && favCount > 0) badgeHtml = `<span class="nav-badge">${favCount > 9 ? '9+' : favCount}</span>`;
    return `
      <button class="nav-item ${active ? 'active' : ''}" data-path="${item.path}" aria-label="${item.label}">
        ${item.icon}
        ${badgeHtml}
        <span>${item.label}</span>
      </button>`;
  }).join('');

  navEl.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.path));
  });
}
