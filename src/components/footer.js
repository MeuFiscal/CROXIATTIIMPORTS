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
    padding: 32px 20px 24px;
    margin-top: auto;
    font-size: 0.8rem;
  `;

  footerElement.innerHTML = `

    
    <div class="container" style="display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; margin-bottom: 20px;">
      <div style="flex: 1; min-width: 250px;">
        <img src="/logo.png" alt="Croxiatti" style="height: 32px; filter: brightness(0) invert(1); margin-bottom: 12px;" />
        <p style="color: var(--gray-400); line-height: 1.4; max-width: 300px; font-size: 0.75rem;">A mais refinada seleção de perfumes, skincare e cuidados pessoais. Sua beleza elevada a um novo patamar de exclusividade e sofisticação.</p>
      </div>
      <div style="flex: 1; min-width: 150px;">
        <h4 style="color: var(--white); font-family: var(--font-serif); font-size: 0.95rem; margin-bottom: 12px;">Navegação</h4>
        <ul style="display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0; font-size: 0.8rem;">
          <li><a href="#/" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Início</a></li>
          <li><a href="#/search?filter=destaque" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Destaques</a></li>
          <li><a href="#/search?filter=encomenda" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Encomendas Exclusivas</a></li>
        </ul>
      </div>
      <div style="flex: 1; min-width: 150px;">
        <h4 style="color: var(--white); font-family: var(--font-serif); font-size: 0.95rem; margin-bottom: 12px;">Atendimento</h4>
        <ul style="display: flex; flex-direction: column; gap: 8px; list-style: none; padding: 0; font-size: 0.8rem;">
          <li><a href="#/my-orders" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Acompanhar Pedido</a></li>
          <li><a href="#/policy" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Política de Trocas</a></li>
          <li><a href="#/faq" style="color: var(--gray-400); text-decoration: none; transition: color var(--transition);">Dúvidas Frequentes</a></li>
        </ul>
      </div>
    </div>
    <div class="container" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
      <p style="font-size: 0.7rem; color: var(--gray-500);">© 2026 Croxiatti Imports. Todos os direitos reservados.</p>
      <div style="display: flex; gap: 12px; align-items: center; color: var(--gray-500);">
        <!-- Pagamentos -->
        <span style="font-size: 0.7rem;">Pagamento Seguro</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
    </div>
  `;

  app.appendChild(footerElement);
}
