// ======================================================
// ADMIN REPORTS PAGE
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { formatCurrency } from '../../components/productCard.js';
import Chart from 'chart.js/auto';

export async function renderAdminReports(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Relatórios', async (content) => {
    content.innerHTML = `
      <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap" id="report-period-btns">
        <button class="chip active" data-period="week">Esta Semana</button>
        <button class="chip" data-period="month">Este Mês</button>
        <button class="chip" data-period="all">Todo o Período</button>
      </div>

      <div class="stat-grid" id="report-stats" style="margin-bottom:24px">
        ${Array(4).fill('<div class="stat-card"><div class="stat-info"><div class="skeleton" style="height:12px;width:80px;margin-bottom:10px"></div><div class="skeleton" style="height:32px;width:60px"></div></div></div>').join('')}
      </div>

      <div class="chart-grid" style="margin-bottom:24px">
        <div class="chart-card">
          <div class="chart-header"><span class="chart-title">Vendas por Dia</span></div>
          <div class="chart-canvas-wrap"><canvas id="sales-day-chart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-header"><span class="chart-title">Status dos Pedidos</span></div>
          <div class="chart-canvas-wrap"><canvas id="status-chart"></canvas></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px" class="report-tables">
        <div class="admin-table-wrap">
          <div class="admin-table-header"><span style="font-weight:500">Produtos Mais Vendidos</span></div>
          <table class="admin-table" id="top-prod-table">
            <thead><tr><th>#</th><th>Produto</th><th>Marca</th><th>Encomendas</th></tr></thead>
            <tbody id="top-prod-body"><tr><td colspan="4" class="admin-table-empty">Carregando...</td></tr></tbody>
          </table>
        </div>
        <div class="admin-table-wrap">
          <div class="admin-table-header"><span style="font-weight:500">Clientes que Mais Compram</span></div>
          <table class="admin-table" id="top-cust-table">
            <thead><tr><th>#</th><th>Cliente</th><th>Pedidos</th><th>Total</th></tr></thead>
            <tbody id="top-cust-body"><tr><td colspan="4" class="admin-table-empty">Carregando...</td></tr></tbody>
          </table>
        </div>
      </div>
    `;

    let currentPeriod = 'week';
    let chartInstances = {};

    const load = async () => {
      const now = new Date();
      let since = null;
      if (currentPeriod === 'week') {
        since = new Date(now); since.setDate(now.getDate() - 6);
      } else if (currentPeriod === 'month') {
        since = new Date(now); since.setDate(1);
      }
      const sinceStr = since ? since.toISOString() : null;

      let q = supabase.from('pedidos').select(`id, valor_total, status, created_at,
        pedido_itens(quantidade, produto_id, produtos(nome, marca)),
        clientes(nome)`);
      if (sinceStr) q = q.gte('created_at', sinceStr);

      const { data: pedidos } = await q;
      const all = pedidos || [];

      // Stats
      const totalReceita = all.reduce((s, p) => s + (p.valor_total || 0), 0);
      const concluidos = all.filter(p => p.status === 'entregue').length;
      const pendentes = all.filter(p => p.status === 'pendente').length;

      const statsEl = content.querySelector('#report-stats');
      statsEl.innerHTML = [
        { label: 'Total de Pedidos', value: all.length, icon: '📋', cls: 'stat-icon-gold' },
        { label: 'Receita Estimada', value: formatCurrency(totalReceita), icon: '💰', cls: 'stat-icon-dark' },
        { label: 'Pedidos Concluídos', value: concluidos, icon: '✅', cls: 'stat-icon-success' },
        { label: 'Pedidos Pendentes', value: pendentes, icon: '⏳', cls: 'stat-icon-warning' },
      ].map(s => `
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value">${s.value}</div>
          </div>
          <div class="stat-icon ${s.cls}">${s.icon}</div>
        </div>
      `).join('');

      // Sales by day chart
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });
      const salesPerDay = days.map(day => {
        const dayPedidos = all.filter(p => p.created_at.slice(0,10) === day);
        return dayPedidos.reduce((s, p) => s + (p.valor_total || 0), 0);
      });
      const dayLabels = days.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }));

      if (chartInstances.salesDay) chartInstances.salesDay.destroy();
      const ctx1 = document.getElementById('sales-day-chart');
      if (ctx1) {
        chartInstances.salesDay = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: dayLabels,
            datasets: [{
              label: 'Receita (R$)',
              data: salesPerDay,
              backgroundColor: 'rgba(200,155,60,.7)',
              borderColor: '#C89B3C',
              borderWidth: 1,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v.toLocaleString('pt-BR'), font: { size: 11 } }, grid: { color: 'rgba(0,0,0,.05)' } },
              x: { grid: { display: false }, ticks: { font: { size: 10 } } }
            }
          }
        });
      }

      // Status pie chart
      const statusCounts = {
        pendente: all.filter(p => p.status === 'pendente').length,
        aceito: all.filter(p => p.status === 'aceito').length,
        entregue: all.filter(p => p.status === 'entregue').length,
      };
      if (chartInstances.status) chartInstances.status.destroy();
      const ctx2 = document.getElementById('status-chart');
      if (ctx2) {
        chartInstances.status = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['Pendente', 'Aceito', 'Entregue'],
            datasets: [{
              data: [statusCounts.pendente, statusCounts.aceito, statusCounts.entregue],
              backgroundColor: ['#C8842A', '#3A6EA5', '#2D7A4F'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
            cutout: '65%'
          }
        });
      }

      // Top products
      const prodMap = {};
      all.forEach(p => (p.pedido_itens || []).forEach(it => {
        const key = it.produto_id;
        if (!prodMap[key]) prodMap[key] = { nome: it.produtos?.nome, marca: it.produtos?.marca, qty: 0 };
        prodMap[key].qty += it.quantidade;
      }));
      const topProds = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 8);
      const tbody1 = content.querySelector('#top-prod-body');
      if (tbody1) {
        tbody1.innerHTML = topProds.length ? topProds.map((p, i) => `
          <tr>
            <td><span class="badge ${i === 0 ? 'badge-gold' : 'badge-outline'}">${i + 1}</span></td>
            <td style="font-weight:500;font-size:.88rem">${p.nome || '—'}</td>
            <td><span class="text-xs text-muted">${p.marca || '—'}</span></td>
            <td><strong>${p.qty}</strong></td>
          </tr>
        `).join('') : '<tr><td colspan="4" class="admin-table-empty">Sem dados</td></tr>';
      }

      // Top customers
      const custMap = {};
      all.forEach(p => {
        const nome = p.clientes?.nome;
        if (!nome) return;
        if (!custMap[nome]) custMap[nome] = { nome, pedidos: 0, total: 0 };
        custMap[nome].pedidos++;
        custMap[nome].total += p.valor_total || 0;
      });
      const topCusts = Object.values(custMap).sort((a, b) => b.total - a.total).slice(0, 8);
      const tbody2 = content.querySelector('#top-cust-body');
      if (tbody2) {
        tbody2.innerHTML = topCusts.length ? topCusts.map((c, i) => `
          <tr>
            <td><span class="badge ${i === 0 ? 'badge-gold' : 'badge-outline'}">${i + 1}</span></td>
            <td style="font-weight:500;font-size:.88rem">${c.nome}</td>
            <td>${c.pedidos}</td>
            <td><strong>${formatCurrency(c.total)}</strong></td>
          </tr>
        `).join('') : '<tr><td colspan="4" class="admin-table-empty">Sem dados</td></tr>';
      }
    };

    content.querySelectorAll('#report-period-btns .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        content.querySelectorAll('#report-period-btns .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentPeriod = chip.dataset.period;
        load();
      });
    });

    // Responsive table on mobile
    const style = document.createElement('style');
    style.textContent = `@media(max-width:700px){.report-tables{grid-template-columns:1fr!important}}`;
    content.appendChild(style);

    load();
  });
}
