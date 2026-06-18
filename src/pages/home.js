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
      <!-- Hero Banner Dark Luxury -->
      <section class="hero-banner-dark" aria-label="Banner principal">
        <div class="hero-dark-bg"></div>
        <div class="hero-dark-overlay"></div>

        <div class="hero-dark-content">
          <!-- Crown logo monogram -->
          <div class="hero-crown">
            <img src="/logo.png" alt="Croxiatti" class="hero-crown-img" />
          </div>

          <p class="hero-dark-label">✦ SELEÇÃO PREMIUM DE BELEZA E PERFUMARIA</p>

          <h1 class="hero-dark-title">
            REALCE SUA BELEZA.<br>
            <span class="hero-dark-title-gold">MARQUE SUA PRESENÇA.</span>
          </h1>

          <p class="hero-dark-sub" style="max-width:700px; margin: 0 auto;">
            Perfumes, skincare e cuidados pessoais selecionados para quem valoriza qualidade, sofisticação e autocuidado em cada detalhe.
          </p>

          <div class="hero-dark-actions">
            <button class="hero-btn-solid" id="hero-shop-btn">EXPLORAR VITRINE &nbsp;›</button>
            <button class="hero-btn-outline" id="hero-order-btn">FAZER ENCOMENDA &nbsp;›</button>
          </div>
        </div>
      </section>

      <!-- Promo Banners (gerenciados pelo admin) -->
      <div id="promo-banners-wrap"></div>

      <!-- Vitrine Geral -->
      <section class="home-section container" style="padding-top: 20px;">
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

      <!-- Social Proof -->
      <section class="social-proof-section container" style="padding: 20px 20px 40px; border-top: 1px solid var(--gray-200); text-align: center; margin-top: 20px;">
        <div style="font-size: 0.78rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px;">Experiência Croxiatti</div>
        <h2 style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 500; color: var(--black); margin-bottom: 24px;">O que nossos clientes dizem</h2>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 20px; border-radius: var(--radius-md); max-width: 280px; width: 100%; text-align: left; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <div style="color: var(--gold); margin-bottom: 8px; font-size: 0.9rem;">★★★★★</div>
            <p style="font-size: 0.88rem; color: var(--gray-700); font-style: italic; line-height: 1.5; margin-bottom: 12px;">"Perfumes de otima qualidade."</p>
            <div style="font-weight: 600; font-size: 0.8rem; color: var(--black);">- Cliente</div>
          </div>
          <div style="background: var(--white); border: 1px solid var(--gray-200); padding: 20px; border-radius: var(--radius-md); max-width: 280px; width: 100%; text-align: left; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <div style="color: var(--gold); margin-bottom: 8px; font-size: 0.9rem;">★★★★★</div>
            <p style="font-size: 0.88rem; color: var(--gray-700); font-style: italic; line-height: 1.5; margin-bottom: 12px;">"Atendimento otimo e mercadorias de qualidade."</p>
            <div style="font-weight: 600; font-size: 0.8rem; color: var(--black);">- Cliente</div>
          </div>
        </div>
      </section>

      <!-- Trust Section -->
      <section style="background: var(--black); padding: 48px 0; margin-top: 40px;">
        <div class="container" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; text-align: center;">
          <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="color: var(--gold); background: rgba(200,155,60,0.1); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <span style="color: var(--white); font-weight: 500; font-size: 0.95rem;">Produtos Originais</span>
          </div>
          <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="color: var(--gold); background: rgba(200,155,60,0.1); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span style="color: var(--white); font-weight: 500; font-size: 0.95rem;">Atendimento Personalizado</span>
          </div>
          <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="color: var(--gold); background: rgba(200,155,60,0.1); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <span style="color: var(--white); font-weight: 500; font-size: 0.95rem;">Compra Segura</span>
          </div>
          <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="color: var(--gold); background: rgba(200,155,60,0.1); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.2"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <span style="color: var(--white); font-weight: 500; font-size: 0.95rem;">Encomendas Exclusivas</span>
          </div>
        </div>
      </section>
    </div>
  `;

  container.appendChild(page);

  // Events
  page.querySelector('#hero-shop-btn').addEventListener('click', () => {
    document.getElementById('vitrine-grid')?.scrollIntoView({ behavior: 'smooth' });
  });
  page.querySelector('#hero-order-btn').addEventListener('click', () => navigate('/search?filter=encomenda'));

  // Load promo banners
  loadPromoBanners();

  // Load data
  await loadVitrine();
}

async function loadPromoBanners() {
  const wrap = document.getElementById('promo-banners-wrap');
  if (!wrap) return;

  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = `
    <section class="promo-banners-section" aria-label="Banners promocionais">
      ${data.map(b => `
        <div class="promo-banner-item">
          <img
            src="${b.imagem_url}"
            alt="${b.titulo || 'Promoção Croxiatti Imports'}"
            class="promo-banner-img"
            loading="lazy"
          />
        </div>
      `).join('')}
    </section>
  `;
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
