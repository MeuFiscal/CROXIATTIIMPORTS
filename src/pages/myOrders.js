// ======================================================
// MY ORDERS PAGE — Consulta sem login
// ======================================================
import { supabase } from '../supabase.js';
import { navigate } from '../router.js';
import { formatCurrency } from '../components/productCard.js';

export function renderMyOrders(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  container.innerHTML = `
    <div class="container my-orders-page">
      <div style="margin-bottom:24px">
        <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Meus Pedidos</h1>
        <p style="color:var(--gray-500);font-size:.9rem">Consulte o status dos seus pedidos</p>
      </div>

      <div class="card" style="padding:28px;margin-bottom:24px">
        <p style="font-size:.88rem;color:var(--gray-500);margin-bottom:20px">Informe seu nome e telefone para consultar seus pedidos.</p>
        <form id="lookup-form" novalidate style="display:flex;flex-direction:column;gap:16px">
          <div class="form-group">
            <label class="form-label" for="lookup-nome">Nome</label>
            <input class="form-input" type="text" id="lookup-nome" placeholder="Seu nome" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="lookup-tel">WhatsApp</label>
            <input class="form-input" type="tel" id="lookup-tel" placeholder="(44) 99999-9999" required />
          </div>
          <button type="submit" class="btn btn-primary" id="lookup-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Consultar Pedidos
          </button>
        </form>
      </div>

      <div id="orders-result"></div>
    </div>
  `;

  // Phone mask
  const telInput = container.querySelector('#lookup-tel');
  telInput.addEventListener('input', () => {
    let v = telInput.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)$/, '($1) $2');
    else if (v.length > 0) v = '(' + v;
    telInput.value = v;
  });

  container.querySelector('#lookup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const nome = container.querySelector('#lookup-nome').value.trim();
    const tel = telInput.value.replace(/\D/g, '');
    const result = container.querySelector('#orders-result');
    const btn = container.querySelector('#lookup-btn');

    if (!nome || tel.length < 10) {
      result.innerHTML = '<div class="card" style="padding:20px;text-align:center;color:var(--error)">Preencha nome e telefone válidos.</div>';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="loader-ring" style="width:18px;height:18px;border-width:2px"></span>';

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id,nome,telefone')
      .eq('telefone', tel)
      .ilike('nome', `%${nome.split(' ')[0]}%`)
      .single();

    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Consultar Pedidos';

    if (!cliente) {
      result.innerHTML = `
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>Nenhum pedido encontrado</h3>
          <p>Não encontramos pedidos com esses dados. Verifique as informações ou faça seu primeiro pedido.</p>
          <button class="btn btn-primary" id="no-order-shop">Explorar produtos</button>
        </div>`;
      result.querySelector('#no-order-shop')?.addEventListener('click', () => navigate('/'));
      return;
    }

    const { data: pedidos } = await supabase
      .from('pedidos')
      .select(`id, valor_total, status, created_at, pedido_itens(quantidade, valor_unitario, produtos(nome, marca))`)
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false });

    if (!pedidos || pedidos.length === 0) {
      result.innerHTML = '<div class="empty-state"><div class="icon">📦</div><h3>Nenhum pedido</h3><p>Você ainda não realizou pedidos.</p></div>';
      return;
    }

    const statusLabel = { pendente: '⏳ Pendente', aceito: '✅ Aceito', entregue: '🎉 Entregue' };
    const statusClass = { pendente: 'badge-warning', aceito: 'badge-info', entregue: 'badge-success' };

    result.innerHTML = `
      <h3 style="font-family:var(--font-serif);font-size:1.2rem;margin-bottom:16px">Olá, ${cliente.nome}! Encontramos ${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''}.</h3>
      ${pedidos.map((p, i) => `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <div class="order-number">Pedido #${p.id.slice(0,8).toUpperCase()}</div>
              <div class="order-date">${new Date(p.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
            <span class="badge ${statusClass[p.status] || 'badge-outline'}">${statusLabel[p.status] || p.status}</span>
          </div>
          <div class="order-items">
            ${(p.pedido_itens || []).map(it => `
              <div class="order-item-row">
                <span>${it.produtos?.nome || 'Produto'} × ${it.quantidade}</span>
                <span>${formatCurrency(it.valor_unitario * it.quantidade)}</span>
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            <span class="label">Total</span>
            <span class="value">${formatCurrency(p.valor_total)}</span>
          </div>
        </div>
      `).join('')}
    `;
  });
}
