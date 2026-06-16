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
          pedido_itens(quantidade, valor_unitario, produtos(nome, imagem_url))`)
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

      // Define global helper for opening product image modal if it doesn't exist
      if (!window.viewOrderProduct) {
        window.viewOrderProduct = (imgUrl, name) => {
          import('../../components/modal.js').then(({ openModal }) => {
            openModal({
              title: name,
              body: `<div style="text-align:center;background:#f9f9f9;padding:20px;border-radius:8px;"><img src="${imgUrl}" style="max-width:100%;max-height:50vh;object-fit:contain;border-radius:8px;" onerror="this.src='/logo.png'"/></div>`,
              maxWidth: '500px'
            });
          });
        };
      }

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
              ${orders.map(o => {
                const itens = o.pedido_itens || [];
                const temEncomenda = itens.some(it => (it.quantidade_encomenda || 0) > 0);
                return `
                <tr data-id="${o.id}">
                  <td><span class="text-xs text-muted font-medium">#${o.id.slice(0,8).toUpperCase()}</span></td>
                  <td>
                    <div style="font-weight:500;font-size:.88rem">${o.clientes?.nome || '—'}</div>
                    <div class="text-xs text-muted">${o.clientes?.telefone ? formatPhone(o.clientes.telefone) : ''}</div>
                  </td>
                  <td>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;max-width:280px;padding:4px 0;">
                      ${itens.map(it => {
                        const qtyEnc = it.quantidade_encomenda || 0;
                        const qtyEst = it.quantidade - qtyEnc;
                        const label = qtyEst > 0 && qtyEnc > 0
                          ? `${qtyEst}📦+${qtyEnc}🔖`
                          : qtyEnc > 0 ? `${it.quantidade}🔖` : `${it.quantidade}📦`;
                        return `
                        <div class="order-product-thumb" style="width:48px;height:48px;border-radius:6px;border:1px solid var(--gray-200);cursor:pointer;background:#fff;position:relative;transition:transform 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);" title="${it.produtos?.nome} — ${label}" onmouseover="this.style.transform='scale(1.05)';this.style.borderColor='var(--gold)';" onmouseout="this.style.transform='scale(1)';this.style.borderColor='var(--gray-200)';" onclick="window.viewOrderProduct('${it.produtos?.imagem_url}', '${it.produtos?.nome?.replace(/'/g, "\\'")} — ${label}')">
                          <img src="${it.produtos?.imagem_url || ''}" style="width:100%;height:100%;object-fit:contain;border-radius:5px;padding:2px;" onerror="this.src='/logo.png'" />
                          <span style="position:absolute;bottom:-6px;right:-6px;background:${qtyEnc > 0 ? '#8B5CF6' : 'var(--gold)'};color:white;font-size:0.6rem;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:9px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.2);padding:0 3px">${label}</span>
                        </div>`;
                      }).join('')}
                    </div>
                    ${temEncomenda ? '<div style="font-size:.72rem;color:#8B5CF6;margin-top:4px">📦 Tem itens de encomenda</div>' : ''}
                  </td>
                  <td><strong>${formatCurrency(o.valor_total)}</strong></td>
                  <td><span class="badge ${statusCls[o.status] || 'badge-outline'}">${statusLabel[o.status] || o.status}</span></td>
                  <td><span class="text-xs text-muted">${new Date(o.created_at).toLocaleDateString('pt-BR')}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                      ${o.status === 'pendente' ? `<button class="btn btn-sm btn-success accept-btn" data-id="${o.id}" data-has-enc="${temEncomenda}">${temEncomenda ? 'Aceitar e Distribuir' : 'Aceitar'}</button>` : ''}
                      ${o.status === 'aceito' ? `<button class="btn btn-sm btn-primary deliver-btn" data-id="${o.id}">Entregue</button>` : ''}
                      ${o.clientes?.telefone ? `<a href="https://wa.me/55${o.clientes.telefone}" target="_blank" class="btn btn-sm btn-whatsapp" style="padding:6px 10px;border-radius:6px;font-size:.75rem">WhatsApp</a>` : ''}
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      wrap.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const hasEnc = btn.dataset.hasEnc === 'true';
          if (hasEnc) {
            smartAccept(btn.dataset.id, load);
          } else {
            updateStatus(btn.dataset.id, 'aceito', load);
          }
        });
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

// Smart accept: distributes items between entregar (aceito) and encomendas
async function smartAccept(pedidoId, reload) {
  const ok = await confirmModal({
    title: 'Aceitar e Distribuir',
    message: 'Este pedido tem itens de encomenda. Os itens em estoque irão para "Entregar" e os itens de encomenda irão para a aba "Encomendas". Continuar?',
    confirmText: 'Confirmar e Distribuir'
  });
  if (!ok) return;

  try {
    // Fetch full order
    const { data: order } = await supabase
      .from('pedidos')
      .select('*, clientes(id), pedido_itens(id, produto_id, quantidade, quantidade_encomenda, valor_unitario)')
      .eq('id', pedidoId)
      .single();

    const itens = order.pedido_itens || [];
    const encomendaItens = itens.filter(it => (it.quantidade_encomenda || 0) > 0);
    const stockItens = itens.filter(it => (it.quantidade - (it.quantidade_encomenda || 0)) > 0);

    if (encomendaItens.length > 0) {
      // Create new pedido for encomenda items
      const totalEnc = encomendaItens.reduce((s, it) => s + it.valor_unitario * it.quantidade_encomenda, 0);
      const { data: newPedido, error: encErr } = await supabase
        .from('pedidos')
        .insert({ cliente_id: order.clientes.id, valor_total: totalEnc, status: 'encomenda' })
        .select('id')
        .single();
      if (encErr) throw encErr;

      // Insert encomenda items into new pedido
      await supabase.from('pedido_itens').insert(
        encomendaItens.map(it => ({
          pedido_id: newPedido.id,
          produto_id: it.produto_id,
          quantidade: it.quantidade_encomenda,
          quantidade_encomenda: it.quantidade_encomenda,
          valor_unitario: it.valor_unitario
        }))
      );

      // Update original items: reduce to stock-only quantities
      for (const it of encomendaItens) {
        const remaining = it.quantidade - (it.quantidade_encomenda || 0);
        if (remaining <= 0) {
          await supabase.from('pedido_itens').delete().eq('id', it.id);
        } else {
          await supabase.from('pedido_itens').update({ quantidade: remaining, quantidade_encomenda: 0 }).eq('id', it.id);
        }
      }
    }

    // If there are stock items, mark original as aceito (Entregar)
    // If ALL items were encomenda, mark original as encomenda too (then delete it or move)
    if (stockItens.length > 0) {
      await supabase.from('pedidos').update({ status: 'aceito' }).eq('id', pedidoId);
    } else {
      // All items went to encomenda — mark original as encomenda
      await supabase.from('pedidos').update({ status: 'encomenda' }).eq('id', pedidoId);
    }

    showToast('Pedido distribuído com sucesso! ✅', 'success');
    reload();
  } catch (err) {
    console.error(err);
    showToast('Erro ao distribuir pedido', 'error');
  }
}

function formatPhone(tel) {
  const d = tel.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return tel;
}
