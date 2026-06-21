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
            <button class="hero-btn-outline" id="hero-order-btn" style="display:flex; align-items:center; justify-content:center; gap:8px;">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              chamar no Whatsapp
            </button>
          </div>
        </div>
      </section>

      <!-- Promo Banners (gerenciados pelo admin) -->
      <div id="promo-banners-wrap"></div>

      <!-- Categories Pills -->
      <div id="home-categories-wrap" class="container hide-desktop" style="padding-top: 24px; padding-bottom: 8px;"></div>

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
  page.querySelector('#hero-order-btn').addEventListener('click', () => {
    const msg = encodeURIComponent('Olá, vim por sua loja Croxiatti Imports, desejo saber mais sobre um Item!');
    window.open(`https://wa.me/5544998766259?text=${msg}`, '_blank');
  });

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
