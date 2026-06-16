// ======================================================
// ADMIN LAYOUT — Sidebar + Topbar wrapper
// ======================================================
import { navigate, getParams } from '../../router.js';
import { signOutAdmin, getAdminSession } from '../../supabase.js';
import { supabase } from '../../supabase.js';

const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { path: '/admin/products', label: 'Produtos', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>` },
  { path: '/admin/orders', label: 'Pedidos', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, badge: true },
  { path: '/admin/customers', label: 'Clientes', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { path: '/admin/reports', label: 'Relatórios', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>` },
];

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) { navigate('/admin'); return false; }
  return true;
}

export function renderAdminLayout(container, title, renderContent) {
  container.innerHTML = '';
  container.className = '';
  document.body.style.padding = '0';

  const { path } = getParams();

  container.innerHTML = `
    <div class="admin-layout">
      <div class="sidebar-overlay" id="sidebar-overlay"></div>

      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div style="background: white; padding: 12px 10px; border-radius: 8px; text-align: center; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
              <img src="/logo.png" alt="Croxiatti Imports" style="height: 45px; object-fit: contain;" />
            </div>
            <span style="font-size: 0.75rem; letter-spacing: 0.1em; text-align: center; color: rgba(255,255,255,0.6);">PAINEL ADMINISTRATIVO</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${NAV.map(n => `
            <a class="sidebar-nav-item ${path === n.path ? 'active' : ''}" data-path="${n.path}" href="#${n.path}">
              ${n.icon}
              ${n.label}
              ${n.badge ? `<span class="sidebar-notification-badge" id="pending-badge" style="display:none">0</span>` : ''}
            </a>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-nav-item btn-full" id="sidebar-store-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Ver Loja
          </button>
          <button class="sidebar-nav-item btn-full" id="sidebar-logout-btn" style="margin-top:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </aside>

      <div class="admin-main">
        <div class="admin-topbar">
          <div style="display:flex;align-items:center;gap:12px">
            <button class="menu-toggle btn btn-ghost btn-icon" id="menu-toggle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span class="admin-topbar-title">${title}</span>
          </div>
          <div class="admin-topbar-actions">
            <button class="admin-notification-btn btn btn-ghost btn-icon" id="notif-btn" title="Notificações">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="admin-notification-badge" id="notif-badge"></span>
            </button>
          </div>
        </div>
        <div class="admin-content" id="admin-content"></div>
      </div>
    </div>
  `;

  // Mobile sidebar toggle
  const sidebar = container.querySelector('#admin-sidebar');
  const overlay = container.querySelector('#sidebar-overlay');
  container.querySelector('#menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Nav clicks
  container.querySelectorAll('.sidebar-nav-item[data-path]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      navigate(item.dataset.path);
    });
  });

  container.querySelector('#sidebar-store-btn').addEventListener('click', () => {
    document.body.style.padding = '';
    navigate('/');
  });

  container.querySelector('#sidebar-logout-btn').addEventListener('click', async () => {
    await signOutAdmin();
    document.body.style.padding = '';
    navigate('/admin');
  });

  // Load pending orders count
  loadPendingCount();

  // Real-time subscription for new orders
  if (window._adminOrderSub) {
    supabase.removeChannel(window._adminOrderSub);
  }
  
  const sub = supabase
    .channel('pedidos-realtime-' + Date.now())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, () => {
      loadPendingCount();
      showNewOrderAlert();
    })
    .subscribe();
    
  window._adminOrderSub = sub;

  // Render content
  const contentEl = container.querySelector('#admin-content');
  renderContent(contentEl);

  return {
    cleanup: () => {
      supabase.removeChannel(sub);
      document.body.style.padding = '';
    }
  };
}

async function loadPendingCount() {
  const { count } = await supabase
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pendente');

  const badge = document.getElementById('pending-badge');
  const notifBadge = document.getElementById('notif-badge');

  if (badge) {
    badge.textContent = count || 0;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  if (notifBadge) {
    notifBadge.classList.toggle('show', count > 0);
  }
}

function showNewOrderAlert() {
  const alert = document.createElement('div');
  alert.style.cssText = `position:fixed;top:80px;right:20px;z-index:9999;background:var(--gold);color:white;padding:14px 20px;border-radius:12px;box-shadow:0 8px 32px rgba(200,155,60,.4);font-weight:500;font-size:.9rem;display:flex;align-items:center;gap:8px;animation:slideInToast .3s ease`;
  alert.innerHTML = `🔔 Novo pedido recebido!`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}
