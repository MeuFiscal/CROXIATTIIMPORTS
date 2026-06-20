// ======================================================
// MY ORDERS PAGE — Consulta sem login e com login (V3)
// ======================================================
import { supabase, getCustomerSession, getProfile } from '../supabase.js';
import { navigate } from '../router.js';
import { formatCurrency } from '../components/productCard.js';

export async function renderMyOrders(container) {
  container.innerHTML = `
    <div class="container" style="padding-top: 48px; text-align: center;">
      <div class="loader" style="margin: 0 auto; border: 3px solid var(--gray-200); border-top-color: var(--gold); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 16px; color: var(--gray-500);">Verificando sessão...</p>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;

  const session = await getCustomerSession();

  container.innerHTML = '';
  container.className = 'page-enter';

  if (session) {
    // User is logged in, fetch orders directly
    const profile = await getProfile();
    await renderLoggedInOrders(container, profile);
  } else {
    // User is NOT logged in, show lookup form
    renderLoggedOutOrders(container);
  }
}

async function renderLoggedInOrders(container, profile) {
  container.innerHTML = `
    <div class="container my-orders-page">
      <div style="margin-bottom:24px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Meus Pedidos</h1>
          <p style="color:var(--gray-500);font-size:.9rem">Olá, ${profile?.nome || 'Cliente'}! Aqui estão suas compras.</p>
        </div>
        <button onclick="window.location.hash='/account'" class="btn btn-outline btn-sm">Voltar à Conta</button>
      </div>

      <div id="orders-result">
        <div style="text-align: center; padding: 40px 0; color: var(--gray-500);">Carregando pedidos...</div>
      </div>
    </div>
  `;

  const resultEl = container.querySelector('#orders-result');

  try {
    const session = await getCustomerSession();
    
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`id, valor_total, status, created_at, pedido_itens(quantidade, valor_unitario, produtos(nome, marca))`)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!pedidos || pedidos.length === 0) {
      resultEl.innerHTML = '<div class="empty-state"><div class="icon">📦</div><h3>Nenhum pedido</h3><p>Você ainda não realizou pedidos com esta conta.</p><button class="btn btn-primary" style="margin-top:16px" onclick="window.location.hash=\'/\'">Explorar produtos</button></div>';
      return;
    }

    renderOrdersList(resultEl, pedidos);
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><h3>Erro ao buscar</h3><p>Houve um erro ao buscar seus pedidos. Tente novamente mais tarde.</p></div>';
  }
}

function renderLoggedOutOrders(container) {
  container.innerHTML = `
    <div class="container my-orders-page">
      <div style="margin-bottom:24px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Consulta de Pedidos</h1>
          <p style="color:var(--gray-500);font-size:.9rem">Consulte compras antigas feitas sem conta</p>
        </div>
        <button onclick="window.location.hash='/login'" class="btn btn-primary btn-sm">Fazer Login</button>
      </div>

      <div class="card" style="padding:28px;margin-bottom:24px">
        <p style="font-size:.88rem;color:var(--gray-500);margin-bottom:20px">Informe seu nome e WhatsApp para consultar pedidos avulsos.</p>
        <form id="lookup-form" novalidate style="display:flex;flex-direction:column;gap:16px">
          <div class="form-group">
            <label class="form-label" for="lookup-nome">Nome</label>
            <input class="form-input" type="text" id="lookup-nome" placeholder="Seu nome" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="lookup-tel">WhatsApp</label>
            <input class="form-input" type="tel" id="lookup-tel" placeholder="(00) 00000-0000" required />
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
      result.innerHTML = '<div class="card" style="padding:20px;text-align:center;color:var(--error)">Preencha nome e WhatsApp válidos.</div>';
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
          <p>Não encontramos pedidos com esses dados. Faça login ou verifique as informações.</p>
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
      result.innerHTML = '<div class="empty-state"><div class="icon">📦</div><h3>Nenhum pedido</h3><p>Você ainda não realizou pedidos com estes dados.</p></div>';
      return;
    }

    renderOrdersList(result, pedidos);
  });
}

function renderOrdersList(container, pedidos) {
  const statusLabel = { 
    'recebido': '📦 Recebido', 
    'aguardando_pagamento': '⏳ Aguardando Pagamento', 
    'pago': '💵 Pago', 
    'em_separacao': '🛒 Em Separação', 
    'enviado': '🚚 Enviado', 
    'entregue': '🎉 Entregue', 
    'cancelado': '❌ Cancelado',
    // Fallbacks para compatibilidade com dados antigos:
    'pendente': '⏳ Aguardando Pagamento',
    'aceito': '🛒 Em Separação'
  };
  
  const statusClass = { 
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

  const timelineSteps = ['recebido', 'pago', 'em_separacao', 'enviado', 'entregue'];
  const statusMapTimeline = {
    'recebido': 0,
    'aguardando_pagamento': 0,
    'pendente': 0,
    'pago': 1,
    'em_separacao': 2,
    'aceito': 2,
    'enviado': 3,
    'entregue': 4
  };

  container.innerHTML = `
    ${pedidos.map((p) => {
      const currentStep = p.status === 'cancelado' ? -1 : (statusMapTimeline[p.status] || 0);
      
      let timelineHtml = '';
      if (p.status !== 'cancelado') {
        timelineHtml = `
          <div style="margin: 24px 0 16px; position: relative;">
            <div style="position: absolute; top: 12px; left: 0; width: 100%; height: 2px; background: var(--gray-200); z-index: 1;"></div>
            <div style="position: absolute; top: 12px; left: 0; width: ${currentStep > 0 ? (currentStep / (timelineSteps.length - 1)) * 100 : 0}%; height: 2px; background: var(--gold); z-index: 2; transition: width 0.5s ease;"></div>
            
            <div style="display: flex; justify-content: space-between; position: relative; z-index: 3;">
              <div style="display: flex; flex-direction: column; align-items: center; width: 20%;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${currentStep >= 0 ? 'var(--gold)' : 'var(--gray-300)'}; color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; box-shadow: 0 0 0 4px var(--white);">✓</div>
                <span style="font-size: 0.65rem; color: ${currentStep >= 0 ? 'var(--black)' : 'var(--gray-500)'}; margin-top: 6px; font-weight: ${currentStep >= 0 ? '600' : '400'}; text-align: center;">Recebido</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; width: 20%;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${currentStep >= 1 ? 'var(--gold)' : 'var(--gray-300)'}; color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; box-shadow: 0 0 0 4px var(--white);">✓</div>
                <span style="font-size: 0.65rem; color: ${currentStep >= 1 ? 'var(--black)' : 'var(--gray-500)'}; margin-top: 6px; font-weight: ${currentStep >= 1 ? '600' : '400'}; text-align: center;">Pago</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; width: 20%;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${currentStep >= 2 ? 'var(--gold)' : 'var(--gray-300)'}; color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; box-shadow: 0 0 0 4px var(--white);">✓</div>
                <span style="font-size: 0.65rem; color: ${currentStep >= 2 ? 'var(--black)' : 'var(--gray-500)'}; margin-top: 6px; font-weight: ${currentStep >= 2 ? '600' : '400'}; text-align: center;">Separação</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; width: 20%;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${currentStep >= 3 ? 'var(--gold)' : 'var(--gray-300)'}; color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; box-shadow: 0 0 0 4px var(--white);">✓</div>
                <span style="font-size: 0.65rem; color: ${currentStep >= 3 ? 'var(--black)' : 'var(--gray-500)'}; margin-top: 6px; font-weight: ${currentStep >= 3 ? '600' : '400'}; text-align: center;">Enviado</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; width: 20%;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${currentStep >= 4 ? 'var(--gold)' : 'var(--gray-300)'}; color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; box-shadow: 0 0 0 4px var(--white);">✓</div>
                <span style="font-size: 0.65rem; color: ${currentStep >= 4 ? 'var(--black)' : 'var(--gray-500)'}; margin-top: 6px; font-weight: ${currentStep >= 4 ? '600' : '400'}; text-align: center;">Entregue</span>
              </div>
            </div>
          </div>
        `;
      }

      return `
      <div class="order-card" style="background: var(--white); padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200); margin-bottom: 20px;">
        <div class="order-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--gray-100); padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <div class="order-number" style="font-weight: 600; font-size: 1.05rem; color: var(--black);">Pedido #${p.id.slice(0,8).toUpperCase()}</div>
            <div class="order-date" style="font-size: 0.85rem; color: var(--gray-500); margin-top: 4px;">${new Date(p.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
          </div>
          <span class="badge ${statusClass[p.status] || 'badge-outline'}" style="padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${statusLabel[p.status] || p.status}</span>
        </div>
        
        ${timelineHtml}

        <div class="order-items" style="display: flex; flex-direction: column; gap: 8px;">
          ${(p.pedido_itens || []).map(it => `
            <div class="order-item-row" style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--gray-700);">
              <span>${it.quantidade}x ${it.produtos?.nome || 'Produto'}</span>
              <span style="font-weight: 500;">${formatCurrency(it.valor_unitario * it.quantidade)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="order-total" style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top: 16px; border-top: 1px dashed var(--gray-200); font-weight:600;">
          <span class="label" style="font-size: 1rem; color: var(--gray-800);">Total</span>
          <span class="value" style="color:var(--gold-dark); font-size:1.2rem;">${formatCurrency(p.valor_total)}</span>
        </div>
      </div>
    `}).join('')}
  `;
}
