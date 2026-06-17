// ======================================================
// PRODUCT CARD — Card de produto reutilizável
// ======================================================
import { addToCart, toggleFavorite, isFavorite } from '../store.js';
import { showToast } from './toast.js';
import { navigate } from '../router.js';
import { showCartPopup } from '../pages/cart.js';
import { openModal, confirmModal } from './modal.js';

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// Helper: show popup when qty exceeds stock
function askEncomendaPopup(produto, qtdSolicitada, estoque, onConfirm) {
  const qtdEncomenda = qtdSolicitada - estoque;
  const textoEstoque = estoque > 0
    ? `Temos apenas <strong>${estoque} unidade${estoque > 1 ? 's' : ''} em estoque</strong>.`
    : `Este produto não está em estoque no momento.`;

  openModal({
    title: '⚠️ Disponibilidade Limitada',
    maxWidth: '440px',
    body: `
      <div style="line-height:1.7;color:var(--gray-700)">
        <p>${textoEstoque}</p>
        <p>As <strong>${qtdEncomenda} unidade${qtdEncomenda > 1 ? 's' : ''} restante${qtdEncomenda > 1 ? 's' : ''}</strong> serão processadas como <strong>Encomenda</strong> e chegam em prazo combinado.</p>
        ${estoque > 0 ? `<p style="font-size:.85rem;color:var(--gray-500)">📦 ${estoque} imediato${estoque > 1 ? 's' : ''} + 🔖 ${qtdEncomenda} encomenda${qtdEncomenda > 1 ? 's' : ''}</p>` : ''}
        <p>Deseja continuar assim?</p>
      </div>
    `,
    footer: `
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-outline" id="popup-cancel">Cancelar</button>
        <button class="btn btn-primary" id="popup-confirm">Sim, adicionar à encomenda</button>
      </div>
    `
  });

  setTimeout(() => {
    document.getElementById('popup-confirm')?.addEventListener('click', () => {
      document.querySelector('.modal-overlay')?.remove();
      onConfirm();
    });
    document.getElementById('popup-cancel')?.addEventListener('click', () => {
      document.querySelector('.modal-overlay')?.remove();
    });
  }, 50);
}

// Helper: build qty selector HTML
function qtyControlHtml(id, value = 1) {
  return `
    <div class="qty-control" id="qty-ctrl-${id}">
      <button class="qty-btn qty-minus" type="button">−</button>
      <span class="qty-value">1</span>
      <button class="qty-btn qty-plus" type="button">+</button>
    </div>
  `;
}

// Helper: wire up quantity selector and add-to-cart with stock popup
function wireQtyAndCart(root, produto, addBtn, isModal = false) {
  const ctrl = root.querySelector('.qty-control');
  if (!ctrl) return;

  const minusBtn = ctrl.querySelector('.qty-minus');
  const plusBtn = ctrl.querySelector('.qty-plus');
  const qtyDisplay = ctrl.querySelector('.qty-value');
  let qty = 1;

  const isOutOfStock = !produto.apenas_encomenda && produto.quantidade <= 0;
  const isEncomendaAction = produto.apenas_encomenda || isOutOfStock;
  const estoqueDisponivel = isEncomendaAction ? Infinity : (produto.quantidade || 0);

  minusBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (qty > 1) { qty--; qtyDisplay.textContent = qty; }
  });

  plusBtn.addEventListener('click', e => {
    e.stopPropagation();
    qty++;
    qtyDisplay.textContent = qty;
  });

  if (addBtn) {
    addBtn.addEventListener('click', e => {
      e.stopPropagation();

      // If product is encomenda-only or out of stock: always add entirely as encomenda
      if (isEncomendaAction) {
        addToCart(produto, qty, 0, qty);
        showCartPopup(produto);
        if (isModal) document.querySelector('.modal-overlay')?.remove();
        return;
      }

      // If qty exceeds available stock
      if (qty > estoqueDisponivel) {
        const qtdEstoque = Math.max(0, estoqueDisponivel);
        const qtdEncomenda = qty - qtdEstoque;

        askEncomendaPopup(produto, qty, qtdEstoque, () => {
          addToCart(produto, qty, qtdEstoque, qtdEncomenda);
          showCartPopup(produto);
          if (isModal) document.querySelector('.modal-overlay')?.remove();
        });
        return;
      }

      // Normal add
      addToCart(produto, qty, qty, 0);
      showCartPopup(produto);
      if (isModal) document.querySelector('.modal-overlay')?.remove();
    });
  }
}

export function createProductCard(produto) {
  const fav = isFavorite(produto.id);
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = produto.id;

  const imgHtml = produto.imagem_url
    ? `<img class="product-card-img" src="${produto.imagem_url}" alt="${produto.nome}" loading="lazy" />`
    : `<div class="product-card-placeholder">✦</div>`;

  const badgesHtml = [
    produto.destaque ? `<span class="badge badge-gold">★ Destaque</span>` : '',
    produto.apenas_encomenda ? `<span class="badge badge-encomenda">Encomenda</span>` : ''
  ].filter(Boolean).join('');

  const isOutOfStock = !produto.apenas_encomenda && produto.quantidade <= 0;
  const isEncomendaAction = produto.apenas_encomenda || isOutOfStock;

  const stockText = produto.apenas_encomenda
    ? '<span class="card-stock">Sob encomenda</span>'
    : isOutOfStock
      ? '<span class="card-stock low">Esgotado - Disponível para encomenda</span>'
      : produto.quantidade <= 3
        ? `<span class="card-stock low">Últimas ${produto.quantidade} unidades</span>`
        : `<span class="card-stock">${produto.quantidade} disponíveis</span>`;

  let cardTitle = '';
  if (produto.destaque) {
    card.style.border = '2px solid var(--gold)';
    cardTitle = `<div style="background:var(--gold);color:white;text-align:center;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;padding:6px;text-transform:uppercase;">Destaque</div>`;
  } else if (produto.mais_encomendado) {
    card.style.border = '2px solid #222';
    cardTitle = `<div style="background:#222;color:white;text-align:center;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;padding:6px;text-transform:uppercase;">Mais Encomendado</div>`;
  }

  const isDisabled = false; // Never disabled now, out of stock goes to encomenda

  card.innerHTML = `
    ${cardTitle}
    <div class="product-card-img-wrap">
      ${imgHtml}
      <div class="card-badges" style="top: ${cardTitle ? '40px' : '10px'}">${badgesHtml}</div>
      <button class="card-favorite ${fav ? 'active' : ''}" title="Favoritar" aria-label="Favoritar produto" style="top: ${cardTitle ? '40px' : '10px'}">
        <svg viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
    <div class="product-card-body">
      ${produto.marca ? `<div class="card-brand">${produto.marca}</div>` : ''}
      <div class="card-name">${produto.nome}</div>
      <div class="card-price">${formatCurrency(produto.preco)}</div>
      ${stockText}
    </div>
    <div class="product-card-footer">
      ${!isDisabled ? qtyControlHtml(produto.id) : ''}
      <button class="btn-add-cart" ${isDisabled ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        ${isEncomendaAction ? 'Encomendar' : 'Adicionar'}
      </button>
    </div>
  `;

  // Favorite toggle
  card.querySelector('.card-favorite').addEventListener('click', e => {
    e.stopPropagation();
    const added = toggleFavorite(produto);
    const btn = card.querySelector('.card-favorite');
    btn.classList.toggle('active', added);
    const icon = btn.querySelector('svg');
    icon.setAttribute('fill', added ? 'currentColor' : 'none');
    showToast(added ? 'Adicionado aos favoritos' : 'Removido dos favoritos', added ? 'gold' : 'default');
  });

  // Wire quantity + cart
  if (!isDisabled) {
    const addBtn = card.querySelector('.btn-add-cart');
    wireQtyAndCart(card, produto, addBtn, false);
  }

  // Open details modal
  card.addEventListener('click', e => {
    if (e.target.closest('.card-favorite') || e.target.closest('.btn-add-cart') || e.target.closest('.qty-control')) return;

    const modalId = `modal-qty-${produto.id}`;

    const images = [produto.imagem_url, produto.imagem_url_2, produto.imagem_url_3].filter(Boolean);
    const mainImg = images[0] || '';

    let galleryHtml = '';
    if (images.length > 1) {
      galleryHtml = `
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
          ${images.map((img, idx) => `
            <img src="${img}" class="modal-gallery-thumb" data-src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid ${idx===0 ? 'var(--gold)' : 'transparent'};transition:all 0.2s;background:#fff;padding:2px;box-shadow:0 1px 3px rgba(0,0,0,0.05);" />
          `).join('')}
        </div>
      `;
    }

    const { overlay } = openModal({
      title: produto.nome,
      maxWidth: '600px',
      body: `
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div style="width:100%;text-align:center;background:#f5f5f5;border-radius:8px;padding:20px;">
            <div style="position:relative;display:inline-block;max-width:100%;">
              ${images.length > 1 ? `
                <button class="modal-gallery-prev" style="position:absolute;left:-10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.7);border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.1);z-index:10;color:var(--gray-700);backdrop-filter:blur(4px);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                <button class="modal-gallery-next" style="position:absolute;right:-10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.7);border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.1);z-index:10;color:var(--gray-700);backdrop-filter:blur(4px);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
              ` : ''}
              <img id="modal-main-img-${produto.id}" src="${mainImg}" alt="${produto.nome}" style="max-width:100%;max-height:40vh;object-fit:contain;border-radius:4px;transition:opacity 0.2s;" />
            </div>
            ${galleryHtml}
          </div>
          <div>
            ${produto.marca ? `<p style="color:var(--gray-500);font-size:0.9rem;text-transform:uppercase;margin-bottom:4px;">${produto.marca}</p>` : ''}
            <h2 style="font-size:1.5rem;margin-bottom:8px;">${formatCurrency(produto.preco)}</h2>
            ${stockText}
            <div style="margin-top:16px;color:var(--gray-600);line-height:1.6;font-size:0.95rem;white-space:pre-wrap;">${produto.descricao || 'Nenhuma descrição disponível para este produto.'}</div>
          </div>
        </div>
      `,
      footer: `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          ${!isDisabled ? `<div class="qty-control" id="modal-qty-${produto.id}"><button class="qty-btn qty-minus" type="button">−</button><span class="qty-value">1</span><button class="qty-btn qty-plus" type="button">+</button></div>` : ''}
          <button class="btn btn-primary" id="modal-add-cart-${produto.id}" style="flex:1;" ${isDisabled ? 'disabled' : ''}>
            ${isEncomendaAction ? '📦 Encomendar' : '🛒 Adicionar ao Carrinho'}
          </button>
        </div>
      `
    });

    // Wire qty + add button directly using the overlay reference
    if (!isDisabled) {
      const addBtn = overlay.querySelector(`#modal-add-cart-${produto.id}`);
      wireQtyAndCart(overlay, produto, addBtn, true);
    }

    // Wire gallery thumbnails and arrows
    if (images.length > 1) {
      const thumbs = overlay.querySelectorAll('.modal-gallery-thumb');
      const mainImgEl = overlay.querySelector(`#modal-main-img-${produto.id}`);
      let currentIndex = 0;

      const updateImage = (index) => {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;

        mainImgEl.style.opacity = '0.5';
        setTimeout(() => {
          mainImgEl.src = images[currentIndex];
          mainImgEl.style.opacity = '1';
        }, 150);

        thumbs.forEach((th, idx) => {
          th.style.borderColor = idx === currentIndex ? 'var(--gold)' : 'transparent';
        });
      };

      thumbs.forEach((t, idx) => {
        t.addEventListener('click', () => updateImage(idx));
      });

      const prevBtn = overlay.querySelector('.modal-gallery-prev');
      const nextBtn = overlay.querySelector('.modal-gallery-next');
      if (prevBtn) prevBtn.addEventListener('click', () => updateImage(currentIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => updateImage(currentIndex + 1));
    }
  });

  return card;
}

export function createSkeletonCards(count = 8) {
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'product-card loading';
    card.innerHTML = `
      <div class="product-card-img-wrap skeleton" style="aspect-ratio:1/1"></div>
      <div class="product-card-body" style="gap:10px">
        <div class="card-brand skeleton" style="height:12px;width:60px">&nbsp;</div>
        <div class="card-name skeleton" style="height:16px;width:90%">&nbsp;</div>
        <div class="card-price skeleton" style="height:20px;width:50%">&nbsp;</div>
      </div>
    `;
    grid.appendChild(card);
  }
  return grid;
}
