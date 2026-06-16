// ======================================================
// TOAST — Notificações flutuantes
// ======================================================

let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'default', duration = 3000) {
  const c = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✓', error: '✕', gold: '★', default: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;

  c.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 250);
  }, duration);

  return toast;
}
