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
    <div>
      <!-- Hero Banner Edge-to-Edge -->
      <section class="hero-banner" aria-label="Banner principal" style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); margin-bottom: 48px; background: var(--off-white); min-height: 400px; display: flex; align-items: center; justify-content: center; text-align: center; border-bottom: 1px solid var(--gray-200);">
        <!-- Optional Background image if they have one, kept subtle -->
        <div class="hero-bg" style="opacity: 0.15; filter: grayscale(100%);"></div>
        <div class="hero-content" style="z-index: 1; padding: 40px 20px; max-width: 800px; display: flex; flex-direction: column; align-items: center;">
          <div class="hero-label" style="color: var(--black); font-weight: 500; margin-bottom: 12px; letter-spacing: 0.2em;">✦ Importados Exclusivos</div>
          <h1 class="hero-title" style="color: var(--black); font-weight: 400; margin-bottom: 24px; text-transform: uppercase; font-size: clamp(1.8rem, 4vw, 2.5rem); letter-spacing: 0.05em;">Sofisticação que <strong>transcende fronteiras</strong></h1>
          <p class="hero-subtitle" style="color: var(--gray-600); margin-bottom: 32px; max-width: 600px;">Curadoria selecionada dos melhores produtos importados para quem valoriza qualidade e exclusividade.</p>
          <div class="hero-actions" style="display: flex; gap: 16px; justify-content: center;">
            <button class="btn btn-primary btn-lg" id="hero-shop-btn" style="min-width: 200px;">Explorar Vitrine</button>
            <button class="btn btn-outline" style="border-color: var(--gray-400); color: var(--black); min-width: 200px;" id="hero-order-btn" onmouseover="this.style.borderColor='var(--gold)'; this.style.color='var(--gold)';" onmouseout="this.style.borderColor='var(--gray-400)'; this.style.color='var(--black)';">Fazer Encomenda</button>
          </div>
        </div>
      </section>

      <!-- Produtos em Destaque -->
      <section class="home-section" id="section-destaque">
        <div class="home-section-header" style="margin-bottom: 24px;">
          <div>
            <div class="text-xs uppercase font-semibold" style="color: var(--gray-400); letter-spacing: 0.15em; margin-bottom: 8px;">Coleção Especial</div>
            <h2 class="home-section-title" style="font-weight: 400; font-size: 1.8rem;">Produtos em Destaque</h2>
          </div>
          <button class="view-all" id="view-all-destaque" style="color: var(--gold); text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;">
            Ver todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div id="destaque-grid" class="featured-scroll"></div>
      </section>

      <!-- Mais Encomendados -->
      <section class="home-section" id="section-top">
        <div class="home-section-header" style="margin-bottom: 24px;">
          <div>
            <div class="text-xs uppercase font-semibold" style="color: var(--gray-400); letter-spacing: 0.15em; margin-bottom: 8px;">Ranking</div>
            <h2 class="home-section-title" style="font-weight: 400; font-size: 1.8rem;">Mais Encomendados</h2>
          </div>
          <button class="view-all" id="view-all-top" style="color: var(--gold); text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;">
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
