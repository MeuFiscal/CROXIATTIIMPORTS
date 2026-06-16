// ======================================================
// ADMIN ORDERS PAGE
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { formatCurrency } from '../../components/productCard.js';
import { showToast } from '../../components/toast.js';
import { confirmModal } from '../../components/modal.js';

export async function renderAdminOrders(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Pedidos', async (content) => {
    content.innerHTML = `
      <div class="admin-table-wrap">
        <div class="admin-table-header">
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="order-filters">
            <button class="chip active" data-status="">Todos</button>
            <button class="chip" data-status="pendente">⏳ Pendentes</button>
            <button class="chip" data-status="aceito">✅ Aceitos</button>
            <button class="chip" data-status="entregue">🎉 Entregues</button>
          </div>
          <input type="search" class="form-input" id="order-search" placeholder="Buscar cliente..." style="max-width:220px;padding:8px 14px;font-size:.85rem" />
        </div>
        <div id="orders-table-wrap">
          <div style="padding:48px;text-align:center;color:var(--gray-400)">Carregando pedidos...</div>
        </div>
      </div>
    `;

    let currentStatus = '';
    let searchQ = '';

    const load = async () => {
      const wrap = content.querySelector('#orders-table-wrap');
      wrap.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)">Carregando...</div>';

      let q = supabase
        .from('pedidos')
        .select(`id, valor_total, status, created_at,
          clientes(nome, telefone, endereco),
          pedido_itens(quantidade, valor_unitario, produtos(nome))`)
        .order('created_at', { ascending: false });

      if (currentStatus) q = q.eq('status', currentStatus);

      const { data } = await q;
      let orders = data || [];

      if (searchQ) {
        orders = orders.filter(o => o.clientes?.nome?.toLowerCase().includes(searchQ.toLowerCase()));
      }

      if (!orders.length) {
        wrap.innerHTML = '<div class="admin-table-empty">Nenhum pedido encontrado</div>';
        return;
      }

      const statusLabel = { pendente: '⏳ Pendente', aceito: '✅ Aceito', entregue: '🎉 Entregue' };
      const statusCls = { pendente: 'badge-warning', aceito: 'badge-info', entregue: 'badge-success' };

      wrap.innerHTML = `
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr data-id="${o.id}">
                  <td><span class="text-xs text-muted font-medium">#${o.id.slice(0,8).toUpperCase()}</span></td>
                  <td>
                    <div style="font-weight:500;font-size:.88rem">${o.clientes?.nome || '—'}</div>
                    <div class="text-xs text-muted">${o.clientes?.telefone ? formatPhone(o.clientes.telefone) : ''}</div>
                  </td>
                  <td>
                    <div style="font-size:.82rem;color:var(--gray-600);max-width:220px">
                      ${(o.pedido_itens || []).map(it => `${it.produtos?.nome} × ${it.quantidade}`).join(', ')}
                    </div>
                  </td>
                  <td><strong>${formatCurrency(o.valor_total)}</strong></td>
                  <td><span class="badge ${statusCls[o.status] || 'badge-outline'}">${statusLabel[o.status] || o.status}</span></td>
                  <td><span class="text-xs text-muted">${new Date(o.created_at).toLocaleDateString('pt-BR')}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                      ${o.status === 'pendente' ? `<button class="btn btn-sm btn-success accept-btn" data-id="${o.id}">Aceitar</button>` : ''}
                      ${o.status === 'aceito' ? `<button class="btn btn-sm btn-primary deliver-btn" data-id="${o.id}">Entregar</button>` : ''}
                      ${o.clientes?.telefone ? `<a href="https://wa.me/55${o.clientes.telefone}" target="_blank" class="btn btn-sm btn-whatsapp" style="padding:6px 10px;border-radius:6px;font-size:.75rem">WhatsApp</a>` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      wrap.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'aceito', load));
      });
      wrap.querySelectorAll('.deliver-btn').forEach(btn => {
        btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'entregue', load));
      });
    };

    // Filters
    content.querySelectorAll('#order-filters .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        content.querySelectorAll('#order-filters .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentStatus = chip.dataset.status;
        load();
      });
    });

    let debounce;
    content.querySelector('#order-search').addEventListener('input', e => {
      searchQ = e.target.value;
      clearTimeout(debounce);
      debounce = setTimeout(load, 300);
    });

    load();
  });
}

async function updateStatus(id, status, reload) {
  const labels = { aceito: 'Aceitar pedido', entregue: 'Marcar como entregue' };
  const ok = await confirmModal({ title: labels[status], message: `Deseja alterar o status do pedido para "${status}"?`, confirmText: 'Confirmar' });
  if (!ok) return;
  const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
  if (error) { showToast('Erro ao atualizar pedido', 'error'); return; }
  showToast('Status atualizado!', 'success');
  reload();
}

function formatPhone(tel) {
  const d = tel.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return tel;
}
