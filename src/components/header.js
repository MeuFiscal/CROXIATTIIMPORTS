// ======================================================
// HEADER — Cabeçalho principal com pesquisa e ações
// ======================================================
import { navigate } from '../router.js';
import { getCartCount, on } from '../store.js';
import { supabase } from '../supabase.js';

let searchTimeout = null;
let searchResultsEl = null;
let headerElement = null;

export function renderHeader(app) {
  if (document.getElementById('app-header')) {
    if (headerElement && !app.contains(headerElement)) app.prepend(headerElement);
    return;
  }
  if (headerElement && !app.contains(headerElement)) {
    app.prepend(headerElement);
    return;
  }

  headerElement = document.createElement('header');
  headerElement.className = 'app-header';
  headerElement.id = 'app-header';
  headerElement.innerHTML = `
    <div class="container header-inner">
      
      <!-- Logo na Esquerda -->
      <a href="#/" class="header-logo" id="logo-home">
        <img src="/logo.png" alt="Croxiatti Imports" />
      </a>

      <!-- Busca no Centro -->
      <div class="header-search">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input type="search" id="header-search-input" placeholder="Buscar produtos..." autocomplete="off" />
        <button class="search-clear" id="search-clear-btn" title="Limpar pesquisa">✕</button>
        <div class="search-results" id="search-results-dropdown"></div>
      </div>

      <!-- Ícones na Direita -->
      <div class="header-actions">
        <a href="#/my-orders" class="header-nav-link hide-mobile" id="header-orders-btn">Meus Pedidos</a>
        <a href="#/admin" class="header-nav-link hide-mobile">Painel Admin</a>
        
        <button class="header-btn" id="header-fav-btn" aria-label="Favoritos" title="Favoritos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        <button class="header-btn" id="header-cart-btn" aria-label="Carrinho" title="Carrinho">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="btn-cart-count" id="cart-count-badge">0</span>
        </button>
      </div>
    </div>

    <!-- Barra de Categorias Premium -->
    <div class="header-categories">
      <div class="container categories-inner" id="header-categories-inner">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  app.prepend(headerElement);

  // Load categories
  supabase.from('categorias').select('id, nome').order('ordem', { ascending: true })
    .then(({ data }) => {
      const catContainer = headerElement.querySelector('#header-categories-inner');
      if (data && data.length > 0) {
        catContainer.innerHTML = data.map(cat => 
          `<a href="#/search?categoria=${cat.id}" class="cat-link">${cat.nome}</a>`
        ).join('');
      } else {
        // Fallback para manter as originais visualmente se o banco estiver vazio
        catContainer.innerHTML = `
          <a href="#/search?q=perfume" class="cat-link">PERFUMES</a>
          <a href="#/search?q=skincare" class="cat-link">SKINCARE</a>
          <a href="#/search?q=cabelo" class="cat-link">CABELOS</a>
          <a href="#/search?q=corpo" class="cat-link">CORPO E BANHO</a>
          <a href="#/search?q=maquiagem" class="cat-link">MAQUIAGEM</a>
        `;
      }
    }).catch(() => {
        const catContainer = headerElement.querySelector('#header-categories-inner');
        catContainer.innerHTML = `
          <a href="#/search?q=perfume" class="cat-link">PERFUMES</a>
          <a href="#/search?q=skincare" class="cat-link">SKINCARE</a>
          <a href="#/search?q=cabelo" class="cat-link">CABELOS</a>
          <a href="#/search?q=corpo" class="cat-link">CORPO E BANHO</a>
          <a href="#/search?q=maquiagem" class="cat-link">MAQUIAGEM</a>
        `;
    });

  // Logo → home
  headerElement.querySelector('#logo-home').addEventListener('click', () => navigate('/'));

  // Cart count badge
  const badge = headerElement.querySelector('#cart-count-badge');
  const updateBadge = () => {
    const count = getCartCount();
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.toggle('show', count > 0);
  };
  updateBadge();
  on('cartChange', updateBadge);

  // Cart button
  headerElement.querySelector('#header-cart-btn').addEventListener('click', () => navigate('/cart'));

  // Favorites button
  headerElement.querySelector('#header-fav-btn').addEventListener('click', () => navigate('/favorites'));

  // Meus Pedidos button (desktop)
  headerElement.querySelector('#header-orders-btn')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/my-orders'); });

  // Search
  const searchInput = headerElement.querySelector('#header-search-input');
  const clearBtn = headerElement.querySelector('#search-clear-btn');
  searchResultsEl = headerElement.querySelector('#search-results-dropdown');

  searchInput.addEventListener('input', e => {
    const val = e.target.value.trim();
    clearBtn.classList.toggle('visible', val.length > 0);
    clearTimeout(searchTimeout);
    if (val.length < 1) { closeDropdown(); return; }
    searchTimeout = setTimeout(() => runSearch(val), 150);
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) { navigate(`/search?q=${encodeURIComponent(val)}`); closeDropdown(); }
    }
    if (e.key === 'Escape') closeDropdown();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    closeDropdown();
    searchInput.focus();
  });

  document.addEventListener('click', e => {
    if (!headerElement.querySelector('.header-search').contains(e.target)) closeDropdown();
  });
}

function closeDropdown() {
  if (searchResultsEl) { searchResultsEl.innerHTML = ''; searchResultsEl.classList.remove('open'); }
}

async function runSearch(query) {
  if (!searchResultsEl) return;
  searchResultsEl.innerHTML = '<div style="padding:12px 16px;text-align:center;color:var(--gray-400);font-size:.85rem">Buscando...</div>';
  searchResultsEl.classList.add('open');

  const { data } = await supabase
    .from('produtos')
    .select('id,nome,marca,preco,imagem_url')
    .or(`nome.ilike.%${query}%,marca.ilike.%${query}%`)
    .order('nome')
    .limit(8);

  if (!data || data.length === 0) {
    searchResultsEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--gray-400);font-size:.85rem">Nenhum produto encontrado</div>';
    return;
  }

  searchResultsEl.innerHTML = data.map(p => `
    <div class="search-result-item" data-id="${p.id}">
      ${p.imagem_url
        ? `<img class="search-result-img" src="${p.imagem_url}" alt="${p.nome}" loading="lazy" />`
        : `<div class="search-result-img" style="display:flex;align-items:center;justify-content:center;background:var(--gold-pale);color:var(--gold);font-size:1.2rem">✦</div>`}
      <div class="search-result-info">
        <div class="name">${p.nome}</div>
        <div class="brand">${p.marca || ''}</div>
        <div class="price">${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(p.preco)}</div>
      </div>
    </div>
  `).join('') + `<div style="padding:10px 16px;border-top:1px solid var(--gray-100)"><button class="btn btn-ghost btn-sm" style="width:100%;font-size:.82rem;color:var(--gold)" id="search-see-all">Ver todos os resultados para "${query}"</button></div>`;

  searchResultsEl.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(`/search?q=${encodeURIComponent(item.dataset.id)}&mode=id`);
      closeDropdown();
    });
  });

  document.getElementById('search-see-all')?.addEventListener('click', () => {
    navigate(`/search?q=${encodeURIComponent(document.querySelector('#header-search-input').value.trim())}`);
    closeDropdown();
  });
}

export function resetHeader() {
  headerRendered = false;
  document.getElementById('app-header')?.remove();
}
