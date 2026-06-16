// ======================================================
// ADMIN ENTREGAR PAGE
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { formatCurrency } from '../../components/productCard.js';
import { showToast } from '../../components/toast.js';
import { confirmModal } from '../../components/modal.js';

export async function renderAdminEntregar(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Entregar', async (content) => {
    content.innerHTML = `
      <div class="admin-table-wrap">
        <div class="admin-table-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h2 style="font-size:1.2rem;font-weight:600;margin:0">Pedidos Prontos para Entrega</h2>
          <input type="search" class="form-input" id="entregar-search" placeholder="Buscar cliente..." style="max-width:220px;padding:8px 14px;font-size:.85rem" />
        </div>
        <div id="entregar-table-wrap">
          <div style="padding:48px;text-align:center;color:var(--gray-400)">Carregando pedidos para entregar...</div>
        </div>
      </div>
    `;

    let searchQ = '';

    const load = async () => {
      const wrap = content.querySelector('#entregar-table-wrap');
      wrap.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)">Carregando...</div>';

      let q = supabase
        .from('pedidos')
        .select(`id, valor_total, status, created_at,
          clientes(nome, telefone, endereco),
          pedido_itens(quantidade, valor_unitario, produtos(nome, imagem_url))`)
        .eq('status', 'aceito')
        .order('created_at', { ascending: false });

      const { data } = await q;
      let orders = data || [];

      if (searchQ) {
        orders = orders.filter(o => o.clientes?.nome?.toLowerCase().includes(searchQ.toLowerCase()));
      }

      if (!orders.length) {
        wrap.innerHTML = '<div class="admin-table-empty">Nenhum pedido aguardando entrega no momento</div>';
        return;
      }

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
                <th>Cliente / Endereço</th>
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
                    <div class="text-xs text-muted" style="margin-top:4px;max-width:200px;line-height:1.4">${o.clientes?.endereco || 'Sem endereço'}</div>
                  </td>
                  <td>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;max-width:260px;padding:4px 0;">
                      ${(o.pedido_itens || []).map(it => `
                        <div class="order-product-thumb" style="width:44px;height:44px;border-radius:6px;border:1px solid var(--gray-200);cursor:pointer;background:#fff;position:relative;transition:transform 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);" title="${it.produtos?.nome} (${it.quantidade}x)" onmouseover="this.style.transform='scale(1.05)';this.style.borderColor='var(--gold)';" onmouseout="this.style.transform='scale(1)';this.style.borderColor='var(--gray-200)';" onclick="window.viewOrderProduct('${it.produtos?.imagem_url}', '${it.produtos?.nome?.replace(/'/g, "\\'")}')">
                          <img src="${it.produtos?.imagem_url || ''}" style="width:100%;height:100%;object-fit:contain;border-radius:5px;padding:2px;" onerror="this.src='/logo.png'" />
                          <span style="position:absolute;bottom:-6px;right:-6px;background:var(--gold);color:white;font-size:0.65rem;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:9px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${it.quantidade}</span>
                        </div>
                      `).join('')}
                    </div>
                  </td>
                  <td><strong>${formatCurrency(o.valor_total)}</strong></td>
                  <td><span class="badge badge-info">🚚 Pronto</span></td>
                  <td><span class="text-xs text-muted">${new Date(o.created_at).toLocaleDateString('pt-BR')}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                      <button class="btn btn-sm btn-primary deliver-btn" data-id="${o.id}">Entregue</button>
                      ${o.clientes?.telefone ? `<a href="https://wa.me/55${o.clientes.telefone}" target="_blank" class="btn btn-sm btn-whatsapp" style="padding:6px 10px;border-radius:6px;font-size:.75rem">WhatsApp</a>` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      wrap.querySelectorAll('.deliver-btn').forEach(btn => {
        btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'entregue', load));
      });
    };

    // Search
    const searchInput = content.querySelector('#entregar-search');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQ = e.target.value.trim();
        load();
      }, 300);
    });

    load();
  });
}

async function updateStatus(id, status, reloadFn) {
  confirmModal('Finalizar Pedido', `Deseja marcar este pedido como entregue ao cliente?`, async () => {
    try {
      const { error } = await supabase.from('pedidos').update({ status }).eq('id', id);
      if (error) throw error;
      showToast('success', 'Pedido finalizado (Entregue)!');
      reloadFn();
    } catch (err) {
      showToast('error', 'Erro ao atualizar');
      console.error(err);
    }
  });
}

function formatPhone(p) {
  if (!p) return '';
  return p.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
}
