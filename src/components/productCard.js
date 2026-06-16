// ======================================================
// PRODUCT CARD — Card de produto reutilizável
// ======================================================
import { addToCart, toggleFavorite, isFavorite } from '../store.js';
import { showToast } from './toast.js';
import { navigate } from '../router.js';
import { showCartPopup } from '../pages/cart.js';

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
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

  const stockText = produto.apenas_encomenda
    ? '<span class="card-stock">Sob encomenda</span>'
    : produto.quantidade <= 0
      ? '<span class="card-stock low">Sem estoque</span>'
      : produto.quantidade <= 3
        ? `<span class="card-stock low">Últimas ${produto.quantidade} unidades</span>`
        : `<span class="card-stock">${produto.quantidade} disponíveis</span>`;

  card.innerHTML = `
    <div class="product-card-img-wrap">
      ${imgHtml}
      <div class="card-badges">${badgesHtml}</div>
      <button class="card-favorite ${fav ? 'active' : ''}" title="Favoritar" aria-label="Favoritar produto">
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
      <button class="btn-add-cart" ${(!produto.apenas_encomenda && produto.quantidade <= 0) ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Adicionar ao Carrinho
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

  // Add to cart
  card.querySelector('.btn-add-cart').addEventListener('click', e => {
    e.stopPropagation();
    addToCart(produto, 1);
    showCartPopup(produto);
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
