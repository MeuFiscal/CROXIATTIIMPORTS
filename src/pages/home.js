// ======================================================
// HOME PAGE — Vitrine principal (V3 - Optimized)
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
      <!-- Hero Banner Dark Luxury (compact V3) -->
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

      <!-- Categories Pills -->
      <div id="home-categories-wrap" class="container" style="padding-top: 24px; padding-bottom: 8px;"></div>

      <!-- Vitrine Geral -->
      <section class="home-section container" style="padding-top: 16px;">
        <div class="home-section-header">
          <div>
            <div class="text-xs uppercase font-semibold" style="color: var(--gold); letter-spacing: 0.15em; margin-bottom: 4px;">Nossa Coleção</div>
            <h2 class="home-section-title">Vitrine Completa</h2>
          </div>
          <div id="vitrine-count" class="text-sm text-muted"></div>
        </div>
        <div id="vitrine-grid" class="product-grid"></div>
        <div id="load-more-wrap" style="text-align:center;margin-top:24px"></div>
      </section>

      <!-- Comentários de Clientes -->
      <section class="home-section container" style="padding-top: 16px; padding-bottom: 24px;">
        <div class="home-section-header" style="justify-content:center; text-align:center; margin-bottom: 24px;">
          <div>
            <div class="text-xs uppercase font-semibold" style="color: var(--gold); letter-spacing: 0.15em; margin-bottom: 4px;">O que dizem nossos clientes</div>
            <h2 class="home-section-title">Avaliações</h2>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div style="background:var(--gray-50); padding:20px; border-radius:12px; border:1px solid var(--gray-100); text-align:center;">
            <div style="color:var(--gold); font-size:1.2rem; margin-bottom:8px;">★★★★★</div>
            <p style="font-size:0.9rem; color:var(--gray-700); font-style:italic; margin-bottom:12px;">"Perfumes de ótima qualidade! Chegaram perfeitamente embalados e a fragrância é incrível."</p>
            <strong style="font-size:0.8rem; color:var(--black);">— Mariana S.</strong>
          </div>
          <div style="background:var(--gray-50); padding:20px; border-radius:12px; border:1px solid var(--gray-100); text-align:center;">
            <div style="color:var(--gold); font-size:1.2rem; margin-bottom:8px;">★★★★★</div>
            <p style="font-size:0.9rem; color:var(--gray-700); font-style:italic; margin-bottom:12px;">"Atendimento ótimo e mercadorias de qualidade. Tive todo o suporte pelo WhatsApp."</p>
            <strong style="font-size:0.8rem; color:var(--black);">— Carlos E.</strong>
          </div>
          <div style="background:var(--gray-50); padding:20px; border-radius:12px; border:1px solid var(--gray-100); text-align:center;">
            <div style="color:var(--gold); font-size:1.2rem; margin-bottom:8px;">★★★★★</div>
            <p style="font-size:0.9rem; color:var(--gray-700); font-style:italic; margin-bottom:12px;">"A melhor loja de cosméticos importados. Os produtos são impecáveis."</p>
            <strong style="font-size:0.8rem; color:var(--black);">— Fernanda L.</strong>
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

  // Load Categories
  await loadCategories();

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

async function loadCategories() {
  const wrap = document.getElementById('home-categories-wrap');
  if (!wrap) return;

  const { data } = await supabase
    .from('categorias')
    .select('id, nome')
    .order('ordem', { ascending: true });

  if (!data || data.length === 0) return;

  wrap.innerHTML = `
    <div style="display:flex; gap:12px; overflow-x:auto; padding-bottom:12px; scrollbar-width:none;" class="hide-scrollbar">
      <button class="btn btn-primary" style="border-radius:24px; padding:8px 20px; white-space:nowrap; flex-shrink:0; font-size:0.85rem;" onclick="window.location.hash='/'">Todas</button>
      ${data.map(c => `
        <button class="btn btn-outline" style="border-radius:24px; padding:8px 20px; white-space:nowrap; flex-shrink:0; font-size:0.85rem; border-color:var(--gray-200); color:var(--gray-700);" onclick="window.location.hash='/search?categoria=${c.id}'">${c.nome}</button>
      `).join('')}
    </div>
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
