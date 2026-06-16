// ======================================================
// CHECKOUT PAGE — Finalização do pedido
// ======================================================
import { getCart, getCartTotal, clearCart, saveOrderSession } from '../store.js';
import { supabase } from '../supabase.js';
import { navigate } from '../router.js';
import { formatCurrency } from '../components/productCard.js';
import { showToast } from '../components/toast.js';

export async function renderCheckout(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  const cart = getCart();
  if (cart.length === 0) { navigate('/cart'); return; }

  const total = getCartTotal();

  container.innerHTML = `
    <div class="container checkout-page">
      <div class="checkout-header">
        <button class="btn btn-ghost" id="checkout-back" style="padding-left:0;gap:8px;margin-bottom:8px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar ao carrinho
        </button>
        <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Finalizar Pedido</h1>
        <p style="color:var(--gray-500);font-size:.9rem;margin-top:4px">Preencha seus dados para confirmar a encomenda</p>
      </div>

      <form class="checkout-form" id="checkout-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="co-nome">Nome Completo *</label>
          <input class="form-input" type="text" id="co-nome" placeholder="Seu nome completo" autocomplete="name" required />
          <span class="form-error" id="err-nome"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="co-tel">WhatsApp *</label>
          <input class="form-input" type="tel" id="co-tel" placeholder="(44) 99999-9999" autocomplete="tel" required />
          <span class="form-error" id="err-tel"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="co-end">Endereço Completo *</label>
          <textarea class="form-input" id="co-end" placeholder="Rua, número, bairro, cidade, estado, CEP" rows="3" required></textarea>
          <span class="form-error" id="err-end"></span>
        </div>

        <div class="checkout-summary">
          <h3 style="font-family:var(--font-serif);font-size:1.1rem;font-weight:500;margin-bottom:16px">Resumo do Pedido</h3>
          ${cart.map(item => `
            <div class="checkout-item">
              <span>${item.nome} × ${item.quantidade}</span>
              <span style="font-weight:500">${formatCurrency(item.preco * item.quantidade)}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1.5px solid var(--gray-100)">
            <span style="font-weight:600;font-size:1rem">Total da Encomenda</span>
            <span style="font-family:var(--font-serif);font-size:1.5rem;font-weight:600;color:var(--gold-dark)">${formatCurrency(total)}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-full btn-lg" id="submit-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Confirmar Pedido
        </button>
      </form>
    </div>
  `;

  container.querySelector('#checkout-back').addEventListener('click', () => navigate('/cart'));

  // Phone mask
  const telInput = container.querySelector('#co-tel');
  telInput.addEventListener('input', () => {
    let v = telInput.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)$/, '($1) $2');
    else if (v.length > 0) v = '(' + v;
    telInput.value = v;
  });

  // Submit
  container.querySelector('#checkout-form').addEventListener('submit', async e => {
    e.preventDefault();
    const nome = container.querySelector('#co-nome').value.trim();
    const tel = telInput.value.trim();
    const end = container.querySelector('#co-end').value.trim();

    let valid = true;
    const setErr = (id, msg) => { document.getElementById(id).textContent = msg; if (msg) valid = false; };

    setErr('err-nome', nome.length < 3 ? 'Informe seu nome completo' : '');
    setErr('err-tel', tel.replace(/\D/g,'').length < 10 ? 'Informe um telefone válido' : '');
    setErr('err-end', end.length < 10 ? 'Informe o endereço completo' : '');

    if (!valid) return;

    const btn = container.querySelector('#submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loader-ring" style="width:20px;height:20px;border-width:2px"></span> Processando...';

    try {
      // Upsert cliente
      let { data: cliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', tel.replace(/\D/g,''))
        .single();

      if (!cliente) {
        const { data: novo, error } = await supabase
          .from('clientes')
          .insert({ nome, telefone: tel.replace(/\D/g,''), endereco: end })
          .select('id')
          .single();
        if (error) throw error;
        cliente = novo;
      } else {
        await supabase.from('clientes').update({ endereco: end }).eq('id', cliente.id);
      }

      // Criar pedido
      const { data: pedido, error: pedErr } = await supabase
        .from('pedidos')
        .insert({ cliente_id: cliente.id, valor_total: total, status: 'pendente' })
        .select('id')
        .single();
      if (pedErr) throw pedErr;

      // Inserir itens
      const itens = cart.map(item => ({
        pedido_id: pedido.id,
        produto_id: item.id,
        quantidade: item.quantidade,
        valor_unitario: item.preco
      }));
      const { error: itensErr } = await supabase.from('pedido_itens').insert(itens);
      if (itensErr) throw itensErr;

      // Atualizar total_pedidos e estoque
      for (const item of cart) {
        const { data: prod } = await supabase.from('produtos').select('total_pedidos,quantidade,apenas_encomenda').eq('id', item.id).single();
        if (prod) {
          const updates = { total_pedidos: (prod.total_pedidos || 0) + item.quantidade };
          if (!prod.apenas_encomenda) updates.quantidade = Math.max(0, (prod.quantidade || 0) - item.quantidade);
          await supabase.from('produtos').update(updates).eq('id', item.id);
        }
      }

      saveOrderSession({ nome, tel, pedido_id: pedido.id, total, cart });
      clearCart();
      renderSuccess(container, { nome, tel, total, cart });

    } catch (err) {
      console.error(err);
      showToast('Erro ao processar pedido. Tente novamente.', 'error');
      btn.disabled = false;
      btn.textContent = 'Confirmar Pedido';
    }
  });
}

function renderSuccess(container, { nome, tel, total, cart }) {
  const rawTel = tel.replace(/\D/g, '');
  const whatsMsg = encodeURIComponent(
    `Olá! Sou ${nome}.\n\nGostaria de confirmar minha encomenda na *Croxiatti Imports*:\n\n` +
    cart.map(i => `• ${i.nome} × ${i.quantidade} — ${formatCurrency(i.preco * i.quantidade)}`).join('\n') +
    `\n\n*Total: ${formatCurrency(total)}*\n\nAguardo a confirmação. 🙏`
  );
  const whatsUrl = `https://wa.me/5544998766259?text=${whatsMsg}`;

  container.innerHTML = `
    <div class="container checkout-page">
      <div class="order-success">
        <div class="success-icon">✓</div>
        <h2 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Pedido Realizado!</h2>
        <p style="color:var(--gray-500);max-width:380px;text-align:center">
          Seu pedido foi registrado com sucesso. Clique abaixo para notificar via WhatsApp e confirmar sua encomenda.
        </p>
        <a href="${whatsUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-lg">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Notificar via WhatsApp
        </a>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-outline" id="success-home">Continuar Comprando</button>
          <button class="btn btn-ghost" id="success-orders">Ver Meus Pedidos</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#success-home').addEventListener('click', () => navigate('/'));
  container.querySelector('#success-orders').addEventListener('click', () => navigate('/my-orders'));
}
