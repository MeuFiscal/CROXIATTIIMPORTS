// ======================================================
// DRAWER MENU — Menu lateral mobile (V3)
// ======================================================
import { supabase, getCustomerSession, getProfile, signOutCustomer } from '../supabase.js';
import { navigate } from '../router.js';

let drawerEl = null;
let overlayEl = null;

// Helper para criar o HTML do menu
function buildDrawerHTML(profile) {
  const userName = profile ? profile.nome.split(' ')[0] : null;
  const greeting = userName ? `Olá, ${userName}` : 'Faça seu Login';
  const accountLink = userName ? '#/account' : '#/login';
  const loginAction = userName ? '<button id="drawer-logout" class="drawer-link" style="color: var(--error); border: none; background: none; width: 100%; text-align: left; padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 1rem;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Sair da Conta</button>' : '';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return `
    <div class="drawer-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 16px; border-bottom: 1px solid rgba(200,155,60,0.2);">
      <h2 style="font-family: var(--font-serif); font-size: 1.1rem; letter-spacing: 0.1em; color: var(--gold); margin: 0;">CROXIATTI IMPORTS</h2>
      <button id="drawer-close-btn" style="background: none; border: none; color: var(--white); cursor: pointer; padding: 4px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div class="drawer-user" style="padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <a href="${accountLink}" class="drawer-user-link" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--white);">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gold); color: var(--black); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
          ${userName ? userName.charAt(0).toUpperCase() : '👤'}
        </div>
        <div>
          <div style="font-size: 1rem; font-weight: 500;">${greeting}</div>
          ${!userName ? '<div style="font-size: 0.8rem; color: var(--gold); margin-top: 2px;">Entrar ou Cadastrar ›</div>' : '<div style="font-size: 0.8rem; color: var(--gold); margin-top: 2px;">Minha Conta ›</div>'}
        </div>
      </a>
    </div>

    <div class="drawer-body" style="padding: 12px 0; overflow-y: auto; flex: 1;">
      <a href="#/" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--white); text-decoration: none; font-size: 1rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        Início
      </a>

      <!-- Categorias Dropdown -->
      <div class="drawer-dropdown" id="drawer-cat-dropdown">
        <button class="drawer-link drawer-dropdown-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; color: var(--white); cursor: pointer; font-size: 1rem;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Categorias
          </div>
          <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="drawer-dropdown-content" id="drawer-categories-container" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; background: rgba(255,255,255,0.03);">
          <div style="padding: 8px 0 8px 48px; display: flex; flex-direction: column; gap: 12px; font-size: 0.95rem; color: var(--gray-300);">
            Carregando...
          </div>
        </div>
      </div>

      <a href="#/search?filter=encomenda" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--white); text-decoration: none; font-size: 1rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        Fazer Encomenda
      </a>

      <a href="#/favorites" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--white); text-decoration: none; font-size: 1rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        Favoritos
      </a>

      <a href="#/my-orders" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--white); text-decoration: none; font-size: 1rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        Meus Pedidos
      </a>

      <div style="height: 1px; background: rgba(200,155,60,0.2); margin: 16px 16px;"></div>

      ${isAdmin ? `
      <a href="#/admin" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--gray-400); text-decoration: none; font-size: 0.95rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        Painel Admin
      </a>` : ''}

      <a href="#/policy" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--gray-400); text-decoration: none; font-size: 0.95rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        Política de Trocas
      </a>

      <a href="#/faq" class="drawer-link" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; color: var(--gray-400); text-decoration: none; font-size: 0.95rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Dúvidas Frequentes
      </a>

      ${loginAction}
    </div>
  `;
}

// Cria o drawer se não existir
async function initDrawer() {
  if (drawerEl) return;

  const session = await getCustomerSession();
  let profile = null;
  if (session) {
    profile = await getProfile();
  }

  overlayEl = document.createElement('div');
  Object.assign(overlayEl.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: '9998',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  });

  drawerEl = document.createElement('div');
  Object.assign(drawerEl.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '280px',
    maxWidth: '85vw',
    height: '100vh',
    background: '#111111',
    color: 'var(--white)',
    zIndex: '9999',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
    overflow: 'hidden'
  });

  drawerEl.innerHTML = buildDrawerHTML(profile);

  document.body.appendChild(overlayEl);
  document.body.appendChild(drawerEl);

  // Event Listeners
  drawerEl.querySelector('#drawer-close-btn').addEventListener('click', closeDrawer);
  overlayEl.addEventListener('click', closeDrawer);
  
  // Sair da conta
  const logoutBtn = drawerEl.querySelector('#drawer-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOutCustomer();
      closeDrawer();
      window.location.reload();
    });
  }

  // Links normais - fecham o drawer
  drawerEl.querySelectorAll('a.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Dropdown Categorias
  const dropBtn = drawerEl.querySelector('.drawer-dropdown-btn');
  const dropContent = drawerEl.querySelector('#drawer-categories-container');
  const dropArrow = drawerEl.querySelector('.dropdown-arrow');

  dropBtn.addEventListener('click', () => {
    const isOpen = dropContent.style.maxHeight !== '0px';
    if (isOpen) {
      dropContent.style.maxHeight = '0px';
      dropArrow.style.transform = 'rotate(0deg)';
    } else {
      dropContent.style.maxHeight = dropContent.scrollHeight + 'px';
      dropArrow.style.transform = 'rotate(180deg)';
    }
  });

  // Carregar Categorias
  loadCategories();
}

async function loadCategories() {
  if (!drawerEl) return;
  const catContainer = drawerEl.querySelector('#drawer-categories-container');
  
  try {
    const { data } = await supabase.from('categorias').select('id, nome').order('ordem', { ascending: true });
    
    let html = '';
    if (data && data.length > 0) {
      html = data.map(cat => 
        `<a href="#/search?categoria=${cat.id}" style="color: var(--gray-300); text-decoration: none; display: block; padding: 4px 0;">${cat.nome}</a>`
      ).join('');
    } else {
      html = `
        <a href="#/search?q=perfume" style="color: var(--gray-300); text-decoration: none; display: block; padding: 4px 0;">PERFUMES</a>
        <a href="#/search?q=skincare" style="color: var(--gray-300); text-decoration: none; display: block; padding: 4px 0;">SKINCARE</a>
        <a href="#/search?q=cabelo" style="color: var(--gray-300); text-decoration: none; display: block; padding: 4px 0;">CABELOS</a>
        <a href="#/search?q=corpo" style="color: var(--gray-300); text-decoration: none; display: block; padding: 4px 0;">CORPO E BANHO</a>
        <a href="#/search?q=maquiagem" style="color: var(--gray-300); text-decoration: none; display: block; padding: 4px 0;">MAQUIAGEM</a>
      `;
    }
    
    catContainer.innerHTML = `<div style="padding: 8px 0 8px 48px; display: flex; flex-direction: column; gap: 12px; font-size: 0.95rem;">${html}</div>`;
    
    // Atualiza event listeners dos novos links
    catContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Se estiver aberto, atualiza a altura
    if (catContainer.style.maxHeight !== '0px') {
      catContainer.style.maxHeight = catContainer.scrollHeight + 'px';
    }

  } catch (err) {
    console.error("Erro ao carregar categorias no drawer", err);
  }
}

export async function openDrawer() {
  // Sempre reinicia para garantir que mostra os dados atualizados (como nome do usuário logado)
  if (drawerEl) {
    drawerEl.remove();
    drawerEl = null;
  }
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }

  await initDrawer();

  document.body.style.overflow = 'hidden';
  overlayEl.style.pointerEvents = 'auto';
  
  // Pequeno delay para a animação rodar após injetar no DOM
  requestAnimationFrame(() => {
    overlayEl.style.opacity = '1';
    drawerEl.style.transform = 'translateX(0)';
  });
}

export function closeDrawer() {
  if (!drawerEl || !overlayEl) return;

  overlayEl.style.opacity = '0';
  drawerEl.style.transform = 'translateX(-100%)';
  document.body.style.overflow = '';
  
  setTimeout(() => {
    overlayEl.style.pointerEvents = 'none';
  }, 300);
}
