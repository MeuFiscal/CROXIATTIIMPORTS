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
      <section class="hero-banner" aria-label="Banner principal" style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); margin-bottom: 24px; background: var(--off-white); padding: 40px 20px; display: flex; align-items: center; justify-content: center; text-align: center; border-bottom: 1px solid var(--gray-200);">
        <div class="hero-bg" style="opacity: 0.15; filter: grayscale(100%);"></div>
        <div class="hero-content" style="z-index: 1; max-width: 800px; display: flex; flex-direction: column; align-items: center;">
          <div class="hero-label" style="color: var(--black); font-weight: 500; margin-bottom: 8px; letter-spacing: 0.2em; font-size: 0.85rem;">✦ Importados Exclusivos</div>
          <h1 class="hero-title" style="color: var(--black); font-weight: 400; margin-bottom: 16px; text-transform: uppercase; font-size: clamp(1.5rem, 3vw, 2rem); letter-spacing: 0.05em;">Sofisticação que <strong>transcende fronteiras</strong></h1>
          <p class="hero-subtitle" style="color: var(--gray-600); margin-bottom: 24px; max-width: 600px; font-size: 0.95rem;">Curadoria selecionada dos melhores produtos importados para quem valoriza qualidade e exclusividade.</p>
          <div class="hero-actions" style="display: flex; gap: 16px; justify-content: center;">
            <button class="btn btn-primary" id="hero-shop-btn" style="min-width: 160px;">Explorar Vitrine</button>
            <button class="btn btn-outline" style="border-color: var(--gray-400); color: var(--black); min-width: 160px;" id="hero-order-btn" onmouseover="this.style.borderColor='var(--gold)'; this.style.color='var(--gold)';" onmouseout="this.style.borderColor='var(--gray-400)'; this.style.color='var(--black)';">Fazer Encomenda</button>
          </div>
        </div>
      </section>

      <!-- Vitrine Geral -->
      <section class="home-section" style="padding-top: 20px;">
        <div class="home-section-header">
          <div>
            <div class="text-xs uppercase font-semibold" style="color: var(--gold); letter-spacing: 0.15em; margin-bottom: 4px;">Nossa Coleção</div>
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
    document.getElementById('vitrine-grid')?.scrollIntoView({ behavior: 'smooth' });
  });
  page.querySelector('#hero-order-btn').addEventListener('click', () => navigate('/search?filter=encomenda'));

  // Load data
  await loadVitrine();
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
    .order('destaque', { ascending: false })
    .order('apenas_encomenda', { ascending: false })
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
