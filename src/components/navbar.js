// ======================================================
// BOTTOM NAVBAR — Navegação inferior mobile (4 itens)
// ======================================================
import { navigate, getParams } from '../router.js';
import { getCartCount, on } from '../store.js';

const NAV_ITEMS = [
  { path: '/', label: 'Início', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { path: '/search', label: 'Buscar', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
  { path: '/cart', label: 'Carrinho', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`, badge: 'cart' },
  { action: 'menu', label: 'Menu', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>` },
];

let navEl = null;
let lastScrollY = window.scrollY;

function handleScroll() {
  if (!navEl) return;
  const currentY = window.scrollY;
  if (currentY > lastScrollY && currentY - lastScrollY > 10) {
    navEl.style.transform = 'translateY(100%)';
  } else if (currentY < lastScrollY) {
    navEl.style.transform = 'translateY(0)';
  }
  lastScrollY = currentY;
}

export function renderNavbar() {
  if (navEl && document.body.contains(navEl)) return;
  if (navEl && !document.body.contains(navEl)) {
    document.body.appendChild(navEl);
    return;
  }

  navEl = document.createElement('nav');
  navEl.className = 'app-navbar hide-desktop';
  navEl.id = 'app-navbar';
  navEl.style.height = '52px';
  navEl.style.transition = 'transform 0.3s ease';
  updateNavbar();
  document.body.appendChild(navEl);

  on('cartChange', updateNavbar);
  window.addEventListener('hashchange', updateNavbar);
  window.addEventListener('scroll', handleScroll, { passive: true });
}

function updateNavbar() {
  if (!navEl) return;
  const { path } = getParams();
  const cartCount = getCartCount();

  navEl.innerHTML = NAV_ITEMS.map(item => {
    const isNav = !!item.path;
    const active = isNav && (path === item.path || (item.path === '/' && path === ''));
    let badgeHtml = '';
    if (item.badge === 'cart' && cartCount > 0) {
      badgeHtml = `<span class="nav-badge">${cartCount > 9 ? '9+' : cartCount}</span>`;
    }
    if (isNav) {
      return `
        <button class="nav-item ${active ? 'active' : ''}" data-path="${item.path}" aria-label="${item.label}">
          ${item.icon}
          ${badgeHtml}
          <span>${item.label}</span>
        </button>`;
    }
    return `
      <button class="nav-item" data-action="${item.action}" aria-label="${item.label}">
        ${item.icon}
        <span>${item.label}</span>
      </button>`;
  }).join('');

  navEl.querySelectorAll('.nav-item[data-path]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.path));
  });

  const menuBtn = navEl.querySelector('[data-action="menu"]');
  menuBtn?.addEventListener('click', async () => {
    const { openDrawer } = await import('./drawer.js');
    openDrawer();
  });
}
