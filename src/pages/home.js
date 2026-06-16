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

          <p class="hero-dark-label">✦ IMPORTADOS EXCLUSIVOS</p>

          <h1 class="hero-dark-title">
            SOFISTICAÇÃO QUE<br>
            <span class="hero-dark-title-gold">TRANSCENDE FRONTEIRAS</span>
          </h1>

          <p class="hero-dark-sub">
            Curadoria selecionada dos melhores produtos importados<br>
            para quem valoriza qualidade e exclusividade.
          </p>

          <div class="hero-dark-actions">
            <button class="hero-btn-solid" id="hero-shop-btn">EXPLORAR VITRINE &nbsp;›</button>
            <button class="hero-btn-outline" id="hero-order-btn">FAZER ENCOMENDA &nbsp;›</button>
          </div>
        </div>

        <!-- Feature bar -->
        <div class="hero-features">
          <div class="hero-feature">
            <span class="hero-feature-icon">🏆</span>
            <div>
              <strong>PRODUTOS 100% ORIGINAIS</strong>
              <span>Garantia de autenticidade</span>
            </div>
          </div>
          <div class="hero-feature">
            <span class="hero-feature-icon">💎</span>
            <div>
              <strong>QUALIDADE PREMIUM</strong>
              <span>Selecionamos o melhor</span>
            </div>
          </div>
          <div class="hero-feature">
            <span class="hero-feature-icon">🔒</span>
            <div>
              <strong>COMPRA SEGURA</strong>
              <span>Seus dados protegidos</span>
            </div>
          </div>
          <div class="hero-feature">
            <span class="hero-feature-icon">💬</span>
            <div>
              <strong>ATENDIMENTO PERSONALIZADO</strong>
              <span>Fale conosco via WhatsApp</span>
            </div>
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
