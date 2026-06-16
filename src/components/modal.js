// ======================================================
// MODAL — Modal genérico reutilizável
// ======================================================

export function openModal({ title, body, footer, onClose, maxWidth = '480px' }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:${maxWidth}">
      <div class="modal-header">
        <h3 style="font-family:var(--font-serif);font-size:1.2rem;font-weight:500">${title}</h3>
        <button class="btn btn-ghost btn-icon modal-close" style="padding:6px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  const close = () => {
    overlay.style.animation = 'fadeIn 0.15s ease reverse';
    setTimeout(() => { overlay.remove(); if (onClose) onClose(); }, 150);
  };

  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.body.appendChild(overlay);

  return { close, overlay };
}

export function confirmModal({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false }) {
  return new Promise(resolve => {
    const { close } = openModal({
      title,
      body: `<p style="color:var(--gray-600);font-size:0.95rem">${message}</p>`,
      footer: `
        <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm">${confirmText}</button>
      `,
      onClose: () => resolve(false)
    });

    document.getElementById('modal-cancel').addEventListener('click', () => { close(); resolve(false); });
    document.getElementById('modal-confirm').addEventListener('click', () => { close(); resolve(true); });
  });
}
