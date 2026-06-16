// ======================================================
// CART PAGE + POPUP
// ======================================================
import { getCart, removeFromCart, updateCartQty, getCartTotal, clearCart, on } from '../store.js';
import { navigate } from '../router.js';
import { formatCurrency } from '../components/productCard.js';

// ---- Cart Popup ----
let popupEl = null;

export function showCartPopup(produto) {
  removePopup();

  popupEl = document.createElement('div');
  popupEl.className = 'cart-popup-overlay';
  popupEl.innerHTML = `
    <div class="cart-popup">
      <div class="cart-popup-icon">🛍️</div>
      <h3>Adicionado à encomenda!</h3>
      <p>Este produto foi adicionado à sua lista de encomenda. Você poderá revisar antes de enviar.</p>
      <div class="cart-popup-actions">
        <button class="btn btn-primary btn-full" id="popup-go-cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Ir para o Carrinho
        </button>
        <button class="btn btn-ghost btn-full" id="popup-continue">Continuar Comprando</button>
      </div>
    </div>
  `;

  document.body.appendChild(popupEl);

  popupEl.querySelector('#popup-go-cart').addEventListener('click', () => {
    removePopup();
    navigate('/cart');
  });
  popupEl.querySelector('#popup-continue').addEventListener('click', removePopup);
  popupEl.addEventListener('click', e => { if (e.target === popupEl) removePopup(); });
}

function removePopup() {
  popupEl?.remove();
  popupEl = null;
}

// ---- Cart Page ----
export async function renderCart(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  const render = () => {
    const cart = getCart();
    const total = getCartTotal();

    container.innerHTML = `
      <div class="container cart-page">
        <div style="margin-bottom:24px">
          <button class="btn btn-ghost" id="cart-back" style="padding-left:0;gap:8px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
            Continuar comprando
          </button>
          <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500;margin-top:8px">Minha Encomenda</h1>
          <p style="color:var(--gray-500);font-size:.9rem">${cart.length} ${cart.length === 1 ? 'item' : 'itens'}</p>
        </div>

        ${cart.length === 0 ? `
          <div class="empty-state">
            <div class="icon">🛍️</div>
            <h3>Encomenda vazia</h3>
            <p>Adicione produtos para fazer sua encomenda.</p>
            <button class="btn btn-primary" id="cart-explore">Explorar produtos</button>
          </div>
        ` : `
          <div class="cart-layout">
            <div id="cart-items-list">
              ${cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                  ${item.imagem_url
                    ? `<img class="cart-item-img" src="${item.imagem_url}" alt="${item.nome}" loading="lazy"/>`
                    : `<div class="cart-item-img-placeholder">✦</div>`}
                  <div class="cart-item-info">
                    ${item.marca ? `<div class="cart-item-brand">${item.marca}</div>` : ''}
                    <div class="cart-item-name">${item.nome}</div>
                    <div class="cart-item-price">${formatCurrency(item.preco)} por unidade</div>
                  </div>
                  <div class="cart-item-actions">
                    <div class="qty-stepper">
                      <button class="qty-minus" data-id="${item.id}">−</button>
                      <span>${item.quantidade}</span>
                      <button class="qty-plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-remove btn btn-ghost btn-icon" data-id="${item.id}" title="Remover">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="cart-summary">
              <h3 style="font-family:var(--font-serif);font-size:1.2rem;font-weight:500;margin-bottom:16px">Resumo</h3>
              ${cart.map(item => `
                <div class="cart-summary-row">
                  <span class="label" style="font-size:.88rem;color:var(--gray-600)">${item.nome} × ${item.quantidade}</span>
                  <span style="font-size:.88rem;font-weight:500">${formatCurrency(item.preco * item.quantidade)}</span>
                </div>
              `).join('')}
              <div class="cart-summary-row total">
                <span class="label">Total da Encomenda</span>
                <span class="value">${formatCurrency(total)}</span>
              </div>
              <button class="btn btn-primary btn-full btn-lg" id="checkout-btn" style="margin-top:20px">
                Finalizar Pedido
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button class="btn btn-ghost btn-full btn-sm" id="clear-cart-btn" style="margin-top:8px;color:var(--gray-400)">Limpar encomenda</button>
            </div>
          </div>
        `}
      </div>
    `;

    container.querySelector('#cart-back')?.addEventListener('click', () => navigate('/'));
    container.querySelector('#cart-explore')?.addEventListener('click', () => navigate('/'));
    container.querySelector('#checkout-btn')?.addEventListener('click', () => navigate('/checkout'));
    container.querySelector('#clear-cart-btn')?.addEventListener('click', () => {
      clearCart();
      render();
    });

    container.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const current = getCart().find(i => i.id === id);
        updateCartQty(id, (current?.quantidade || 1) - 1);
        render();
      });
    });

    container.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const current = getCart().find(i => i.id === id);
        updateCartQty(id, (current?.quantidade || 0) + 1);
        render();
      });
    });

    container.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.id);
        render();
      });
    });
  };

  render();
}
