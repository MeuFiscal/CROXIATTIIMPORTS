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
  const originalHash = window.location.hash;
  let hash = originalHash.slice(1) || '/';
  
  // Se a URL contém parâmetros do Supabase (ex: erro de link expirado ou token)
  if (hash.startsWith('error=') || hash.startsWith('access_token=') || hash.startsWith('type=')) {
    // Isso não é uma rota de navegação, é um retorno de auth do Supabase.
    // O Supabase vai processar o hash em background. 
    // Para o roteador visual, forçamos o path para '/' ou '/reset-password'.
    
    // Se for recuperação com sucesso, o Supabase emitirá o evento PASSWORD_RECOVERY.
    // O listener no main.js vai redirecionar para /reset-password.
    // Por precaução, se tiver type=recovery, já preparamos a rota.
    if (hash.includes('type=recovery')) {
      return { path: '/reset-password', params: {} };
    }
    
    // Se for erro (ex: link expirado), o ideal é ir para home (e talvez depois mostrar um toast)
    return { path: '/', params: {} };
  }

  // Remove qualquer fragmento extra que o Supabase possa ter anexado
  const tokenIndex = hash.indexOf('access_token=');
  if (tokenIndex !== -1) hash = hash.substring(0, tokenIndex).replace(/[&?#]$/, '');
  
  const [path, query] = hash.split('?');
  const finalPath = path || '/';

  const params = {};
  if (query) {
    new URLSearchParams(query).forEach((v, k) => { params[k] = v; });
  }
  
  return { path: finalPath, params };
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
  
  if (result instanceof Promise) {
    result.then(res => {
      if (res && typeof res.cleanup === 'function') {
        currentCleanup = res.cleanup;
      }
    }).catch(console.error);
  } else if (result && typeof result.cleanup === 'function') {
    currentCleanup = result.cleanup;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
