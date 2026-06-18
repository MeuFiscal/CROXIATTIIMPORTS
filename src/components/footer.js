// ======================================================
// FOOTER — Rodapé Premium
// ======================================================

let footerElement = null;

export function renderFooter(app) {
  if (document.getElementById('app-footer')) {
    if (footerElement && !app.contains(footerElement)) app.appendChild(footerElement);
    return;
  }
  if (footerElement && !app.contains(footerElement)) {
    app.appendChild(footerElement);
    return;
  }

  footerElement = document.createElement('footer');
  footerElement.className = 'app-footer';
  footerElement.id = 'app-footer';
  footerElement.style.cssText = `
    background: var(--black);
    color: var(--gray-300);
    padding: 64px 20px 32px;
    margin-top: auto;
    font-size: 0.9rem;
  `;

  footerElement.innerHTML = `
    <div aria-label="Por que comprar conosco" style="margin-bottom: 40px; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2);">
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
    </div>
    
    <div class="container" style="display: flex; flex-wrap: wrap; gap: 40px; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px; margin-bottom: 32px;">
      <div style="flex: 1; min-width: 250px;">
        <img src="/logo.png" alt="Croxiatti" style="height: 48px; filter: brightness(0) invert(1); margin-bottom: 16px;" />
        <p style="color: var(--gray-400); line-height: 1.6; max-width: 300px;">A mais refinada seleção de perfumes, skincare e cuidados pessoais. Sua beleza elevada a um novo patamar de exclusividade e sofisticação.</p>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <h4 style="color: var(--white); font-family: var(--font-serif); font-size: 1.1rem; margin-bottom: 20px;">Navegação</h4>
        <ul style="display: flex; flex-direction: column; gap: 12px; list-style: none; padding: 0;">
          <li><a href="#/" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Início</a></li>
          <li><a href="#/search?filter=destaque" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Destaques</a></li>
          <li><a href="#/search?filter=encomenda" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Encomendas Exclusivas</a></li>
        </ul>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <h4 style="color: var(--white); font-family: var(--font-serif); font-size: 1.1rem; margin-bottom: 20px;">Atendimento</h4>
        <ul style="display: flex; flex-direction: column; gap: 12px; list-style: none; padding: 0;">
          <li><a href="#/my-orders" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Acompanhar Pedido</a></li>
          <li><a href="#/policy" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Política de Trocas</a></li>
          <li><a href="#/faq" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Dúvidas Frequentes</a></li>
        </ul>
      </div>
    </div>
    <div class="container" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
      <p style="font-size: 0.8rem; color: var(--gray-500);">© 2026 Croxiatti Imports. Todos os direitos reservados.</p>
      <div style="display: flex; gap: 16px; align-items: center; color: var(--gray-500);">
        <!-- Pagamentos -->
        <span style="font-size: 0.8rem;">Pagamento Seguro</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
    </div>
  `;

  app.appendChild(footerElement);
}
