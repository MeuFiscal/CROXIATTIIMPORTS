// ======================================================
// STORE — Estado Global (Carrinho, Favoritos, Sessão)
// ======================================================

const listeners = {};

function emit(event, data) {
  (listeners[event] || []).forEach(fn => fn(data));
}

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
  return () => { listeners[event] = listeners[event].filter(f => f !== fn); };
}

// ---- CARRINHO ----
function loadCart() {
  try { return JSON.parse(localStorage.getItem('croxiatti_cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('croxiatti_cart', JSON.stringify(cart));
  emit('cartChange', cart);
}

export function getCart() { return loadCart(); }

export function addToCart(produto, quantidade = 1, qtyEstoque = null, qtyEncomenda = 0) {
  const cart = loadCart();
  const idx = cart.findIndex(i => i.id === produto.id);
  // Use explicit split if provided, otherwise derive from stock
  const estoqueQty = qtyEstoque !== null ? qtyEstoque : quantidade;
  const encomendaQty = qtyEncomenda;

  if (idx >= 0) {
    cart[idx].quantidade += quantidade;
    cart[idx].qty_estoque = (cart[idx].qty_estoque || cart[idx].quantidade - encomendaQty) + estoqueQty;
    cart[idx].qty_encomenda = (cart[idx].qty_encomenda || 0) + encomendaQty;
  } else {
    cart.push({
      ...produto,
      quantidade,
      qty_estoque: estoqueQty,
      qty_encomenda: encomendaQty
    });
  }
  saveCart(cart);
}

export function removeFromCart(productId) {
  saveCart(loadCart().filter(i => i.id !== productId));
}

export function updateCartQty(productId, qty) {
  const cart = loadCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx >= 0) {
    if (qty <= 0) { cart.splice(idx, 1); }
    else { cart[idx].quantidade = qty; }
    saveCart(cart);
  }
}

export function clearCart() { saveCart([]); }

export function getCartCount() {
  return loadCart().reduce((s, i) => s + i.quantidade, 0);
}

export function getCartTotal() {
  return loadCart().reduce((s, i) => s + (i.preco * i.quantidade), 0);
}

// ---- FAVORITOS ----
function loadFavs() {
  try { return JSON.parse(localStorage.getItem('croxiatti_favs') || '[]'); }
  catch { return []; }
}

function saveFavs(favs) {
  localStorage.setItem('croxiatti_favs', JSON.stringify(favs));
  emit('favsChange', favs);
}

export function getFavorites() { return loadFavs(); }

export function toggleFavorite(produto) {
  const favs = loadFavs();
  const idx = favs.findIndex(f => f.id === produto.id);
  if (idx >= 0) { favs.splice(idx, 1); }
  else { favs.push(produto); }
  saveFavs(favs);
  return idx < 0;
}

export function isFavorite(productId) {
  return loadFavs().some(f => f.id === productId);
}

// ---- SESSÃO TEMPORÁRIA (pedido) ----
export function saveOrderSession(data) {
  sessionStorage.setItem('croxiatti_order', JSON.stringify(data));
}

export function getOrderSession() {
  try { return JSON.parse(sessionStorage.getItem('croxiatti_order') || 'null'); }
  catch { return null; }
}

export function clearOrderSession() {
  sessionStorage.removeItem('croxiatti_order');
}
