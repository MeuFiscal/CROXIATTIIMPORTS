// ======================================================
// ADMIN DASHBOARD
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { formatCurrency } from '../../components/productCard.js';
import { confirmModal } from '../../components/modal.js';
import Chart from 'chart.js/auto';

export async function renderDashboard(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Dashboard', async (content) => {
    content.innerHTML = `
      <div style="display:flex; justify-content:flex-end; margin-bottom: 20px;">
        <button id="btn-reset-dashboard" class="btn" style="background: var(--error); color: white; border: none; padding: 10px 16px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:8px;vertical-align:middle"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Zerar Dashboard
        </button>
      </div>
      <div class="stat-grid" id="stat-grid">
        ${Array(6).fill('<div class="stat-card"><div class="stat-info"><div class="skeleton" style="height:12px;width:80px;margin-bottom:10px"></div><div class="skeleton" style="height:32px;width:60px"></div></div></div>').join('')}
      </div>
      <div class="chart-grid" id="chart-grid">
        <div class="chart-card"><div class="chart-header"><span class="chart-title">Pedidos por Dia (últimos 7 dias)</span></div><div class="chart-canvas-wrap"><canvas id="orders-chart"></canvas></div></div>
        <div class="chart-card"><div class="chart-header"><span class="chart-title">Produtos Mais Vendidos</span></div><div class="chart-canvas-wrap"><canvas id="top-products-chart"></canvas></div></div>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header">
          <span style="font-weight:500">Estoque Baixo</span>
          <span class="badge badge-warning" id="low-stock-count">Carregando...</span>
        </div>
        <table class="admin-table" id="low-stock-table">
          <thead><tr><th>Produto</th><th>Marca</th><th>Estoque</th><th>Ação</th></tr></thead>
          <tbody id="low-stock-body"><tr><td colspan="4" class="admin-table-empty">Carregando...</td></tr></tbody>
        </table>
      </div>
    `;

    const [stats, ordersChart, topProducts, lowStock] = await Promise.all([
      fetchStats(),
      fetchOrdersLast7Days(),
      fetchTopProducts(),
      fetchLowStock()
    ]);

    renderStats(content, stats);
    renderOrdersChart(ordersChart);
    renderTopChart(topProducts);
    renderLowStock(content, lowStock);

    content.querySelector('#btn-reset-dashboard').addEventListener('click', async () => {
      const confirmed = await confirmModal({
        title: 'Zerar Dashboard',
        message: 'Deseja realmente apagar todos os clientes e pedidos? Esta ação apagará permanentemente esses dados do aplicativo e do banco de dados.',
        confirmText: 'Sim, Zerar Tudo',
        cancelText: 'Cancelar',
        danger: true
      });
      
      if (confirmed) {
        const btn = content.querySelector('#btn-reset-dashboard');
        btn.innerHTML = '<span class="loader-ring" style="width:16px;height:16px;border-width:2px;vertical-align:middle;margin-right:8px"></span> Zerando...';
        btn.disabled = true;

        // The 'neq' filter matches all records
        await supabase.from('pedido_itens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        window.location.reload();
      }
    });
  });
}

async function fetchStats() {
  const [produtos, clientes, pedidos, pendente, aceito, entregue] = await Promise.all([
    supabase.from('produtos').select('id', { count: 'exact', head: true }),
    supabase.from('clientes').select('id', { count: 'exact', head: true }),
    supabase.from('pedidos').select('id,valor_total'),
    supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('status', 'aceito'),
    supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('status', 'entregue'),
  ]);
  const receita = (pedidos.data || []).reduce((s, p) => s + (p.valor_total || 0), 0);
  return {
    produtos: produtos.count || 0,
    clientes: clientes.count || 0,
    totalPedidos: (pedidos.data || []).length,
    pendente: pendente.count || 0,
    aceito: aceito.count || 0,
    entregue: entregue.count || 0,
    receita
  };
}

async function fetchOrdersLast7Days() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const since = days[0] + 'T00:00:00Z';
  const { data } = await supabase.from('pedidos').select('created_at').gte('created_at', since);
  const counts = days.map(day => (data || []).filter(p => p.created_at.slice(0,10) === day).length);
  return { days: days.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })), counts };
}

async function fetchTopProducts() {
  const { data } = await supabase.from('produtos').select('nome,total_pedidos').gt('total_pedidos', 0).order('total_pedidos', { ascending: false }).limit(8);
  return data || [];
}

async function fetchLowStock() {
  const { data } = await supabase.from('produtos').select('id,nome,marca,quantidade,apenas_encomenda').eq('apenas_encomenda', false).lte('quantidade', 5).order('quantidade');
  return data || [];
}

function renderStats(content, s) {
  const grid = content.querySelector('#stat-grid');
  const items = [
    { label: 'Total de Produtos', value: s.produtos, icon: '📦', cls: 'stat-icon-gold' },
    { label: 'Clientes', value: s.clientes, icon: '👥', cls: 'stat-icon-dark' },
    { label: 'Total de Pedidos', value: s.totalPedidos, icon: '📋', cls: 'stat-icon-gold' },
    { label: 'Pedidos Pendentes', value: s.pendente, icon: '⏳', cls: 'stat-icon-warning' },
    { label: 'Pedidos Entregues', value: s.entregue, icon: '✅', cls: 'stat-icon-success' },
    { label: 'Receita Estimada', value: formatCurrency(s.receita), icon: '💰', cls: 'stat-icon-gold' },
  ];
  grid.innerHTML = items.map(item => `
    <div class="stat-card">
      <div class="stat-info">
        <div class="stat-label">${item.label}</div>
        <div class="stat-value">${item.value}</div>
      </div>
      <div class="stat-icon ${item.cls}">${item.icon}</div>
    </div>
  `).join('');
}

function renderOrdersChart({ days, counts }) {
  const ctx = document.getElementById('orders-chart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Pedidos',
        data: counts,
        borderColor: '#C89B3C',
        backgroundColor: 'rgba(200,155,60,.1)',
        borderWidth: 2,
        pointBackgroundColor: '#C89B3C',
        pointRadius: 4,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,.05)' } }
      }
    }
  });
}

function renderTopChart(data) {
  const ctx = document.getElementById('top-products-chart');
  if (!ctx || !data.length) { ctx && (ctx.parentElement.innerHTML = '<div class="empty-state" style="height:200px"><div class="icon">📊</div><p>Nenhum dado disponível</p></div>'); return; }
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.nome.length > 18 ? d.nome.slice(0,18) + '…' : d.nome),
      datasets: [{
        label: 'Encomendas',
        data: data.map(d => d.total_pedidos),
        backgroundColor: data.map((_, i) => i === 0 ? '#C89B3C' : i === 1 ? '#A6761D' : 'rgba(200,155,60,.35)'),
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,.05)' } }
      }
    }
  });
}

function renderLowStock(content, data) {
  const countBadge = content.querySelector('#low-stock-count');
  const tbody = content.querySelector('#low-stock-body');
  if (countBadge) countBadge.textContent = `${data.length} produto${data.length !== 1 ? 's' : ''}`;
  if (!tbody) return;
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="4" class="admin-table-empty" style="color:var(--success)">✓ Nenhum produto com estoque crítico</td></tr>'; return; }
  tbody.innerHTML = data.map(p => `
    <tr>
      <td><strong>${p.nome}</strong></td>
      <td><span class="text-muted text-sm">${p.marca || '—'}</span></td>
      <td><span class="badge ${p.quantidade === 0 ? 'badge-error' : 'badge-warning'}">${p.quantidade} un.</span></td>
      <td><a href="#/admin/products" class="btn btn-sm btn-outline" onclick="event.preventDefault();window.location.hash='/admin/products'">Editar</a></td>
    </tr>
  `).join('');
}
