/* ============================================================
   Bachat Bazar — Store / State Management
   Cart, Wishlist, Compare, Recently Viewed, Theme, Currency,
   Auth, Orders, Notifications — all persisted to localStorage
   ============================================================ */

const Store = (() => {
  const KEY = 'bachatbazar_v3';
  const state = {
    cart: [],            // {id, qty}
    saved: [],           // saved for later
    wishlist: [],
    compare: [],
    recentlyViewed: [],
    coupon: null,
    user: null,
    orders: [],
    addresses: [],
    theme: 'light',
    currency: 'PKR',
    rate: 1,
    symbol: 'Rs ',
    lang: 'EN',
    notifs: [],
    rewards: 1250,
    newsletter: false,
    cookieConsent: null,
    catalog: null,       // managed products (admin-editable)
    catList: null,      // managed categories (admin-editable)
  };

  const CURRENCIES = {
    PKR: { symbol:'Rs ', rate:1 },
    USD: { symbol:'$',  rate:0.00357 },
    EUR: { symbol:'€',  rate:0.00329 },
    GBP: { symbol:'£',  rate:0.00282 },
    INR: { symbol:'₹',  rate:0.297 },
    JPY: { symbol:'¥',  rate:0.557 },
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved) Object.assign(state, saved);
    } catch(e) { console.warn('Load failed', e); }
    if (!state.rate) { const c = CURRENCIES[state.currency]||CURRENCIES.PKR; state.rate=c.rate; state.symbol=c.symbol; }
    // Seed managed catalog & categories from DATA on first run (admin-editable copies)
    const seed = window.DATA;
    if (!state.catalog || !state.catalog.length) {
      state.catalog = JSON.parse(JSON.stringify(seed?.PRODUCTS || []));
    }
    if (!state.catList || !state.catList.length) {
      state.catList = JSON.parse(JSON.stringify(seed?.CATEGORIES || []));
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {}
  }
  function saveCatalog(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {} }

  /* ---- Product lookup (from managed catalog) ---- */
  const product = id => (state.catalog || []).find(p => p.id === Number(id));
  const allProducts = () => state.catalog || [];
  const categories = () => state.catList || [];

  /* ---- Admin: normalize a product payload into a full product object ---- */
  function normalizeProduct(id, d) {
    const D = window.DATA;
    const images = (d.images && d.images.length) ? d.images
      : (d.imageId ? [d.imageId] : [D.PRODUCTS[0].imageId]);
    const price = +d.price || 0;
    const old = +d.oldPrice || 0;
    return {
      id: Number(id),
      name: d.name || 'Untitled Product',
      brand: d.brand || 'Generic',
      category: d.category || 'home-lifestyle',
      price, oldPrice: old,
      rating: +d.rating || 0,
      reviews: +d.reviews || 0,
      stock: +d.stock || 0,
      sku: d.sku || `BB-${String(id).padStart(4,'0')}`,
      images, imageId: images[0],
      badge: d.badge || (old && old>price ? Math.round((1-price/old)*100)+'% OFF' : ''),
      isNew: !!d.isNew, trending: !!d.trending, bestSeller: !!d.bestSeller, featured: !!d.featured,
      description: d.description || `${d.name||'Product'} by ${d.brand||'Generic'}.`,
      features: (d.features && d.features.length) ? d.features : ['Premium materials','1 year warranty','Free shipping','30-day returns'],
      specs: d.specs || { 'Brand': d.brand||'Generic', 'Category': d.category||'home-lifestyle', 'Warranty':'1 Year' },
      related: d.related || []
    };
  }
  function addProduct(d) {
    const id = (state.catalog.reduce((m,p)=>Math.max(m,p.id),0) || 0) + 1;
    const p = normalizeProduct(id, d); state.catalog.push(p); saveCatalog(); return p;
  }
  function updateProduct(id, d) {
    const i = state.catalog.findIndex(p => p.id === Number(id));
    if (i > -1) { state.catalog[i] = { ...state.catalog[i], ...normalizeProduct(id, d), id: Number(id) }; saveCatalog(); }
  }
  function deleteProduct(id) {
    state.catalog = state.catalog.filter(p => p.id !== Number(id)); saveCatalog();
  }
  /* ---- Admin: categories CRUD ---- */
  function addCategory(d) {
    const id = (d.id || d.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if (state.catList.find(c=>c.id===id)) return null;
    const c = { id, name:d.name||'Category', icon:d.icon||'tag', color:d.color||'from-slate-500 to-slate-700', img:d.img||'' };
    state.catList.push(c); saveCatalog(); return c;
  }
  function updateCategory(id, d) {
    const i = state.catList.findIndex(c=>c.id===id); if(i<0) return;
    state.catList[i] = { ...state.catList[i], ...d }; saveCatalog();
  }
  function deleteCategory(id) {
    state.catList = state.catList.filter(c=>c.id!==id);
    // reassign products of deleted category to 'home-lifestyle'
    state.catalog.forEach(p=>{ if(p.category===id) p.category='home-lifestyle'; });
    saveCatalog();
  }
  function resetCatalog() {
    state.catalog = JSON.parse(JSON.stringify(window.DATA.PRODUCTS));
    state.catList = JSON.parse(JSON.stringify(window.DATA.CATEGORIES));
    saveCatalog();
  }

  /* ---- Cart ---- */
  function addToCart(id, qty=1) {
    id = Number(id);
    const item = state.cart.find(i => i.id === id);
    const p = product(id);
    if (p && p.stock <= 0) { UI.toast('Item is out of stock','error'); return false; }
    if (item) item.qty = Math.min(item.qty + qty, p?.stock || 99);
    else state.cart.push({ id, qty });
    save(); updateBadges(); UI.toast(`${p?.name || 'Item'} added to cart`,'success');
    return true;
  }
  function removeFromCart(id) {
    state.cart = state.cart.filter(i => i.id !== Number(id));
    save(); updateBadges();
  }
  function saveForLater(id) {
    id = Number(id);
    const item = state.cart.find(i => i.id === id);
    if (item) { state.saved.push(item); state.cart = state.cart.filter(i=>i.id!==id); save(); updateBadges(); }
  }
  function moveToCart(id) {
    id = Number(id);
    const item = state.saved.find(i => i.id === id);
    if (item) { state.saved = state.saved.filter(i=>i.id!==id); addToCart(id, item.qty); }
  }
  function setQty(id, qty) {
    const item = state.cart.find(i => i.id === Number(id));
    if (item) { item.qty = Math.max(1, qty); save(); updateBadges(); }
  }

  /* ---- Wishlist ---- */
  function toggleWishlist(id) {
    id = Number(id);
    const i = state.wishlist.indexOf(id);
    if (i > -1) { state.wishlist.splice(i,1); UI.toast('Removed from wishlist','info'); }
    else { state.wishlist.push(id); UI.toast('Added to wishlist','success'); }
    save(); updateBadges();
    return state.wishlist.includes(id);
  }
  function inWishlist(id){ return state.wishlist.includes(Number(id)); }

  /* ---- Compare ---- */
  function toggleCompare(id) {
    id = Number(id);
    const i = state.compare.indexOf(id);
    if (i > -1) { state.compare.splice(i,1); UI.toast('Removed from compare','info'); }
    else {
      if (state.compare.length >= 4) { UI.toast('You can compare up to 4 items','error'); return false; }
      state.compare.push(id); UI.toast('Added to compare','success');
    }
    save(); updateBadges();
    return state.compare.includes(id);
  }
  function inCompare(id){ return state.compare.includes(Number(id)); }

  /* ---- Recently viewed ---- */
  function pushRecent(id) {
    id = Number(id);
    state.recentlyViewed = [id, ...state.recentlyViewed.filter(x=>x!==id)].slice(0,8);
    save();
  }

  /* ---- Coupon ---- */
  function applyCoupon(code) {
    const c = (window.DATA?.COUPONS||[]).find(x => x.code === (code||'').toUpperCase());
    if (!c) { UI.toast('Invalid coupon code','error'); return false; }
    const sub = cartSubtotal().raw;
    if (sub < c.min) { UI.toast(`Minimum order ${money(c.min)} required for ${c.code}`,'error'); return false; }
    state.coupon = c; save(); UI.toast(`Coupon applied: ${c.label}`,'success'); return true;
  }
  function clearCoupon(){ state.coupon = null; save(); }

  /* ---- Totals ---- */
  function cartSubtotal() {
    const raw = state.cart.reduce((s,i)=>{ const p=product(i.id); return s + (p?p.price*i.qty:0); },0);
    return { raw, display: money(raw) };
  }
  function cartCount(){ return state.cart.reduce((s,i)=>s+i.qty,0); }
  function cartDiscount(sub) {
    if (!state.coupon) return 0;
    const c = state.coupon;
    if (c.type==='percent') return sub * c.value/100;
    if (c.type==='flat') return Math.min(c.value, sub);
    return 0;
  }
  function shippingCost(sub) {
    if (state.coupon?.type==='ship') return 0;
    if (sub === 0) return 0;
    return sub >= 5000 ? 0 : 150;
  }
  function cartTotals() {
    const sub = cartSubtotal().raw;
    const discount = cartDiscount(sub);
    const shipping = shippingCost(sub - discount);
    const tax = (sub - discount) * 0.08;
    const total = sub - discount + shipping + tax;
    return { sub, discount, shipping, tax, total, subDisplay: money(sub), discountDisplay: money(discount), shipDisplay: money(shipping), taxDisplay: money(tax), totalDisplay: money(total) };
  }

  /* ---- Currency ---- */
  function money(usd) {
    const v = (usd * state.rate);
    const sym = state.symbol;
    if (state.currency === 'JPY' || state.currency === 'PKR') return sym + Math.round(v).toLocaleString();
    return sym + v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function setCurrency(code) {
    const c = CURRENCIES[code]; if(!c) return;
    state.currency = code; state.rate = c.rate; state.symbol = c.symbol;
    save(); UI.toast(`Currency set to ${code}`,'info');
    const btn = document.querySelector('[data-currency-toggle]');
    if (btn) btn.textContent = `${code} ${c.symbol.trim()}`;
  }
  function cycleCurrency() {
    const keys = Object.keys(CURRENCIES);
    const next = keys[(keys.indexOf(state.currency)+1)%keys.length];
    setCurrency(next);
  }

  /* ---- Theme ---- */
  function setTheme(t){ state.theme = t; applyTheme(); save(); }
  function toggleTheme(){ setTheme(state.theme==='dark'?'light':'dark'); }
  function applyTheme() {
    document.documentElement.classList.toggle('dark', state.theme==='dark');
    const icon = document.querySelector('#themeToggle i');
    if (icon) { icon.setAttribute('data-lucide', state.theme==='dark'?'sun':'moon'); lucide.createIcons(); }
  }

  /* ---- Auth (demo) ---- */
  function login(email) {
    state.user = { name: email.split('@')[0].replace(/\b\w/g,c=>c.toUpperCase()), email, joined: new Date().toISOString() };
    if (!state.addresses.length) state.addresses = [demoAddress()];
    save(); UI.toast(`Welcome back, ${state.user.name}!`,'success');
    return state.user;
  }
  function register(name,email){ state.user={name,email,joined:new Date().toISOString()}; if(!state.addresses.length)state.addresses=[demoAddress()]; save(); UI.toast(`Account created. Welcome, ${name}!`,'success'); return state.user; }
  function logout(){ state.user=null; save(); UI.toast('Logged out','info'); }
  function demoAddress(){ return { id:1, label:'Home', name:'', line:'House 42, Block C, Gulberg III', city:'Lahore', state:'Punjab', zip:'54000', country:'Pakistan', phone:'+92 300 1234567', default:true }; }

  /* ---- Orders ---- */
  function placeOrder(payment, address) {
    const totals = cartTotals();
    const order = {
      id: 'BB' + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      status: 'Confirmed',
      items: state.cart.map(i => ({...i, name: product(i.id)?.name, price: product(i.id)?.price, imageId: product(i.id)?.imageId })),
      totals, payment, address,
      eta: new Date(Date.now()+5*864e5).toISOString()
    };
    state.orders.unshift(order);
    state.cart = []; state.saved = []; state.coupon = null;
    state.rewards += Math.round(totals.total);
    addNotif({ icon:'package-check', title:'Order Confirmed', text:`Order ${order.id} has been placed.` });
    save(); updateBadges();
    return order;
  }
  function cancelOrder(id){ const o=state.orders.find(o=>o.id===id); if(o){o.status='Cancelled'; save(); UI.toast('Order cancelled','info');} }

  /* ---- Notifications ---- */
  function addNotif(n){ state.notifs.unshift({id:Date.now(),read:false,time:new Date().toISOString(),...n}); state.notifs = state.notifs.slice(0,12); save(); }
  function markAllRead(){ state.notifs.forEach(n=>n.read=true); save(); }

  function updateBadges() {
    const set = (id,n) => { const el=document.getElementById(id); if(!el)return; el.textContent=n; el.classList.toggle('hidden', n===0); };
    set('cartCount', cartCount());
    set('wishlistCount', state.wishlist.length);
    set('compareCount', state.compare.length);
    const nb=document.querySelector('#notifBtn .badge'); if(nb) nb.classList.toggle('hidden', state.notifs.filter(n=>!n.read).length===0);
  }

  /* ---- Recently viewed helpers for UI ---- */
  function recentProducts(){ return state.recentlyViewed.map(product).filter(Boolean); }

  load();

  return {
    state, CURRENCIES,
    product, allProducts, categories,
    addProduct, updateProduct, deleteProduct, normalizeProduct,
    addCategory, updateCategory, deleteCategory, resetCatalog,
    addToCart, removeFromCart, saveForLater, moveToCart, setQty,
    toggleWishlist, inWishlist,
    toggleCompare, inCompare,
    pushRecent, recentProducts,
    applyCoupon, clearCoupon,
    cartSubtotal, cartCount, cartTotals, shippingCost,
    money, setCurrency, cycleCurrency,
    setTheme, toggleTheme, applyTheme,
    login, register, logout,
    placeOrder, cancelOrder,
    addNotif, markAllRead,
    updateBadges, save
  };
})();
