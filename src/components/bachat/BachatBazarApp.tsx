'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { PRODUCTS, CATEGORIES, COUPONS, TESTIMONIALS, BLOGS, HERO_SLIDES, SHIPPING_METHODS, PAYMENTS, U, type Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Heart, ShoppingCart, Search, Star, User, Menu, X, Minus, Plus, Trash2,
  ChevronRight, ChevronLeft, Eye, GitCompare, Moon, Sun, ArrowUp,
  Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube,
  Truck, Shield, RotateCcw, Headphones, Tag, Clock, Flame,
  Check, AlertCircle, Copy, Share2, ZoomIn, ChevronDown,
  CreditCard, Wallet, Building2, Banknote, Gift, Package,
  Settings, BarChart3, BoxIcon, ClipboardList, Lock, LogOut,
  Bell, Cookie, Sparkles, Tv, Smartphone, Shirt, Sofa, Watch, Baby,
  ShoppingCartIcon, Zap, TrendingUp, Award, ThumbsUp, ArrowRight,
  Home, Store, Info, HelpCircle, BookOpen, Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, ShoppingCart, Tv, Smartphone, Shirt, Sofa, Watch, Baby, Tag
};

function getCatIcon(iconName: string) {
  return ICON_MAP[iconName] || Tag;
}

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, seed?: string) {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = `https://picsum.photos/seed/${seed || 'bb' + Math.random().toString(36).slice(2, 6)}/400/400`;
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [diff, setDiff] = useState(Math.max(0, targetDate.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, targetDate.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className="font-mono font-bold tracking-wider">
      {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  );
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
      ))}
    </span>
  );
}

function ProductImage({ src, alt, seed, className = '' }: { src: string; alt: string; seed?: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => imgFallback(e, seed)}
      loading="lazy"
    />
  );
}

function PriceDisplay({ price, oldPrice }: { price: number; oldPrice: number }) {
  const s = useStore();
  return (
    <span className="flex items-center gap-2">
      <span className="font-bold text-lg">{s.money(price)}</span>
      {oldPrice > price && <span className="text-sm text-muted-foreground line-through">{s.money(oldPrice)}</span>}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// ROUTER
// ──────────────────────────────────────────────────────────────
interface RouteInfo {
  view: string;
  id: string;
  query: Record<string, string>;
}

function parseHash(hash: string): RouteInfo {
  const h = hash.replace(/^#\/?/, '') || '';
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  const query: Record<string, string> = {};
  if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  const view = parts[0] || '';
  const id = parts[1] || '';
  return { view, id, query };
}

function makeHash(view: string, id?: string, query?: Record<string, string>) {
  let h = '#/' + view;
  if (id) h += '/' + id;
  if (query && Object.keys(query).length) h += '?' + Object.entries(query).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return h;
}

// ──────────────────────────────────────────────────────────────
// PRODUCT CARD
// ──────────────────────────────────────────────────────────────
function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) {
  const s = useStore();
  const { toast } = useToast();
  const inWish = s.inWishlist(product.id);
  const inComp = s.inCompare(product.id);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (s.addToCart(product.id)) {
      toast({ title: 'Added to cart', description: product.name.slice(0, 40) });
      s.addNotif({ icon: 'ShoppingCart', title: 'Cart Updated', text: `${product.name.slice(0,30)} added` });
    } else {
      toast({ title: 'Out of stock', variant: 'destructive' });
    }
  };

  return (
    <div className="product-card group bg-card rounded-xl border overflow-hidden cursor-pointer" onClick={() => { window.location.hash = makeHash('product', String(product.id)); }}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage src={product.images[0]} alt={product.name} seed={product.imageId} className="product-img w-full h-full object-cover" />
        {product.badge && <span className="absolute top-2 left-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{product.badge}</span>}
        {product.isNew && <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }} className="quick-view-btn flex-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-500 hover:text-white transition flex items-center justify-center gap-1"><Eye size={14}/>Quick View</button>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const added = s.toggleWishlist(product.id); toast({ title: added ? 'Added to wishlist' : 'Removed from wishlist' }); }} className={`p-1.5 rounded-full ${inWish ? 'bg-pink-500 text-white' : 'bg-white/90 dark:bg-zinc-800/90'} hover:scale-110 transition`}><Heart size={14} fill={inWish ? 'currentColor' : 'none'}/></button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const ok = s.toggleCompare(product.id); toast({ title: ok ? 'Added to compare' : 'Removed / Max 4', variant: ok ? 'default' : 'destructive' }); }} className={`p-1.5 rounded-full ${inComp ? 'bg-indigo-500 text-white' : 'bg-white/90 dark:bg-zinc-800/90'} hover:scale-110 transition`}><GitCompare size={14}/></button>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
        <p className="text-sm font-medium line-clamp-2 leading-snug min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} size={12}/>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <PriceDisplay price={product.price} oldPrice={product.oldPrice}/>
        </div>
        <Button size="sm" className="w-full mt-1 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white border-0" onClick={handleCart}>
          <ShoppingCart size={14} className="mr-1"/> Add to Cart
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// VIEWS
// ──────────────────────────────────────────────────────────────

// HOME VIEW
function HomeView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore();
  const [heroIdx, setHeroIdx] = useState(0);
  const allProducts = s.allProducts();
  const featured = allProducts.filter(p => p.featured).slice(0, 8);
  const trending = allProducts.filter(p => p.trending).slice(0, 8);
  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 8);
  const bestSellers = allProducts.filter(p => p.bestSeller).slice(0, 8);
  const flashSaleEnd = useMemo(() => new Date(Date.now() + 6 * 3600000), []);
  const flashItems = allProducts.filter(p => p.oldPrice > p.price).slice(0, 6);

  useEffect(() => {
    const id = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="animate-fadeUp">
      {/* Hero Slider */}
      <div className="relative overflow-hidden rounded-2xl mb-8" style={{ minHeight: 320 }}>
        {HERO_SLIDES.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.grad} opacity-90`}/>
            <ProductImage src={U(slide.img, 1200)} alt={slide.title} seed={slide.img} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center p-6 md:p-12">
              <div className="max-w-lg text-white space-y-4">
                <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg">{slide.title}</h2>
                <p className="text-base md:text-lg opacity-90 drop-shadow">{slide.sub}</p>
                <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold" onClick={() => navigate(slide.route)}>{slide.cta} <ChevronRight size={16}/></Button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setHeroIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur rounded-full p-2 text-white hover:bg-white/50 transition"><ChevronLeft size={20}/></button>
        <button onClick={() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur rounded-full p-2 text-white hover:bg-white/50 transition"><ChevronRight size={20}/></button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => <button key={i} onClick={() => setHeroIdx(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === heroIdx ? 'bg-white' : 'bg-white/40'}`}/>)}
        </div>
      </div>

      {/* Category Cards */}
      <section className="mb-10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Store size={22}/> Shop by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {s.categories().map(cat => {
            const Icon = getCatIcon(cat.icon);
            return (
              <button key={cat.id} onClick={() => navigate(makeHash('shop', undefined, { category: cat.id }))} className="group relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer">
                <ProductImage src={U(cat.img, 400)} alt={cat.name} seed={cat.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-70 transition`}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                  <Icon size={28} className="mb-1 drop-shadow"/>
                  <span className="text-sm font-semibold text-center drop-shadow">{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Flash Sale */}
      {flashItems.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Flame size={22} className="text-pink-500"/> Flash Sale</h3>
            <div className="flex items-center gap-2 text-sm"><Clock size={16}/> Ends in <CountdownTimer targetDate={flashSaleEnd}/></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {flashItems.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Award size={22} className="text-indigo-500"/> Featured</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(makeHash('shop', undefined, { featured: 'true' }))}>View All <ChevronRight size={14}/></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {featured.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <div className="mb-10 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 p-6 md:p-10 text-white flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold">Get 25% Off This Eid!</h3>
          <p className="opacity-90">Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded">EID25</span> on orders above Rs 50,000</p>
        </div>
        <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shrink-0" onClick={() => navigate(makeHash('deals'))}>Shop Deals <ArrowRight size={16}/></Button>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp size={22} className="text-emerald-500"/> Trending Now</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(makeHash('shop', undefined, { trending: 'true' }))}>View All <ChevronRight size={14}/></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {trending.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Zap size={22} className="text-amber-500"/> New Arrivals</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate(makeHash('new'))}>View All <ChevronRight size={14}/></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><ThumbsUp size={22} className="text-blue-500"/> Best Sellers</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mb-10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={22}/> What Our Customers Say</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={U(t.avatar, 80)} alt={t.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => imgFallback(e, t.name)}/>
                <div><p className="font-medium text-sm">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
              </div>
              <StarRating rating={t.rating} size={12}/>
              <p className="mt-2 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><BookOpen size={22}/> From the Blog</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate(makeHash('blog'))}>All Posts <ChevronRight size={14}/></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {BLOGS.map((b) => (
            <Card key={b.id} className="overflow-hidden group cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <ProductImage src={U(b.img, 400)} alt={b.title} seed={b.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground">{b.date} &middot; {b.author}</p>
                <p className="font-medium text-sm line-clamp-2">{b.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{b.excerpt}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="mb-10">
        <h3 className="text-xl font-bold mb-4">Top Brands</h3>
        <div className="overflow-hidden">
          <div className="marquee-track flex gap-8 whitespace-nowrap">
            {[...Array(2)].map((_, si) => (
              <React.Fragment key={si}>
                {s.allProducts().map((p, i) => `${si}-${i}`).filter((_, i) => i < 20).map((key, idx) => {
                  const p = s.allProducts()[idx];
                  return p ? <span key={key} className="text-lg font-bold text-muted-foreground/50 px-4">{p.brand}</span> : null;
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'On orders over Rs 25,000' },
          { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
          { icon: RotateCcw, title: '7-Day Returns', desc: 'Easy return policy' },
          { icon: Headphones, title: '24/7 Support', desc: 'We are here to help' },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50">
            <f.icon size={28} className="text-indigo-500 mb-2"/>
            <p className="font-semibold text-sm">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

// SHOP VIEW
function ShopView({ onQuickView, query }: { onQuickView: (p: Product) => void; query: Record<string, string> }) {
  const s = useStore();
  const [catFilter, setCatFilter] = useState(query.category || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [showFilters, setShowFilters] = useState(false);
  const resetPage = useCallback(() => setPage(1), []);

  const allProducts = s.allProducts();
  const brands = useMemo(() => [...new Set(allProducts.map(p => p.brand))].sort(), [allProducts]);

  const filtered = useMemo(() => {
    let items = [...allProducts];
    if (catFilter) items = items.filter(p => p.category === catFilter);
    if (query.featured) items = items.filter(p => p.featured);
    if (query.trending) items = items.filter(p => p.trending);
    items = items.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (brandFilter.length) items = items.filter(p => brandFilter.includes(p.brand));
    switch (sortBy) {
      case 'price-low': items.sort((a,b) => a.price - b.price); break;
      case 'price-high': items.sort((a,b) => b.price - a.price); break;
      case 'rating': items.sort((a,b) => b.rating - a.rating); break;
      case 'newest': items.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: items.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return items;
  }, [allProducts, catFilter, priceRange, brandFilter, sortBy, query]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Shop{catFilter ? ` — ${s.categories().find(c=>c.id===catFilter)?.name || catFilter}` : ''}</h2>
        <span className="text-sm text-muted-foreground">{filtered.length} products</span>
      </div>

      <div className="flex gap-6">
        {/* Filters - Desktop */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-56 shrink-0 space-y-5`}>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Category</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              <button onClick={() => { setCatFilter(''); resetPage(); }} className={`block w-full text-left text-sm px-2 py-1 rounded ${!catFilter ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' : 'hover:bg-muted'}`}>All Categories</button>
              {s.categories().map(c => (
                <button key={c.id} onClick={() => { setCatFilter(c.id); resetPage(); }} className={`block w-full text-left text-sm px-2 py-1 rounded ${catFilter === c.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' : 'hover:bg-muted'}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <Separator/>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Price Range</h4>
            <div className="flex gap-2 items-center text-xs">
              <Input type="number" value={priceRange[0]} onChange={e => { setPriceRange([Number(e.target.value), priceRange[1]]); resetPage(); }} className="w-20 h-8 text-xs" placeholder="Min"/>
              <span>-</span>
              <Input type="number" value={priceRange[1]} onChange={e => { setPriceRange([priceRange[0], Number(e.target.value)]); resetPage(); }} className="w-20 h-8 text-xs" placeholder="Max"/>
            </div>
          </div>
          <Separator/>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Brand</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {brands.slice(0, 15).map(b => (
                <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={brandFilter.includes(b)} onChange={e => { setBrandFilter(prev => e.target.checked ? [...prev, b] : prev.filter(x => x !== b)); resetPage(); }} className="rounded border-gray-300"/>
                  <span className="truncate">{b}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 gap-3">
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowFilters(f => !f)}><Menu size={14}/> Filters</Button>
            <Select value={sortBy} onValueChange={v => { setSortBy(v); resetPage(); }}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Sort by"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><Package size={48} className="mx-auto mb-4 opacity-30"/><p>No products found</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paged.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14}/></Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(n => (
                <Button key={n} variant={n === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(n)} className="w-8 h-8 p-0">{n}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14}/></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// PRODUCT DETAIL VIEW
function ProductDetailView({ productId }: { productId: string }) {
  const s = useStore();
  const { toast } = useToast();
  const product = s.getProduct(Number(productId));
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => { if (product) s.pushRecent(product.id); }, [product]);

  if (!product) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Product not found</h2><p className="text-muted-foreground mt-2">This product may have been removed.</p></div>;

  const related = product.related.map(id => s.getProduct(id)).filter(Boolean) as Product[];
  const inWish = s.inWishlist(product.id);

  const handleAdd = () => {
    if (s.addToCart(product.id, qty)) {
      toast({ title: 'Added to cart', description: `${qty}x ${product.name.slice(0, 30)}` });
    }
  };

  return (
    <div className="animate-fadeUp">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            <ProductImage src={product.images[imgIdx] || product.images[0]} alt={product.name} seed={product.imageId} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === imgIdx ? 'border-indigo-500' : 'border-transparent'}`}>
                  <ProductImage src={img} alt="" seed={`${product.imageId}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <h1 className="text-2xl font-bold">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating}/>
            <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
          </div>
          <PriceDisplay price={product.price} oldPrice={product.oldPrice}/>
          {product.badge && <Badge className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-0">{product.badge}</Badge>}
          <p className="text-sm text-muted-foreground">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"><Check size={14}/> In Stock ({product.stock})</span>
            ) : (
              <span className="text-sm text-red-500 font-medium flex items-center gap-1"><AlertCircle size={14}/> Out of Stock</span>
            )}
          </div>

          {/* Qty + Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14}/></Button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(q => Math.min(product.stock, q + 1))}><Plus size={14}/></Button>
            </div>
            <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white" onClick={handleAdd} disabled={product.stock <= 0}>
              <ShoppingCart size={16} className="mr-2"/> Add to Cart
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className={inWish ? 'text-pink-500 border-pink-500' : ''} onClick={() => { const a = s.toggleWishlist(product.id); toast({ title: a ? 'Wishlist added' : 'Wishlist removed' }); }}><Heart size={14} fill={inWish ? 'currentColor' : 'none'} className="mr-1"/> {inWish ? 'Wishlisted' : 'Wishlist'}</Button>
            <Button variant="outline" size="sm" onClick={() => { const ok = s.toggleCompare(product.id); toast({ title: ok ? 'Compare added' : 'Removed / Max 4' }); }}><GitCompare size={14} className="mr-1"/> Compare</Button>
            <Button variant="outline" size="sm"><Share2 size={14} className="mr-1"/> Share</Button>
          </div>

          {/* SKU */}
          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {product.features.map((f, i) => (
              <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4">
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </TabsContent>
        <TabsContent value="specs" className="mt-4">
          <div className="grid grid-cols-2 gap-2 max-w-lg">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b py-1.5 px-2"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-10">
          <h3 className="text-xl font-bold mb-4">Related Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {related.map(p => <ProductCard key={p.id} product={p} onQuickView={() => {}}/>)}
          </div>
        </section>
      )}
    </div>
  );
}

// CART VIEW
function CartView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const cart = s.cart;
  const totals = s.cartTotals();

  const handleCoupon = () => {
    if (s.applyCoupon(couponCode)) {
      toast({ title: 'Coupon applied!', description: s.coupon?.label });
      setCouponCode('');
    } else {
      toast({ title: 'Invalid coupon', variant: 'destructive' });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="animate-fadeUp text-center py-20">
        <ShoppingCart size={64} className="mx-auto mb-4 text-muted-foreground/30"/>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => navigate(makeHash('shop'))}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart ({s.cartCount()} items)</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => {
            const p = s.getProduct(item.id);
            if (!p) return null;
            return (
              <Card key={item.id} className="flex gap-4 p-4">
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                  <PriceDisplay price={p.price} oldPrice={p.oldPrice}/>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border rounded">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => s.setQty(item.id, item.qty - 1)}><Minus size={12}/></Button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => s.setQty(item.id, item.qty + 1)}><Plus size={12}/></Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { s.saveForLater(item.id); toast({ title: 'Saved for later' }); }}><Clock size={12} className="mr-1"/> Save</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-red-500" onClick={() => { s.removeFromCart(item.id); toast({ title: 'Removed from cart' }); }}><Trash2 size={12} className="mr-1"/> Remove</Button>
                  </div>
                </div>
                <div className="font-semibold text-sm shrink-0">{s.money(p.price * item.qty)}</div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            <Separator/>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{totals.subDisplay}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-emerald-600">-{totals.discountDisplay}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{totals.shipDisplay}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>{totals.taxDisplay}</span></div>
            </div>
            <Separator/>
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{totals.totalDisplay}</span></div>

            {/* Coupon */}
            <div className="flex gap-2">
              <Input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="h-8 text-xs"/>
              <Button size="sm" variant="outline" onClick={handleCoupon} className="shrink-0">Apply</Button>
            </div>
            {s.coupon && <div className="flex items-center gap-1 text-xs text-emerald-600"><Check size={12}/> {s.coupon.label} <button onClick={() => { s.clearCoupon(); toast({ title: 'Coupon removed' }); }} className="text-red-500 ml-1"><X size={12}/></button></div>}

            <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => navigate(makeHash('checkout'))}>Proceed to Checkout</Button>
          </Card>

          {/* Saved for Later */}
          {s.saved.length > 0 && (
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold">Saved for Later</h3>
              {s.saved.map(item => {
                const p = s.getProduct(item.id);
                if (!p) return null;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div>
                    <span className="flex-1 truncate">{p.name}</span>
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { s.moveToCart(item.id); toast({ title: 'Moved to cart' }); }}>Move to Cart</Button>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// CHECKOUT VIEW
function CheckoutView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(s.addresses[0] || { id: 1, label: 'Home', name: '', line: '', city: '', state: '', zip: '', country: 'Pakistan', phone: '', default: true });
  const [shipping, setShipping] = useState('standard');
  const [payment, setPayment] = useState('cod');
  const totals = s.cartTotals();

  const steps = ['Address', 'Shipping', 'Payment', 'Review'];

  const handlePlaceOrder = () => {
    const addr = { ...address, id: 1, default: true };
    const order = s.placeOrder(payment, addr);
    toast({ title: 'Order placed!', description: `Order #${order.id}` });
    s.addNotif({ icon: 'Package', title: 'Order Confirmed', text: `Order #${order.id} placed successfully!` });
    navigate(makeHash('orders'));
  };

  return (
    <div className="animate-fadeUp max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      {/* Steps */}
      <div className="flex items-center mb-8">
        {steps.map((st, i) => (
          <React.Fragment key={st}>
            <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-1.5 text-sm font-medium ${i <= step ? 'text-indigo-500' : 'text-muted-foreground'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? 'bg-indigo-500 text-white' : i === step ? 'border-2 border-indigo-500 text-indigo-500' : 'border border-gray-300 text-gray-400'}`}>{i < step ? <Check size={14}/> : i + 1}</span>
              <span className="hidden sm:inline">{st}</span>
            </button>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}/>}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Full Name</Label><Input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="h-9"/></div>
            <div><Label className="text-xs">Phone</Label><Input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="h-9"/></div>
          </div>
          <div><Label className="text-xs">Address Line</Label><Input value={address.line} onChange={e => setAddress({...address, line: e.target.value})} className="h-9"/></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">City</Label><Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="h-9"/></div>
            <div><Label className="text-xs">State</Label><Input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="h-9"/></div>
            <div><Label className="text-xs">ZIP</Label><Input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="h-9"/></div>
          </div>
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => setStep(1)}>Continue to Shipping</Button>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Shipping Method</h3>
          {SHIPPING_METHODS.map(m => (
            <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${shipping === m.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-muted'}`}>
              <input type="radio" name="shipping" checked={shipping === m.id} onChange={() => setShipping(m.id)} className="accent-indigo-500"/>
              <div className="flex-1"><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.desc}</p></div>
              <span className="font-semibold text-sm">{m.cost === 0 ? 'Free' : s.money(m.cost)}</span>
            </label>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
            <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => setStep(2)}>Continue to Payment</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Payment Method</h3>
          {PAYMENTS.map(p => (
            <label key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${payment === p.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-muted'}`}>
              <input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} className="accent-indigo-500"/>
              <span className="font-medium text-sm">{p.name}</span>
            </label>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => setStep(3)}>Review Order</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Review Order</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Ship to:</span> {address.name}, {address.line}, {address.city}</div>
            <div><span className="text-muted-foreground">Shipping:</span> {SHIPPING_METHODS.find(m => m.id === shipping)?.name}</div>
            <div><span className="text-muted-foreground">Payment:</span> {PAYMENTS.find(p => p.id === payment)?.name}</div>
          </div>
          <Separator/>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{totals.subDisplay}</span></div>
            <div className="flex justify-between"><span>Discount</span><span className="text-emerald-600">-{totals.discountDisplay}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{totals.shipDisplay}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{totals.taxDisplay}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>{totals.totalDisplay}</span></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
            <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={handlePlaceOrder}>Place Order</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// WISHLIST VIEW
function WishlistView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore();
  const { toast } = useToast();
  const items = s.wishlist.map(id => s.getProduct(id)).filter(Boolean) as Product[];

  if (items.length === 0) {
    return (
      <div className="animate-fadeUp text-center py-20">
        <Heart size={64} className="mx-auto mb-4 text-muted-foreground/30"/>
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white mt-4" onClick={() => navigate(makeHash('shop'))}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6">Wishlist ({items.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
      </div>
    </div>
  );
}

// COMPARE VIEW
function CompareView() {
  const s = useStore();
  const { toast } = useToast();
  const items = s.compare.map(id => s.getProduct(id)).filter(Boolean) as Product[];

  if (items.length === 0) {
    return <div className="animate-fadeUp text-center py-20"><GitCompare size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2">No items to compare</h2><p className="text-muted-foreground">Add up to 4 products to compare.</p></div>;
  }

  const specKeys = [...new Set(items.flatMap(p => Object.keys(p.specs)))];

  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6">Compare Products</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left bg-muted/50 w-32"></th>
              {items.map(p => (
                <th key={p.id} className="p-3 text-center bg-muted/50 min-w-[200px]">
                  <div className="w-24 h-24 mx-auto mb-2 rounded-lg overflow-hidden bg-muted">
                    <ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/>
                  </div>
                  <p className="font-semibold text-xs truncate">{p.name}</p>
                  <Button variant="ghost" size="sm" className="text-red-500 text-xs h-6 mt-1" onClick={() => { s.toggleCompare(p.id); toast({ title: 'Removed from compare' }); }}><X size={12}/></Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-3 font-medium text-muted-foreground">Price</td>{items.map(p => <td key={p.id} className="p-3 text-center font-semibold">{s.money(p.price)}</td>)}</tr>
            <tr className="bg-muted/30"><td className="p-3 font-medium text-muted-foreground">Rating</td>{items.map(p => <td key={p.id} className="p-3 text-center"><StarRating rating={p.rating} size={12}/></td>)}</tr>
            <tr><td className="p-3 font-medium text-muted-foreground">Brand</td>{items.map(p => <td key={p.id} className="p-3 text-center">{p.brand}</td>)}</tr>
            <tr className="bg-muted/30"><td className="p-3 font-medium text-muted-foreground">Category</td>{items.map(p => <td key={p.id} className="p-3 text-center">{p.category}</td>)}</tr>
            {specKeys.map(key => (
              <tr key={key}><td className="p-3 font-medium text-muted-foreground">{key}</td>{items.map(p => <td key={p.id} className="p-3 text-center">{p.specs[key] || '-'}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ORDERS VIEW
function OrdersView() {
  const s = useStore();
  const { toast } = useToast();

  if (s.orders.length === 0) {
    return <div className="animate-fadeUp text-center py-20"><Package size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2">No orders yet</h2><p className="text-muted-foreground">Your order history will appear here.</p></div>;
  }

  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <div className="space-y-4">
        {s.orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold">#{o.id}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={o.status === 'Cancelled' ? 'destructive' : 'default'}>{o.status}</Badge>
                {o.status !== 'Cancelled' && <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { s.cancelOrder(o.id); toast({ title: 'Order cancelled' }); }}>Cancel</Button>}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              {o.items.map((item, i) => (
                <div key={i} className="flex justify-between"><span>{item.qty}x {item.name?.slice(0, 40)}</span><span>{item.price ? s.money(item.price * item.qty) : ''}</span></div>
              ))}
            </div>
            <Separator className="my-2"/>
            <div className="flex justify-between font-semibold text-sm"><span>Total</span><span>{o.totals.totalDisplay}</span></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ACCOUNT VIEW
function AccountView() {
  const s = useStore();
  const [tab, setTab] = useState('profile');

  if (!s.user) {
    return <div className="animate-fadeUp text-center py-20"><User size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2">Please login</h2><p className="text-muted-foreground">You need to be logged in to view your account.</p></div>;
  }

  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6">My Account</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile"><User size={14} className="mr-1"/> Profile</TabsTrigger>
          <TabsTrigger value="orders"><Package size={14} className="mr-1"/> Orders</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin size={14} className="mr-1"/> Addresses</TabsTrigger>
          <TabsTrigger value="rewards"><Gift size={14} className="mr-1"/> Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Profile</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">{s.user.name[0]}</div>
              <div><p className="font-semibold">{s.user.name}</p><p className="text-sm text-muted-foreground">{s.user.email}</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Member since {new Date(s.user.joined).toLocaleDateString()}</p>
            <Button variant="outline" onClick={() => { s.logout(); }}><LogOut size={14} className="mr-1"/> Logout</Button>
          </Card>
        </TabsContent>

        <TabsContent value="orders"><OrdersView/></TabsContent>

        <TabsContent value="addresses">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold text-lg">Saved Addresses</h3>
            {s.addresses.map((a, i) => (
              <div key={i} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{a.label} {a.default && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}</p>
                <p className="text-sm text-muted-foreground">{a.name}, {a.line}, {a.city}, {a.state} {a.zip}</p>
                <p className="text-xs text-muted-foreground">{a.phone}</p>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold text-lg">Reward Points</h3>
            <div className="text-4xl font-bold gradient-text">{s.rewards.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Earn 1 point for every Rs 1 spent. Redeem points for discounts on future orders.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// DEALS VIEW
function DealsView({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const s = useStore();
  const deals = s.allProducts().filter(p => p.oldPrice > p.price || p.badge.includes('OFF'));
  const saleEnd = useMemo(() => new Date(Date.now() + 3 * 86400000), []);

  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Flame size={24} className="text-pink-500"/> Today&apos;s Deals</h2>
        <div className="flex items-center gap-2 text-sm pulse-glow rounded-full px-3 py-1"><Clock size={14}/> <CountdownTimer targetDate={saleEnd}/></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {deals.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
      </div>
      {deals.length === 0 && <p className="text-center text-muted-foreground py-10">No deals available right now. Check back soon!</p>}
    </div>
  );
}

// NEW ARRIVALS VIEW
function NewArrivalsView({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const s = useStore();
  const items = s.allProducts().filter(p => p.isNew);
  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Zap size={24} className="text-amber-500"/> New Arrivals</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}
      </div>
    </div>
  );
}

// ABOUT VIEW
function AboutView() {
  return (
    <div className="animate-fadeUp max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">About Bachat Bazar</h2>
      <div className="prose dark:prose-invert max-w-none space-y-4">
        <p className="text-muted-foreground">Bachat Bazar is Pakistan&apos;s leading online marketplace, bringing you the best deals on health & beauty, groceries, electronics, fashion, home appliances, and more.</p>
        <p className="text-muted-foreground">Founded with the mission to make quality products accessible to everyone, we partner with trusted brands and sellers to offer genuine products at unbeatable prices.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          {[
            { label: 'Products', value: '5,000+' },
            { label: 'Happy Customers', value: '100K+' },
            { label: 'Cities Served', value: '50+' },
            { label: 'Brands', value: '200+' },
          ].map((s, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground">With Cash on Delivery, free returns, and fast shipping across Pakistan, shopping with Bachat Bazar is safe, easy, and rewarding.</p>
      </div>
    </div>
  );
}

// CONTACT VIEW
function ContactView() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  return (
    <div className="animate-fadeUp max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-3"><Phone size={20} className="text-indigo-500"/><div><p className="font-medium text-sm">Phone</p><p className="text-sm text-muted-foreground">+92 300 1234567</p></div></Card>
          <Card className="p-4 flex items-center gap-3"><Mail size={20} className="text-indigo-500"/><div><p className="font-medium text-sm">Email</p><p className="text-sm text-muted-foreground">support@bachatbazar.pk</p></div></Card>
          <Card className="p-4 flex items-center gap-3"><MapPin size={20} className="text-indigo-500"/><div><p className="font-medium text-sm">Address</p><p className="text-sm text-muted-foreground">Gulberg III, Lahore, Pakistan</p></div></Card>
        </div>
        <Card className="p-6 space-y-4">
          {sent ? (
            <div className="text-center py-8"><Check size={48} className="mx-auto mb-4 text-emerald-500"/><p className="font-semibold">Message sent!</p><p className="text-sm text-muted-foreground">We&apos;ll get back to you soon.</p></div>
          ) : (
            <>
              <div><Label>Name</Label><Input placeholder="Your name" className="h-9"/></div>
              <div><Label>Email</Label><Input placeholder="you@email.com" className="h-9"/></div>
              <div><Label>Message</Label><Textarea placeholder="How can we help?" rows={4}/></div>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => { setSent(true); toast({ title: 'Message sent!' }); }}>Send Message</Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// FAQ VIEW
function FAQView() {
  const faqs = [
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express shipping delivers in 1-2 business days.' },
    { q: 'What is the return policy?', a: 'We offer a 7-day return policy for most products. Items must be unused and in original packaging.' },
    { q: 'Is Cash on Delivery available?', a: 'Yes! Cash on Delivery is available for all orders across Pakistan.' },
    { q: 'How do I track my order?', a: 'You can track your order in the Orders section of your account. You\'ll also receive SMS updates.' },
    { q: 'Are the products genuine?', a: 'Absolutely. We only source from authorized distributors and brand partners. Every product is 100% genuine.' },
    { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are shipped. Go to your order history and click Cancel.' },
  ];

  return (
    <div className="animate-fadeUp max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q${i}`}>
            <AccordionTrigger className="text-sm font-medium text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// BLOG VIEW
function BlogView() {
  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen size={22}/> Blog</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
        {BLOGS.map(b => (
          <Card key={b.id} className="overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <ProductImage src={U(b.img, 600)} alt={b.title} seed={b.img} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground">{b.date} &middot; {b.author}</p>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.excerpt}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 404 VIEW
function NotFoundView() {
  return (
    <div className="animate-fadeUp text-center py-20">
      <h2 className="text-6xl font-bold gradient-text mb-4">404</h2>
      <p className="text-xl font-semibold mb-2">Page Not Found</p>
      <p className="text-muted-foreground mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => { window.location.hash = '#/'; }}>Go Home</Button>
    </div>
  );
}

// ADMIN VIEW
function AdminView() {
  const s = useStore();
  const { toast } = useToast();
  const [authed, setAuthed] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('bb_admin') === '1') return true;
    return false;
  });
  const [pw, setPw] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', category: '', price: 0, stock: 0 });

  const handleLogin = () => {
    if (pw === 'BA56CR7VK18') {
      setAuthed(true);
      sessionStorage.setItem('bb_admin', '1');
      setPw('');
    } else {
      toast({ title: 'Wrong password', variant: 'destructive' });
    }
  };

  if (!authed) {
    return (
      <div className="animate-fadeUp max-w-sm mx-auto text-center py-16">
        <Lock size={48} className="mx-auto mb-4 text-muted-foreground"/>
        <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
        <div className="flex gap-2">
          <Input type="password" placeholder="Enter password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-9"/>
          <Button onClick={handleLogin}>Enter</Button>
        </div>
      </div>
    );
  }

  const allProducts = s.allProducts();
  const totalRevenue = s.orders.reduce((sum, o) => sum + o.totals.total, 0);

  return (
    <div className="animate-fadeUp">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings size={22}/> Admin Panel</h2>
      <Tabs value={adminTab} onValueChange={setAdminTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard"><BarChart3 size={14} className="mr-1"/> Dashboard</TabsTrigger>
          <TabsTrigger value="products"><BoxIcon size={14} className="mr-1"/> Products</TabsTrigger>
          <TabsTrigger value="orders"><ClipboardList size={14} className="mr-1"/> Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: allProducts.length, icon: BoxIcon, color: 'text-indigo-500' },
              { label: 'Total Orders', value: s.orders.length, icon: ClipboardList, color: 'text-pink-500' },
              { label: 'Revenue', value: s.money(totalRevenue), icon: Banknote, color: 'text-emerald-500' },
              { label: 'Customers', value: s.orders.length ? Math.ceil(s.orders.length * 0.8) : 0, icon: Users, color: 'text-amber-500' },
            ].map((stat, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon size={24} className={stat.color}/>
                  <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-xl font-bold">{stat.value}</p></div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { s.resetCatalog(); toast({ title: 'Catalog reset' }); }}>Reset Catalog to Default</Button>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Products ({allProducts.length})</h3>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => setEditProduct({ id: 0, name: '', brand: '', category: '', price: 0, oldPrice: 0, rating: 0, reviews: 0, stock: 0, sku: '', images: [], imageId: '', badge: '', isNew: false, trending: false, bestSeller: false, featured: false, description: '', features: [], specs: {}, video: null, related: [] })}>Add Product</Button>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0"><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Brand</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Stock</th><th className="p-2 text-right">Actions</th></tr></thead>
                <tbody>
                  {allProducts.slice(0, 50).map(p => (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="p-2 truncate max-w-[200px]">{p.name}</td>
                      <td className="p-2">{p.brand}</td>
                      <td className="p-2 text-right">{s.money(p.price)}</td>
                      <td className="p-2 text-right">{p.stock}</td>
                      <td className="p-2 text-right space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditProduct({...p})}>Edit</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500" onClick={() => { s.deleteProduct(p.id); toast({ title: 'Product deleted' }); }}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit/Add Product Dialog */}
          <Dialog open={!!editProduct} onOpenChange={(open) => { if (!open) setEditProduct(null); }}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editProduct?.id ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
              {editProduct && (
                <div className="space-y-3">
                  <div><Label className="text-xs">Name</Label><Input value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} className="h-9"/></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">Brand</Label><Input value={editProduct.brand} onChange={e => setEditProduct({...editProduct, brand: e.target.value})} className="h-9"/></div>
                    <div><Label className="text-xs">Category</Label><Input value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value})} className="h-9"/></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label className="text-xs">Price</Label><Input type="number" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: Number(e.target.value)})} className="h-9"/></div>
                    <div><Label className="text-xs">Old Price</Label><Input type="number" value={editProduct.oldPrice} onChange={e => setEditProduct({...editProduct, oldPrice: Number(e.target.value)})} className="h-9"/></div>
                    <div><Label className="text-xs">Stock</Label><Input type="number" value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: Number(e.target.value)})} className="h-9"/></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
                    <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => {
                      if (editProduct.id) {
                        s.updateProduct(editProduct.id, editProduct);
                        toast({ title: 'Product updated' });
                      } else {
                        s.addProduct(editProduct);
                        toast({ title: 'Product added' });
                      }
                      setEditProduct(null);
                    }}>Save</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-3">
            <h3 className="font-semibold">Orders ({s.orders.length})</h3>
            {s.orders.length === 0 ? <p className="text-muted-foreground text-sm">No orders yet.</p> : (
              s.orders.map(o => (
                <Card key={o.id} className="p-3 flex items-center justify-between">
                  <div><p className="font-medium text-sm">#{o.id}</p><p className="text-xs text-muted-foreground">{o.items.length} items &middot; {o.totals.totalDisplay}</p></div>
                  <Badge variant={o.status === 'Cancelled' ? 'destructive' : 'default'}>{o.status}</Badge>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ──────────────────────────────────────────────────────────────
export default function BachatBazarApp() {
  const s = useStore();
  const { toast } = useToast();

  // Router
  const [route, setRoute] = useState<RouteInfo>(() => parseHash(typeof window !== 'undefined' ? window.location.hash : ''));
  const navigate = useCallback((hash: string) => { window.location.hash = hash; }, []);

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Theme sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', s.theme === 'dark');
  }, [s.theme]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return s.allProducts().filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, s]);

  // Drawers
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');

  // UI state
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') setCookieConsent(localStorage.getItem('bb_cookie') === '1');
  }, []);

  // Promo countdown
  const promoEnd = useMemo(() => new Date(Date.now() + 24 * 3600000), []);

  // Cart drawer content
  const cartItems = s.cart;
  const cartTotals = s.cartTotals();
  const cartCount = s.cartCount();

  // Handle auth
  const handleAuth = () => {
    if (authMode === 'login') {
      if (authEmail) {
        s.login(authEmail);
        toast({ title: 'Welcome back!' });
        setAuthOpen(false);
        setAuthEmail('');
      }
    } else {
      if (authName && authEmail) {
        s.register(authName, authEmail);
        toast({ title: 'Account created!' });
        setAuthOpen(false);
        setAuthName('');
        setAuthEmail('');
      }
    }
  };

  // Render view
  const renderView = () => {
    const { view, id, query } = route;
    switch (view) {
      case '': case 'home': return <HomeView onQuickView={setQuickViewProduct} navigate={navigate}/>;
      case 'shop': return <ShopView onQuickView={setQuickViewProduct} query={query}/>;
      case 'product': return <ProductDetailView productId={id}/>;
      case 'cart': return <CartView navigate={navigate}/>;
      case 'checkout': return <CheckoutView navigate={navigate}/>;
      case 'wishlist': return <WishlistView onQuickView={setQuickViewProduct} navigate={navigate}/>;
      case 'compare': return <CompareView/>;
      case 'orders': return <OrdersView/>;
      case 'account': return <AccountView/>;
      case 'deals': return <DealsView onQuickView={setQuickViewProduct}/>;
      case 'new': return <NewArrivalsView onQuickView={setQuickViewProduct}/>;
      case 'about': return <AboutView/>;
      case 'contact': return <ContactView/>;
      case 'faq': return <FAQView/>;
      case 'blog': return <BlogView/>;
      case 'admin': return <AdminView/>;
      default: return <NotFoundView/>;
    }
  };

  // Nav links
  const navLinks = [
    { label: 'Home', hash: '#/', icon: Home },
    { label: 'Shop', hash: '#/shop', icon: Store },
    { label: 'Deals', hash: '#/deals', icon: Flame },
    { label: 'New', hash: '#/new', icon: Zap },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Promo Bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Truck size={14}/> Free shipping on orders over Rs 25,000</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1"><Clock size={12}/> <CountdownTimer targetDate={promoEnd}/></span>
            <Select value={s.currency} onValueChange={s.setCurrency}>
              <SelectTrigger className="w-16 h-6 text-xs border-white/30 bg-white/10 text-white"><SelectValue/></SelectTrigger>
              <SelectContent>
                {['PKR','USD','EUR','GBP','INR','JPY'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-40 glass border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setMobileMenuOpen(true)}><Menu size={22}/></Button>

          {/* Logo */}
          <button onClick={() => navigate('#/')} className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="Bachat Bazar" className="h-8 w-8"/>
            <span className="text-lg font-bold hidden sm:block gradient-text">Bachat Bazar</span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input
                placeholder="Search products, brands..."
                className="pl-9 h-9 text-sm w-full"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(makeHash('shop', undefined, { q: searchQuery })); setSearchOpen(false); } }}
              />
            </div>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar">
                {searchResults.map(p => (
                  <button key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted w-full text-left" onMouseDown={() => { navigate(makeHash('product', String(p.id))); setSearchOpen(false); setSearchQuery(''); }}>
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand} &middot; {s.money(p.price)}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Button key={link.hash} variant="ghost" size="sm" className="text-xs h-8" onClick={() => navigate(link.hash)}>{link.label}</Button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => navigate(makeHash('wishlist'))}>
              <Heart size={18}/>{s.wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center font-bold">{s.wishlist.length}</span>}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => navigate(makeHash('compare'))}>
              <GitCompare size={18}/>{s.compare.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">{s.compare.length}</span>}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={18}/>{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center font-bold">{cartCount}</span>}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { if (s.user) navigate(makeHash('account')); else setAuthOpen(true); }}>
              <User size={18}/>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={s.toggleTheme}>
              {s.theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </Button>
          </div>
        </div>
      </header>

      {/* Category Bar */}
      <div className="border-b bg-card/50 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5">
          {s.categories().map(cat => (
            <button key={cat.id} onClick={() => navigate(makeHash('shop', undefined, { category: cat.id }))} className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition ${route.query.category === cat.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-muted text-muted-foreground'}`}>{cat.name}</button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><img src="/logo.svg" alt="Bachat Bazar" className="h-6 w-6"/><span className="font-bold gradient-text">Bachat Bazar</span></div>
              <p className="text-sm text-muted-foreground mb-3">Pakistan&apos;s #1 online marketplace for quality products at the best prices.</p>
              <div className="flex gap-2">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => <button key={i} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-indigo-500 hover:text-white transition"><Icon size={14}/></button>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {navLinks.map(l => <button key={l.hash} onClick={() => navigate(l.hash)} className="block hover:text-foreground transition">{l.label}</button>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Help</h4>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {[{ l: 'About Us', h: '#/about' }, { l: 'Contact', h: '#/contact' }, { l: 'FAQ', h: '#/faq' }, { l: 'Blog', h: '#/blog' }].map(item => (
                  <button key={item.h} onClick={() => navigate(item.h)} className="block hover:text-foreground transition">{item.l}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-2">Get the latest deals in your inbox.</p>
              <div className="flex gap-2">
                <Input placeholder="Email address" className="h-8 text-xs"/>
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white shrink-0">Subscribe</Button>
              </div>
            </div>
          </div>
          <Separator className="mb-4"/>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>&copy; 2026 Bachat Bazar. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => navigate(makeHash('admin'))} className="hover:text-foreground transition">Admin</button>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── DRAWERS ─── */}

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2"><ShoppingCart size={18}/> Cart ({cartCount})</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground"><ShoppingCart size={40} className="mx-auto mb-3 opacity-30"/><p>Your cart is empty</p></div>
            ) : cartItems.map(item => {
              const p = s.getProduct(item.id);
              if (!p) return null;
              return (
                <div key={item.id} className="flex gap-3 p-2 rounded-lg border">
                  <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{s.money(p.price)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => s.setQty(item.id, item.qty - 1)}><Minus size={10}/></Button>
                      <span className="text-xs w-6 text-center">{item.qty}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => s.setQty(item.id, item.qty + 1)}><Plus size={10}/></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 ml-auto" onClick={() => { s.removeFromCart(item.id); toast({ title: 'Removed' }); }}><Trash2 size={10}/></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {cartItems.length > 0 && (
            <SheetFooter className="p-4 border-t space-y-3">
              <div className="space-y-1 text-sm w-full">
                <div className="flex justify-between"><span>Subtotal</span><span>{cartTotals.subDisplay}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{cartTotals.totalDisplay}</span></div>
              </div>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => { setCartOpen(false); navigate(makeHash('cart')); }}>View Cart</Button>
              <Button className="w-full" variant="outline" onClick={() => { setCartOpen(false); navigate(makeHash('checkout')); }}>Checkout</Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Wishlist Drawer */}
      <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2"><Heart size={18}/> Wishlist ({s.wishlist.length})</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {s.wishlist.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground"><Heart size={40} className="mx-auto mb-3 opacity-30"/><p>Your wishlist is empty</p></div>
            ) : s.wishlist.map(id => {
              const p = s.getProduct(id);
              if (!p) return null;
              return (
                <div key={id} className="flex gap-3 p-2 rounded-lg border">
                  <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{s.money(p.price)}</p>
                    <div className="flex gap-1.5 mt-1">
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => { s.addToCart(id); toast({ title: 'Added to cart' }); }}><ShoppingCart size={10} className="mr-1"/> Add</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-red-500 px-2" onClick={() => { s.toggleWishlist(id); toast({ title: 'Removed' }); }}><Trash2 size={10}/></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {s.wishlist.length > 0 && (
            <SheetFooter className="p-4 border-t">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => { setWishlistOpen(false); navigate(makeHash('wishlist')); }}>View All</Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2"><img src="/logo.svg" alt="" className="h-6 w-6"/> Bachat Bazar</SheetTitle>
          </SheetHeader>
          <nav className="p-4 space-y-1">
            {navLinks.map(l => (
              <button key={l.hash} onClick={() => { navigate(l.hash); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition text-sm font-medium">
                <l.icon size={16} className="text-muted-foreground"/><span>{l.label}</span>
              </button>
            ))}
            <Separator className="my-2"/>
            {[{ l: 'Wishlist', h: makeHash('wishlist'), i: Heart }, { l: 'Compare', h: makeHash('compare'), i: GitCompare }, { l: 'Orders', h: makeHash('orders'), i: Package }, { l: 'Account', h: makeHash('account'), i: User }].map(item => (
              <button key={item.h} onClick={() => { navigate(item.h); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition text-sm font-medium">
                <item.i size={16} className="text-muted-foreground"/><span>{item.l}</span>
              </button>
            ))}
            <Separator className="my-2"/>
            {[{ l: 'About', h: makeHash('about'), i: Info }, { l: 'Contact', h: makeHash('contact'), i: Phone }, { l: 'FAQ', h: makeHash('faq'), i: HelpCircle }, { l: 'Blog', h: makeHash('blog'), i: BookOpen }].map(item => (
              <button key={item.h} onClick={() => { navigate(item.h); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition text-sm font-medium">
                <item.i size={16} className="text-muted-foreground"/><span>{item.l}</span>
              </button>
            ))}
            <Separator className="my-2"/>
            <button onClick={() => { navigate(makeHash('admin')); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition text-sm font-medium">
              <Lock size={16} className="text-muted-foreground"/><span>Admin</span>
            </button>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dark Mode</span>
              <Switch checked={s.theme === 'dark'} onCheckedChange={s.toggleTheme}/>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── MODALS ─── */}

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={(open) => { if (!open) setQuickViewProduct(null); }}>
        <DialogContent className="max-w-2xl">
          {quickViewProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <ProductImage src={quickViewProduct.images[0]} alt={quickViewProduct.name} seed={quickViewProduct.imageId} className="w-full h-full object-cover"/>
              </div>
              <div className="space-y-3">
                <DialogHeader>
                  <DialogTitle className="text-lg">{quickViewProduct.name}</DialogTitle>
                  <DialogDescription>{quickViewProduct.brand}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2"><StarRating rating={quickViewProduct.rating} size={14}/><span className="text-xs text-muted-foreground">({quickViewProduct.reviews})</span></div>
                <PriceDisplay price={quickViewProduct.price} oldPrice={quickViewProduct.oldPrice}/>
                <p className="text-sm text-muted-foreground line-clamp-3">{quickViewProduct.description}</p>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={() => { s.addToCart(quickViewProduct.id); toast({ title: 'Added to cart' }); }}><ShoppingCart size={14} className="mr-1"/> Add to Cart</Button>
                  <Button variant="outline" onClick={() => { setQuickViewProduct(null); navigate(makeHash('product', String(quickViewProduct.id))); }}>View Details</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
            <DialogDescription>{authMode === 'login' ? 'Login to your Bachat Bazar account' : 'Join Bachat Bazar today'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {authMode === 'register' && (
              <div><Label className="text-xs">Full Name</Label><Input placeholder="Your name" value={authName} onChange={e => setAuthName(e.target.value)} className="h-9"/></div>
            )}
            <div><Label className="text-xs">Email</Label><Input type="email" placeholder="you@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="h-9" onKeyDown={e => e.key === 'Enter' && handleAuth()}/></div>
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={handleAuth}>{authMode === 'login' ? 'Login' : 'Create Account'}</Button>
            <p className="text-xs text-center text-muted-foreground">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button className="text-indigo-500 font-medium" onClick={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Sign up' : 'Login'}</button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Back to Top */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg flex items-center justify-center hover:scale-110 transition animate-fadeUp">
          <ArrowUp size={18}/>
        </button>
      )}

      {/* Cookie Consent */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t shadow-lg animate-fadeUp">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm"><Cookie size={18} className="text-indigo-500 shrink-0"/><span className="text-muted-foreground">We use cookies to enhance your experience. By continuing, you agree to our cookie policy.</span></div>
            <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white shrink-0" onClick={() => { setCookieConsent(true); localStorage.setItem('bb_cookie', '1'); }}>Accept</Button>
          </div>
        </div>
      )}
    </div>
  );
}
