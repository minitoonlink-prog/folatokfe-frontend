// ============================================================
// FOLATOKFE - JAVASCRIPT PRINCIPAL
// ============================================================
 
// ============================================================
// CONSTANTES Y DATOS INICIALES
// ============================================================
const API_BASE = 'https://saint-washstand-closable.ngrok-free.dev/api';
const CART_KEY = 'folatokfe_cart';
const AUTH_KEY = 'folatokfe_user';
const TOKEN_KEY = 'folatokfe_token';
const REG_KEY = 'folatokfe_registered';
const PROD_KEY = 'folatokfe_products';
const ORD_KEY = 'folatokfe_orders';

const COLOMBIAN_DEPARTMENTS = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas','Caquetá',
  'Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare',
  'Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo',
  'Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima',
  'Valle del Cauca','Vaupés','Vichada',
];

const NORTE_SANTANDER_CITIES = [
  'Cúcuta','Ocaña','Pamplona','Villa del Rosario','Los Patios',
  'Chinácota','El Zulia','San Cayetano','Puerto Santander','Tibú',
];

let appState = {
  filterCategory: 'Todos',
  sortBy: 'name',
  viewType: 'grid',
  filterOpen: false,
  sortOpen: false,
  currentQty: 1,
  adminShowInactive: false,
  adminEditingId: null,
  products: [],
  categories: [],
  cartItems: [],
};

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Galletas Corporativas',
    description: 'Pack de galletas decoradas para eventos empresariales y regalos corporativos.',
    price: '$32.000',
    priceNumber: 32000,
    image: 'https://images.unsplash.com/photo-1515041219746-3aab15b82a25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'Corporativas',
    stock: 12,
    active: true,
  },
  {
    id: 2,
    name: 'Galletas Personalizadas',
    description: 'Galletas únicas para cumpleaños, aniversarios y detalles especiales.',
    price: '$28.000',
    priceNumber: 28000,
    image: 'https://images.unsplash.com/photo-1534407109676-5ad5f09a3135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'Personalizadas',
    stock: 10,
    active: true,
  },
  {
    id: 3,
    name: 'Galletas Didacticas',
    description: 'Galletas didácticas perfectas para talleres infantiles y actividades escolares.',
    price: '$26.000',
    priceNumber: 26000,
    image: 'https://images.unsplash.com/photo-1604160139172-99eb3f9e1a09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'Didacticas',
    stock: 8,
    active: true,
  },
  {
    id: 4,
    name: 'Galletas Emoji',
    description: 'Galletas con diseños emoji ideales para fiestas infantiles y detalles divertidos.',
    price: '$30.000',
    priceNumber: 30000,
    image: 'https://images.unsplash.com/photo-1599785209707-84f8d3f8c5d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    category: 'Emoji',
    stock: 14,
    active: true,
  },
];

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "ngrok-skip-browser-warning": "true",   // ← AGREGAR ESTA LÍNEA
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || 'Error en la solicitud';
    throw new Error(message);
  }

  return data;
}

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || 'Error en la solicitud';
    throw new Error(message);
  }

  return data;
}

function getCurrentUser() {
  try {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY) && !!getCurrentUser();
}

function authLogout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
  appState.cartItems = [];
}

async function authLogin(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    id: data.id,
    name: data.nombre,
    email: data.email,
    role: data.rol.toLowerCase(),
  }));
  await loadCartFromServer();
  return getCurrentUser();
}

async function authRegister(email, password, name) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre: name, email, password }),
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    id: data.id,
    name: data.nombre,
    email: data.email,
    role: data.rol.toLowerCase(),
  }));
  await loadCartFromServer();
  return getCurrentUser();
}
 
// ============================================================
// MÓDULO PRODUCTOS
// ============================================================
 
function initProducts() {
  if (!localStorage.getItem(PROD_KEY))
    localStorage.setItem(PROD_KEY, JSON.stringify(DEFAULT_PRODUCTS));
}
function mapProductFromApi(item) {
  return {
    id: item.id,
    name: item.nombre,
    description: item.descripcion,
    price: fmtCOP(item.precio),
    priceNumber: Number(item.precio || 0),
    image: item.imagenUrl || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    category: item.categoriaNombre || 'Sin categoría',
    stock: item.stock ?? 0,
    active: item.activo !== false,
  };
}

async function loadProducts() {
  try {
    const data = await apiFetch('/productos');
    appState.products = Array.isArray(data) ? data.map(mapProductFromApi) : [];
  } catch (error) {
    console.error(error);
    const saved = JSON.parse(localStorage.getItem(PROD_KEY) || 'null');
    appState.products = Array.isArray(saved) && saved.length ? saved : DEFAULT_PRODUCTS.slice();
  }
  localStorage.setItem(PROD_KEY, JSON.stringify(appState.products));
  appState.categories = ['Todos', ...new Set(appState.products.filter(p => p.active).map(p => p.category).filter(Boolean))];
}

function getAllProducts() {
  return appState.products.length ? appState.products : JSON.parse(localStorage.getItem(PROD_KEY) || '[]');
}

function getActiveProducts() {
  return getAllProducts().filter(p => p.active !== false);
}

function getProductById(id) {
  return getAllProducts().find(p => p.id === id);
}

async function createProduct(data) {
  const payload = {
    nombre: data.name,
    descripcion: data.description,
    precio: data.priceNumber,
    imagenUrl: data.image,
    categoriaId: data.categoriaId || null,
    stock: data.stock ?? 0,
    activo: data.active !== false,
  };
  const created = await apiFetch('/productos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await loadProducts();
  return mapProductFromApi(created);
}

async function updateProduct(id, updates) {
  const payload = {
    nombre: updates.name,
    descripcion: updates.description,
    precio: updates.priceNumber,
    imagenUrl: updates.image,
    categoriaId: updates.categoriaId || null,
    stock: updates.stock ?? 0,
    activo: updates.active !== false,
  };
  const updated = await apiFetch(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  await loadProducts();
  return mapProductFromApi(updated);
}

async function deleteProduct(id) {
  await apiFetch(`/productos/${id}`, { method: 'DELETE' });
  await loadProducts();
  return true;
}

async function restoreProduct(id) {
  await apiFetch(`/productos/${id}/restaurar`, { method: 'PATCH' });
  await loadProducts();
  return true;
}

async function permanentDeleteProduct(id) {
  await apiFetch(`/productos/${id}/permanente`, { method: 'DELETE' });
  await loadProducts();
  return true;
}

function getFilteredProducts(category, sortBy) {
  let ps = getActiveProducts();
  if (category !== 'Todos') ps = ps.filter(p => p.category === category);
  if (sortBy === 'name') ps.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === 'price-asc') ps.sort((a, b) => a.priceNumber - b.priceNumber);
  else if (sortBy === 'price-desc') ps.sort((a, b) => b.priceNumber - a.priceNumber);
  return ps;
}

function getCategories() {
  if (appState.categories.length) return appState.categories;
  const cats = ['Todos', ...new Set(getActiveProducts().map(p => p.category).filter(Boolean))];
  appState.categories = cats;
  return cats;
}
 
// ============================================================
// MÓDULO CARRITO
// ============================================================
 
function getCartItems() {
  if (isLoggedIn()) {
    return appState.cartItems;
  }
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function setCartItems(items) {
  appState.cartItems = items;
  if (!isLoggedIn()) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
  updateCartBadge();
}

async function loadCartFromServer() {
  if (!isLoggedIn()) return;
  try {
    const data = await apiFetch('/carrito');
    const items = (data || []).map(item => ({
      id: item.productoId,
      itemId: item.id,
      name: item.productoNombre,
      price: fmtCOP(item.precioUnitario),
      priceNumber: Number(item.precioUnitario || 0),
      image: item.imagenUrl || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200',
      quantity: item.cantidad,
      dozen: item.cantidad,
    }));
    setCartItems(items);
  } catch (error) {
    console.error(error);
    setCartItems([]);
  }
}

async function addToCart(item) {
  if (isLoggedIn()) {
    try {
      await apiFetch('/carrito/items', {
        method: 'POST',
        body: JSON.stringify({ productoId: item.id, cantidad: 1 }),
      });
      await loadCartFromServer();
      return;
    } catch (error) {
      showToast(error.message, 'error');
      return;
    }
  }

  const cart = getCartItems();
  const ex = cart.find(i => i.id === item.id);
  if (ex) { ex.quantity += 1; ex.dozen += 1; }
  else cart.push({ ...item, quantity: 1, dozen: 1 });
  setCartItems(cart);
}

async function updateCartItemQty(id, dozen) {
  if (dozen <= 0) {
    await removeFromCart(id);
    return;
  }
  if (isLoggedIn()) {
    const existing = getCartItems().find(i => i.id === id);
    if (!existing) return;
    try {
      await apiFetch(`/carrito/items/${existing.itemId}?cantidad=${dozen}`, {
        method: 'PUT'
      });
      await loadCartFromServer();
      return;
    } catch (error) {
      showToast(error.message, 'error');
      return;
    }
  }

  const cart = getCartItems();
  const it = cart.find(i => i.id === id);
  if (it) { it.dozen = dozen; it.quantity = dozen; setCartItems(cart); }
}

async function removeFromCart(id) {
  if (isLoggedIn()) {
    const existing = getCartItems().find(i => i.id === id);
    if (existing?.itemId) {
      try {
        await apiFetch(`/carrito/items/${existing.itemId}`, { method: 'DELETE' });
        await loadCartFromServer();
        return;
      } catch (error) {
        showToast(error.message, 'error');
        return;
      }
    }
  }

  setCartItems(getCartItems().filter(i => i.id !== id));
}

async function clearCart() {
  if (isLoggedIn()) {
    try {
      await apiFetch('/carrito', { method: 'DELETE' });
      await loadCartFromServer();
      return;
    } catch (error) {
      showToast(error.message, 'error');
      return;
    }
  }

  setCartItems([]);
}

function getCartTotal() {
  return getCartItems().reduce((t, i) => t + i.priceNumber * i.dozen, 0);
}

function getCartCount() {
  return getCartItems().reduce((c, i) => c + i.quantity, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById('cart-count');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
}
 
// ============================================================
// MÓDULO PEDIDOS
// ============================================================
 
function getAllOrders() {
  try { return JSON.parse(localStorage.getItem(ORD_KEY)) || []; } catch { return []; }
}

function getUserOrders(userId) {
  return getAllOrders().filter(o => o.userId === userId);
}

function getOrderById(id) {
  return getAllOrders().find(o => o.id === id);
}

async function fetchOrders() {
  if (!isLoggedIn()) return [];
  try {
    const data = await apiFetch('/pedidos');
    const orders = Array.isArray(data) ? data : [];
    localStorage.setItem(ORD_KEY, JSON.stringify(orders));
    return orders;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function createOrder(userEmail, items, shippingAddress, paymentMethod, total) {
  const payload = {
    envioNombreCompleto: shippingAddress.fullName,
    envioTelefono: shippingAddress.phone,
    envioDireccion: shippingAddress.address,
    envioCiudad: shippingAddress.city,
    envioDepartamento: shippingAddress.department,
    envioInstrucciones: shippingAddress.instructions || '',
    metodoPagoTipo: paymentMethod.type,
    metodoPagoTitular: paymentMethod.cardName || '',
    metodoPagoUltimosDigitos: paymentMethod.cardNumber || '',
  };

  const order = await apiFetch('/pedidos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const storedOrders = getAllOrders();
  storedOrders.push(order);
  localStorage.setItem(ORD_KEY, JSON.stringify(storedOrders));
  return order;
}

function getDeliveryText(dateStr) {
  const diff = Math.ceil(Math.abs(new Date(dateStr) - new Date()) / 86400000);
  if (diff === 0) return 'Hoy'; if (diff === 1) return 'Mañana';
  return 'En ' + diff + ' días';
}

function getStatusText(s) {
  return { pending:'Pendiente', in_warehouse:'En bodega', in_transit:'En camino', delivered:'Entregado', cancelled:'Cancelado' }[s] || s;
}

function getStatusEmoji(s) {
  return { pending:'⏳', in_warehouse:'📦', in_transit:'🚚', delivered:'✅', cancelled:'❌' }[s] || '❓';
}
 
// ============================================================
// TOASTS
// ============================================================
 
function showToast(msg, type = 'success') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3000);
}
 
// ============================================================
// UTILIDADES
// ============================================================
 
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtCOP(num) { return '$' + parseInt(num).toLocaleString('es-CO'); }
 
// ============================================================
// NAVEGACIÓN
// ============================================================
 
function navigate(path) { window.location.hash = '#' + path; }
function getCurrentPath() { const h = window.location.hash; return h ? h.slice(1) : '/'; }
 
// ============================================================
// SIDEBAR
// ============================================================
 
let sidebarOpen = false;
 
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  document.getElementById('sidebar')?.classList.toggle('open', sidebarOpen);
  document.getElementById('sidebar-overlay')?.classList.toggle('active', sidebarOpen);
  if (sidebarOpen) renderSidebarContent();
}
function closeSidebar() {
  sidebarOpen = false;
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
}
function renderSidebarContent() {
  const nav = document.getElementById('sidebar-nav');
  const panel = document.getElementById('sidebar-user-panel');
  if (!nav) return;
  const user = getCurrentUser();
 
  const items = [
    { icon:'📦', label:'Productos',         path:'/productos' },
    { icon:'📋', label:'Folatopedidos',      path:'/folatopedidos', auth:true },
    { icon:'📖', label:'Nuestra historia',   path:'/historia' },
    { icon:'💬', label:'Buzón de mensajes',  path:'/contacto' },
  ];
  if (user?.role === 'admin') items.push({ icon:'🛡️', label:'Panel de Administración', path:'/admin' });
 
  nav.innerHTML = items.map(it => `
    <button class="sidebar-item" onclick="sidebarNav('${it.path}',${!!it.auth})">
      <span class="sidebar-item-icon">${it.icon}</span><span>${it.label}</span>
    </button>`).join('');
 
  panel.innerHTML = user ? `
    <div class="sidebar-user-inner">
      <div class="sidebar-user-row">
        <div class="sidebar-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="sidebar-user-name">${escHtml(user.name)}</div>
          <div class="sidebar-user-role">${user.role === 'admin' ? 'Administrador' : 'Cliente'}</div>
        </div>
      </div>
      <button class="btn btn-outline-red btn-full" onclick="handleLogout()">🚪 Cerrar Sesión</button>
    </div>` : '';
}
window.sidebarNav = function(path, auth) {
  closeSidebar();
  if (auth && !getCurrentUser()) { showToast('Debes iniciar sesión para ver tus pedidos','error'); navigate('/login'); return; }
  navigate(path);
};
 
// ============================================================
// MENÚ DE USUARIO
// ============================================================
 
let userMenuOpen = false;
function toggleUserMenu() {
  userMenuOpen = !userMenuOpen;
  const menu = document.getElementById('user-menu');
  const ov   = document.getElementById('user-overlay');
  if (menu) menu.style.display = userMenuOpen ? 'block' : 'none';
  if (ov)   ov.style.display   = userMenuOpen ? 'block' : 'none';
  if (userMenuOpen) renderUserDropdown();
}
function closeUserMenu() {
  userMenuOpen = false;
  const menu = document.getElementById('user-menu');
  const ov   = document.getElementById('user-overlay');
  if (menu) menu.style.display = 'none';
  if (ov)   ov.style.display   = 'none';
}
function renderUserDropdown() {
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  const user = getCurrentUser();
  if (user) {
    menu.innerHTML = `
      <div class="dropdown-header">
        <div class="dropdown-header-name">${escHtml(user.name)}</div>
        <div class="dropdown-header-email">${escHtml(user.email)}</div>
        <div class="dropdown-header-role">${user.role === 'admin' ? 'Administrador' : 'Cliente'}</div>
      </div>
      <button class="dropdown-item" onclick="closeUserMenu();navigate('/historia')">👤 Mi Perfil</button>
      <button class="dropdown-item" onclick="closeUserMenu();navigate('/folatopedidos')">📋 Mis Pedidos</button>
      ${user.role === 'admin' ? `<button class="dropdown-item" onclick="closeUserMenu();navigate('/admin')">🛡️ Panel Admin</button>` : ''}
      <div class="dropdown-separator"></div>
      <button class="dropdown-item danger" onclick="handleLogout()">🚪 Cerrar Sesión</button>`;
  } else {
    menu.innerHTML = `
      <div class="dropdown-header">
        <div class="dropdown-header-name">¡Bienvenido!</div>
        <div class="dropdown-header-email">Inicia sesión o crea una cuenta</div>
      </div>
      <button class="dropdown-item" onclick="closeUserMenu();navigate('/login')">🔑 Iniciar Sesión</button>
      <button class="dropdown-item" onclick="closeUserMenu();navigate('/register')">👤 Crear Cuenta</button>`;
  }
}
 
// ============================================================
// BÚSQUEDA
// ============================================================
 
let searchOpen = false;
function toggleSearch() {
  searchOpen = !searchOpen;
  const bar = document.getElementById('search-bar');
  if (bar) {
    bar.style.display = searchOpen ? 'block' : 'none';
    if (searchOpen) {
      const inp = document.getElementById('search-input');
      if (inp) { inp.value = ''; inp.focus(); }
      const res = document.getElementById('search-results');
      if (res) res.style.display = 'none';
    }
  }
}
function closeSearch() {
  searchOpen = false;
  const bar = document.getElementById('search-bar');
  if (bar) bar.style.display = 'none';
}
function handleSearch(query) {
  const res = document.getElementById('search-results');
  if (!res) return;
  if (!query.trim()) { res.style.display = 'none'; return; }
  const products = getActiveProducts().filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  res.innerHTML = products.length
    ? products.map(p => `<button class="search-result-btn" onclick="closeSearch();navigate('/producto/${p.id}')">
        <div class="search-result-name">${escHtml(p.name)}</div>
        <div class="search-result-price">${p.price} / docena</div>
      </button>`).join('')
    : `<div class="search-no-results"><p>No se encontraron productos</p></div>`;
  res.style.display = 'block';
}
 
// ============================================================
// NAVBAR
// ============================================================
 
function updateNavbar() {
  updateCartBadge();
  const badge = document.getElementById('admin-badge');
  if (badge) badge.style.display = getCurrentUser()?.role === 'admin' ? 'flex' : 'none';
}
window.handleLogout = function() {
  authLogout(); closeUserMenu(); closeSidebar();
  showToast('Sesión cerrada correctamente','success');
  updateNavbar(); navigate('/login');
};
 
// ============================================================
// COMPONENTES COMPARTIDOS
// ============================================================
 
function renderFooter() {
  return `<footer class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div>
          <div class="footer-title">Galletas Personalizadas</div>
          <p class="footer-text">Deliciosas galletas hechas con amor y los mejores ingredientes.</p>
        </div>
        <div>
          <div class="footer-title">Horarios</div>
          <p class="footer-text">Lunes - Viernes: 9:00 AM - 6:00 PM<br>Sábado: 10:00 AM - 4:00 PM<br>Domingo: Cerrado</p>
        </div>
        <div>
          <div class="footer-title">Síguenos</div>
          <div class="footer-social">
            <a class="footer-social-a" href="https://www.instagram.com/folatokfe/?hl=es-la" target="_blank" title="Instagram">📷</a>
            <a class="footer-social-a" href="https://web.facebook.com/profile.php?id=61558578597869" target="_blank" title="Facebook">📘</a>
            <a class="footer-social-a" href="mailto:galletasfolatokfe@gmail.com" title="Email">✉️</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; 2025 Folatokfe Galletas Personalizadas para cualquier ocasión. Todos los derechos reservados.
      </div>
    </div>
  </footer>`;
}
 
function renderControlsBar() {
  const cats = getCategories();
  return `<div class="controls-bar">
    <div class="view-toggle">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="var(--amber-700)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      <span class="view-toggle-label">Tipo de vista</span>
      <div class="view-btns">
        <button class="btn btn-sm ${appState.viewType==='grid'?'btn-primary':'btn-outline'}" onclick="setViewType('grid')" title="Cuadrícula">⊞</button>
        <button class="btn btn-sm ${appState.viewType==='list'?'btn-primary':'btn-outline'}" onclick="setViewType('list')" title="Lista">≡</button>
      </div>
    </div>
    <div class="filter-sort-wrap">
      <div class="filter-dropdown-wrap" style="position:relative">
        <button class="btn btn-outline btn-sm" onclick="toggleFilterMenu(event)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="var(--amber-700)" stroke-width="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtrar ▾
        </button>
        <div id="filter-menu" class="filter-menu">
          ${cats.map(c => `<button class="menu-option ${appState.filterCategory===c?'active':''}" onclick="setFilter('${escHtml(c)}')">${escHtml(c)}</button>`).join('')}
        </div>
      </div>
      <div style="position:relative">
        <button class="btn btn-outline btn-sm" onclick="toggleSortMenu(event)">
          Ordenar por: ▾
        </button>
        <div id="sort-menu" class="sort-menu">
          <button class="menu-option ${appState.sortBy==='name'?'active':''}" onclick="setSort('name')">Nombre</button>
          <button class="menu-option ${appState.sortBy==='price-asc'?'active':''}" onclick="setSort('price-asc')">Precio: Menor a Mayor</button>
          <button class="menu-option ${appState.sortBy==='price-desc'?'active':''}" onclick="setSort('price-desc')">Precio: Mayor a Menor</button>
        </div>
      </div>
    </div>
  </div>`;
}
 
function renderProductsGrid(products, viewType) {
  if (!products.length) return `<div class="empty-state"><div class="empty-icon">🍪</div><h3 style="color:var(--gray-700);margin-bottom:0.5rem">No hay productos disponibles</h3><p style="color:var(--gray-500)">Prueba con otro filtro</p></div>`;
  const wrap = viewType === 'grid' ? 'products-grid' : 'products-list';
  const extra = viewType === 'list' ? 'product-card-list' : '';
  return `<div class="${wrap}">${products.map(p => `
    <div class="card product-card ${extra}" onclick="navigate('/producto/${p.id}')">
      <div class="product-card-img">
        <img src="${escHtml(p.image)}" alt="${escHtml(p.name)}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'" />
      </div>
      <div class="product-card-body">
        <div class="product-card-head">
          <div class="product-card-title">${escHtml(p.name)}</div>
          <div class="product-card-desc">${escHtml(p.description)}</div>
        </div>
        <div class="product-card-foot">
          <div class="product-card-price">${escHtml(p.price)} <span style="color:var(--gray-500);font-weight:400;font-size:0.875rem">/ docena</span></div>
          ${p.stock != null ? `<div class="product-card-stock">${p.stock > 0 ? p.stock + ' disponibles' : 'Agotado'}</div>` : ''}
          <div style="margin-top:0.75rem">
            <button class="btn btn-primary btn-full" onclick="event.stopPropagation();quickAddToCart(${p.id})" ${p.stock != null && p.stock <= 0 ? 'disabled' : ''}>
              🛒 ${p.stock != null && p.stock <= 0 ? 'Agotado' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>`).join('')}</div>`;
}
 
window.quickAddToCart = function(id) {
  const p = getProductById(id);
  if (!p) return;
  addToCart({ id: p.id, name: p.name, price: p.price, priceNumber: p.priceNumber, image: p.image });
  showToast(p.name + ' agregado al carrito', 'success');
};
window.setViewType = function(t) { appState.viewType = t; reRenderProducts(); };
window.setFilter   = function(c) {
  appState.filterCategory = c; appState.filterOpen = false;
  document.getElementById('filter-menu')?.classList.remove('open');
  reRenderProducts();
};
window.setSort = function(s) {
  appState.sortBy = s; appState.sortOpen = false;
  document.getElementById('sort-menu')?.classList.remove('open');
  reRenderProducts();
};
window.toggleFilterMenu = function(e) {
  e.stopPropagation(); appState.filterOpen = !appState.filterOpen; appState.sortOpen = false;
  document.getElementById('filter-menu')?.classList.toggle('open', appState.filterOpen);
  document.getElementById('sort-menu')?.classList.remove('open');
};
window.toggleSortMenu = function(e) {
  e.stopPropagation(); appState.sortOpen = !appState.sortOpen; appState.filterOpen = false;
  document.getElementById('sort-menu')?.classList.toggle('open', appState.sortOpen);
  document.getElementById('filter-menu')?.classList.remove('open');
};
 
function reRenderProducts() {
  const c = document.getElementById('products-container');
  if (c) c.innerHTML = renderProductsGrid(getFilteredProducts(appState.filterCategory, appState.sortBy), appState.viewType);
  // Also re-render controls bar if it exists
  const cb = document.getElementById('controls-bar-wrap');
  if (cb) cb.innerHTML = renderControlsBar();
}
 
// ============================================================
// ROUTER
// ============================================================
 
function router() {
  const path = getCurrentPath();
  closeUserMenu(); closeSearch();
  appState.filterOpen = false; appState.sortOpen = false;
  updateNavbar();
  renderPage(path);
  window.scrollTo(0, 0);
}
 
function renderPage(path) {
  const content = document.getElementById('content');
  if (!content) return;
 
  if (path === '/' || path === '')             renderHome(content);
  else if (path === '/productos')              renderProductsPage(content);
  else if (path.startsWith('/producto/'))      renderProductDetail(content, parseInt(path.split('/')[2]));
  else if (path === '/cart')                   renderCart(content);
  else if (path === '/checkout/shipping')      { if (!getCurrentUser()) { navigate('/login'); return; } renderCheckoutShipping(content); }
  else if (path === '/checkout/payment')       { if (!getCurrentUser()) { navigate('/login'); return; } renderCheckoutPayment(content); }
  else if (path === '/checkout/payment-details') { if (!getCurrentUser()) { navigate('/login'); return; } renderCheckoutPaymentDetails(content); }
  else if (path.startsWith('/checkout/success/')) { if (!getCurrentUser()) { navigate('/login'); return; } renderCheckoutSuccess(content, path.split('/').slice(3).join('/')); }
  else if (path === '/folatopedidos')          { if (!getCurrentUser()) { navigate('/login'); return; } renderFolatopedidos(content); }
  else if (path === '/login')                  renderLogin(content);
  else if (path === '/register')               renderRegister(content);
  else if (path === '/admin')                  {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') { showToast('Acceso denegado','error'); navigate('/'); return; }
    renderAdmin(content);
  }
  else if (path === '/historia')               renderAbout(content);
  else if (path === '/contacto')               renderContact(content);
  else                                         renderNotFound(content);
}
 
// ============================================================
// PÁGINA: HOME
// ============================================================
 
function renderHome(container) {
  const products = getFilteredProducts(appState.filterCategory, appState.sortBy);
  container.innerHTML = `
    <div>
      <!-- HERO -->
      <section class="hero">
        <img src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400"
          alt="Galletas Folatokfe"
          onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#fef3c7,#fde68a,#f59e0b)'" />
        <div class="hero-overlay"></div>
        <div class="hero-btn-wrap">
          <button class="btn btn-primary btn-lg" onclick="document.getElementById('products-section')?.scrollIntoView({behavior:'smooth'})">
            Ver Productos
          </button>
        </div>
        <button class="hero-arrow-btn" onclick="document.getElementById('products-section')?.scrollIntoView({behavior:'smooth'})">⌄</button>
      </section>
 
      <!-- PRODUCTOS -->
      <section id="products-section" class="section section-white">
        <div class="page-container">
          <div class="section-header">
            <h2 class="section-title">Nuestros Productos</h2>
            <p class="section-desc">
              Cada una de nuestras galletas no solo es un dulce detalle es una emoción hecha a mano, un recuerdo que se queda, una sonrisa que se comparte.
              Porque en Folatokfe no solo hacemos momentos que saben a felicidad.
              La ocasión es corta, pero la magia… ¡la magia no se limita! Porque con Folatokfe te expresas y regalas felicidad.
            </p>
          </div>
          <div id="controls-bar-wrap">${renderControlsBar()}</div>
          <div id="products-container">${renderProductsGrid(products, appState.viewType)}</div>
        </div>
      </section>
 
      ${renderFooter()}
    </div>
  `;
}
 
// ============================================================
// PÁGINA: PRODUCTOS
// ============================================================
 
function renderProductsPage(container) {
  const products = getFilteredProducts(appState.filterCategory, appState.sortBy);
  container.innerHTML = `
    <div style="background:var(--amber-50);min-height:100vh">
      <section class="section section-white" style="padding-top:3rem">
        <div class="page-container">
          <div class="section-header">
            <h2 class="section-title">Nuestros Productos</h2>
            <p class="section-desc">Cada una de nuestras galletas no solo es un dulce detalle es una emoción hecha a mano, un recuerdo que se queda, una sonrisa que se comparte.</p>
          </div>
          <div id="controls-bar-wrap">${renderControlsBar()}</div>
          <div id="products-container">${renderProductsGrid(products, appState.viewType)}</div>
        </div>
      </section>
      ${renderFooter()}
    </div>`;
}
 
// ============================================================
// PÁGINA: DETALLE DE PRODUCTO
// ============================================================
 
function getDetailedDescription(name) {
  const map = {
    'Galletas Corporativas': 'Nuestras galletas corporativas son la herramienta perfecta para hacer marketing de una manera dulce e inolvidable. Cada galleta es elaborada artesanalmente con ingredientes de primera calidad y decorada con los colores y logo de tu empresa. Son ideales para eventos corporativos, lanzamientos de productos, agradecimientos a clientes y promociones de marca.',
    'Galletas Personalizadas': 'Expresa tus emociones de una manera única y deliciosa. Perfectas para declaraciones de amor, aniversarios, cumpleaños o cualquier ocasión especial. Cada galleta es una obra de arte comestible, decorada a mano con técnicas profesionales de repostería. Podemos crear diseños personalizados según tus necesidades.',
    'Galletas Didacticas': 'Una estrategia didáctica innovadora que combina el aprendizaje con la diversión. Perfectas para trabajar la motricidad fina, estimular la creatividad y enseñar conceptos educativos de manera divertida. Ideales para talleres, fiestas infantiles y actividades en el aula.',
    'Galletas Emoji': 'Galletas diseñadas para trabajar la inteligencia emocional con los niños. Cada emoji representa una emoción diferente, permitiendo a los pequeños identificar y expresar cómo se sienten. Perfectas para psicólogos infantiles, educadores y padres de familia.',
  };
  return map[name] || 'Galletas artesanales elaboradas con los mejores ingredientes y mucho amor.';
}
function getIngredients(name) {
  const map = {
    'Galletas Corporativas':  ['Harina de trigo','Mantequilla','Azúcar refinada','Huevos frescos','Colorantes naturales','Glaseado real','Esencias naturales'],
    'Galletas Personalizadas':['Harina premium','Mantequilla artesanal','Azúcar glass','Huevos orgánicos','Colorantes comestibles','Fondant','Extractos naturales'],
    'Galletas Didacticas':    ['Harina integral','Mantequilla sin sal','Azúcar morena','Huevos de campo','Colorantes vegetales','Miel de abejas','Vainilla natural'],
    'Galletas Emoji':         ['Harina de trigo','Mantequilla danesa','Azúcar refinada','Huevos frescos','Colorantes alimentarios','Glaseado real','Saborizantes naturales'],
  };
  return map[name] || map['Galletas Corporativas'];
}
 
function renderProductDetail(container, id) {
  const p = getProductById(id);
  if (!p) { navigate('/productos'); return; }
  appState.currentQty = 1;
 
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container">
        <button class="btn btn-ghost back-btn" onclick="history.back()">← Volver</button>
        <div class="product-detail-grid">
          <!-- Galería -->
          <div>
            <div class="main-img-wrap">
              <img id="main-product-img" src="${escHtml(p.image)}" alt="${escHtml(p.name)}"
                onerror="this.src='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600'" />
            </div>
            <div class="thumbnails">
              ${[p.image,p.image,p.image,p.image].map((img,i) => `
                <button class="thumb-btn ${i===0?'active':''}" onclick="selectThumb(this,'${escHtml(img)}')">
                  <img src="${escHtml(img)}" alt="Vista ${i+1}" />
                </button>`).join('')}
            </div>
          </div>
          <!-- Info -->
          <div>
            <h2 style="color:var(--amber-900);margin-bottom:0.5rem">${escHtml(p.name)}</h2>
            <div class="stars mb-3">★★★★★ <span style="color:var(--gray-600);font-size:0.875rem;margin-left:0.5rem">(4.9/5 - 127 reseñas)</span></div>
            <div style="font-size:1.75rem;font-weight:700;color:var(--amber-700);margin-bottom:0.5rem">
              ${escHtml(p.price)} <span style="font-size:1rem;color:var(--gray-600);font-weight:400">/ docena</span>
            </div>
            ${p.stock != null ? `<p class="mb-4" style="font-size:0.875rem">${p.stock > 0 ? `<span style="color:var(--green-600);font-weight:500">✓ ${p.stock} disponibles</span>` : `<span style="color:var(--red-600);font-weight:500">Agotado</span>`}</p>` : ''}
 
            <div class="card mb-4"><div class="card-content">
              <h5 style="color:var(--amber-900);margin-bottom:0.5rem">Descripción</h5>
              <p style="color:var(--gray-700);line-height:1.7">${escHtml(getDetailedDescription(p.name))}</p>
            </div></div>
 
            <div class="card mb-4"><div class="card-content">
              <h5 style="color:var(--amber-900);margin-bottom:0.75rem">Ingredientes</h5>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.35rem">
                ${getIngredients(p.name).map(i => `<div style="color:var(--gray-700);font-size:0.875rem">• ${escHtml(i)}</div>`).join('')}
              </div>
            </div></div>
 
            <div class="card mb-6"><div class="card-content">
              <h5 style="color:var(--amber-900);margin-bottom:0.75rem">Información Adicional</h5>
              <div style="color:var(--gray-700);font-size:0.875rem;display:flex;flex-direction:column;gap:0.35rem">
                <p><strong>Peso:</strong> Aproximadamente 600g por docena</p>
                <p><strong>Tamaño:</strong> 8-10 cm cada galleta</p>
                <p><strong>Tiempo de elaboración:</strong> 3-5 días hábiles</p>
                <p><strong>Vida útil:</strong> 15 días en empaque sellado</p>
                <p><strong>Almacenamiento:</strong> Lugar fresco y seco</p>
              </div>
            </div></div>
 
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap">
              <span style="font-weight:500;color:var(--gray-700)">Cantidad (docenas):</span>
              <div class="qty-ctrl">
                <button class="qty-btn" onclick="changeDetailQty(-1)">−</button>
                <span class="qty-num" id="detail-qty">1</span>
                <button class="qty-btn" onclick="changeDetailQty(1)">+</button>
              </div>
            </div>
 
            <button class="btn btn-primary btn-full btn-xl" id="add-to-cart-btn"
              onclick="addDetailToCart(${p.id})"
              ${p.stock != null && p.stock <= 0 ? 'disabled' : ''}>
              🛒 ${p.stock != null && p.stock <= 0 ? 'Producto Agotado' : 'Agregar al Carrito - ' + fmtCOP(p.priceNumber)}
            </button>
            <p style="font-size:0.8rem;text-align:center;color:var(--gray-600);margin-top:0.5rem">
              Envío gratis en Cúcuta para compras superiores a $200.000
            </p>
          </div>
        </div>
      </div>
      ${renderFooter()}
    </div>`;
 
  window._detailProductId = p.id;
}
 
window.selectThumb = function(btn, src) {
  document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const img = document.getElementById('main-product-img');
  if (img) img.src = src;
};
window.changeDetailQty = function(delta) {
  appState.currentQty = Math.max(1, appState.currentQty + delta);
  const disp = document.getElementById('detail-qty');
  if (disp) disp.textContent = appState.currentQty;
  const id = window._detailProductId;
  if (id) {
    const p = getProductById(id);
    const btn = document.getElementById('add-to-cart-btn');
    if (p && btn) btn.textContent = '🛒 Agregar al Carrito - ' + fmtCOP(p.priceNumber * appState.currentQty);
  }
};
window.addDetailToCart = function(id) {
  const p = getProductById(id);
  if (!p) return;
  for (let i = 0; i < appState.currentQty; i++)
    addToCart({ id: p.id, name: p.name, price: p.price, priceNumber: p.priceNumber, image: p.image });
  showToast(appState.currentQty + ' docena(s) de ' + p.name + ' agregadas al carrito', 'success');
};
 
// ============================================================
// PÁGINA: CARRITO
// ============================================================
 
function renderCart(container) {
  const items = getCartItems();
  const user  = getCurrentUser();
  const total = getCartTotal();
 
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container-md">
        <button class="btn btn-ghost back-btn" onclick="navigate('/')">← Volver al sitio</button>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
          <div>
            <h2 style="color:var(--amber-900);display:flex;align-items:center;gap:0.75rem">🛒 Mi Carrito de Compras</h2>
            ${user ? `<p style="color:var(--gray-600);margin-top:0.5rem">Usuario: <strong>${escHtml(user.name)}</strong></p>` : ''}
          </div>
          ${items.length > 0 ? `<button class="btn btn-outline-red" onclick="handleClearCart()">Vaciar Carrito</button>` : ''}
        </div>
 
        ${items.length === 0 ? `
          <div class="card shadow-xl"><div class="card-content"><div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3 style="color:var(--gray-700);margin-bottom:0.5rem">No hay pedidos pendientes</h3>
            <p style="color:var(--gray-500);margin-bottom:1.5rem">Tu carrito está vacío. ¡Explora nuestros deliciosos productos!</p>
            <button class="btn btn-primary" onclick="navigate('/productos')">Ver Productos</button>
          </div></div></div>` :
        `<div style="margin-bottom:2rem">
          ${items.map(it => `
            <div class="card shadow-lg cart-item-wrap">
              <div class="cart-item-inner">
                <div class="cart-item-img">
                  <img src="${escHtml(it.image)}" alt="${escHtml(it.name)}"
                    onerror="this.src='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200'" />
                </div>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem">
                    <div>
                      <h4 style="color:var(--amber-900)">${escHtml(it.name)}</h4>
                      <p style="color:var(--gray-600)">${it.price} <span style="font-size:0.875rem">/ docena</span></p>
                    </div>
                    <button class="btn btn-sm" style="color:var(--red-600)" onclick="handleRemoveCartItem(${it.id},'${escHtml(it.name).replace(/'/g,"\\'")}')">🗑️</button>
                  </div>
                  <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap">
                    <span style="font-size:0.875rem;font-weight:500;color:var(--gray-700)">Cantidad (docenas):</span>
                    <div class="qty-ctrl">
                      <button class="qty-btn" onclick="handleCartQty(${it.id},${it.dozen-1})" ${it.dozen<=1?'disabled':''}>−</button>
                      <span class="qty-num">${it.dozen}</span>
                      <button class="qty-btn" onclick="handleCartQty(${it.id},${it.dozen+1})">+</button>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <p style="font-size:0.8rem;color:var(--gray-600)">Subtotal:</p>
                    <p style="font-size:1.5rem;font-weight:700;color:var(--amber-700)">${fmtCOP(it.priceNumber*it.dozen)}</p>
                  </div>
                </div>
              </div>
            </div>`).join('')}
        </div>
        <div class="card shadow-xl">
          <div class="card-header"><div class="card-title">Resumen del Pedido</div></div>
          <div class="card-content">
            <div style="display:flex;justify-content:space-between;color:var(--gray-600);margin-bottom:1rem">
              <span>Total de items:</span>
              <span style="font-weight:600">${items.reduce((s,i)=>s+i.dozen,0)} docenas</span>
            </div>
            <div class="border-t" style="padding-top:1rem;display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600;font-size:1.0625rem">Total:</span>
              <span style="font-size:1.75rem;font-weight:700;color:var(--amber-700)">${fmtCOP(total)}</span>
            </div>
          </div>
          <div class="card-footer" style="display:flex;flex-direction:column;gap:0.75rem">
            <button class="btn btn-primary btn-full btn-xl" onclick="handleCheckout()">Proceder con el Pago</button>
            ${user
              ? `<p style="font-size:0.75rem;text-align:center;color:var(--gray-500)">Serás redirigido al formulario de envío</p>`
              : `<p style="font-size:0.75rem;text-align:center;color:var(--amber-600);font-weight:500">Debes iniciar sesión para proceder con el pago</p>`}
          </div>
        </div>`}
      </div>
    </div>`;
}
 
window.handleRemoveCartItem = function(id, name) { removeFromCart(id); showToast(name + ' eliminado del carrito','info'); renderPage(getCurrentPath()); };
window.handleCartQty        = function(id, qty)  { updateCartItemQty(id, qty); renderPage(getCurrentPath()); };
window.handleClearCart      = function() {
  if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) { clearCart(); showToast('Carrito vaciado','info'); renderPage(getCurrentPath()); }
};
window.handleCheckout = function() {
  if (!getCurrentUser()) { showToast('Debes iniciar sesión para proceder con el pago','error'); setTimeout(()=>navigate('/login'),1000); return; }
  navigate('/checkout/shipping');
};
 
// ============================================================
// PÁGINA: CHECKOUT - ENVÍO
// ============================================================
 
function renderCheckoutShipping(container) {
  const s = sessionStorage.getItem('shipping_address');
  const d = s ? JSON.parse(s) : { fullName:'', phone:'', address:'', city:'', department:'Norte de Santander', instructions:'' };
 
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container-sm">
        <button class="btn btn-ghost back-btn" onclick="navigate('/cart')">← Volver al Carrito</button>
        <div class="card shadow-xl">
          <div class="checkout-header">
            <h3>📍 Información de Envío</h3>
            <p>Paso 1 de 3: Ingresa la dirección donde deseas recibir tu pedido</p>
          </div>
          <div class="card-content" style="padding:2rem">
            <form id="shipping-form" onsubmit="handleShippingSubmit(event)">
              <div style="display:flex;flex-direction:column;gap:1.25rem">
                <div class="form-group">
                  <label class="form-label">Nombre Completo <span class="form-required">*</span></label>
                  <input type="text" name="fullName" class="form-input" placeholder="Ejemplo: Juan Andrés García Pérez" value="${escHtml(d.fullName)}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Número de Teléfono <span class="form-required">*</span></label>
                  <input type="tel" name="phone" class="form-input" placeholder="Ejemplo: 3001234567" value="${escHtml(d.phone)}" required />
                  <span class="form-hint">Se puede utilizar para ayuda a la entrega</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Departamento <span class="form-required">*</span></label>
                  <select name="department" id="dept-select" class="form-select" onchange="handleDeptChange(this.value)">
                    ${COLOMBIAN_DEPARTMENTS.map(dep => `<option value="${escHtml(dep)}" ${d.department===dep?'selected':''}>${escHtml(dep)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Ciudad <span class="form-required">*</span></label>
                  <div id="city-wrap">
                    ${d.department === 'Norte de Santander'
                      ? `<select name="city" class="form-select"><option value="">Selecciona una ciudad</option>
                          ${NORTE_SANTANDER_CITIES.map(c=>`<option value="${escHtml(c)}" ${d.city===c?'selected':''}>${escHtml(c)}</option>`).join('')}
                        </select>`
                      : `<input type="text" name="city" class="form-input" placeholder="Ingresa tu ciudad" value="${escHtml(d.city)}" required />`}
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Dirección <span class="form-required">*</span></label>
                  <input type="text" name="address" class="form-input" placeholder="Ejemplo: Calle 10 #15-23, Apto 501" value="${escHtml(d.address)}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Instrucciones de Entrega <span style="color:var(--gray-400);font-size:0.8rem">(Opcional)</span></label>
                  <textarea name="instructions" class="form-input form-textarea" placeholder="Ejemplo: Casa de dos pisos color blanco, tocar el timbre...">${escHtml(d.instructions)}</textarea>
                  <span class="form-hint">Notas, preferencias y más</span>
                </div>
                <div class="banner banner-amber"><strong>Envío gratis</strong> en Cúcuta para compras superiores a $200.000</div>
                <button type="submit" class="btn btn-primary btn-full btn-xl">Continuar al Método de Pago →</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>`;
}
window.handleDeptChange = function(dept) {
  const w = document.getElementById('city-wrap');
  if (!w) return;
  w.innerHTML = dept === 'Norte de Santander'
    ? `<select name="city" class="form-select"><option value="">Selecciona una ciudad</option>${NORTE_SANTANDER_CITIES.map(c=>`<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('')}</select>`
    : `<input type="text" name="city" class="form-input" placeholder="Ingresa tu ciudad" required />`;
};
window.handleShippingSubmit = function(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    fullName: f.fullName.value.trim(), phone: f.phone.value.trim(),
    address: f.address.value.trim(), city: f.city ? f.city.value.trim() : '',
    department: f.department.value, instructions: f.instructions ? f.instructions.value.trim() : '',
  };
  if (!data.fullName || !data.phone || !data.address || !data.city) { showToast('Por favor completa todos los campos obligatorios','error'); return; }
  sessionStorage.setItem('shipping_address', JSON.stringify(data));
  navigate('/checkout/payment');
};
 
// ============================================================
// PÁGINA: CHECKOUT - MÉTODO DE PAGO
// ============================================================
 
function renderCheckoutPayment(container) {
  const sel = sessionStorage.getItem('payment_method_type') || '';
  const methods = [
    { type:'PSE',             name:'PSE',                     desc:'Débito a cuenta de ahorros o corriente', icon:'🏦', bg:'linear-gradient(135deg,#2563eb,#1d4ed8)' },
    { type:'Visa',            name:'Visa (Nacional)',          desc:'Tarjeta de crédito o débito Visa',       icon:'💳', bg:'linear-gradient(135deg,#1d4ed8,#1e3a8a)' },
    { type:'Mastercard',      name:'Mastercard (Nacional)',    desc:'Tarjeta Mastercard',                     icon:'💳', bg:'linear-gradient(135deg,#dc2626,#b91c1c)' },
    { type:'American Express',name:'American Express',         desc:'Tarjeta de crédito American Express',    icon:'💳', bg:'linear-gradient(135deg,#16a34a,#15803d)' },
    { type:'Payvalida',       name:'Payvalida',                desc:'Pago digital con Payvalida',             icon:'📱', bg:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    { type:'Efecty',          name:'Efecty',                   desc:'Pago en efectivo en puntos Efecty',      icon:'💰', bg:'linear-gradient(135deg,#d97706,#b45309)' },
  ];
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container-sm">
        <button class="btn btn-ghost back-btn" onclick="navigate('/checkout/shipping')">← Volver a Información de Envío</button>
        <div class="card shadow-xl">
          <div class="checkout-header"><h3>💳 Método de Pago</h3><p>Paso 2 de 3: Selecciona tu método de pago preferido</p></div>
          <div class="card-content" style="padding:2rem">
            <div class="payment-method-grid mb-6">
              ${methods.map(m => `
                <button class="pm-btn ${sel===m.type?'selected':''}" onclick="selectPM('${m.type}',this)">
                  <div class="pm-icon" style="background:${m.bg}">${m.icon}</div>
                  <div><div class="pm-name">${m.name}</div><div class="pm-desc">${m.desc}</div></div>
                  ${sel===m.type?'<div class="pm-check">✓</div>':''}
                </button>`).join('')}
            </div>
            <div class="banner banner-blue mb-6">
              <strong>Pago seguro:</strong> Todas las transacciones están protegidas con encriptación SSL de 256 bits.
            </div>
            <button id="pm-continue-btn" class="btn btn-primary btn-full btn-xl" onclick="handlePMContinue()" ${!sel?'disabled':''}>
              ${sel ? 'Continuar con ' + (methods.find(m=>m.type===sel)?.name||'') : 'Selecciona un método de pago'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
}
window.selectPM = function(type, btn) {
  sessionStorage.setItem('payment_method_type', type);
  document.querySelectorAll('.pm-btn').forEach(b => { b.classList.remove('selected'); b.querySelector('.pm-check')?.remove(); });
  btn.classList.add('selected');
  const check = document.createElement('div'); check.className = 'pm-check'; check.textContent = '✓'; btn.appendChild(check);
  const cb = document.getElementById('pm-continue-btn');
  if (cb) { cb.disabled = false; cb.textContent = 'Continuar con ' + btn.querySelector('.pm-name').textContent; }
};
window.handlePMContinue = function() {
  if (!sessionStorage.getItem('payment_method_type')) { showToast('Por favor selecciona un método de pago','error'); return; }
  navigate('/checkout/payment-details');
};
 
// ============================================================
// PÁGINA: CHECKOUT - DATOS DE PAGO
// ============================================================
 
function renderCheckoutPaymentDetails(container) {
  const method = sessionStorage.getItem('payment_method_type') || 'Tarjeta';
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container-sm">
        <button class="btn btn-ghost back-btn" onclick="navigate('/checkout/payment')">← Volver a Método de Pago</button>
        <div class="card shadow-xl">
          <div class="checkout-header"><h3>🔒 Información de Pago</h3><p>Paso 3 de 3: Ingresa los datos de tu tarjeta</p></div>
          <div class="card-content" style="padding:2rem">
            <div class="card-preview">
              <div class="card-preview-top">
                <span style="font-size:2rem">💳</span>
                <div style="text-align:right">
                  <div class="card-preview-label">Método de Pago</div>
                  <div style="font-weight:600">${escHtml(method)}</div>
                </div>
              </div>
              <div id="prev-num" class="card-preview-number">•••• •••• •••• ••••</div>
              <div class="card-preview-bottom">
                <div><div class="card-preview-label">Titular</div><div id="prev-name" class="card-preview-value">NOMBRE COMPLETO</div></div>
                <div style="text-align:right"><div class="card-preview-label">Vencimiento</div><div id="prev-exp" class="card-preview-value">MM/AA</div></div>
              </div>
            </div>
            <form id="payment-form" onsubmit="handlePaymentSubmit(event)">
              <div style="display:flex;flex-direction:column;gap:1.25rem">
                <div class="form-group">
                  <label class="form-label">Número de Tarjeta <span class="form-required">*</span></label>
                  <input type="text" id="c-num" name="cardNumber" class="form-input form-mono" placeholder="1234 5678 9012 3456" maxlength="19" oninput="fmtCard(this)" required />
                  <span class="form-hint">Demo: Usa 4111 1111 1111 1111 para pruebas</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Nombre en la Tarjeta <span class="form-required">*</span></label>
                  <input type="text" id="c-name" name="cardName" class="form-input" placeholder="JUAN GARCIA"
                    oninput="this.value=this.value.toUpperCase();document.getElementById('prev-name').textContent=this.value||'NOMBRE COMPLETO'" required />
                </div>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Vencimiento <span class="form-required">*</span></label>
                    <input type="text" id="c-exp" name="expiryDate" class="form-input form-mono" placeholder="MM/AA" maxlength="5" oninput="fmtExp(this)" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">CVV <span class="form-required">*</span></label>
                    <input type="text" name="cvv" class="form-input form-mono" placeholder="123" maxlength="4" oninput="this.value=this.value.replace(/\\D/g,'')" required />
                  </div>
                </div>
                <div class="banner banner-green">
                  <div style="display:flex;gap:0.75rem;align-items:start">
                    <span style="font-size:1.25rem">🔒</span>
                    <div>
                      <p style="font-weight:600;margin-bottom:0.1rem">Transacción Segura</p>
                      <p style="font-size:0.8rem">Tus datos están protegidos con encriptación de nivel bancario</p>
                    </div>
                  </div>
                </div>
                <button type="submit" id="pay-btn" class="btn btn-primary btn-full btn-xl">✓ Completar Pago</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>`;
}
window.fmtCard = function(input) {
  let v = input.value.replace(/\s/g,'').replace(/\D/g,'').slice(0,16);
  input.value = v.match(/.{1,4}/g)?.join(' ') || v;
  document.getElementById('prev-num').textContent = input.value || '•••• •••• •••• ••••';
};
window.fmtExp = function(input) {
  let v = input.value.replace(/\D/g,'').slice(0,4);
  if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
  input.value = v;
  document.getElementById('prev-exp').textContent = v || 'MM/AA';
};
window.handlePaymentSubmit = async function(e) {
  e.preventDefault();
  const f = e.target;
  const btn = document.getElementById('pay-btn');
  if (!f.cardNumber.value || !f.cardName.value || !f.expiryDate.value || !f.cvv.value) { showToast('Por favor completa todos los campos','error'); return; }
  btn.disabled = true; btn.textContent = '⏳ Procesando Pago...';
  try {
    const user = getCurrentUser();
    if (!user) { navigate('/login'); return; }
    const shippingStr = sessionStorage.getItem('shipping_address');
    if (!shippingStr) { showToast('No se encontró información de envío','error'); navigate('/checkout/shipping'); return; }
    const shippingData = JSON.parse(shippingStr);
    const cartItems = getCartItems();
    const order = await createOrder(
      user.email,
      cartItems.map(i => ({ productId:i.id, productName:i.name, quantity:i.dozen, price:i.priceNumber, image:i.image })),
      shippingData,
      {
        type: sessionStorage.getItem('payment_method_type'),
        cardNumber: '****' + f.cardNumber.value.replace(/\s/g,'').slice(-4),
        cardName: f.cardName.value,
      },
      getCartTotal()
    );
    localStorage.setItem('last_order', JSON.stringify(order));
    await clearCart();
    sessionStorage.removeItem('shipping_address');
    sessionStorage.removeItem('payment_method_type');
    showToast('¡Pago procesado exitosamente!','success');
    navigate('/checkout/success/' + order.id);
  } catch (error) {
    showToast(error.message || 'Error al procesar el pago. Intenta nuevamente.','error');
  } finally {
    btn.disabled = false; btn.textContent = '✓ Completar Pago';
  }
};
 
// ============================================================
// PÁGINA: CHECKOUT - ÉXITO
// ============================================================
 
function renderCheckoutSuccess(container, orderId) {
  const order = getOrderById(orderId) || JSON.parse(localStorage.getItem('last_order') || 'null');
  if (!order) { navigate('/'); return; }

  const shipping = order.shippingAddress || {
    fullName: order.envioNombreCompleto || '',
    phone: order.envioTelefono || '',
    address: order.envioDireccion || '',
    city: order.envioCiudad || '',
    department: order.envioDepartamento || '',
  };
  const payment = order.paymentMethod || {
    type: order.metodoPagoTipo || '',
    cardNumber: order.metodoPagoUltimosDigitos || '',
  };
  const items = order.items || [];
  const estimated = order.estimatedDelivery || order.fechaEntregaEstimada;

  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container-sm">
        <div style="text-align:center;margin-bottom:2rem">
          <div class="success-icon-wrap">✅</div>
          <h2 style="color:var(--amber-900);margin-bottom:0.5rem">¡Pedido Realizado con Éxito!</h2>
          <p style="color:var(--gray-600)">Tu pedido ha sido confirmado y está siendo procesado</p>
        </div>
        <div class="order-banner">
          <div class="order-banner-label">Número de Pedido</div>
          <div class="order-banner-id">${escHtml(order.numeroPedido || order.id)}</div>
          <div class="order-banner-delivery">Entrega estimada: ${estimated ? getDeliveryText(estimated) : 'Calculando...'}</div>
        </div>
        <div class="card shadow-xl mb-4">
          <div class="card-content">
            <h5 style="color:var(--amber-900);margin-bottom:1rem">📦 Productos</h5>
            ${items.map(it => `
              <div style="display:flex;align-items:center;gap:1rem;background:var(--amber-50);padding:0.75rem;border-radius:var(--radius);margin-bottom:0.5rem">
                <img src="${escHtml(it.image || it.productoImagenUrl)}" alt="${escHtml(it.productName || it.productoNombre)}" style="width:4rem;height:4rem;object-fit:cover;border-radius:var(--radius-sm)" onerror="this.style.display='none'" />
                <div style="flex:1"><p style="font-weight:500">${escHtml(it.productName || it.productoNombre)}</p><p style="font-size:0.8rem;color:var(--gray-600)">${it.quantity || it.cantidad} ${((it.quantity || it.cantidad)===1)?'docena':'docenas'}</p></div>
                <p style="font-weight:600;color:var(--amber-700)">${fmtCOP((it.price || it.precioUnitario || 0) * (it.quantity || it.cantidad || 0))}</p>
              </div>`).join('')}
            <div style="margin-top:1.5rem">
              <h5 style="color:var(--amber-900);margin-bottom:0.75rem">📍 Dirección de Envío</h5>
              <div style="background:var(--gray-50);padding:1rem;border-radius:var(--radius)">
                <p style="font-weight:500">${escHtml(shipping.fullName)}</p>
                <p style="color:var(--gray-600)">${escHtml(shipping.phone)}</p>
                <p style="color:var(--gray-600);margin-top:0.4rem">${escHtml(shipping.address)}</p>
                <p style="color:var(--gray-600)">${escHtml(shipping.city)}, ${escHtml(shipping.department)}</p>
              </div>
            </div>
            <div style="margin-top:1.5rem">
              <h5 style="color:var(--amber-900);margin-bottom:0.75rem">💳 Método de Pago</h5>
              <div style="background:var(--gray-50);padding:1rem;border-radius:var(--radius)">
                <p style="font-weight:500">${escHtml(payment.type)}</p>
                ${payment.cardNumber ? `<p style="color:var(--gray-600);font-family:monospace">${escHtml(payment.cardNumber)}</p>` : ''}
              </div>
            </div>
            <div class="border-t" style="padding-top:1rem;margin-top:1rem;display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600;font-size:1.0625rem">Total Pagado:</span>
              <span style="font-size:1.75rem;font-weight:700;color:var(--amber-700)">${fmtCOP(order.total || 0)}</span>
            </div>
          </div>
        </div>
        <div class="grid-2-sm mb-4">
          <button class="btn btn-primary" onclick="navigate('/folatopedidos')">📋 Ver Mis Pedidos</button>
          <button class="btn btn-outline-amber" onclick="navigate('/')">🏠 Volver al Inicio</button>
        </div>
        <div class="banner banner-blue">
          <h5 style="color:var(--blue-900);margin-bottom:0.5rem">¿Qué sigue?</h5>
          <ul style="font-size:0.875rem;color:var(--blue-800);display:flex;flex-direction:column;gap:0.25rem">
            <li>✓ Recibirás una confirmación por correo electrónico</li>
            <li>✓ Prepararemos tu pedido con el mayor cuidado</li>
            <li>✓ Te notificaremos cuando tu pedido esté en camino</li>
            <li>✓ Puedes seguir el estado de tu pedido en "Folatopedidos"</li>
          </ul>
        </div>
      </div>
    </div>`;
}
 
// ============================================================
// PÁGINA: LOGIN
// ============================================================
 
function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-inner"><span style="font-size:3rem">🍪</span><span class="auth-site-name">Galletas Folatokfe</span></div>
          <p class="auth-subtitle">Inicia sesión en tu cuenta</p>
        </div>
        <div class="card shadow-xl">
          <div class="card-header">
            <div class="card-title">🔑 Iniciar Sesión</div>
            <div class="card-desc">Ingresa tus credenciales para acceder a tu cuenta</div>
          </div>
          <div class="card-content">
            <form id="login-form" onsubmit="handleLoginSubmit(event)" style="display:flex;flex-direction:column;gap:1rem">
              <div class="form-group">
                <label class="form-label">Correo Electrónico</label>
                <input type="email" name="email" class="form-input" placeholder="tu@email.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input type="password" name="password" class="form-input" placeholder="••••••••" required />
              </div>
              <button type="submit" id="login-btn" class="btn btn-primary btn-full btn-lg">Iniciar Sesión</button>
            </form>
            <div style="margin-top:1rem;text-align:center;border-top:1px solid var(--gray-200);padding-top:1rem">
              <p style="font-size:0.875rem;color:var(--gray-600)">¿No tienes cuenta?
                <button class="btn btn-ghost btn-sm" onclick="navigate('/register')" style="padding:0.2rem 0.5rem">Regístrate aquí</button>
              </p>
            </div>
            <div class="demo-box">
              <div class="demo-box-title">Credenciales de demostración:</div>
              <div class="demo-box-row">👨‍💼 <strong>Admin:</strong> admin@folatokfe.com / admin123</div>
              <div class="demo-box-row">👤 <strong>Cliente:</strong> cliente@example.com / cliente123</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
window.handleLoginSubmit = async function(e) {
  e.preventDefault();
  const f = e.target; const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Iniciando sesión...';
  try {
    const user = await authLogin(f.email.value, f.password.value);
    if (user) {
      await loadProducts();
      await loadCartFromServer();
      showToast('¡Bienvenido, ' + user.name + '!','success');
      updateNavbar();
      navigate('/');
    } else {
      showToast('Credenciales incorrectas. Intenta de nuevo.','error');
    }
  } catch (error) {
    showToast(error.message || 'No se pudo iniciar sesión','error');
  } finally {
    btn.disabled = false; btn.textContent = 'Iniciar Sesión';
  }
};
 
// ============================================================
// PÁGINA: REGISTRO
// ============================================================
 
function renderRegister(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-inner"><span style="font-size:3rem">🍪</span><span class="auth-site-name">Galletas Folatokfe</span></div>
          <p class="auth-subtitle">Crea tu cuenta para comenzar</p>
        </div>
        <div class="card shadow-xl">
          <div class="card-header">
            <div class="card-title">👤 Crear Cuenta</div>
            <div class="card-desc">Completa el formulario para registrarte</div>
          </div>
          <div class="card-content">
            <form id="register-form" onsubmit="handleRegisterSubmit(event)" style="display:flex;flex-direction:column;gap:1rem">
              <div class="form-group"><label class="form-label">Nombre Completo</label><input type="text" name="name" class="form-input" placeholder="Tu nombre" required /></div>
              <div class="form-group"><label class="form-label">Correo Electrónico</label><input type="email" name="email" class="form-input" placeholder="tu@email.com" required /></div>
              <div class="form-group"><label class="form-label">Contraseña</label><input type="password" name="password" class="form-input" placeholder="Mínimo 6 caracteres" minlength="6" required /></div>
              <div class="form-group"><label class="form-label">Confirmar Contraseña</label><input type="password" name="confirmPassword" class="form-input" placeholder="Repite tu contraseña" minlength="6" required /></div>
              <button type="submit" id="register-btn" class="btn btn-primary btn-full btn-lg">Crear Cuenta</button>
            </form>
            <div style="margin-top:1rem;text-align:center">
              <button class="btn btn-ghost btn-sm" onclick="navigate('/login')">¿Ya tienes cuenta? Inicia sesión</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
window.handleRegisterSubmit = async function(e) {
  e.preventDefault();
  const f = e.target; const btn = document.getElementById('register-btn');
  if (f.password.value !== f.confirmPassword.value) { showToast('Las contraseñas no coinciden','error'); return; }
  if (f.password.value.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres','error'); return; }
  btn.disabled = true; btn.textContent = 'Creando cuenta...';
  try {
    const user = await authRegister(f.email.value, f.password.value, f.name.value);
    if (user) {
      await loadProducts();
      await loadCartFromServer();
      showToast('¡Bienvenido, ' + user.name + '!','success');
      updateNavbar();
      navigate('/');
    }
  } catch (error) {
    showToast(error.message || 'No se pudo crear la cuenta','error');
  } finally {
    btn.disabled = false; btn.textContent = 'Crear Cuenta';
  }
};
 
// ============================================================
// PÁGINA: FOLATOPEDIDOS
// ============================================================
 
async function renderFolatopedidos(container) {
  const user = getCurrentUser();
  if (!user) { navigate('/login'); return; }
  let orders = [];
  let filterState = 'all';

  try {
    const data = await fetchOrders();
    orders = (data || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (error) {
    console.error(error);
  }

  const pendingCount   = orders.filter(o => ['pending','in_warehouse','in_transit'].includes(o.estado || o.status)).length;
  const completedCount = orders.filter(o => ['delivered','cancelled'].includes(o.estado || o.status)).length;
 
  function getFiltered() {
    if (filterState === 'pending')   return orders.filter(o => ['pending','in_warehouse','in_transit'].includes(o.estado || o.status));
    if (filterState === 'completed') return orders.filter(o => ['delivered','cancelled'].includes(o.estado || o.status));
    return orders;
  }
  function renderList() {
    const filtered = getFiltered();
    if (!filtered.length) return `<div class="card shadow-xl"><div class="card-content"><div class="empty-state">
      <div class="empty-icon">📦</div>
      <h3 style="color:var(--gray-700);margin-bottom:0.5rem">No hay pedidos</h3>
      <p style="color:var(--gray-500);margin-bottom:1.5rem">
        ${filterState==='pending'?'No tienes pedidos pendientes':filterState==='completed'?'No tienes pedidos finalizados':'Aún no has realizado ningún pedido'}
      </p>
      <button class="btn btn-primary" onclick="navigate('/productos')">Explorar Productos</button>
    </div></div></div>`;
 
    return filtered.map(order => {
      const status = order.estado || order.status || 'pending';
      const isPending = ['pending','in_warehouse','in_transit'].includes(status);
      const items = order.items || [];
      const shipping = order.shippingAddress || {
        city: order.envioCiudad || '',
        address: order.envioDireccion || '',
      };
      return `<div class="card shadow-lg" style="margin-bottom:1rem">
        <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--gray-200);background:linear-gradient(90deg,var(--amber-50),var(--orange-50))">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;align-items:center">
            <div>
              <div style="font-weight:600;font-family:monospace;color:var(--amber-900)">${escHtml(order.id)}</div>
              <div style="font-size:0.8rem;color:var(--gray-600);margin-top:0.2rem">
                ${new Date(order.createdAt || order.fechaCreacion || Date.now()).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
              </div>
            </div>
            <div class="status-badge status-${status}">${getStatusEmoji(status)} ${getStatusText(status)}</div>
          </div>
        </div>
        <div class="card-content">
          <div>
            <h5 style="margin-bottom:0.75rem">Productos</h5>
            ${items.map(it => `
              <div style="display:flex;align-items:center;gap:0.75rem;background:var(--gray-50);padding:0.75rem;border-radius:var(--radius);margin-bottom:0.5rem">
                <img src="${escHtml(it.image || it.imagenUrl)}" alt="${escHtml(it.productName || it.productoNombre)}" style="width:3rem;height:3rem;object-fit:cover;border-radius:var(--radius-sm)" onerror="this.style.display='none'" />
                <div style="flex:1"><p style="font-weight:500;font-size:0.875rem">${escHtml(it.productName || it.productoNombre)}</p><p style="font-size:0.75rem;color:var(--gray-600)">${it.quantity || it.cantidad} ${(it.quantity || it.cantidad)===1?'docena':'docenas'}</p></div>
                <p style="font-size:0.875rem;font-weight:600;color:var(--amber-700)">${fmtCOP((it.price || it.precioUnitario || 0) * (it.quantity || it.cantidad || 0))}</p>
              </div>`).join('')}
          </div>
          <div style="margin-top:1rem">
            <div style="background:var(--gray-50);padding:0.875rem;border-radius:var(--radius);margin-bottom:0.75rem">
              <p style="font-size:0.75rem;color:var(--gray-600);margin-bottom:0.2rem">Dirección de entrega</p>
              <p style="font-weight:500;font-size:0.875rem">${escHtml(shipping.city || '')}</p>
              <p style="font-size:0.75rem;color:var(--gray-600)">${escHtml(shipping.address || '')}</p>
            </div>
            ${isPending && order.estimatedDelivery ? `
              <div style="background:var(--blue-50);border:1px solid var(--blue-200);padding:0.75rem;border-radius:var(--radius);margin-bottom:0.75rem">
                <p style="font-size:0.7rem;color:var(--blue-600);margin-bottom:0.15rem">Entrega estimada</p>
                <p style="font-weight:600;color:var(--blue-900);font-size:0.875rem">${getDeliveryText(order.estimatedDelivery)}</p>
              </div>` : ''}
            <div style="border-top:1px solid var(--gray-200);padding-top:0.75rem;display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600;font-size:0.875rem">Total:</span>
              <span style="font-size:1.25rem;font-weight:700;color:var(--amber-700)">${fmtCOP(order.total || 0)}</span>
            </div>
          </div>
          ${isPending ? `
            <div class="progress-bar-wrap">
              <div class="progress-bar">
                <div class="progress-step"><div class="progress-dot on"></div><span class="progress-label on">Confirmado</span></div>
                <div class="progress-line ${['in_warehouse','in_transit'].includes(status)?'on':'off'}"></div>
                <div class="progress-step"><div class="progress-dot ${['in_warehouse','in_transit'].includes(status)?'on':'off'}"></div><span class="progress-label ${['in_warehouse','in_transit'].includes(status)?'on':'off'}">En bodega</span></div>
                <div class="progress-line ${status==='in_transit'?'on':'off'}"></div>
                <div class="progress-step"><div class="progress-dot ${status==='in_transit'?'on':'off'}"></div><span class="progress-label ${status==='in_transit'?'on':'off'}">En camino</span></div>
              </div>
            </div>` : ''}
        </div>
      </div>`;
    }).join('');
  }
 
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container">
        <div style="margin-bottom:2rem">
          <h2 style="color:var(--amber-900);margin-bottom:0.25rem">📋 Folatopedidos</h2>
          <p style="color:var(--gray-600)">Gestiona y realiza seguimiento a tus pedidos</p>
        </div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:2rem" id="fp-tabs">
          <button class="btn btn-primary btn-sm" onclick="fpFilter('all',this)">Todos (${orders.length})</button>
          <button class="btn btn-outline btn-sm" onclick="fpFilter('pending',this)">⏳ Pendientes (${pendingCount})</button>
          <button class="btn btn-outline btn-sm" onclick="fpFilter('completed',this)">✅ Finalizados (${completedCount})</button>
        </div>
        <div id="orders-list">${renderList()}</div>
      </div>
      ${renderFooter()}
    </div>`;
 
  window.fpFilter = function(filter, btn) {
    filterState = filter;
    document.querySelectorAll('#fp-tabs button').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-outline'); });
    btn.classList.remove('btn-outline'); btn.classList.add('btn-primary');
    document.getElementById('orders-list').innerHTML = renderList();
  };
}
 
// ============================================================
// PÁGINA: ADMIN PANEL
// ============================================================
 
function renderAdmin(container) {
  function getDisplayProducts() {
    return appState.adminShowInactive ? getAllProducts() : getAllProducts().filter(p => p.active);
  }
  function renderForm() {
    const editing = appState.adminEditingId;
    const p = editing ? getProductById(editing) : null;
    return `<div class="card shadow-lg mb-8">
      <div class="card-header">
        <div class="card-title">${editing?'✏️ Editar Producto':'➕ Agregar Nuevo Producto'}</div>
        <div class="card-desc">${editing?'Modifica los detalles del producto':'Completa la información del nuevo producto'}</div>
      </div>
      <div class="card-content">
        <form id="admin-form" onsubmit="handleAdminSubmit(event)">
          <div class="form-grid-2" style="margin-bottom:1rem">
            <div class="form-group"><label class="form-label">Nombre <span class="form-required">*</span></label>
              <input type="text" name="name" class="form-input" placeholder="Galletas Corporativas" value="${p?escHtml(p.name):''}" required /></div>
            <div class="form-group"><label class="form-label">Categoría</label>
              <input type="text" name="category" class="form-input" placeholder="Corporativas" value="${p?escHtml(p.category||''):''}" /></div>
            <div class="form-group"><label class="form-label">Precio (número) <span class="form-required">*</span></label>
              <input type="number" name="priceNumber" class="form-input" placeholder="72000" min="1" value="${p?p.priceNumber:''}" required />
              <span class="form-hint">Solo el número, sin $ ni puntos</span></div>
            <div class="form-group"><label class="form-label">Stock</label>
              <input type="number" name="stock" class="form-input" placeholder="100" min="0" value="${p?p.stock||0:0}" /></div>
            <div class="form-group form-col-full"><label class="form-label">URL de Imagen</label>
              <input type="text" name="image" class="form-input" placeholder="https://..." value="${p?escHtml(p.image||''):''}" /></div>
            <div class="form-group form-col-full"><label class="form-label">Descripción <span class="form-required">*</span></label>
              <textarea name="description" class="form-input form-textarea" required>${p?escHtml(p.description):''}</textarea></div>
          </div>
          <div style="display:flex;gap:0.75rem">
            <button type="submit" class="btn btn-primary">💾 ${editing?'Guardar Cambios':'Crear Producto'}</button>
            ${editing?`<button type="button" class="btn btn-outline" onclick="cancelAdminEdit()">✕ Cancelar</button>`:''}
          </div>
        </form>
      </div>
    </div>`;
  }
  function renderProductList() {
    const products = getDisplayProducts();
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h4 style="color:var(--amber-900)">Productos (${products.length})</h4>
        <button class="btn btn-outline btn-sm" onclick="toggleAdminInactive()">
          ${appState.adminShowInactive?'👁 Ver Solo Activos':'👁 Ver Todos'}
        </button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(1,1fr);gap:1rem">
        ${!products.length ? `<p style="color:var(--gray-500)">No hay productos.</p>` : ''}
        ${products.map(p => `
          <div class="card shadow-lg ${!p.active?'admin-product-inactive':''}">
            <div class="card-header">
              <div class="card-title">${escHtml(p.name)} ${!p.active?'<span class="admin-badge-inactive">(Inactivo)</span>':''}</div>
              ${p.category?`<div class="card-desc">${escHtml(p.category)}</div>`:''}
            </div>
            <div class="card-content">
              <p style="font-size:0.875rem;color:var(--gray-600);margin-bottom:0.5rem">${escHtml(p.description)}</p>
              <p style="font-weight:600;color:var(--amber-700)">${escHtml(p.price)} / docena</p>
              ${p.stock!=null?`<p style="font-size:0.8rem;color:var(--gray-600)">Stock: ${p.stock} docenas</p>`:''}
            </div>
            <div class="card-footer" style="display:flex;gap:0.5rem;flex-wrap:wrap">
              ${p.active ? `
                <button class="btn btn-outline btn-sm" style="flex:1" onclick="adminEdit(${p.id})">✏️ Editar</button>
                <button class="btn btn-outline-red btn-sm" style="flex:1" onclick="adminDelete(${p.id},'${escHtml(p.name).replace(/'/g,"\\'")}')">🗑️ Desactivar</button>
              ` : `
                <button class="btn btn-outline-green btn-sm" style="flex:1" onclick="adminRestore(${p.id},'${escHtml(p.name).replace(/'/g,"\\'")}')">🔄 Restaurar</button>
                <button class="btn btn-outline-red btn-sm" style="flex:1" onclick="adminPermDelete(${p.id},'${escHtml(p.name).replace(/'/g,"\\'")}')">🗑️ Eliminar</button>
              `}
            </div>
          </div>`).join('')}
      </div>`;
  }
 
  container.innerHTML = `
    <div class="page-bg">
      <div class="page-container">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:2rem">
          <span style="font-size:2rem">🛡️</span>
          <div><h3 style="color:var(--amber-900)">Panel de Administración</h3>
            <p style="color:var(--gray-600)">Gestiona los productos de Galletas Folatokfe</p></div>
        </div>
        <div id="admin-form-wrap">${renderForm()}</div>
        <div id="admin-products-wrap">${renderProductList()}</div>
      </div>
    </div>`;
 
  window.handleAdminSubmit = function(e) {
    e.preventDefault();
    const f = e.target;
    const priceNumber = parseInt(f.priceNumber.value) || 0;
    if (!f.name.value.trim())        { showToast('El nombre es requerido','error'); return; }
    if (!f.description.value.trim()) { showToast('La descripción es requerida','error'); return; }
    if (priceNumber <= 0)             { showToast('El precio debe ser mayor a 0','error'); return; }
    const data = { name:f.name.value.trim(), description:f.description.value.trim(),
      price:'$'+priceNumber.toLocaleString('es-CO'), priceNumber,
      image:f.image.value.trim()||'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      category:f.category.value.trim(), stock:parseInt(f.stock.value)||0, active:true };
    if (appState.adminEditingId) { updateProduct(appState.adminEditingId, data); showToast('Producto actualizado','success'); appState.adminEditingId = null; }
    else { createProduct(data); showToast('Producto creado','success'); }
    renderAdmin(container);
  };
  window.adminEdit = function(id) { appState.adminEditingId = id; renderAdmin(container); window.scrollTo({top:0,behavior:'smooth'}); };
  window.cancelAdminEdit = function() { appState.adminEditingId = null; renderAdmin(container); };
  window.adminDelete    = function(id, name) { if (confirm('¿Desactivar "'+name+'"?')) { deleteProduct(id); showToast('Producto desactivado','info'); renderAdmin(container); } };
  window.adminRestore   = function(id, name) { restoreProduct(id); showToast('"'+name+'" restaurado','success'); renderAdmin(container); };
  window.adminPermDelete= function(id, name) { if (confirm('¿ELIMINAR PERMANENTEMENTE "'+name+'"?')) { permanentDeleteProduct(id); showToast('Producto eliminado permanentemente','success'); renderAdmin(container); } };
  window.toggleAdminInactive = function() { appState.adminShowInactive = !appState.adminShowInactive; renderAdmin(container); };
}
 
// ============================================================
// PÁGINA: NUESTRA HISTORIA
// ============================================================
 
function renderAbout(container) {
  container.innerHTML = `
    <div style="background:var(--amber-50);min-height:100vh">
      <section class="section section-white">
        <div class="page-container">
          <div class="about-grid">
            <div>
              <p style="color:var(--amber-700);font-weight:600;margin-bottom:0.5rem">Nuestra Historia</p>
              <h2 style="color:var(--amber-900);margin-bottom:1.5rem">Galletas que hablan por ti</h2>
              <p style="color:var(--gray-700);margin-bottom:1.25rem;line-height:1.8">En Folatokfe transformamos cada galleta en una experiencia emotiva. Desde hace tres años elaboramos galletas personalizadas y didácticas que permiten a las personas expresar sentimientos, celebrar momentos y aprender de forma creativa.</p>
              <p style="color:var(--gray-700);margin-bottom:1.25rem;line-height:1.8">Nuestra pasión es unir arte, sabor y propósito en cada diseño, creando piezas únicas que conectan con historias reales. Trabajamos bajo pedido, cuidando cada detalle para que cada galleta lleve un mensaje especial y auténtico.</p>
              <p style="color:var(--gray-700);margin-bottom:2rem;line-height:1.8">En Folatokfe no solo hacemos galletas: creamos recuerdos que se disfrutan con el corazón.</p>
              <div>
                <div class="about-feature">
                  <div class="about-icon">❤️</div>
                  <div><h5 style="color:var(--amber-900);margin-bottom:0.35rem">Hecho con Amor</h5><p style="color:var(--gray-600);font-size:0.9rem">Cada galleta es preparada con cuidado y pasión.</p></div>
                </div>
                <div class="about-feature">
                  <div class="about-icon">🏆</div>
                  <div><h5 style="color:var(--amber-900);margin-bottom:0.35rem">Calidad Premium</h5><p style="color:var(--gray-600);font-size:0.9rem">Ingredientes de primera calidad en cada receta.</p></div>
                </div>
                <div class="about-feature">
                  <div class="about-icon">🌿</div>
                  <div><h5 style="color:var(--amber-900);margin-bottom:0.35rem">Ingredientes Naturales</h5><p style="color:var(--gray-600);font-size:0.9rem">Sin conservantes ni aditivos artificiales.</p></div>
                </div>
              </div>
            </div>
            <div class="about-img">
              <img src="https://images.unsplash.com/photo-1612203985729-70726954388c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=700" alt="Horneando galletas"
                onerror="this.src='https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=700'" />
            </div>
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>`;
}
 
// ============================================================
// PÁGINA: CONTACTO
// ============================================================
 
function renderContact(container) {
  container.innerHTML = `
    <div style="background:#fff;min-height:100vh">
      <section class="section">
        <div class="page-container">
          <div class="section-header">
            <h2 class="section-title">Contáctanos</h2>
            <p class="section-desc">¿Tienes alguna pregunta o quieres hacer un pedido especial? Estamos aquí para ayudarte.</p>
          </div>
          <div class="contact-cards-grid">
            <div class="card contact-card"><div class="contact-icon-wrap">📞</div><h4 style="color:var(--amber-900);margin-bottom:0.5rem">Teléfono</h4><p style="color:var(--gray-600)">+57 3222863961</p></div>
            <div class="card contact-card"><div class="contact-icon-wrap">✉️</div><h4 style="color:var(--amber-900);margin-bottom:0.5rem">Email</h4><p style="color:var(--gray-600)">galletasfolatokfe@gmail.com</p></div>
            <div class="card contact-card"><div class="contact-icon-wrap">📍</div><h4 style="color:var(--amber-900);margin-bottom:0.5rem">Ubicación</h4><p style="color:var(--gray-600)">Cúcuta - Norte de Santander</p></div>
          </div>
          <div class="card max-w-2xl mx-auto">
            <div class="card-header"><div class="card-title">Envíanos un Mensaje</div><div class="card-desc">Completa el formulario y nos pondremos en contacto contigo lo antes posible.</div></div>
            <div class="card-content">
              <form id="contact-form" onsubmit="handleContactSubmit(event)" style="display:flex;flex-direction:column;gap:1.25rem">
                <div class="form-group"><label class="form-label">Nombre</label><input type="text" name="name" class="form-input" placeholder="Tu nombre" required /></div>
                <div class="form-group"><label class="form-label">Email</label><input type="email" name="email" class="form-input" placeholder="tu@email.com" required /></div>
                <div class="form-group"><label class="form-label">Teléfono</label><input type="tel" name="phone" class="form-input" placeholder="3001234567" /></div>
                <div class="form-group"><label class="form-label">Mensaje</label><textarea name="message" class="form-input form-textarea" rows="5" placeholder="Cuéntanos sobre tu pedido o consulta..." required></textarea></div>
                <button type="submit" class="btn btn-primary btn-full btn-lg">Enviar Mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>`;
}
window.handleContactSubmit = function(e) {
  e.preventDefault();
  const f = e.target;
  const subject = 'Nuevo mensaje de ' + f.name.value;
  const body = `Nombre: ${f.name.value}\nEmail: ${f.email.value}\nTeléfono: ${f.phone.value}\n\nMensaje:\n${f.message.value}`;
  window.location.href = `mailto:galletasfolatokfe@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  f.reset();
};
 
// ============================================================
// PÁGINA: 404
// ============================================================
 
function renderNotFound(container) {
  container.innerHTML = `
    <div style="min-height:100vh;background:var(--amber-50);display:flex;align-items:center;justify-content:center;padding:2rem">
      <div style="text-align:center">
        <div style="font-size:6rem;margin-bottom:1rem">🍪</div>
        <h1 style="font-size:5rem;font-weight:700;color:var(--amber-900);margin-bottom:1rem">404</h1>
        <h2 style="color:var(--gray-800);margin-bottom:1rem">¡Ups! Página no encontrada</h2>
        <p style="color:var(--gray-600);max-width:26rem;margin:0 auto 2rem">La página que buscas no existe o ha sido movida. Vuelve al inicio.</p>
        <button class="btn btn-primary btn-lg" onclick="navigate('/')">🏠 Volver al Inicio</button>
      </div>
    </div>`;
}
 
// ============================================================
// INICIALIZACIÓN
// ============================================================
 
window.addEventListener('hashchange', router);
window.addEventListener('load', async function() {
  initProducts();
  await loadProducts();
  if (isLoggedIn()) {
    await loadCartFromServer();
  }
  updateNavbar();
  renderSidebarContent();
  router();
});
 
// Cerrar menús al hacer clic fuera
document.addEventListener('click', function(e) {
  if (searchOpen && !e.target.closest('#search-bar') && !e.target.closest('.icon-btn')) closeSearch();
  if (appState.filterOpen || appState.sortOpen) {
    if (!e.target.closest('.filter-dropdown-wrap') && !e.target.closest('[onclick*="toggleSortMenu"]')) {
      document.getElementById('filter-menu')?.classList.remove('open');
      document.getElementById('sort-menu')?.classList.remove('open');
      appState.filterOpen = false; appState.sortOpen = false;
    }
  }
});
