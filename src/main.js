import './kill-sw.js';
// ======================================================
// MAIN.JS — Entry point, CSS imports, Router setup
// ======================================================
import './css/global.css';
import './css/components.css';

import { registerRoute, initRouter } from './router.js';
import { renderHeader } from './components/header.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

const app = document.getElementById('app');

// Customer shell layout
function withShell(renderFn) {
  return async (path) => {
    // Remove admin layout if present
    document.body.style.padding = '';

    // Ensure header exists
    renderHeader(app);

    // Ensure navbar exists
    renderNavbar();

    // Main content area
    let contentEl = document.getElementById('page-content');
    if (!contentEl) {
      contentEl = document.createElement('main');
      contentEl.id = 'page-content';
      contentEl.style.cssText = 'padding-bottom:24px; min-height: 60vh;';
      app.appendChild(contentEl);
    }
    contentEl.innerHTML = '';

    const result = await renderFn(contentEl, path);
    
    // Ensure footer exists
    renderFooter(app);
    
    return result;
  };
}

// Admin shell — no header/navbar
function withAdminShell(renderFn) {
  return async (path) => {
    document.getElementById('app-header')?.remove();
    document.getElementById('app-navbar')?.remove();

    let contentEl = document.getElementById('page-content');
    if (!contentEl) {
      contentEl = document.createElement('main');
      contentEl.id = 'page-content';
      app.appendChild(contentEl);
    }

    const result = await renderFn(contentEl, path);
    return result;
  };
}

// ---- Lazy imports ----
const lazyHome       = () => import('./pages/home.js').then(m => m.renderHome);
const lazySearch     = () => import('./pages/search.js').then(m => m.renderSearch);
const lazyFavorites  = () => import('./pages/favorites.js').then(m => m.renderFavorites);
const lazyCart       = () => import('./pages/cart.js').then(m => m.renderCart);
const lazyCheckout   = () => import('./pages/checkout.js').then(m => m.renderCheckout);
const lazyMyOrders   = () => import('./pages/myOrders.js').then(m => m.renderMyOrders);
const lazyPolicy     = () => import('./pages/policy.js').then(m => m.renderPolicy);
const lazyFaq        = () => import('./pages/faq.js').then(m => m.renderFaq);

const lazyAdminLogin     = () => import('./pages/admin/login.js').then(m => m.renderAdminLogin);
const lazyAdminDash      = () => import('./pages/admin/dashboard.js').then(m => m.renderDashboard);
const lazyAdminProducts  = () => import('./pages/admin/products.js').then(m => m.renderAdminProducts);
const lazyAdminOrders    = () => import('./pages/admin/orders.js').then(m => m.renderAdminOrders);
const lazyAdminEncomendas= () => import('./pages/admin/encomendas.js').then(m => m.renderAdminEncomendas);
const lazyAdminEntregar  = () => import('./pages/admin/entregar.js').then(m => m.renderAdminEntregar);
const lazyAdminCustomers = () => import('./pages/admin/customers.js').then(m => m.renderAdminCustomers);
const lazyAdminReports   = () => import('./pages/admin/reports.js').then(m => m.renderAdminReports);
const lazyAdminDestaques = () => import('./pages/admin/destaques.js').then(m => m.renderAdminDestaques);

// ---- Register customer routes ----
registerRoute('/', withShell(async (el) => {
  const fn = await lazyHome();
  return fn(el);
}));

registerRoute('/search', withShell(async (el) => {
  const fn = await lazySearch();
  return fn(el);
}));

registerRoute('/favorites', withShell(async (el) => {
  const fn = await lazyFavorites();
  return fn(el);
}));

registerRoute('/cart', withShell(async (el) => {
  const fn = await lazyCart();
  return fn(el);
}));

registerRoute('/checkout', withShell(async (el) => {
  const fn = await lazyCheckout();
  return fn(el);
}));

registerRoute('/my-orders', withShell(async (el) => {
  const fn = await lazyMyOrders();
  return fn(el);
}));

registerRoute('/policy', withShell(async (el) => {
  const fn = await lazyPolicy();
  return fn(el);
}));

registerRoute('/faq', withShell(async (el) => {
  const fn = await lazyFaq();
  return fn(el);
}));

// ---- Register admin routes ----
registerRoute('/admin', withAdminShell(async (el) => {
  const fn = await lazyAdminLogin();
  return fn(el);
}));

registerRoute('/admin/dashboard', withAdminShell(async (el) => {
  const fn = await lazyAdminDash();
  return fn(el);
}));

registerRoute('/admin/products', withAdminShell(async (el) => {
  const fn = await lazyAdminProducts();
  return fn(el);
}));

registerRoute('/admin/orders', withAdminShell(async (el) => {
  const fn = await lazyAdminOrders();
  return fn(el);
}));

registerRoute('/admin/encomendas', withAdminShell(async (el) => {
  const fn = await lazyAdminEncomendas();
  return fn(el);
}));

registerRoute('/admin/entregar', withAdminShell(async (el) => {
  const fn = await lazyAdminEntregar();
  return fn(el);
}));

registerRoute('/admin/customers', withAdminShell(async (el) => {
  const fn = await lazyAdminCustomers();
  return fn(el);
}));

registerRoute('/admin/reports', withAdminShell(async (el) => {
  const fn = await lazyAdminReports();
  return fn(el);
}));

registerRoute('/admin/destaques', withAdminShell(async (el) => {
  const fn = await lazyAdminDestaques();
  return fn(el);
}));

// Admin catch-all
registerRoute('/admin/*', withAdminShell(async (el) => {
  const fn = await lazyAdminDash();
  return fn(el);
}));

// 404 fallback
registerRoute('*', withShell(async (el) => {
  el.innerHTML = `
    <div class="container" style="padding-top:48px">
      <div class="empty-state">
        <div class="icon">🔍</div>
        <h3>Página não encontrada</h3>
        <p>A página que você procura não existe.</p>
        <button class="btn btn-primary" onclick="window.location.hash='/'">Voltar à loja</button>
      </div>
    </div>
  `;
}));

// ---- Start router ----
initRouter();
