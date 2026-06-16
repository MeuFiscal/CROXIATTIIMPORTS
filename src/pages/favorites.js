// ======================================================
// FAVORITES PAGE
// ======================================================
import { getFavorites, toggleFavorite, on } from '../store.js';
import { createProductCard } from '../components/productCard.js';
import { navigate } from '../router.js';

export function renderFavorites(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  const render = () => {
    const favs = getFavorites();
    container.innerHTML = `
      <div class="container favorites-page">
        <div style="margin-bottom:24px">
          <h1 style="font-family:var(--font-serif);font-size:2rem;font-weight:500">Meus Favoritos</h1>
          <p style="color:var(--gray-500);font-size:.9rem">${favs.length} produto${favs.length !== 1 ? 's' : ''} favorito${favs.length !== 1 ? 's' : ''}</p>
        </div>
        ${favs.length === 0 ? `
          <div class="empty-state">
            <div class="icon">❤️</div>
            <h3>Nenhum favorito ainda</h3>
            <p>Toque no ❤ nos produtos para salvá-los aqui.</p>
            <button class="btn btn-primary" id="fav-explore">Explorar produtos</button>
          </div>
        ` : `
          <div class="product-grid" id="fav-grid"></div>
        `}
      </div>
    `;

    container.querySelector('#fav-explore')?.addEventListener('click', () => navigate('/'));

    const grid = container.querySelector('#fav-grid');
    if (grid) favs.forEach(p => grid.appendChild(createProductCard(p)));
  };

  render();
  const unsub = on('favsChange', render);
  return { cleanup: unsub };
}
