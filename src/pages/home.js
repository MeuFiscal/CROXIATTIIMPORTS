// ======================================================
// HOME PAGE — Vitrine principal
// ======================================================
import { supabase } from '../supabase.js';
import { createProductCard, createSkeletonCards } from '../components/productCard.js';
import { navigate } from '../router.js';

export async function renderHome(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  const page = document.createElement('div');
  page.className = 'home-page';
  page.innerHTML = `
    <div class="container">
      <!-- Hero Banner -->
      <section class="hero-banner" aria-label="Banner principal">
        <div class="hero-gradient"></div>
        <div class="hero-content">
          <div class="hero-label">✦ Importados Exclusivos</div>
          <h1 class="hero-title">Sofisticação que <strong>transcende fronteiras</strong></h1>
          <p class="hero-subtitle">Curadoria selecionada dos melhores produtos importados para quem valoriza qualidade e exclusividade.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" id="hero-shop-btn">Explorar Vitrine</button>
            <button class="btn btn-outline" style="border-color:rgba(255,255,255,0.3);color:white" id="hero-order-btn">Fazer Encomenda</button>
          </div>
        </div>
        <div class="hero-ornament">C</div>
      </section>

      <!-- Produtos em Destaque -->
      <section class="home-section" id="section-destaque">
        <div class="home-section-header">
          <div>
            <div class="text-xs uppercase text-gold font-semibold" style="letter-spacing:.15em;margin-bottom:4px">Coleção Especial</div>
            <h2 class="home-section-title">Produtos em Destaque</h2>
          </div>
          <button class="view-all" id="view-all-destaque">
            Ver todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div id="destaque-grid" class="featured-scroll"></div>
      </section>

      <!-- Mais Encomendados -->
      <section class="home-section" id="section-top">
        <div class="home-section-header">
          <div>
            <div class="text-xs uppercase text-gold font-semibold" style="letter-spacing:.15em;margin-bottom:4px">Ranking</div>
            <h2 class="home-section-title">Mais Encomendados</h2>
          </div>
          <button class="view-all" id="view-all-top">
            Ver todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div id="top-grid" class="product-grid"></div>
      </section>

      <!-- Vitrine Geral -->
      <section class="home-section">
        <div class="home-section-header">
          <div>
            <div class="text-xs uppercase text-gold font-semibold" style="letter-spacing:.15em;margin-bottom:4px">Nossa Coleção</div>
            <h2 class="home-section-title">Vitrine Completa</h2>
          </div>
          <div id="vitrine-count" class="text-sm text-muted"></div>
        </div>
        <div id="vitrine-grid" class="product-grid"></div>
        <div id="load-more-wrap" style="text-align:center;margin-top:32px"></div>
      </section>
    </div>
  `;

  container.appendChild(page);

  // Events
  page.querySelector('#hero-shop-btn').addEventListener('click', () => {
    document.getElementById('section-destaque')?.scrollIntoView({ behavior: 'smooth' });
  });
  page.querySelector('#hero-order-btn').addEventListener('click', () => navigate('/search?filter=encomenda'));
  page.querySelector('#view-all-destaque').addEventListener('click', () => navigate('/search?filter=destaque'));
  page.querySelector('#view-all-top').addEventListener('click', () => navigate('/search?sort=top'));

  // Load data
  await Promise.all([loadDestaque(), loadTop(), loadVitrine()]);
}

async function loadDestaque() {
  const grid = document.getElementById('destaque-grid');
  if (!grid) return;

  grid.appendChild(createSkeletonCards(4));

  const { data } = await supabase
    .from('produtos')
    .select('*')
    .eq('destaque', true)
    .order('total_pedidos', { ascending: false })
    .limit(8);

  grid.innerHTML = '';

  if (!data || data.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray-400);font-size:.9rem;padding:16px 0">Nenhum produto em destaque ainda.</p>';
    return;
  }

  data.forEach(p => grid.appendChild(createProductCard(p)));
}

async function loadTop() {
  const grid = document.getElementById('top-grid');
  if (!grid) return;

  grid.appendChild(createSkeletonCards(4));

  const { data } = await supabase
    .from('produtos')
    .select('*')
    .gt('total_pedidos', 0)
    .order('total_pedidos', { ascending: false })
    .limit(8);

  grid.innerHTML = '';

  if (!data || data.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray-400);font-size:.9rem;padding:16px 0">Os mais encomendados aparecerão aqui.</p>';
    return;
  }

  data.forEach(p => grid.appendChild(createProductCard(p)));
}

let vitrineOffset = 0;
const PAGE_SIZE = 12;

async function loadVitrine(append = false) {
  const grid = document.getElementById('vitrine-grid');
  const countEl = document.getElementById('vitrine-count');
  const loadMoreWrap = document.getElementById('load-more-wrap');
  if (!grid) return;

  if (!append) {
    vitrineOffset = 0;
    grid.appendChild(createSkeletonCards(8));
  }

  const { data, count } = await supabase
    .from('produtos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(vitrineOffset, vitrineOffset + PAGE_SIZE - 1);

  if (!append) grid.innerHTML = '';
  if (countEl && count !== null) countEl.textContent = `${count} produto${count !== 1 ? 's' : ''}`;

  if (!data || data.length === 0) {
    if (!append) grid.innerHTML = '<div class="empty-state"><div class="icon">📦</div><h3>Vitrine vazia</h3><p>Em breve novos produtos serão adicionados.</p></div>';
    loadMoreWrap.innerHTML = '';
    return;
  }

  data.forEach(p => grid.appendChild(createProductCard(p)));
  vitrineOffset += data.length;

  loadMoreWrap.innerHTML = '';
  if (data.length === PAGE_SIZE) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-lg';
    btn.textContent = 'Carregar mais produtos';
    btn.addEventListener('click', () => loadVitrine(true));
    loadMoreWrap.appendChild(btn);
  }
}
