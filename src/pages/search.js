// ======================================================
// SEARCH PAGE — Pesquisa com filtros
// ======================================================
import { supabase } from '../supabase.js';
import { createProductCard, createSkeletonCards } from '../components/productCard.js';
import { getParams, navigate } from '../router.js';

export async function renderSearch(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  const { params } = getParams();
  const initialQ = params.q || '';
  const initialCategoria = params.categoria || '';
  const initialFilter = params.filter || '';
  const initialSort = params.sort || '';

  container.innerHTML = `
    <div class="container search-page">
      <div style="margin-bottom:24px">
        <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Buscar Produtos</h1>
      </div>

      <div class="filter-bar">
        <div class="form-group" style="flex:1;min-width:200px">
          <label class="form-label">Buscar</label>
          <input type="search" class="form-input" id="search-q" placeholder="Nome ou marca..." value="${initialQ}" />
        </div>
        <div class="form-group" style="min-width:150px">
          <label class="form-label">Marca</label>
          <select class="form-input" id="search-marca">
            <option value="">Todas</option>
          </select>
        </div>
        <div class="form-group" style="min-width:130px">
          <label class="form-label">Preço mín.</label>
          <input type="number" class="form-input" id="price-min" placeholder="R$ 0" min="0" />
        </div>
        <div class="form-group" style="min-width:130px">
          <label class="form-label">Preço máx.</label>
          <input type="number" class="form-input" id="price-max" placeholder="Sem limite" min="0" />
        </div>
        <div class="form-group" style="min-width:150px">
          <label class="form-label">Ordenar por</label>
          <select class="form-input" id="search-sort">
            <option value="" ${!initialSort ? 'selected' : ''}>Mais recentes</option>
            <option value="top" ${initialSort === 'top' ? 'selected' : ''}>Mais encomendados</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>
      </div>

      <div class="search-filters" id="chip-filters">
        <button class="chip ${!initialFilter ? 'active' : ''}" data-filter="">Todos</button>
        <button class="chip ${initialFilter === 'destaque' ? 'active' : ''}" data-filter="destaque">★ Destaques</button>
        <button class="chip ${initialFilter === 'encomenda' ? 'active' : ''}" data-filter="encomenda">Só por Encomenda</button>
        <button class="chip ${initialFilter === 'estoque' ? 'active' : ''}" data-filter="estoque">Em Estoque</button>
      </div>

      <div id="search-count" class="search-count"></div>
      <div id="search-results-grid" class="product-grid"></div>
      <div id="search-load-more" style="text-align:center;margin-top:32px"></div>
    </div>
  `;

  // Load brands for select
  const { data: brandData } = await supabase.from('produtos').select('marca').not('marca', 'is', null);
  const brands = [...new Set((brandData || []).map(r => r.marca).filter(Boolean))].sort();
  const marcaSelect = container.querySelector('#search-marca');
  brands.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    marcaSelect.appendChild(o);
  });

  let currentFilter = initialFilter;
  let searchOffset = 0;
  const PAGE = 12;

  const doSearch = async (append = false) => {
    const q = container.querySelector('#search-q').value.trim();
    const marca = container.querySelector('#search-marca').value;
    const priceMin = parseFloat(container.querySelector('#price-min').value) || null;
    const priceMax = parseFloat(container.querySelector('#price-max').value) || null;
    const sort = container.querySelector('#search-sort').value;
    const grid = container.querySelector('#search-results-grid');
    const countEl = container.querySelector('#search-count');
    const loadMoreWrap = container.querySelector('#search-load-more');

    if (!append) {
      searchOffset = 0;
      grid.innerHTML = '';
      const sk = createSkeletonCards(8); grid.appendChild(sk);
    }

    let query = supabase.from('produtos').select('*', { count: 'exact' });
    if (q) query = query.ilike('nome', `%${q}%`);
    if (initialCategoria) query = query.eq('categoria_id', initialCategoria);
    if (marca) query = query.eq('marca', marca);
    if (priceMin !== null) query = query.gte('preco', priceMin);
    if (priceMax !== null) query = query.lte('preco', priceMax);
    if (currentFilter === 'destaque') query = query.eq('destaque', true);
    if (currentFilter === 'encomenda') query = query.eq('apenas_encomenda', true);
    if (currentFilter === 'estoque') query = query.gt('quantidade', 0);

    if (sort === 'top') query = query.order('total_pedidos', { ascending: false });
    else if (sort === 'price_asc') query = query.order('preco', { ascending: true });
    else if (sort === 'price_desc') query = query.order('preco', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query = query.range(searchOffset, searchOffset + PAGE - 1);

    const { data, count } = await query;

    if (!append) grid.innerHTML = '';
    if (countEl) countEl.textContent = `${count || 0} produto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;

    if (!data || data.length === 0) {
      if (!append) grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="icon">🔍</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outros termos ou remova os filtros.</p>
        </div>`;
      loadMoreWrap.innerHTML = '';
      return;
    }

    data.forEach(p => grid.appendChild(createProductCard(p)));
    searchOffset += data.length;

    loadMoreWrap.innerHTML = '';
    if (data.length === PAGE) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-lg';
      btn.textContent = 'Carregar mais';
      btn.addEventListener('click', () => doSearch(true));
      loadMoreWrap.appendChild(btn);
    }
  };

  // Chip filters
  container.querySelectorAll('#chip-filters .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('#chip-filters .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      doSearch();
    });
  });

  // Inputs debounce
  let debounce = null;
  ['#search-q', '#price-min', '#price-max'].forEach(sel => {
    container.querySelector(sel)?.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(doSearch, 350);
    });
  });
  container.querySelector('#search-marca')?.addEventListener('change', doSearch);
  container.querySelector('#search-sort')?.addEventListener('change', doSearch);

  doSearch();
}
