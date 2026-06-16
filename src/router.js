// ======================================================
// ROUTER — SPA Hash Router
// ======================================================

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getParams() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, query] = hash.split('?');
  const params = {};
  if (query) {
    new URLSearchParams(query).forEach((v, k) => { params[k] = v; });
  }
  return { path, params };
}

function handleRoute() {
  const { path } = getParams();

  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Match exact or prefix
  let handler = routes[path];
  if (!handler) {
    // Try prefix match (e.g. /admin/*)
    const matched = Object.keys(routes).find(r => r.endsWith('*') && path.startsWith(r.slice(0, -1)));
    if (matched) handler = routes[matched];
  }
  if (!handler) handler = routes['*'] || routes['/'];

  const result = handler(path);
  if (result && typeof result.cleanup === 'function') {
    currentCleanup = result.cleanup;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
