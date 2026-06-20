// ======================================================
// ADMIN CUSTOMERS PAGE
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { formatCurrency } from '../../components/productCard.js';
import { openModal } from '../../components/modal.js';

export async function renderAdminCustomers(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Clientes', async (content) => {
    content.innerHTML = `
      <div class="admin-table-wrap">
        <div class="admin-table-header">
          <input type="search" class="form-input" id="cust-search" placeholder="Buscar cliente..." style="max-width:280px;padding:8px 14px;font-size:.85rem" />
          <span id="cust-count" class="text-sm text-muted"></span>
        </div>
        <div id="customers-table-wrap"></div>
      </div>
    `;

    const load = async (q = '') => {
      const wrap = content.querySelector('#customers-table-wrap');
      wrap.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)">Carregando...</div>';

      let query = supabase
        .from('clientes')
        .select(`id, nome, telefone, endereco, created_at,
          pedidos(id, valor_total, status)`)
        .order('created_at', { ascending: false });
      if (q) query = query.ilike('nome', `%${q}%`);

      const { data, count: _ } = await query;
      const clientes = data || [];

      const countEl = content.querySelector('#cust-count');
      if (countEl) countEl.textContent = `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`;

      if (!clientes.length) {
        wrap.innerHTML = '<div class="admin-table-empty">Nenhum cliente encontrado</div>';
        return;
      }

      wrap.innerHTML = `
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead>
              <tr><th>Nome</th><th>WhatsApp</th><th>Endereço</th><th>Pedidos</th><th>Total Gasto</th><th>Ações</th></tr>
            </thead>
            <tbody>
              ${clientes.map(c => {
                const pedidos = c.pedidos || [];
                const totalGasto = pedidos.reduce((s, p) => s + (p.valor_total || 0), 0);
                return `
                  <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${formatPhone(c.telefone)}</td>
                    <td><span class="text-sm text-muted" style="max-width:200px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.endereco || '—'}</span></td>
                    <td><span class="badge badge-outline">${pedidos.length}</span></td>
                    <td><strong>${formatCurrency(totalGasto)}</strong></td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="btn btn-sm btn-outline view-orders-btn" data-id="${c.id}" data-nome="${c.nome}">Ver Pedidos</button>
                        <a href="https://wa.me/55${c.telefone}" target="_blank" class="btn btn-sm btn-whatsapp" style="padding:6px 10px;font-size:.75rem;border-radius:6px">WhatsApp</a>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      wrap.querySelectorAll('.view-orders-btn').forEach(btn => {
        btn.addEventListener('click', () => showCustomerOrders(btn.dataset.id, btn.dataset.nome));
      });
    };

    let debounce;
    content.querySelector('#cust-search').addEventListener('input', e => {
      clearTimeout(debounce);
      debounce = setTimeout(() => load(e.target.value), 300);
    });

    load();
  });
}

async function showCustomerOrders(clienteId, nome) {
  const { data } = await supabase
    .from('pedidos')
    .select(`id, valor_total, status, created_at,
      pedido_itens(quantidade, valor_unitario, produtos(nome))`)
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  const pedidos = data || [];
  const statusLabel = { 
    'recebido': '📦 Recebido', 
    'aguardando_pagamento': '⏳ Aguardando Pagamento', 
    'pago': '💵 Pago', 
    'em_separacao': '🛒 Em Separação', 
    'enviado': '🚚 Enviado', 
    'entregue': '🎉 Entregue', 
    'cancelado': '❌ Cancelado',
    'pendente': '⏳ Aguardando Pagamento',
    'aceito': '🛒 Em Separação'
  };
  const statusCls = { 
    'recebido': 'badge-outline', 
    'aguardando_pagamento': 'badge-warning', 
    'pago': 'badge-success', 
    'em_separacao': 'badge-info', 
    'enviado': 'badge-info', 
    'entregue': 'badge-success', 
    'cancelado': 'badge-error',
    'pendente': 'badge-warning',
    'aceito': 'badge-info'
  };

  const body = pedidos.length === 0
    ? '<div class="empty-state" style="padding:32px"><div class="icon">📋</div><p>Nenhum pedido encontrado</p></div>'
    : pedidos.map(p => `
        <div style="border:1px solid var(--gray-200);border-radius:12px;padding:16px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:.8rem;color:var(--gray-400)">
              #${p.id.slice(0,8).toUpperCase()} · ${new Date(p.created_at).toLocaleDateString('pt-BR')}
            </span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <select class="form-select status-select" data-id="${p.id}" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; border-color: var(--gray-200);">
                <option value="recebido" ${['recebido'].includes(p.status) ? 'selected' : ''}>Recebido</option>
                <option value="aguardando_pagamento" ${['aguardando_pagamento', 'pendente'].includes(p.status) ? 'selected' : ''}>Aguard. Pagamento</option>
                <option value="pago" ${['pago'].includes(p.status) ? 'selected' : ''}>Pago</option>
                <option value="em_separacao" ${['em_separacao', 'aceito'].includes(p.status) ? 'selected' : ''}>Em Separação</option>
                <option value="enviado" ${['enviado'].includes(p.status) ? 'selected' : ''}>Enviado</option>
                <option value="entregue" ${['entregue'].includes(p.status) ? 'selected' : ''}>Entregue</option>
                <option value="cancelado" ${['cancelado'].includes(p.status) ? 'selected' : ''}>Cancelado</option>
              </select>
              <span class="badge ${statusCls[p.status] || 'badge-outline'}">${statusLabel[p.status] || p.status}</span>
            </div>
          </div>
          <div style="font-size:.85rem;color:var(--gray-600);margin-bottom:10px">
            ${(p.pedido_itens || []).map(it => `${it.produtos?.nome} × ${it.quantidade} — ${formatCurrency(it.valor_unitario * it.quantidade)}`).join('<br>')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--gray-100);padding-top:10px">
            <span style="font-weight:500">Total</span>
            <strong style="font-family:var(--font-serif);color:var(--gold-dark)">${formatCurrency(p.valor_total)}</strong>
          </div>
        </div>
      `).join('');

  openModal({ title: `Pedidos de ${nome}`, body, maxWidth: '560px' });

  // Add event listeners for the selects
  setTimeout(() => {
    const selects = document.querySelectorAll('.modal-content .status-select');
    selects.forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        select.disabled = true;
        
        const { error } = await supabase.from('pedidos').update({ status: newStatus }).eq('id', id);
        
        select.disabled = false;
        
        if (error) {
          import('../../components/toast.js').then(({ showToast }) => showToast('Erro ao atualizar status', 'error'));
        } else {
          import('../../components/toast.js').then(({ showToast }) => showToast('Status atualizado!', 'success'));
          // Reload the modal content to show new badge
          document.querySelector('.modal-overlay')?.remove();
          showCustomerOrders(clienteId, nome);
        }
      });
    });
  }, 100);
}

function formatPhone(tel) {
  const d = (tel || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return tel;
}
