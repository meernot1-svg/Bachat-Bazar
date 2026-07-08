/* ============================================================
   Bachat Bazar — Store / State Management (Zustand)
   Cart, Wishlist, Compare, Theme, Auth, Orders, Banners, Sales
   ============================================================ */
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS, CATEGORIES, COUPONS, DEFAULT_BANNERS, DEFAULT_SALES, type Product, type Category, type Coupon, type BannerData, type SaleData } from './data';

interface CartItem { id: number; qty: number; }
interface Address {
  id: number; label: string; name: string; line: string;
  city: string; state: string; zip: string; country: string;
  phone: string; default: boolean;
}
interface Order {
  id: string; date: string; status: string;
  items: (CartItem & { name?: string; price?: number; imageId?: string })[];
  totals: CartTotals; payment: string; address: Address; eta: string;
}
interface Notif {
  id: number; read: boolean; time: string; icon: string; title: string; text: string;
}
interface CartTotals {
  sub: number; discount: number; shipping: number; tax: number; total: number;
  subDisplay: string; discountDisplay: string; shipDisplay: string; taxDisplay: string; totalDisplay: string;
}

const CURRENCIES: Record<string, { symbol: string; rate: number }> = {
  PKR: { symbol:'Rs ', rate:1 },
  USD: { symbol:'$', rate:0.00357 },
  EUR: { symbol:'€', rate:0.00329 },
  GBP: { symbol:'£', rate:0.00282 },
  INR: { symbol:'₹', rate:0.297 },
  JPY: { symbol:'¥', rate:0.557 },
};

function money(amount: number, currency: string = 'PKR', rate: number = 1, symbol: string = 'Rs '): string {
  const v = amount * rate;
  if (currency === 'JPY' || currency === 'PKR') return symbol + Math.round(v).toLocaleString();
  return symbol + v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
}

function demoAddress(): Address {
  return { id:1, label:'Home', name:'', line:'House 42, Block C, Gulberg III', city:'Lahore', state:'Punjab', zip:'54000', country:'Pakistan', phone:'+92 300 1234567', default:true };
}

interface StoreState {
  cart: CartItem[];
  saved: CartItem[];
  wishlist: number[];
  compare: number[];
  recentlyViewed: number[];
  coupon: Coupon | null;
  user: { name: string; email: string; joined: string } | null;
  orders: Order[];
  addresses: Address[];
  theme: 'light' | 'dark';
  currency: string;
  rate: number;
  symbol: string;
  notifs: Notif[];
  rewards: number;
  catalog: Product[];
  catList: Category[];
  banners: BannerData[];
  sales: SaleData[];
  // Computed
  getProduct: (id: number) => Product | undefined;
  allProducts: () => Product[];
  categories: () => Category[];
  money: (amount: number) => string;
  cartSubtotal: () => { raw: number; display: string };
  cartCount: () => number;
  cartTotals: () => CartTotals;
  shippingCost: (sub: number) => number;
  // Actions
  addToCart: (id: number, qty?: number) => boolean;
  removeFromCart: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  saveForLater: (id: number) => void;
  moveToCart: (id: number) => void;
  toggleWishlist: (id: number) => boolean;
  inWishlist: (id: number) => boolean;
  toggleCompare: (id: number) => boolean;
  inCompare: (id: number) => boolean;
  pushRecent: (id: number) => void;
  recentProducts: () => Product[];
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  setCurrency: (code: string) => void;
  toggleTheme: () => void;
  login: (email: string) => { name: string; email: string; joined: string };
  register: (name: string, email: string) => { name: string; email: string; joined: string };
  logout: () => void;
  placeOrder: (payment: string, address: Address) => Order;
  cancelOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: string) => void;
  addNotif: (n: { icon: string; title: string; text: string }) => void;
  markAllRead: () => void;
  addProduct: (d: Partial<Product>) => Product;
  updateProduct: (id: number, d: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addCategory: (d: Partial<Category>) => Category | null;
  updateCategory: (id: string, d: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetCatalog: () => void;
  // Banner actions
  addBanner: (d: Partial<BannerData>) => BannerData;
  updateBanner: (id: string, d: Partial<BannerData>) => void;
  deleteBanner: (id: string) => void;
  toggleBanner: (id: string) => void;
  // Sale actions
  addSale: (d: Partial<SaleData>) => SaleData;
  updateSale: (id: string, d: Partial<SaleData>) => void;
  deleteSale: (id: string) => void;
  toggleSale: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      saved: [],
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
      notifs: [],
      rewards: 1250,
      catalog: JSON.parse(JSON.stringify(PRODUCTS)),
      catList: JSON.parse(JSON.stringify(CATEGORIES)),
      banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)),
      sales: JSON.parse(JSON.stringify(DEFAULT_SALES)),

      getProduct: (id) => get().catalog.find(p => p.id === Number(id)),
      allProducts: () => get().catalog,
      categories: () => get().catList,
      money: (amount) => money(amount, get().currency, get().rate, get().symbol),

      cartSubtotal: () => {
        const { cart, catalog, currency, rate, symbol } = get();
        const raw = cart.reduce((s,i) => { const p = catalog.find(x=>x.id===i.id); return s + (p ? p.price * i.qty : 0); }, 0);
        return { raw, display: money(raw, currency, rate, symbol) };
      },
      cartCount: () => get().cart.reduce((s,i) => s + i.qty, 0),
      shippingCost: (sub: number) => {
        const c = get().coupon;
        if (c?.type === 'ship') return 0;
        if (sub === 0) return 0;
        return sub >= 5000 ? 0 : 150;
      },
      cartTotals: () => {
        const { coupon, currency, rate, symbol } = get();
        const sub = get().cartSubtotal().raw;
        let discount = 0;
        if (coupon) {
          if (coupon.type === 'percent') discount = sub * coupon.value / 100;
          else if (coupon.type === 'flat') discount = Math.min(coupon.value, sub);
        }
        const shipping = get().shippingCost(sub - discount);
        const tax = (sub - discount) * 0.08;
        const total = sub - discount + shipping + tax;
        const m = (v: number) => money(v, currency, rate, symbol);
        return { sub, discount, shipping, tax, total, subDisplay: m(sub), discountDisplay: m(discount), shipDisplay: m(shipping), taxDisplay: m(tax), totalDisplay: m(total) };
      },

      addToCart: (id, qty = 1) => {
        const { catalog, cart } = get();
        const p = catalog.find(x => x.id === id);
        if (p && p.stock <= 0) return false;
        const existing = cart.find(i => i.id === id);
        if (existing) {
          set({ cart: cart.map(i => i.id === id ? { ...i, qty: Math.min(i.qty + qty, p?.stock || 99) } : i) });
        } else {
          set({ cart: [...cart, { id, qty }] });
        }
        return true;
      },
      removeFromCart: (id) => set({ cart: get().cart.filter(i => i.id !== id) }),
      setQty: (id, qty) => set({ cart: get().cart.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i) }),
      saveForLater: (id) => {
        const { cart, saved } = get();
        const item = cart.find(i => i.id === id);
        if (item) set({ cart: cart.filter(i => i.id !== id), saved: [...saved, item] });
      },
      moveToCart: (id) => {
        const { saved } = get();
        const item = saved.find(i => i.id === id);
        if (item) {
          set({ saved: saved.filter(i => i.id !== id) });
          get().addToCart(id, item.qty);
        }
      },
      toggleWishlist: (id) => {
        const { wishlist } = get();
        const has = wishlist.includes(id);
        set({ wishlist: has ? wishlist.filter(x => x !== id) : [...wishlist, id] });
        return !has;
      },
      inWishlist: (id) => get().wishlist.includes(id),
      toggleCompare: (id) => {
        const { compare } = get();
        const has = compare.includes(id);
        if (!has && compare.length >= 4) return false;
        set({ compare: has ? compare.filter(x => x !== id) : [...compare, id] });
        return !has;
      },
      inCompare: (id) => get().compare.includes(id),
      pushRecent: (id) => {
        const { recentlyViewed } = get();
        set({ recentlyViewed: [id, ...recentlyViewed.filter(x => x !== id)].slice(0, 8) });
      },
      recentProducts: () => {
        const { recentlyViewed, catalog } = get();
        return recentlyViewed.map(id => catalog.find(p => p.id === id)).filter(Boolean) as Product[];
      },
      applyCoupon: (code) => {
        const c = COUPONS.find(x => x.code === code.toUpperCase());
        if (!c) return false;
        const sub = get().cartSubtotal().raw;
        if (sub < c.min) return false;
        set({ coupon: c });
        return true;
      },
      clearCoupon: () => set({ coupon: null }),
      setCurrency: (code) => {
        const c = CURRENCIES[code];
        if (!c) return;
        set({ currency: code, rate: c.rate, symbol: c.symbol });
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      },
      login: (email) => {
        const user = { name: email.split('@')[0].replace(/\b\w/g, c => c.toUpperCase()), email, joined: new Date().toISOString() };
        const addresses = get().addresses.length ? get().addresses : [demoAddress()];
        set({ user, addresses });
        return user;
      },
      register: (name, email) => {
        const user = { name, email, joined: new Date().toISOString() };
        const addresses = get().addresses.length ? get().addresses : [demoAddress()];
        set({ user, addresses });
        return user;
      },
      logout: () => set({ user: null }),
      placeOrder: (payment, address) => {
        const { cart, catalog, coupon } = get();
        const totals = get().cartTotals();
        const order: Order = {
          id: 'BB' + Date.now().toString().slice(-8),
          date: new Date().toISOString(),
          status: 'Confirmed',
          items: cart.map(i => {
            const p = catalog.find(x => x.id === i.id);
            return { ...i, name: p?.name, price: p?.price, imageId: p?.imageId };
          }),
          totals, payment, address,
          eta: new Date(Date.now() + 5 * 864e5).toISOString()
        };
        set({
          orders: [order, ...get().orders],
          cart: [],
          saved: [],
          coupon: null,
          rewards: get().rewards + Math.round(totals.total),
        });
        return order;
      },
      cancelOrder: (id) => {
        set({ orders: get().orders.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o) });
      },
      updateOrderStatus: (id, status) => {
        set({ orders: get().orders.map(o => o.id === id ? { ...o, status } : o) });
      },
      addNotif: (n) => {
        const notifs = [{ id: Date.now(), read: false, time: new Date().toISOString(), ...n }, ...get().notifs].slice(0, 12);
        set({ notifs });
      },
      markAllRead: () => set({ notifs: get().notifs.map(n => ({ ...n, read: true })) }),
      addProduct: (d) => {
        const { catalog } = get();
        const id = (catalog.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;
        // Resolve image: prefer explicit images array, then imageId, then fallback
        const resolvedImages = d.images && d.images.length ? d.images : d.imageId ? [d.imageId] : [PRODUCTS[0].images[0]];
        const resolvedImageId = d.imageId || (d.images && d.images.length ? d.images[0] : PRODUCTS[0].imageId);
        const p: Product = {
          id, name: d.name || 'Untitled Product', brand: d.brand || 'Generic', category: d.category || 'home-lifestyle',
          price: Math.round(d.price || 0), oldPrice: Math.round(d.oldPrice || 0),
          rating: d.rating || 0, reviews: d.reviews || 0, stock: d.stock || 0,
          sku: d.sku || `BB-${String(id).padStart(4,'0')}`,
          images: resolvedImages, imageId: resolvedImageId,
          badge: d.badge || '', isNew: !!d.isNew, trending: !!d.trending,
          bestSeller: !!d.bestSeller, featured: !!d.featured,
          description: d.description || `${d.name || 'Product'} by ${d.brand || 'Generic'}.`,
          features: d.features || ['Premium materials','1 year warranty','Free shipping','30-day returns'],
          specs: d.specs || { 'Brand': d.brand || 'Generic', 'Category': d.category || 'home-lifestyle', 'Warranty':'1 Year' },
          video: d.video || null, related: d.related || []
        };
        set({ catalog: [...catalog, p] });
        return p;
      },
      updateProduct: (id, d) => {
        set({ catalog: get().catalog.map(p => p.id === id ? { ...p, ...d, id } : p) });
      },
      deleteProduct: (id) => set({ catalog: get().catalog.filter(p => p.id !== id) }),
      addCategory: (d) => {
        const { catList } = get();
        const id = (d.id || d.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (catList.find(c => c.id === id)) return null;
        const c: Category = { id, name: d.name || 'Category', icon: d.icon || 'Tag', color: d.color || 'from-slate-500 to-slate-700', img: d.img || '' };
        set({ catList: [...catList, c] });
        return c;
      },
      updateCategory: (id, d) => {
        set({ catList: get().catList.map(c => c.id === id ? { ...c, ...d } : c) });
      },
      deleteCategory: (id) => {
        set({
          catList: get().catList.filter(c => c.id !== id),
          catalog: get().catalog.map(p => p.category === id ? { ...p, category: 'home-lifestyle' } : p)
        });
      },
      resetCatalog: () => set({
        catalog: JSON.parse(JSON.stringify(PRODUCTS)),
        catList: JSON.parse(JSON.stringify(CATEGORIES)),
        banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)),
        sales: JSON.parse(JSON.stringify(DEFAULT_SALES)),
      }),
      // Banner actions
      addBanner: (d) => {
        const { banners } = get();
        const id = 'b' + Date.now().toString().slice(-6);
        const banner: BannerData = {
          id, title: d.title || 'New Banner', subtitle: d.subtitle || '', cta: d.cta || 'Shop Now',
          ctaLink: d.ctaLink || '#/shop', image: d.image || '', gradient: d.gradient || 'from-[#006233] to-[#00A651]',
          active: d.active !== false, order: d.order ?? banners.length + 1
        };
        set({ banners: [...banners, banner] });
        return banner;
      },
      updateBanner: (id, d) => {
        set({ banners: get().banners.map(b => b.id === id ? { ...b, ...d } : b) });
      },
      deleteBanner: (id) => set({ banners: get().banners.filter(b => b.id !== id) }),
      toggleBanner: (id) => {
        set({ banners: get().banners.map(b => b.id === id ? { ...b, active: !b.active } : b) });
      },
      // Sale actions
      addSale: (d) => {
        const { sales } = get();
        const id = 's' + Date.now().toString().slice(-6);
        const sale: SaleData = {
          id, name: d.name || 'New Sale', description: d.description || '',
          discountPercent: d.discountPercent || 10, startDate: d.startDate || new Date().toISOString().split('T')[0],
          endDate: d.endDate || new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0],
          categoryId: d.categoryId || '', active: d.active !== false,
          bannerColor: d.bannerColor || '#006233'
        };
        set({ sales: [...sales, sale] });
        return sale;
      },
      updateSale: (id, d) => {
        set({ sales: get().sales.map(s => s.id === id ? { ...s, ...d } : s) });
      },
      deleteSale: (id) => set({ sales: get().sales.filter(s => s.id !== id) }),
      toggleSale: (id) => {
        set({ sales: get().sales.map(s => s.id === id ? { ...s, active: !s.active } : s) });
      },
    }),
    { name: 'bachatbazar_v9' }
  )
);
