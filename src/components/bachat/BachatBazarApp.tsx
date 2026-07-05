'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { PRODUCTS, CATEGORIES, COUPONS, TESTIMONIALS, BLOGS, HERO_SLIDES, SHIPPING_METHODS, PAYMENTS, U, type Product, type BannerData, type SaleData } from '@/lib/data';
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
  Home, Store, Zap, TrendingUp, Award, ThumbsUp, Info, HelpCircle, BookOpen,
  Users, ArrowRight, Image as ImageIcon, ShieldCheck,
  Upload, Megaphone, Percent, Edit, Save, PlusCircle, Trash, TableProperties
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── HELPERS ───
const ICON_MAP: Record<string, React.ElementType> = { Sparkles, ShoppingCart, Tv, Smartphone, Shirt, Sofa, Watch, Baby, Tag };
function getCatIcon(n: string) { return ICON_MAP[n] || Tag; }
function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, seed?: string) { const t = e.currentTarget; t.onerror = null; t.src = `https://picsum.photos/seed/${seed || 'bb' + Math.random().toString(36).slice(2, 6)}/400/400`; }

const ADMIN_PWD = 'BA56CR7VK18';

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [diff, setDiff] = useState(Math.max(0, targetDate.getTime() - Date.now()));
  useEffect(() => { const id = setInterval(() => setDiff(Math.max(0, targetDate.getTime() - Date.now())), 1000); return () => clearInterval(id); }, [targetDate]);
  const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
  return <span className="font-mono font-bold tracking-wider">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return <span className="inline-flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={size} className={i <= Math.round(rating) ? 'fill-[#C5A028] text-[#C5A028]' : 'text-gray-300 dark:text-gray-600'} />)}</span>;
}

function ProductImage({ src, alt, seed, className = '' }: { src: string; alt: string; seed?: string; className?: string }) {
  return <img src={src} alt={alt} className={className} onError={(e) => imgFallback(e, seed)} loading="lazy" draggable={false} />;
}

function PriceDisplay({ price, oldPrice }: { price: number; oldPrice: number }) {
  const s = useStore();
  return <span className="flex items-center gap-2"><span className="font-bold text-lg text-[#006233] dark:text-[#00A651]" style={{ fontFamily: 'var(--font-poppins)' }}>{s.money(price)}</span>{oldPrice > price && <span className="text-sm text-muted-foreground line-through">{s.money(oldPrice)}</span>}</span>;
}

// ─── ROUTER ───
interface RouteInfo { view: string; id: string; query: Record<string, string>; }
function parseHash(hash: string): RouteInfo { const h = hash.replace(/^#\/?/, '') || ''; const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean); const query: Record<string, string> = {}; if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); return { view: parts[0] || '', id: parts[1] || '', query }; }
function makeHash(view: string, id?: string, query?: Record<string, string>) { let h = '#/' + view; if (id) h += '/' + id; if (query && Object.keys(query).length) h += '?' + Object.entries(query).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); return h; }

// ─── PRODUCT CARD ───
function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) {
  const s = useStore(); const { toast } = useToast(); const inWish = s.inWishlist(product.id); const inComp = s.inCompare(product.id);
  const handleCart = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (s.addToCart(product.id)) { toast({ title: 'Added to cart', description: product.name.slice(0, 40) }); } else { toast({ title: 'Out of stock', variant: 'destructive' }); } };
  return (
    <div className="product-card animate-cardFadeUp group bg-card rounded-xl border overflow-hidden cursor-pointer" onClick={() => { window.location.hash = makeHash('product', String(product.id)); }}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage src={product.images[0]} alt={product.name} seed={product.imageId} className="product-img w-full h-full object-cover" />
        {product.badge && <span className="absolute top-2 left-2 bg-gradient-to-r from-[#006233] to-[#00A651] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">{product.badge}</span>}
        {product.isNew && <span className="absolute top-2 right-2 bg-[#C5A028] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">NEW</span>}
        <div className="absolute bottom-2 left-2 right-2"><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }} className="quick-view-btn w-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur text-xs font-semibold py-1.5 rounded-lg hover:bg-[#006233] hover:text-white transition flex items-center justify-center gap-1 shadow"><Eye size={14}/>Quick View</button></div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const a = s.toggleWishlist(product.id); toast({ title: a ? 'Added to wishlist' : 'Removed' }); }} className={`p-1.5 rounded-full shadow ${inWish ? 'bg-pink-500 text-white' : 'bg-white/90 dark:bg-zinc-800/90'} hover:scale-110 transition`}><Heart size={14} fill={inWish ? 'currentColor' : 'none'}/></button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const ok = s.toggleCompare(product.id); toast({ title: ok ? 'Added to compare' : 'Removed / Max 4' }); }} className={`p-1.5 rounded-full shadow ${inComp ? 'bg-[#006233] text-white' : 'bg-white/90 dark:bg-zinc-800/90'} hover:scale-110 transition`}><GitCompare size={14}/></button>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-[#C5A028] font-semibold truncate" style={{ fontFamily: 'var(--font-poppins)' }}>{product.brand}</p>
        <p className="text-sm font-medium line-clamp-2 leading-snug min-h-[2.5rem] text-slate-800 dark:text-slate-100">{product.name}</p>
        <div className="flex items-center gap-1.5"><StarRating rating={product.rating} size={12}/><span className="text-xs text-muted-foreground">({product.reviews})</span></div>
        <PriceDisplay price={product.price} oldPrice={product.oldPrice}/>
        <Button size="sm" className="w-full mt-1 bg-gradient-to-r from-[#006233] to-[#00A651] hover:from-[#004D25] hover:to-[#006233] text-white border-0 font-semibold" onClick={handleCart}><ShoppingCart size={14} className="mr-1"/> Add to Cart</Button>
      </div>
    </div>
  );
}

// ─── HOME VIEW ───
function HomeView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const [heroIdx, setHeroIdx] = useState(0);
  const allProducts = s.allProducts(); const featured = allProducts.filter(p => p.featured).slice(0, 8); const trending = allProducts.filter(p => p.trending).slice(0, 8); const newArrivals = allProducts.filter(p => p.isNew).slice(0, 8); const bestSellers = allProducts.filter(p => p.bestSeller).slice(0, 8);
  const flashSaleEnd = useMemo(() => new Date(Date.now() + 6 * 3600000), []); const flashItems = allProducts.filter(p => p.oldPrice > p.price).slice(0, 6);
  const activeSales = s.sales.filter(sale => sale.active); const activeBanners = s.banners.filter(b => b.active).sort((a, b) => a.order - b.order);
  useEffect(() => { const id = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000); return () => clearInterval(id); }, []);

  return (
    <div className="animate-fadeUp">
      {/* Hero Slider - Pakistani Gradient Style */}
      <div className="relative overflow-hidden rounded-2xl mb-8 shadow-2xl" style={{ minHeight: 380 }}>
        {HERO_SLIDES.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className={`absolute inset-0 ${slide.bg}`}/>
            <div className="absolute inset-0 pk-pattern"/>
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5"/>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5"/>
            <div className="absolute right-8 top-6 text-white/10 text-7xl select-none" style={{ fontFamily: 'serif' }}>&#9734;</div>
            <div className="absolute left-1/2 bottom-10 text-white/5 text-9xl select-none" style={{ fontFamily: 'serif' }}>&#9734;</div>
            <div className="absolute inset-0 flex items-center p-6 md:p-14">
              <div className="max-w-xl text-white space-y-5 animate-heroTextReveal">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium border border-white/20"><span className="text-[#FFD700] text-lg">&#9734;</span> Bachat Bazar Pakistan</div>
                <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>{slide.title}</h2>
                <p className="text-base md:text-xl opacity-95 drop-shadow font-medium leading-relaxed">{slide.sub}</p>
                <Button className="bg-[#C5A028] hover:bg-[#B08D20] text-white font-bold px-8 py-3 shadow-lg text-base rounded-xl" onClick={() => navigate(slide.route)}>{slide.cta} <ChevronRight size={18} className="ml-1"/></Button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setHeroIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/40 transition shadow z-20"><ChevronLeft size={20}/></button>
        <button onClick={() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/40 transition shadow z-20"><ChevronRight size={20}/></button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">{HERO_SLIDES.map((_, i) => <button key={i} onClick={() => setHeroIdx(i)} className={`w-3 h-3 rounded-full transition shadow backdrop-blur ${i === heroIdx ? 'bg-[#FFD700] scale-125' : 'bg-white/40'}`}/>)}</div>
      </div>

      {/* Active Sales */}
      {activeSales.length > 0 && (<div className="mb-8 flex gap-3 overflow-x-auto no-scrollbar pb-1">{activeSales.map(sale => (<button key={sale.id} onClick={() => navigate(makeHash('shop', undefined, { category: sale.categoryId }))} className="shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-lg hover:scale-[1.02] transition-transform" style={{ background: `linear-gradient(135deg, ${sale.bannerColor}, ${sale.bannerColor}dd)` }}><Percent size={18} className="text-white/80"/><div className="text-left"><p className="font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{sale.name}</p><p className="text-xs opacity-90">{sale.discountPercent}% off — {sale.description}</p></div><ArrowRight size={16} className="ml-2 opacity-70"/></button>))}</div>)}

      {/* Active Banners */}
      {activeBanners.length > 0 && (<div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">{activeBanners.slice(0, 4).map(banner => (<button key={banner.id} onClick={() => navigate(banner.ctaLink)} className={`relative overflow-hidden rounded-xl p-5 md:p-6 text-white text-left shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r ${banner.gradient} min-h-[120px]`}><div className="absolute right-4 top-3 text-5xl opacity-10 select-none" style={{ fontFamily: 'serif' }}>&#9734;</div><p className="text-xs font-medium opacity-80 mb-1">Featured</p><h4 className="text-lg md:text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>{banner.title}</h4><p className="text-sm opacity-90 mb-3">{banner.subtitle}</p><span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{banner.cta} <ArrowRight size={12}/></span></button>))}</div>)}

      {/* Promo Strip */}
      <div className="mb-8 bg-gradient-to-r from-[#006233] via-[#00A651] to-[#006233] rounded-xl p-4 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3"><span className="text-2xl">&#127477;&#127472;</span><div><p className="font-bold text-sm md:text-base" style={{ fontFamily: 'var(--font-poppins)' }}>Pakistan Zindabad! Free Delivery Nationwide</p><p className="text-xs opacity-80">On orders above Rs 25,000 — Cash on Delivery Available</p></div></div>
        <Button className="bg-[#C5A028] hover:bg-[#B08D20] text-white font-bold text-sm shrink-0 shadow" onClick={() => navigate(makeHash('shop'))}>Shop Now</Button>
      </div>

      {/* Categories */}
      <section className="mb-10"><h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Store size={22} className="text-[#006233]"/> Shop by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{s.categories().map(cat => { const Icon = getCatIcon(cat.icon); return (<button key={cat.id} onClick={() => navigate(makeHash('shop', undefined, { category: cat.id }))} className="group relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer bg-slate-200 dark:bg-slate-700 shadow-md hover:shadow-xl transition-shadow"><ProductImage src={U(cat.img, 400)} alt={cat.name} seed={cat.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /><div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-75 transition`}/><div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 shadow"><Icon size={24} className="drop-shadow"/></div><span className="text-sm font-bold text-center drop-shadow-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{cat.name}</span></div></button>); })}</div>
      </section>

      {/* Flash Sale */}{flashItems.length > 0 && (<section className="mb-10"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Flame size={22} className="text-red-500"/> Flash Sale</h3><div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full"><Clock size={16} className="text-red-500"/> Ends in <CountdownTimer targetDate={flashSaleEnd}/></div></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{flashItems.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Featured */}{featured.length > 0 && (<section className="mb-10"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Award size={22} className="text-[#C5A028]"/> Featured</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('shop', undefined, { featured: 'true' }))} className="text-[#006233] dark:text-[#00A651]">View All <ChevronRight size={14}/></Button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{featured.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Eid Banner */}<div className="mb-10 rounded-xl bg-gradient-to-r from-[#006233] to-[#004D25] p-6 md:p-10 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl pk-pattern relative overflow-hidden"><div className="absolute top-4 right-4 text-6xl opacity-10" style={{ fontFamily: 'serif' }}>&#9734;</div><div className="flex-1 space-y-2"><p className="text-[#FFD700] text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-poppins)' }}>Limited Time Offer</p><h3 className="text-2xl md:text-3xl font-extrabold" style={{ fontFamily: 'var(--font-poppins)' }}>Eid Mubarak Sale — 25% Off!</h3><p className="opacity-90 font-medium">Use code <span className="font-mono bg-[#C5A028] px-2 py-0.5 rounded text-white">EID25</span> on orders above Rs 50,000</p></div><Button className="bg-[#C5A028] hover:bg-[#B08D20] text-white font-bold shrink-0 shadow-lg" onClick={() => navigate(makeHash('deals'))}>Shop Deals <ArrowRight size={16}/></Button></div>
      {/* Trending */}{trending.length > 0 && (<section className="mb-10"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><TrendingUp size={22} className="text-[#00A651]"/> Trending Now</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('shop', undefined, { trending: 'true' }))} className="text-[#006233] dark:text-[#00A651]">View All <ChevronRight size={14}/></Button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{trending.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* New Arrivals */}{newArrivals.length > 0 && (<section className="mb-10"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Zap size={22} className="text-[#C5A028]"/> New Arrivals</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('new'))} className="text-[#006233] dark:text-[#00A651]">View All <ChevronRight size={14}/></Button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{newArrivals.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Best Sellers */}{bestSellers.length > 0 && (<section className="mb-10"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><ThumbsUp size={22} className="text-[#006233]"/> Best Sellers</h3></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{bestSellers.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Testimonials */}<section className="mb-10"><h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Users size={22} className="text-[#006233]"/> What Our Customers Say</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{TESTIMONIALS.map((t, i) => (<Card key={i} className="p-4 border-t-2 border-t-[#C5A028]"><div className="flex items-center gap-3 mb-3"><img src={U(t.avatar, 80)} alt={t.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => imgFallback(e, t.name)}/><div><p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{t.name}</p><p className="text-xs text-[#C5A028]">{t.role}</p></div></div><StarRating rating={t.rating} size={12}/><p className="mt-2 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p></Card>))}</div></section>
      {/* Blog */}<section className="mb-10"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><BookOpen size={22} className="text-[#006233]"/> From the Blog</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('blog'))} className="text-[#006233] dark:text-[#00A651]">All Posts <ChevronRight size={14}/></Button></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{BLOGS.map((b) => (<Card key={b.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"><div className="aspect-video overflow-hidden"><ProductImage src={U(b.img, 400)} alt={b.title} seed={b.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /></div><div className="p-3 space-y-1"><p className="text-xs text-[#C5A028] font-medium">{b.date} &middot; {b.author}</p><p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{b.title}</p><p className="text-xs text-muted-foreground line-clamp-2">{b.excerpt}</p></div></Card>))}</div></section>
      {/* Brands */}<section className="mb-10"><h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Top Brands</h3><div className="overflow-hidden"><div className="marquee-track flex gap-8 whitespace-nowrap">{[...Array(2)].map((_, si) => (<React.Fragment key={si}>{s.allProducts().slice(0, 20).map((p, i) => <span key={`${si}-${i}`} className="text-lg font-bold text-[#006233]/20 dark:text-[#00A651]/20 px-4" style={{ fontFamily: 'var(--font-poppins)' }}>{p.brand}</span>)}</React.Fragment>))}</div></div></section>
      {/* Features */}<section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[{ icon: Truck, title: 'Free Shipping', desc: 'Orders over Rs 25,000' },{ icon: ShieldCheck, title: 'Genuine Products', desc: '100% authentic items' },{ icon: RotateCcw, title: '7-Day Returns', desc: 'Easy return policy' },{ icon: Banknote, title: 'Cash on Delivery', desc: 'Pay when you receive' }].map((f, i) => (<div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-b from-[#006233]/5 to-transparent dark:from-[#00A651]/10 border border-[#006233]/10"><div className="w-12 h-12 rounded-full bg-[#006233]/10 dark:bg-[#00A651]/20 flex items-center justify-center mb-2"><f.icon size={22} className="text-[#006233] dark:text-[#00A651]"/></div><p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{f.title}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>))}</section>
    </div>
  );
}

// ─── SHOP VIEW ───
function ShopView({ query, onQuickView, navigate }: { query: Record<string, string>; onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore();
  const [search, setSearch] = useState(query.search || '');
  const [cat, setCat] = useState(query.category || 'all');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [priceMax, setPriceMax] = useState(200000);
  const perPage = 12;

  const activeCat = query.category || cat;
  const activeSearch = query.search || search;

  const filtered = useMemo(() => {
    let list = s.allProducts();
    if (activeCat !== 'all') list = list.filter(p => p.category === activeCat);
    if (activeSearch) { const q = activeSearch.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)); }
    if (query.featured === 'true') list = list.filter(p => p.featured);
    if (query.trending === 'true') list = list.filter(p => p.trending);
    list = list.filter(p => p.price <= priceMax);
    switch (sort) {
      case 'price-low': list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'newest': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [s, activeCat, activeSearch, sort, priceMax, query.featured, query.trending]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Shop{activeCat !== 'all' ? ` — ${s.categories().find(c => c.id === activeCat)?.name || activeCat}` : ''}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search products..." value={activeSearch} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9"/></div>
          <Select value={activeCat} onValueChange={v => { setCat(v); setPage(1); }}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Category"/></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{s.categories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Sort by"/></SelectTrigger><SelectContent><SelectItem value="featured">Featured</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem><SelectItem value="price-high">Price: High to Low</SelectItem><SelectItem value="rating">Top Rated</SelectItem><SelectItem value="newest">Newest</SelectItem></SelectContent></Select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
      {pageItems.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{pageItems.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div>) : (<div className="text-center py-20 text-muted-foreground"><Package size={48} className="mx-auto mb-4 opacity-30"/><p className="text-lg font-medium">No products found</p><p className="text-sm">Try adjusting your filters</p></div>)}
      {totalPages > 1 && (<div className="flex items-center justify-center gap-2 pt-4">{Array.from({ length: totalPages }, (_, i) => <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)} className={page === i + 1 ? 'bg-gradient-to-r from-[#006233] to-[#00A651] text-white border-0' : ''}>{i + 1}</Button>)}</div>)}
    </div>
  );
}

// ─── PRODUCT DETAIL VIEW ───
function ProductDetailView({ id, onQuickView, navigate }: { id: string; onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const { toast } = useToast(); const [qty, setQty] = useState(1); const [tab, setTab] = useState('desc'); const [imgIdx, setImgIdx] = useState(0);
  const product = s.getProduct(Number(id));
  useEffect(() => { if (product) s.pushRecent(product.id); }, [product?.id]);
  if (!product) return <div className="text-center py-20"><p className="text-lg">Product not found</p><Button className="mt-4 bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate(makeHash('shop'))}>Back to Shop</Button></div>;
  const inWish = s.inWishlist(product.id); const related = product.related.map(rid => s.getProduct(rid)).filter(Boolean) as Product[];
  const handleCart = () => { if (s.addToCart(product.id, qty)) { toast({ title: 'Added to cart', description: product.name.slice(0, 40) }); } else { toast({ title: 'Out of stock', variant: 'destructive' }); } };
  const discount = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return (
    <div className="animate-fadeUp space-y-8">
      <button onClick={() => navigate(makeHash('shop'))} className="text-sm text-[#006233] dark:text-[#00A651] hover:underline flex items-center gap-1"><ChevronLeft size={14}/> Back to Shop</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted"><ProductImage src={product.images[imgIdx] || product.images[0]} alt={product.name} seed={product.imageId} className="w-full h-full object-cover"/></div>
          {product.images.length > 1 && <div className="flex gap-2 overflow-x-auto no-scrollbar">{product.images.map((img, i) => <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? 'border-[#006233]' : 'border-transparent'}`}><ProductImage src={img} alt="" seed={product.imageId + i} className="w-full h-full object-cover"/></button>)}</div>}
        </div>
        <div className="space-y-4">
          <p className="text-sm text-[#C5A028] font-semibold" style={{ fontFamily: 'var(--font-poppins)' }}>{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>{product.name}</h1>
          <div className="flex items-center gap-3"><StarRating rating={product.rating}/><span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>{discount > 0 && <Badge className="bg-[#C5A028] text-white">{discount}% OFF</Badge>}</div>
          <PriceDisplay price={product.price} oldPrice={product.oldPrice}/>
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          <div className={`text-sm font-medium ${product.stock > 0 ? 'text-[#006233]' : 'text-red-500'}`}>{product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</div>
          <Separator/>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg"><Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14}/></Button><span className="w-10 text-center font-semibold">{qty}</span><Button variant="ghost" size="icon" onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={14}/></Button></div>
            <Button className="flex-1 bg-gradient-to-r from-[#006233] to-[#00A651] hover:from-[#004D25] hover:to-[#006233] text-white font-semibold" onClick={handleCart} disabled={product.stock <= 0}><ShoppingCart size={16} className="mr-2"/> Add to Cart</Button>
            <Button variant="outline" size="icon" onClick={() => { s.toggleWishlist(product.id); toast({ title: inWish ? 'Removed from wishlist' : 'Added to wishlist' }); }} className={inWish ? 'text-pink-500 border-pink-300' : ''}><Heart size={16} fill={inWish ? 'currentColor' : 'none'}/></Button>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">{[{ icon: Truck, t: 'Free Delivery' },{ icon: RotateCcw, t: '7-Day Returns' },{ icon: ShieldCheck, t: 'Genuine Product' },{ icon: Banknote, t: 'Cash on Delivery' }].map((f, i) => <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><f.icon size={14} className="text-[#006233]"/>{f.t}</div>)}</div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex gap-4 border-b">{[{ k: 'desc', l: 'Description' },{ k: 'features', l: 'Features' },{ k: 'specs', l: 'Specifications' }].map(t => <button key={t.k} onClick={() => setTab(t.k)} className={`pb-2 text-sm font-medium border-b-2 transition ${tab === t.k ? 'border-[#006233] text-[#006233] dark:text-[#00A651] dark:border-[#00A651]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.l}</button>)}</div>
        {tab === 'desc' && <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>}
        {tab === 'features' && <ul className="space-y-2">{product.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-[#006233]"/>{f}</li>)}</ul>}
        {tab === 'specs' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{Object.entries(product.specs).map(([k, v]) => <div key={k} className="flex justify-between text-sm p-2 rounded bg-muted/50"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}</div>}
      </div>
      {related.length > 0 && (<section><h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Related Products</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{related.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
    </div>
  );
}

// ─── CART VIEW ───
function CartView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); const { toast } = useToast(); const [couponCode, setCouponCode] = useState('');
  const cart = s.cart; const catalog = s.allProducts(); const totals = s.cartTotals();
  const cartProducts = cart.map(i => ({ ...i, product: catalog.find(p => p.id === i.id) })).filter(x => x.product);
  if (cart.length === 0) return <div className="text-center py-20 animate-fadeUp"><ShoppingCart size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Your cart is empty</h2><p className="text-muted-foreground mb-6">Add some products to get started!</p><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate(makeHash('shop'))}>Start Shopping</Button></div>;
  return (
    <div className="animate-fadeUp space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Shopping Cart ({s.cartCount()} items)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cartProducts.map(({ id, qty, product: p }) => p && (<div key={id} className="flex gap-4 p-4 rounded-xl border bg-card"><div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><p className="text-xs text-[#C5A028]">{p.brand}</p><PriceDisplay price={p.price} oldPrice={p.oldPrice}/></div><div className="flex items-center gap-2"><div className="flex items-center border rounded-lg"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => s.setQty(id, Math.max(1, qty - 1))}><Minus size={12}/></Button><span className="w-8 text-center text-sm font-semibold">{qty}</span><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => s.setQty(id, qty + 1)}><Plus size={12}/></Button></div><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { s.removeFromCart(id); toast({ title: 'Removed from cart' }); }}><Trash2 size={14}/></Button></div></div>))}
        </div>
        <div className="space-y-4">
          <Card className="p-4 space-y-3"><h3 className="font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>Order Summary</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{totals.subDisplay}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-[#006233]">-{totals.discountDisplay}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{totals.shipDisplay}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>{totals.taxDisplay}</span></div><Separator/><div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-[#006233] dark:text-[#00A651]">{totals.totalDisplay}</span></div></div></Card>
          <div className="flex gap-2"><Input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="flex-1"/><Button variant="outline" onClick={() => { if (s.applyCoupon(couponCode)) { toast({ title: 'Coupon applied!' }); setCouponCode(''); } else { toast({ title: 'Invalid coupon', variant: 'destructive' }); } }}>Apply</Button></div>
          {s.coupon && <div className="flex items-center gap-2 text-sm bg-[#006233]/10 p-2 rounded-lg"><Check size={14} className="text-[#006233]"/><span>{s.coupon.label}</span><Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={() => { s.clearCoupon(); toast({ title: 'Coupon removed' }); }}>Remove</Button></div>}
          <Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-3" onClick={() => navigate(makeHash('checkout'))}>Proceed to Checkout</Button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT VIEW ───
function CheckoutView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); const { toast } = useToast(); const [step, setStep] = useState(0); const [payment, setPayment] = useState('cod');
  const [addr, setAddr] = useState(s.addresses[0] || { id: 1, label: 'Home', name: '', line: '', city: '', state: 'Punjab', zip: '', country: 'Pakistan', phone: '', default: true });
  const totals = s.cartTotals();
  if (s.cart.length === 0) { navigate(makeHash('cart')); return null; }
  const handlePlaceOrder = () => { const order = s.placeOrder(payment, addr); toast({ title: 'Order placed!', description: `Order #${order.id}` }); navigate(makeHash('orders')); };
  return (
    <div className="animate-fadeUp space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Checkout</h2>
      <div className="flex items-center gap-2 mb-6">{['Shipping', 'Payment', 'Review'].map((l, i) => (<React.Fragment key={i}>{i > 0 && <div className={`flex-1 h-0.5 ${i <= step ? 'bg-[#006233]' : 'bg-muted'}`}/>}<div className={`flex items-center gap-2 ${i <= step ? 'text-[#006233] dark:text-[#00A651]' : 'text-muted-foreground'}`}><span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${i <= step ? 'bg-[#006233] text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span><span className="text-sm font-medium hidden sm:inline">{l}</span></div></React.Fragment>))}</div>
      {step === 0 && (<Card className="p-6 space-y-4"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Shipping Address</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><Label>Full Name</Label><Input value={addr.name} onChange={e => setAddr({ ...addr, name: e.target.value })} placeholder="Muhammad Ali"/></div><div><Label>Phone</Label><Input value={addr.phone} onChange={e => setAddr({ ...addr, phone: e.target.value })} placeholder="+92 300 1234567"/></div><div className="sm:col-span-2"><Label>Address</Label><Input value={addr.line} onChange={e => setAddr({ ...addr, line: e.target.value })} placeholder="House 42, Block C"/></div><div><Label>City</Label><Input value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} placeholder="Lahore"/></div><div><Label>Province</Label><Input value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })}/></div></div><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => setStep(1)}>Continue to Payment</Button></Card>)}
      {step === 1 && (<Card className="p-6 space-y-4"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Payment Method</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{PAYMENTS.map(p => (<button key={p.id} onClick={() => setPayment(p.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${payment === p.id ? 'border-[#006233] bg-[#006233]/5' : 'border-border hover:border-[#006233]/30'}`}><Banknote size={20} className="text-[#006233]"/><span className="font-medium text-sm">{p.name}</span>{payment === p.id && <Check size={16} className="ml-auto text-[#006233]"/>}</button>))}</div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(0)}>Back</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => setStep(2)}>Review Order</Button></div></Card>)}
      {step === 2 && (<Card className="p-6 space-y-4"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Review Order</h3><div className="space-y-2"><div className="text-sm"><p className="font-medium">Ship to: {addr.name || 'Not provided'}</p><p className="text-muted-foreground">{addr.line}, {addr.city}, {addr.state}</p></div><Separator/><p className="font-medium text-sm">Payment: {PAYMENTS.find(p => p.id === payment)?.name}</p><Separator/><div className="space-y-1">{s.cart.map(i => { const p = s.getProduct(i.id); return p ? <div key={i.id} className="flex justify-between text-sm"><span>{p.name.slice(0, 40)} x{i.qty}</span><span>{s.money(p.price * i.qty)}</span></div> : null; })}</div><Separator/><div className="flex justify-between font-bold"><span>Total</span><span className="text-[#006233] dark:text-[#00A651]">{totals.totalDisplay}</span></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button className="flex-1 bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-3" onClick={handlePlaceOrder}><Lock size={16} className="mr-2"/> Place Order</Button></div></Card>)}
    </div>
  );
}

// ─── WISHLIST VIEW ───
function WishlistView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const products = s.wishlist.map(id => s.getProduct(id)).filter(Boolean) as Product[];
  if (products.length === 0) return <div className="text-center py-20 animate-fadeUp"><Heart size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Your wishlist is empty</h2><Button className="mt-4 bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate(makeHash('shop'))}>Browse Products</Button></div>;
  return <div className="animate-fadeUp space-y-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Wishlist ({products.length})</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{products.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></div>;
}

// ─── COMPARE VIEW ───
function CompareView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); const products = s.compare.map(id => s.getProduct(id)).filter(Boolean) as Product[];
  if (products.length < 2) return <div className="text-center py-20 animate-fadeUp"><GitCompare size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Compare Products</h2><p className="text-muted-foreground mb-4">Add at least 2 products to compare (max 4)</p><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate(makeHash('shop'))}>Browse Products</Button></div>;
  return (
    <div className="animate-fadeUp space-y-6 overflow-x-auto"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Compare Products</h2>
    <table className="w-full min-w-[600px] text-sm"><thead><tr><th className="p-3 text-left">Feature</th>{products.map(p => <th key={p.id} className="p-3 text-center"><div className="w-20 h-20 mx-auto mb-2 rounded-lg overflow-hidden bg-muted"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><p className="font-medium text-xs truncate">{p.name}</p></th>)}</tr></thead>
    <tbody>{[['Price', p => s.money(p.price)],['Rating', p => `${p.rating} ⭐`],['Brand', p => p.brand],['Category', p => s.categories().find(c => c.id === p.category)?.name || p.category],['Stock', p => p.stock > 0 ? `${p.stock} available` : 'Out of stock'],['SKU', p => p.sku]].map(([label, fn], i) => <tr key={i} className="border-t"><td className="p-3 font-medium text-muted-foreground">{label}</td>{products.map(p => <td key={p.id} className="p-3 text-center">{fn(p)}</td>)}</tr>)}</tbody></table></div>
  );
}

// ─── ORDERS VIEW ───
function OrdersView() {
  const s = useStore();
  if (s.orders.length === 0) return <div className="text-center py-20 animate-fadeUp"><Package size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>No orders yet</h2><p className="text-muted-foreground">Your order history will appear here</p></div>;
  return (
    <div className="animate-fadeUp space-y-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>My Orders</h2>
    <div className="space-y-4">{s.orders.map(o => (<Card key={o.id} className="p-4 space-y-3"><div className="flex items-center justify-between"><div><span className="font-bold text-sm">#{o.id}</span><span className="text-xs text-muted-foreground ml-2">{new Date(o.date).toLocaleDateString()}</span></div><Badge className={`${o.status === 'Delivered' ? 'bg-[#006233]' : o.status === 'Cancelled' ? 'bg-red-500' : 'bg-[#C5A028]'} text-white`}>{o.status}</Badge></div><div className="space-y-1">{o.items.map((it, i) => <div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{it.name?.slice(0, 40)} x{it.qty}</span><span>{s.money((it.price || 0) * it.qty)}</span></div>)}</div><Separator/><div className="flex justify-between font-bold text-sm"><span>Total</span><span className="text-[#006233] dark:text-[#00A651]">{o.totals.totalDisplay}</span></div></Card>))}</div></div>
  );
}

// ─── ACCOUNT VIEW ───
function AccountView() {
  const s = useStore(); const { toast } = useToast(); const [tab, setTab] = useState('profile');
  if (!s.user) return <div className="text-center py-20 animate-fadeUp"><User size={64} className="mx-auto mb-4 text-muted-foreground/30"/><h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Sign In</h2><p className="text-muted-foreground">Please sign in to view your account</p></div>;
  return (
    <div className="animate-fadeUp space-y-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>My Account</h2>
    <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="addresses">Addresses</TabsTrigger><TabsTrigger value="rewards">Rewards</TabsTrigger></TabsList>
    <TabsContent value="profile"><Card className="p-6 space-y-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#006233] to-[#00A651] flex items-center justify-center text-white text-2xl font-bold">{s.user.name[0]}</div><div><p className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{s.user.name}</p><p className="text-sm text-muted-foreground">{s.user.email}</p><p className="text-xs text-muted-foreground">Member since {new Date(s.user.joined).toLocaleDateString()}</p></div></div><Button variant="outline" onClick={() => { s.logout(); toast({ title: 'Logged out' }); }}><LogOut size={14} className="mr-2"/>Logout</Button></Card></TabsContent>
    <TabsContent value="addresses"><div className="space-y-3">{s.addresses.map(a => (<Card key={a.id} className="p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-sm">{a.label} {a.default && <Badge className="ml-2 bg-[#006233] text-white text-xs">Default</Badge>}</p><p className="text-sm text-muted-foreground">{a.name || 'Not set'} — {a.line}, {a.city}, {a.state}</p><p className="text-xs text-muted-foreground">{a.phone}</p></div></div></Card>))}</div></TabsContent>
    <TabsContent value="rewards"><Card className="p-6 text-center"><Gift size={48} className="mx-auto mb-4 text-[#C5A028]"/><p className="text-3xl font-bold text-[#C5A028]" style={{ fontFamily: 'var(--font-poppins)' }}>{s.money(s.rewards)}</p><p className="text-sm text-muted-foreground mt-1">Reward Points Balance</p></Card></TabsContent>
    </Tabs></div>
  );
}

// ─── DEALS VIEW ───
function DealsView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const deals = s.allProducts().filter(p => p.oldPrice > p.price);
  const flashEnd = useMemo(() => new Date(Date.now() + 12 * 3600000), []);
  return (
    <div className="animate-fadeUp space-y-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Flame size={24} className="inline mr-2 text-red-500"/>Hot Deals</h2><div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full"><Clock size={16} className="text-red-500"/>Ends in <CountdownTimer targetDate={flashEnd}/></div></div>
    {s.sales.filter(sale => sale.active).map(sale => (<div key={sale.id} className="rounded-xl p-4 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${sale.bannerColor}, ${sale.bannerColor}cc)` }}><div className="flex items-center justify-between"><div><p className="font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>{sale.name}</p><p className="text-sm opacity-90">{sale.description}</p></div><Badge className="bg-white/20 text-white">{sale.discountPercent}% OFF</Badge></div></div>))}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{deals.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></div>
  );
}

// ─── NEW ARRIVALS VIEW ───
function NewArrivalsView({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const s = useStore(); const items = s.allProducts().filter(p => p.isNew);
  return <div className="animate-fadeUp space-y-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}><Zap size={24} className="inline mr-2 text-[#C5A028]"/>New Arrivals</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{items.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></div>;
}

// ─── ABOUT VIEW ───
function AboutView() {
  return (
    <div className="animate-fadeUp space-y-8"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>About Bachat Bazar</h2>
    <div className="rounded-xl bg-gradient-to-r from-[#006233] to-[#00A651] p-8 md:p-12 text-white shadow-xl pk-pattern relative overflow-hidden"><div className="absolute right-6 top-6 text-7xl opacity-10" style={{ fontFamily: 'serif' }}>&#9734;</div><h3 className="text-3xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Pakistan&apos;s #1 Online Marketplace</h3><p className="text-lg opacity-90 max-w-2xl">Bachat Bazar is committed to bringing the best products at the most competitive prices to every corner of Pakistan. From Health &amp; Beauty to Electronics, Fashion to Home — we&apos;ve got it all.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[{ icon: Store, t: '10,000+ Products', d: 'Across 8 major categories' },{ icon: Users, t: '500,000+ Customers', d: 'Trusted across Pakistan' },{ icon: Truck, t: 'Nationwide Delivery', d: 'COD available everywhere' }].map((f, i) => <Card key={i} className="p-6 text-center"><f.icon size={32} className="mx-auto mb-3 text-[#006233]"/><p className="font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>{f.t}</p><p className="text-sm text-muted-foreground">{f.d}</p></Card>)}</div>
    <Card className="p-6"><h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Our Mission</h3><p className="text-muted-foreground leading-relaxed">At Bachat Bazar, we believe every Pakistani deserves access to quality products at fair prices. Our mission is to make online shopping accessible, reliable, and affordable for everyone — from Karachi to Peshawar, Lahore to Quetta. We partner with trusted brands and sellers to ensure every product is genuine and every order is delivered on time.</p></Card>
    </div>
  );
}

// ─── CONTACT VIEW ───
function ContactView() {
  const { toast } = useToast();
  return (
    <div className="animate-fadeUp space-y-8"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Contact Us</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4"><Card className="p-6 space-y-4"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Get in Touch</h3><div className="space-y-3"><div className="flex items-center gap-3"><Phone size={18} className="text-[#006233]"/><div><p className="font-medium text-sm">Phone</p><p className="text-sm text-muted-foreground">+92 42 3576 1234</p></div></div><div className="flex items-center gap-3"><Mail size={18} className="text-[#006233]"/><div><p className="font-medium text-sm">Email</p><p className="text-sm text-muted-foreground">support@bachatbazar.pk</p></div></div><div className="flex items-center gap-3"><MapPin size={18} className="text-[#006233]"/><div><p className="font-medium text-sm">Address</p><p className="text-sm text-muted-foreground">Gulberg III, Lahore, Punjab, Pakistan</p></div></div><div className="flex items-center gap-3"><Clock size={18} className="text-[#006233]"/><div><p className="font-medium text-sm">Working Hours</p><p className="text-sm text-muted-foreground">Mon-Sat: 9AM - 9PM PKT</p></div></div></div></Card></div>
      <Card className="p-6 space-y-4"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Send us a Message</h3><div className="space-y-3"><Input placeholder="Your Name"/><Input placeholder="Your Email" type="email"/><Textarea placeholder="Your Message" rows={4}/><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => toast({ title: 'Message sent!', description: 'We will get back to you soon.' })}><Mail size={14} className="mr-2"/>Send Message</Button></div></Card>
    </div></div>
  );
}

// ─── FAQ VIEW ───
function FAQView() {
  const faqs = [
    { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit Cards, JazzCash, EasyPaisa, Bank Transfer, and Cash on Delivery (COD) across Pakistan.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express delivery is 1-2 business days. Overnight delivery is available for major cities.' },
    { q: 'What is your return policy?', a: 'We offer a 7-day return policy for all products. Items must be in original packaging and unused condition.' },
    { q: 'Is Cash on Delivery available?', a: 'Yes! COD is available on all orders across Pakistan. No extra charges for COD payments.' },
    { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking number via SMS and email. You can also check order status in My Orders.' },
    { q: 'Do you offer free shipping?', a: 'Free shipping is available on orders above Rs 25,000. Standard shipping fee of Rs 150 applies to orders below that.' },
    { q: 'Are the products genuine?', a: 'Yes, we guarantee 100% genuine products. We source directly from authorized distributors and brands.' },
    { q: 'How do I apply a coupon code?', a: 'Enter your coupon code in the cart page before checkout. The discount will be applied to your order total automatically.' },
  ];
  return (
    <div className="animate-fadeUp space-y-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Frequently Asked Questions</h2>
    <Accordion type="single" collapsible>{faqs.map((f, i) => <AccordionItem key={i} value={`q${i}`}><AccordionTrigger className="text-sm font-medium text-left">{f.q}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent></AccordionItem>)}</Accordion></div>
  );
}

// ─── BLOG VIEW ───
function BlogView() {
  return (
    <div className="animate-fadeUp space-y-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Blog</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{BLOGS.map(b => (<Card key={b.id} className="overflow-hidden group hover:shadow-lg transition-shadow"><div className="aspect-video overflow-hidden"><ProductImage src={U(b.img, 400)} alt={b.title} seed={b.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/></div><div className="p-4 space-y-2"><p className="text-xs text-[#C5A028] font-medium">{b.date} &middot; {b.author}</p><h3 className="font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{b.title}</h3><p className="text-xs text-muted-foreground line-clamp-3">{b.excerpt}</p></div></Card>))}</div></div>
  );
}

// ─── NOT FOUND VIEW ───
function NotFoundView({ navigate }: { navigate: (h: string) => void }) {
  return <div className="text-center py-20 animate-fadeUp"><div className="text-6xl mb-4">&#128533;</div><h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Page Not Found</h2><p className="text-muted-foreground mb-6">The page you are looking for doesn&apos;t exist</p><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate(makeHash(''))}>Go Home</Button></div>;
}

// ─── ADMIN VIEW ───
function AdminView() {
  const s = useStore(); const { toast } = useToast();
  const [authed, setAuthed] = useState(() => { if (typeof window !== 'undefined' && sessionStorage.getItem('bb_admin') === '1') return true; return false; }); const [pwd, setPwd] = useState('');
  const [tab, setTab] = useState('dashboard');
  // Product dialog
  const [prodDialog, setProdDialog] = useState(false); const [editProd, setEditProd] = useState<Product | null>(null);
  const [pName, setPName] = useState(''); const [pBrand, setPBrand] = useState(''); const [pCat, setPCat] = useState('beauty'); const [pPrice, setPPrice] = useState(0); const [pOldPrice, setPOldPrice] = useState(0); const [pStock, setPStock] = useState(0); const [pImg, setPImg] = useState(''); const [pDesc, setPDesc] = useState(''); const [pFeatured, setPFeatured] = useState(false); const [pNew, setPNew] = useState(false); const [pTrending, setPTrending] = useState(false); const [pBestSeller, setPBestSeller] = useState(false); const [pSearch, setPSearch] = useState('');
  // Banner dialog
  const [banDialog, setBanDialog] = useState(false); const [editBan, setEditBan] = useState<BannerData | null>(null);
  const [bTitle, setBTitle] = useState(''); const [bSub, setBSub] = useState(''); const [bCta, setBCta] = useState(''); const [bLink, setBLink] = useState(''); const [bGrad, setBGrad] = useState('from-[#006233] to-[#00A651]'); const [bImg, setBImg] = useState(''); const [bActive, setBActive] = useState(true); const [bOrder, setBOrder] = useState(1);
  // Sale dialog
  const [saleDialog, setSaleDialog] = useState(false); const [editSale, setEditSale] = useState<SaleData | null>(null);
  const [sName, setSName] = useState(''); const [sDesc, setSDesc] = useState(''); const [sDisc, setSDisc] = useState(10); const [sStart, setSStart] = useState(''); const [sEnd, setSEnd] = useState(''); const [sCat, setSCat] = useState(''); const [sActive, setSActive] = useState(true); const [sColor, setSColor] = useState('#006233');
  // Category dialog
  const [catDialog, setCatDialog] = useState(false); const [editCatId, setEditCatId] = useState('');
  const [cName, setCName] = useState(''); const [cIcon, setCIcon] = useState('Tag'); const [cColor, setCColor] = useState('from-slate-500 to-slate-700'); const [cImg, setCImg] = useState('');

  const handleLogin = () => { if (pwd === ADMIN_PWD) { setAuthed(true); sessionStorage.setItem('bb_admin', '1'); toast({ title: 'Admin access granted' }); } else { toast({ title: 'Invalid password', variant: 'destructive' }); } };

  if (!authed) return (<div className="animate-fadeUp max-w-sm mx-auto py-20"><Card className="p-6 space-y-4"><div className="text-center"><Lock size={40} className="mx-auto mb-3 text-[#006233]"/><h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>Admin Access</h2><p className="text-sm text-muted-foreground">Enter the admin password</p></div><Input type="password" placeholder="Password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={handleLogin}>Unlock</Button></Card></div>);

  const allProds = s.allProducts();
  const filteredProds = pSearch ? allProds.filter(p => p.name.toLowerCase().includes(pSearch.toLowerCase()) || p.brand.toLowerCase().includes(pSearch.toLowerCase())) : allProds;
  const totalRevenue = s.orders.reduce((sum, o) => sum + o.totals.total, 0);
  const orderStatusColors: Record<string, string> = { Confirmed: 'bg-blue-500', Processing: 'bg-[#C5A028]', Shipped: 'bg-purple-500', Delivered: 'bg-[#006233]', Cancelled: 'bg-red-500' };

  const openProdDialog = (p?: Product) => {
    if (p) { setEditProd(p); setPName(p.name); setPBrand(p.brand); setPCat(p.category); setPPrice(p.price); setPOldPrice(p.oldPrice); setPStock(p.stock); setPImg(p.images[0] || ''); setPDesc(p.description); setPFeatured(p.featured); setPNew(p.isNew); setPTrending(p.trending); setPBestSeller(p.bestSeller); }
    else { setEditProd(null); setPName(''); setPBrand(''); setPCat('beauty'); setPPrice(0); setPOldPrice(0); setPStock(0); setPImg(''); setPDesc(''); setPFeatured(false); setPNew(false); setPTrending(false); setPBestSeller(false); }
    setProdDialog(true);
  };
  const saveProduct = () => {
    const d: Partial<Product> = { name: pName, brand: pBrand, category: pCat, price: pPrice, oldPrice: pOldPrice, stock: pStock, images: pImg ? [pImg] : undefined, description: pDesc, featured: pFeatured, isNew: pNew, trending: pTrending, bestSeller: pBestSeller };
    if (editProd) { s.updateProduct(editProd.id, d); toast({ title: 'Product updated' }); } else { s.addProduct(d); toast({ title: 'Product added' }); }
    setProdDialog(false);
  };

  const openBanDialog = (b?: BannerData) => {
    if (b) { setEditBan(b); setBTitle(b.title); setBSub(b.subtitle); setBCta(b.cta); setBLink(b.ctaLink); setBGrad(b.gradient); setBImg(b.image); setBActive(b.active); setBOrder(b.order); }
    else { setEditBan(null); setBTitle(''); setBSub(''); setBCta('Shop Now'); setBLink('#/shop'); setBGrad('from-[#006233] to-[#00A651]'); setBImg(''); setBActive(true); setBOrder(s.banners.length + 1); }
    setBanDialog(true);
  };
  const saveBanner = () => {
    const d: Partial<BannerData> = { title: bTitle, subtitle: bSub, cta: bCta, ctaLink: bLink, gradient: bGrad, image: bImg, active: bActive, order: bOrder };
    if (editBan) { s.updateBanner(editBan.id, d); toast({ title: 'Banner updated' }); } else { s.addBanner(d); toast({ title: 'Banner added' }); }
    setBanDialog(false);
  };

  const openSaleDialog = (sale?: SaleData) => {
    if (sale) { setEditSale(sale); setSName(sale.name); setSDesc(sale.description); setSDisc(sale.discountPercent); setSStart(sale.startDate); setSEnd(sale.endDate); setSCat(sale.categoryId); setSActive(sale.active); setSColor(sale.bannerColor); }
    else { setEditSale(null); setSName(''); setSDesc(''); setSDisc(10); setSStart(new Date().toISOString().split('T')[0]); setSEnd(new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0]); setSCat(''); setSActive(true); setSColor('#006233'); }
    setSaleDialog(true);
  };
  const saveSale = () => {
    const d: Partial<SaleData> = { name: sName, description: sDesc, discountPercent: sDisc, startDate: sStart, endDate: sEnd, categoryId: sCat, active: sActive, bannerColor: sColor };
    if (editSale) { s.updateSale(editSale.id, d); toast({ title: 'Sale updated' }); } else { s.addSale(d); toast({ title: 'Sale added' }); }
    setSaleDialog(false);
  };

  const openCatDialog = (c?: { id: string; name: string; icon: string; color: string; img: string }) => {
    if (c) { setEditCatId(c.id); setCName(c.name); setCIcon(c.icon); setCColor(c.color); setCImg(c.img); }
    else { setEditCatId(''); setCName(''); setCIcon('Tag'); setCColor('from-slate-500 to-slate-700'); setCImg(''); }
    setCatDialog(true);
  };
  const saveCat = () => {
    const d = { name: cName, icon: cIcon, color: cColor, img: cImg };
    if (editCatId) { s.updateCategory(editCatId, d); toast({ title: 'Category updated' }); } else { s.addCategory(d); toast({ title: 'Category added' }); }
    setCatDialog(false);
  };

  const adminTabs = [
    { k: 'dashboard', l: 'Dashboard', icon: BarChart3 },
    { k: 'products', l: 'Products', icon: BoxIcon },
    { k: 'orders', l: 'Orders', icon: ClipboardList },
    { k: 'banners', l: 'Banners', icon: ImageIcon },
    { k: 'sales', l: 'Sales', icon: Percent },
    { k: 'categories', l: 'Categories', icon: TableProperties },
  ];

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-poppins)' }}>Admin Panel</h2><Button variant="outline" size="sm" onClick={() => { setAuthed(false); sessionStorage.removeItem('bb_admin'); }}><LogOut size={14} className="mr-1"/>Logout</Button></div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{adminTabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.k ? 'bg-gradient-to-r from-[#006233] to-[#00A651] text-white shadow' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}><t.icon size={16}/>{t.l}</button>)}</div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (<div className="space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ icon: BoxIcon, label: 'Products', value: allProds.length, color: 'from-[#006233] to-[#00A651]' },{ icon: ClipboardList, label: 'Orders', value: s.orders.length, color: 'from-[#C5A028] to-[#E5C340]' },{ icon: Banknote, label: 'Revenue', value: s.money(totalRevenue), color: 'from-[#1A4D8F] to-[#2E6BC6]' },{ icon: Users, label: 'Customers', value: Math.max(s.orders.length, 1), color: 'from-[#8B1A1A] to-[#C41E3A]' }].map((c, i) => <Card key={i} className="p-4"><div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${c.color} flex items-center justify-center mb-2`}><c.icon size={18} className="text-white"/></div><p className="text-xs text-muted-foreground">{c.label}</p><p className="text-lg font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>{c.value}</p></Card>)}</div><Card className="p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>Reset Catalog</h3><p className="text-xs text-muted-foreground">Restore all products, categories, banners & sales to defaults</p></div><Button variant="destructive" size="sm" onClick={() => { s.resetCatalog(); toast({ title: 'Catalog reset!' }); }}><RotateCcw size={14} className="mr-1"/>Reset</Button></div></Card></div>)}

      {/* PRODUCTS */}
      {tab === 'products' && (<div className="space-y-4"><div className="flex items-center gap-2"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Search products..." value={pSearch} onChange={e => setPSearch(e.target.value)}/></div><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white shrink-0" onClick={() => openProdDialog()}><PlusCircle size={14} className="mr-1"/>Add Product</Button></div>
      <div className="rounded-xl border overflow-hidden"><div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar"><table className="w-full text-sm"><thead className="bg-muted/50 sticky top-0"><tr><th className="p-3 text-left font-medium">Product</th><th className="p-3 text-left font-medium">Category</th><th className="p-3 text-left font-medium">Price</th><th className="p-3 text-left font-medium">Stock</th><th className="p-3 text-left font-medium">Flags</th><th className="p-3 text-right font-medium">Actions</th></tr></thead><tbody>{filteredProds.map(p => (<tr key={p.id} className="border-t hover:bg-muted/30"><td className="p-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0"><ProductImage src={p.images[0]} alt="" seed={p.imageId} className="w-full h-full object-cover"/></div><div className="min-w-0"><p className="font-medium truncate max-w-[200px]">{p.name}</p><p className="text-xs text-[#C5A028]">{p.brand}</p></div></div></td><td className="p-3 text-muted-foreground">{s.categories().find(c => c.id === p.category)?.name || p.category}</td><td className="p-3"><span className="font-medium">{s.money(p.price)}</span>{p.oldPrice > p.price && <span className="text-xs text-muted-foreground line-through ml-1">{s.money(p.oldPrice)}</span>}</td><td className="p-3"><span className={p.stock <= 0 ? 'text-red-500 font-medium' : ''}>{p.stock}</span></td><td className="p-3"><div className="flex gap-1 flex-wrap">{p.featured && <Badge className="bg-[#C5A028] text-white text-[10px] px-1.5 py-0">Featured</Badge>}{p.isNew && <Badge className="bg-[#006233] text-white text-[10px] px-1.5 py-0">New</Badge>}{p.trending && <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0">Trending</Badge>}{p.bestSeller && <Badge className="bg-[#00A651] text-white text-[10px] px-1.5 py-0">Best</Badge>}</div></td><td className="p-3 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openProdDialog(p)}><Edit size={14}/></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { s.deleteProduct(p.id); toast({ title: 'Product deleted' }); }}><Trash2 size={14}/></Button></div></td></tr>))}</tbody></table></div></div></div>)}

      {/* ORDERS */}
      {tab === 'orders' && (<div className="space-y-4"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Orders ({s.orders.length})</h3>
      {s.orders.length === 0 && <p className="text-muted-foreground text-sm">No orders yet</p>}
      <div className="space-y-3">{s.orders.map(o => (<Card key={o.id} className="p-4 space-y-3"><div className="flex items-center justify-between flex-wrap gap-2"><div><span className="font-bold">#{o.id}</span><span className="text-xs text-muted-foreground ml-2">{new Date(o.date).toLocaleDateString()}</span><span className="text-xs text-muted-foreground ml-2">{o.payment}</span></div><div className="flex items-center gap-2"><Badge className={`${orderStatusColors[o.status] || 'bg-gray-500'} text-white`}>{o.status}</Badge><Select value={o.status} onValueChange={v => { s.updateOrderStatus(o.id, v); toast({ title: 'Status updated' }); }}><SelectTrigger className="w-[140px] h-7 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Processing">Processing</SelectItem><SelectItem value="Shipped">Shipped</SelectItem><SelectItem value="Delivered">Delivered</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></div></div><div className="space-y-1">{o.items.map((it, i) => <div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{it.name?.slice(0, 40)} x{it.qty}</span><span>{s.money((it.price || 0) * it.qty)}</span></div>)}</div><div className="flex justify-between font-bold text-sm pt-1 border-t"><span>Total</span><span className="text-[#006233] dark:text-[#00A651]">{o.totals.totalDisplay}</span></div></Card>))}</div></div>)}

      {/* BANNERS */}
      {tab === 'banners' && (<div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Banners ({s.banners.length})</h3><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => openBanDialog()}><PlusCircle size={14} className="mr-1"/>Add Banner</Button></div>
      <div className="space-y-3">{s.banners.map(b => (<Card key={b.id} className="p-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className={`w-24 h-14 rounded-lg bg-gradient-to-r ${b.gradient} flex items-center justify-center`}><span className="text-white/40 text-2xl" style={{ fontFamily: 'serif' }}>&#9734;</span></div><div><p className="font-medium text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{b.title}</p><p className="text-xs text-muted-foreground">{b.subtitle} &middot; Order: {b.order}</p></div></div><div className="flex items-center gap-2"><Switch checked={b.active} onCheckedChange={() => { s.toggleBanner(b.id); toast({ title: b.active ? 'Banner disabled' : 'Banner enabled' }); }}/><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openBanDialog(b)}><Edit size={14}/></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { s.deleteBanner(b.id); toast({ title: 'Banner deleted' }); }}><Trash2 size={14}/></Button></div></div></Card>))}</div></div>)}

      {/* SALES */}
      {tab === 'sales' && (<div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Sales ({s.sales.length})</h3><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => openSaleDialog()}><PlusCircle size={14} className="mr-1"/>Add Sale</Button></div>
      <div className="space-y-3">{s.sales.map(sale => (<Card key={sale.id} className="p-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="w-24 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${sale.bannerColor}, ${sale.bannerColor}cc)` }}>{sale.discountPercent}%</div><div><p className="font-medium text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{sale.name}</p><p className="text-xs text-muted-foreground">{sale.description}</p><p className="text-xs text-muted-foreground">{sale.startDate} → {sale.endDate}</p></div></div><div className="flex items-center gap-2"><Switch checked={sale.active} onCheckedChange={() => { s.toggleSale(sale.id); toast({ title: sale.active ? 'Sale disabled' : 'Sale enabled' }); }}/><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openSaleDialog(sale)}><Edit size={14}/></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { s.deleteSale(sale.id); toast({ title: 'Sale deleted' }); }}><Trash2 size={14}/></Button></div></div></Card>))}</div></div>)}

      {/* CATEGORIES */}
      {tab === 'categories' && (<div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Categories ({s.categories().length})</h3><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => openCatDialog()}><PlusCircle size={14} className="mr-1"/>Add Category</Button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{s.categories().map(c => { const Icon = getCatIcon(c.icon); return (<Card key={c.id} className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${c.color} flex items-center justify-center`}><Icon size={18} className="text-white"/></div><div><p className="font-medium text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{c.name}</p><p className="text-xs text-muted-foreground">{c.id} &middot; {allProds.filter(p => p.category === c.id).length} products</p></div></div><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCatDialog(c)}><Edit size={14}/></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { s.deleteCategory(c.id); toast({ title: 'Category deleted' }); }}><Trash2 size={14}/></Button></div></div></Card>); })}</div></div>)}

      {/* Product Dialog */}
      <Dialog open={prodDialog} onOpenChange={setProdDialog}><DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editProd ? 'Edit Product' : 'Add Product'}</DialogTitle><DialogDescription>Fill in the product details below.</DialogDescription></DialogHeader>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={pName} onChange={e => setPName(e.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Brand</Label><Input value={pBrand} onChange={e => setPBrand(e.target.value)}/></div><div><Label>Category</Label><Select value={pCat} onValueChange={setPCat}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{s.categories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div></div>
        <div className="grid grid-cols-3 gap-3"><div><Label>Price (Rs)</Label><Input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))}/></div><div><Label>Old Price</Label><Input type="number" value={pOldPrice} onChange={e => setPOldPrice(Number(e.target.value))}/></div><div><Label>Stock</Label><Input type="number" value={pStock} onChange={e => setPStock(Number(e.target.value))}/></div></div>
        <div><Label>Image URL</Label><Input value={pImg} onChange={e => setPImg(e.target.value)} placeholder="https://..."/></div>
        <div><Label>Description</Label><Textarea value={pDesc} onChange={e => setPDesc(e.target.value)} rows={2}/></div>
        <div className="flex flex-wrap gap-4"><div className="flex items-center gap-2"><Switch checked={pFeatured} onCheckedChange={setPFeatured}/><Label className="text-xs">Featured</Label></div><div className="flex items-center gap-2"><Switch checked={pNew} onCheckedChange={setPNew}/><Label className="text-xs">New</Label></div><div className="flex items-center gap-2"><Switch checked={pTrending} onCheckedChange={setPTrending}/><Label className="text-xs">Trending</Label></div><div className="flex items-center gap-2"><Switch checked={pBestSeller} onCheckedChange={setPBestSeller}/><Label className="text-xs">Best Seller</Label></div></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setProdDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={saveProduct}><Save size={14} className="mr-1"/>Save</Button></DialogFooter></DialogContent></Dialog>

      {/* Banner Dialog */}
      <Dialog open={banDialog} onOpenChange={setBanDialog}><DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editBan ? 'Edit Banner' : 'Add Banner'}</DialogTitle><DialogDescription>Configure the banner settings.</DialogDescription></DialogHeader>
      <div className="space-y-3">
        <div><Label>Title</Label><Input value={bTitle} onChange={e => setBTitle(e.target.value)}/></div>
        <div><Label>Subtitle</Label><Input value={bSub} onChange={e => setBSub(e.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>CTA Text</Label><Input value={bCta} onChange={e => setBCta(e.target.value)}/></div><div><Label>CTA Link</Label><Input value={bLink} onChange={e => setBLink(e.target.value)}/></div></div>
        <div><Label>Gradient Class</Label><Input value={bGrad} onChange={e => setBGrad(e.target.value)} placeholder="from-[#006233] to-[#00A651]"/></div>
        <div><Label>Image (optional)</Label><Input value={bImg} onChange={e => setBImg(e.target.value)} placeholder="Image ID or URL"/></div>
        <div className="grid grid-cols-2 gap-3"><div className="flex items-center gap-2"><Switch checked={bActive} onCheckedChange={setBActive}/><Label>Active</Label></div><div><Label>Order</Label><Input type="number" value={bOrder} onChange={e => setBOrder(Number(e.target.value))}/></div></div>
        <div className="rounded-lg p-4 bg-gradient-to-r text-white" style={{ minHeight: 60 }}><div className={`w-full h-full rounded-lg bg-gradient-to-r ${bGrad} p-3`}><p className="font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>{bTitle || 'Banner Preview'}</p><p className="text-xs opacity-80">{bSub || 'Subtitle'}</p></div></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setBanDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={saveBanner}><Save size={14} className="mr-1"/>Save</Button></DialogFooter></DialogContent></Dialog>

      {/* Sale Dialog */}
      <Dialog open={saleDialog} onOpenChange={setSaleDialog}><DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editSale ? 'Edit Sale' : 'Add Sale'}</DialogTitle><DialogDescription>Configure the sale event.</DialogDescription></DialogHeader>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={sName} onChange={e => setSName(e.target.value)}/></div>
        <div><Label>Description</Label><Input value={sDesc} onChange={e => setSDesc(e.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Discount %</Label><Input type="number" value={sDisc} onChange={e => setSDisc(Number(e.target.value))}/></div><div><Label>Category</Label><Select value={sCat || 'all'} onValueChange={setSCat}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{s.categories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Start Date</Label><Input type="date" value={sStart} onChange={e => setSStart(e.target.value)}/></div><div><Label>End Date</Label><Input type="date" value={sEnd} onChange={e => setSEnd(e.target.value)}/></div></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Banner Color</Label><div className="flex gap-2"><input type="color" value={sColor} onChange={e => setSColor(e.target.value)} className="w-10 h-9 rounded border cursor-pointer"/><Input value={sColor} onChange={e => setSColor(e.target.value)} className="flex-1"/></div></div><div className="flex items-center gap-2 pt-5"><Switch checked={sActive} onCheckedChange={setSActive}/><Label>Active</Label></div></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setSaleDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={saveSale}><Save size={14} className="mr-1"/>Save</Button></DialogFooter></DialogContent></Dialog>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}><DialogContent><DialogHeader><DialogTitle>{editCatId ? 'Edit Category' : 'Add Category'}</DialogTitle><DialogDescription>Category details.</DialogDescription></DialogHeader>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={cName} onChange={e => setCName(e.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Icon</Label><Select value={cIcon} onValueChange={setCIcon}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.keys(ICON_MAP).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div><div><Label>Gradient</Label><Input value={cColor} onChange={e => setCColor(e.target.value)} placeholder="from-slate-500 to-slate-700"/></div></div>
        <div><Label>Image ID</Label><Input value={cImg} onChange={e => setCImg(e.target.value)} placeholder="Unsplash photo ID"/></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={saveCat}><Save size={14} className="mr-1"/>Save</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

// ─── MAIN APP COMPONENT ───
export default function BachatBazarApp() {
  const s = useStore(); const { toast } = useToast();
  const [route, setRoute] = useState<RouteInfo>(() => parseHash(typeof window !== 'undefined' ? window.location.hash : ''));
  const [searchOpen, setSearchOpen] = useState(false); const [searchQ, setSearchQ] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [authOpen, setAuthOpen] = useState(false); const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState(''); const [authName, setAuthName] = useState('');
  const [showBackTop, setShowBackTop] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(() => { if (typeof window !== 'undefined' && localStorage.getItem('bb_cookies') === '1') return true; return false; });
  const [notifOpen, setNotifOpen] = useState(false);

  // Theme sync
  useEffect(() => { if (typeof document !== 'undefined') { document.documentElement.classList.toggle('dark', s.theme === 'dark'); } }, [s.theme]);
  // Cookie consent - initialized from localStorage via useState initializer
  // Route listener
  useEffect(() => { const handler = () => { const newRoute = parseHash(window.location.hash); setRoute(newRoute); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }; window.addEventListener('hashchange', handler); return () => window.removeEventListener('hashchange', handler); }, []);
  // Scroll listener
  useEffect(() => { const handler = () => setShowBackTop(window.scrollY > 400); window.addEventListener('scroll', handler, { passive: true }); return () => window.removeEventListener('scroll', handler); }, []);

  const navigate = useCallback((hash: string) => { window.location.hash = hash; }, []);
  const cartCount = s.cartCount();
  const wishCount = s.wishlist.length;

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (searchQ.trim()) { navigate(makeHash('shop', undefined, { search: searchQ.trim() })); setSearchOpen(false); setSearchQ(''); } };

  const handleAuth = () => {
    if (authMode === 'login') { s.login(authEmail); toast({ title: 'Welcome back!' }); }
    else { s.register(authName, authEmail); toast({ title: 'Account created!' }); }
    setAuthOpen(false); setAuthEmail(''); setAuthName('');
  };

  const currentView = route.view || '';
  const renderView = () => {
    switch (currentView) {
      case '': case 'home': return <HomeView onQuickView={setQuickView} navigate={navigate}/>;
      case 'shop': return <ShopView query={route.query} onQuickView={setQuickView} navigate={navigate}/>;
      case 'product': return <ProductDetailView id={route.id} onQuickView={setQuickView} navigate={navigate}/>;
      case 'cart': return <CartView navigate={navigate}/>;
      case 'checkout': return <CheckoutView navigate={navigate}/>;
      case 'wishlist': return <WishlistView onQuickView={setQuickView} navigate={navigate}/>;
      case 'compare': return <CompareView navigate={navigate}/>;
      case 'orders': return <OrdersView/>;
      case 'account': return <AccountView/>;
      case 'deals': return <DealsView onQuickView={setQuickView} navigate={navigate}/>;
      case 'new': return <NewArrivalsView onQuickView={setQuickView}/>;
      case 'about': return <AboutView/>;
      case 'contact': return <ContactView/>;
      case 'faq': return <FAQView/>;
      case 'blog': return <BlogView/>;
      case 'admin': return <AdminView/>;
      default: return <NotFoundView navigate={navigate}/>;
    }
  };

  const navLinks = [
    { href: makeHash(''), label: 'Home' },
    { href: makeHash('shop'), label: 'Shop' },
    { href: makeHash('deals'), label: 'Deals' },
    { href: makeHash('new'), label: 'New' },
    { href: makeHash('about'), label: 'About' },
    { href: makeHash('contact'), label: 'Contact' },
  ];

  const cartProducts = s.cart.map(i => ({ ...i, product: s.getProduct(i.id) })).filter(x => x.product);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Promo Bar */}
      <div className="bg-gradient-to-r from-[#004D25] to-[#006233] text-white text-center py-1.5 px-4 text-xs font-medium">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span>&#127477;&#127472; Free Delivery on Rs 25,000+</span>
          <span className="opacity-30">|</span>
          <span>Cash on Delivery</span>
          <span className="opacity-30">|</span>
          <span>7-Day Returns</span>
          <span className="opacity-30">|</span>
          <span>100% Genuine Products</span>
        </div>
      </div>

      {/* Navbar */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Mobile menu button */}
          <button className="md:hidden p-1" onClick={() => setMobileMenu(true)}><Menu size={22}/></button>

          {/* Logo */}
          <button onClick={() => navigate(makeHash(''))} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#006233] to-[#00A651] flex items-center justify-center text-white font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>B</div>
            <span className="font-bold text-lg gradient-text hidden sm:inline" style={{ fontFamily: 'var(--font-poppins)' }}>Bachat Bazar</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">{navLinks.map(l => (<button key={l.href} onClick={() => navigate(l.href)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${('#/' + currentView) === l.href || (l.href === '#/' && !currentView) ? 'bg-[#006233]/10 text-[#006233] dark:text-[#00A651]' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>{l.label}</button>))}</nav>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4"><div className="relative w-full"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9 h-9" placeholder="Search products, brands..." value={searchQ} onChange={e => setSearchQ(e.target.value)}/></div></form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile search toggle */}
            <button className="md:hidden p-2" onClick={() => setSearchOpen(!searchOpen)}><Search size={18}/></button>

            {/* Wishlist */}
            <button className="relative p-2" onClick={() => setWishOpen(true)}><Heart size={18}/>{wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}</button>

            {/* Compare */}
            <button className="relative p-2" onClick={() => navigate(makeHash('compare'))}><GitCompare size={18}/>{s.compare.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#006233] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{s.compare.length}</span>}</button>

            {/* Cart */}
            <button className="relative p-2" onClick={() => setCartOpen(true)}><ShoppingCart size={18}/>{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C5A028] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}</button>

            {/* Admin Button */}
            <button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white rounded-lg px-3 h-8 text-xs font-bold flex items-center gap-1.5 admin-pulse" onClick={() => navigate(makeHash('admin'))}><Settings size={14}/>Admin</button>

            {/* User */}
            <button className="p-2" onClick={() => { if (s.user) navigate(makeHash('account')); else setAuthOpen(true); }}><User size={18}/></button>

            {/* Notifications */}
            <button className="relative p-2 hidden sm:block" onClick={() => setNotifOpen(!notifOpen)}><Bell size={18}/>{s.notifs.filter(n => !n.read).length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{s.notifs.filter(n => !n.read).length}</span>}</button>

            {/* Theme toggle */}
            <button className="p-2" onClick={() => s.toggleTheme()}>{s.theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (<div className="md:hidden px-4 pb-3"><form onSubmit={handleSearch}><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} autoFocus/></div></form></div>)}

        {/* Category bar */}
        <div className="border-t overflow-x-auto no-scrollbar hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5">{s.categories().map(cat => { const Icon = getCatIcon(cat.icon); return (<button key={cat.id} onClick={() => navigate(makeHash('shop', undefined, { category: cat.id }))} className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${route.query.category === cat.id ? 'bg-[#006233] text-white' : 'text-muted-foreground hover:bg-muted'}`}><Icon size={12}/>{cat.name}</button>); })}</div>
        </div>
      </header>

      {/* Notification dropdown */}
      {notifOpen && (<div className="fixed top-16 right-4 z-50 w-80 max-h-96 overflow-y-auto custom-scrollbar bg-card border rounded-xl shadow-xl animate-scaleIn"><div className="p-3 border-b flex items-center justify-between"><h4 className="font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>Notifications</h4><Button variant="ghost" size="sm" className="text-xs" onClick={() => { s.markAllRead(); toast({ title: 'All read' }); }}>Mark all read</Button></div>{s.notifs.length === 0 ? <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p> : s.notifs.slice(0, 8).map(n => (<div key={n.id} className={`p-3 border-b last:border-0 ${n.read ? '' : 'bg-[#006233]/5'}`}><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.text}</p><p className="text-xs text-muted-foreground mt-1">{new Date(n.time).toLocaleString()}</p></div>))}<div className="p-2 text-center"><button onClick={() => setNotifOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button></div></div>)}

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{renderView()}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#004D25] to-[#002510] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>B</div><span className="font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>Bachat Bazar</span></div><p className="text-sm opacity-80 leading-relaxed">Pakistan&apos;s #1 Online Marketplace. Quality products at the best prices with nationwide delivery.</p><div className="flex gap-3 mt-4"><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Facebook size={14}/></a><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Instagram size={14}/></a><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Twitter size={14}/></a><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Youtube size={14}/></a></div></div>
            <div><h4 className="font-bold mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>Quick Links</h4><div className="space-y-2">{navLinks.map(l => <button key={l.href} onClick={() => navigate(l.href)} className="block text-sm opacity-80 hover:opacity-100 transition">{l.label}</button>)}<button onClick={() => navigate(makeHash('faq'))} className="block text-sm opacity-80 hover:opacity-100 transition">FAQ</button><button onClick={() => navigate(makeHash('blog'))} className="block text-sm opacity-80 hover:opacity-100 transition">Blog</button></div></div>
            <div><h4 className="font-bold mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>Categories</h4><div className="space-y-2">{s.categories().map(c => <button key={c.id} onClick={() => navigate(makeHash('shop', undefined, { category: c.id }))} className="block text-sm opacity-80 hover:opacity-100 transition">{c.name}</button>)}</div></div>
            <div><h4 className="font-bold mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>Contact</h4><div className="space-y-2 text-sm opacity-80"><div className="flex items-center gap-2"><Phone size={14}/>+92 42 3576 1234</div><div className="flex items-center gap-2"><Mail size={14}/>support@bachatbazar.pk</div><div className="flex items-center gap-2"><MapPin size={14}/>Gulberg III, Lahore</div></div><div className="mt-4"><h5 className="font-medium text-xs mb-2">We Accept</h5><div className="flex gap-2 flex-wrap">{['JazzCash','EasyPaisa','Visa','COD'].map(m => <span key={m} className="text-xs bg-white/10 px-2 py-1 rounded">{m}</span>)}</div></div></div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-60"><p>&copy; 2026 Bachat Bazar. All rights reserved.</p><p>Made with &#10084;&#65039; in Pakistan</p></div>
        </div>
      </footer>

      {/* ─── DRAWERS ─── */}

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}><SheetContent className="w-full sm:max-w-md flex flex-col"><SheetHeader><SheetTitle style={{ fontFamily: 'var(--font-poppins)' }}>Cart ({cartCount})</SheetTitle><SheetDescription>Your shopping cart</SheetDescription></SheetHeader>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 py-4">{cartProducts.length === 0 ? <div className="text-center py-10 text-muted-foreground"><ShoppingCart size={40} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Cart is empty</p></div> : cartProducts.map(({ id, qty, product: p }) => p && (<div key={id} className="flex gap-3 p-3 rounded-xl border"><div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><p className="text-xs text-[#C5A028]">{p.brand}</p><div className="flex items-center justify-between mt-1"><PriceDisplay price={p.price} oldPrice={p.oldPrice}/><div className="flex items-center border rounded"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => s.setQty(id, Math.max(1, qty - 1))}><Minus size={10}/></Button><span className="text-xs font-semibold w-6 text-center">{qty}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => s.setQty(id, qty + 1)}><Plus size={10}/></Button></div></div></div><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 shrink-0" onClick={() => { s.removeFromCart(id); toast({ title: 'Removed' }); }}><Trash2 size={12}/></Button></div>))}</div>
      {cartProducts.length > 0 && (<SheetFooter className="border-t pt-4 space-y-3"><div className="space-y-1 w-full"><div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{s.cartTotals().totalDisplay}</span></div><p className="text-xs text-muted-foreground">Shipping & tax calculated at checkout</p></div><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-3" onClick={() => { setCartOpen(false); navigate(makeHash('cart')); }}>View Cart</Button><Button variant="outline" className="w-full" onClick={() => { setCartOpen(false); navigate(makeHash('checkout')); }}>Checkout</Button></SheetFooter>)}</SheetContent></Sheet>

      {/* Wishlist Drawer */}
      <Sheet open={wishOpen} onOpenChange={setWishOpen}><SheetContent className="w-full sm:max-w-md flex flex-col"><SheetHeader><SheetTitle style={{ fontFamily: 'var(--font-poppins)' }}>Wishlist ({wishCount})</SheetTitle><SheetDescription>Products you love</SheetDescription></SheetHeader>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 py-4">{s.wishlist.length === 0 ? <div className="text-center py-10 text-muted-foreground"><Heart size={40} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Wishlist is empty</p></div> : s.wishlist.map(id => { const p = s.getProduct(id); return p ? (<div key={id} className="flex gap-3 p-3 rounded-xl border"><div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><PriceDisplay price={p.price} oldPrice={p.oldPrice}/></div><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 shrink-0" onClick={() => { s.toggleWishlist(id); toast({ title: 'Removed' }); }}><Trash2 size={12}/></Button></div>) : null; })}</div>
      {s.wishlist.length > 0 && <SheetFooter><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => { setWishOpen(false); navigate(makeHash('wishlist')); }}>View All</Button></SheetFooter>}</SheetContent></Sheet>

      {/* Mobile Menu Drawer */}
      <Sheet open={mobileMenu} onOpenChange={setMobileMenu}><SheetContent className="w-full sm:max-w-xs flex flex-col" side="left"><SheetHeader><SheetTitle style={{ fontFamily: 'var(--font-poppins)' }}><span className="gradient-text">Bachat Bazar</span></SheetTitle><SheetDescription>Pakistan&apos;s #1 Marketplace</SheetDescription></SheetHeader>
      <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-1 py-4">{[...navLinks, { href: makeHash('faq'), label: 'FAQ' }, { href: makeHash('blog'), label: 'Blog' }].map(l => (<button key={l.href} onClick={() => { navigate(l.href); setMobileMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition">{l.label}</button>))}
      <Separator className="my-3"/>
      <p className="px-3 text-xs text-muted-foreground font-medium mb-2">Categories</p>
      {s.categories().map(c => { const Icon = getCatIcon(c.icon); return (<button key={c.id} onClick={() => { navigate(makeHash('shop', undefined, { category: c.id })); setMobileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition"><Icon size={14}/>{c.name}</button>); })}
      <Separator className="my-3"/>
      <button onClick={() => { navigate(makeHash('admin')); setMobileMenu(false); }} className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white rounded-lg px-3 py-2.5 text-sm font-bold flex items-center gap-2"><Settings size={14}/>Admin Panel</button>
      </nav></SheetContent></Sheet>

      {/* Quick View Modal */}
      <Dialog open={!!quickView} onOpenChange={() => setQuickView(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="sr-only">Quick View</DialogTitle><DialogDescription className="sr-only">Product quick view</DialogDescription></DialogHeader>
      {quickView && (<div className="flex flex-col md:flex-row gap-6"><div className="md:w-1/2 aspect-square rounded-xl overflow-hidden bg-muted"><ProductImage src={quickView.images[0]} alt={quickView.name} seed={quickView.imageId} className="w-full h-full object-cover"/></div><div className="md:w-1/2 space-y-3"><p className="text-sm text-[#C5A028] font-semibold" style={{ fontFamily: 'var(--font-poppins)' }}>{quickView.brand}</p><h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>{quickView.name}</h3><div className="flex items-center gap-2"><StarRating rating={quickView.rating}/><span className="text-xs text-muted-foreground">({quickView.reviews})</span></div><PriceDisplay price={quickView.price} oldPrice={quickView.oldPrice}/><p className="text-sm text-muted-foreground line-clamp-3">{quickView.description}</p><div className="flex gap-2 pt-2"><Button className="flex-1 bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => { s.addToCart(quickView.id); toast({ title: 'Added to cart' }); }}><ShoppingCart size={14} className="mr-1"/>Add to Cart</Button><Button variant="outline" onClick={() => { setQuickView(null); navigate(makeHash('product', String(quickView.id))); }}>View Details</Button></div></div></div>)}</DialogContent></Dialog>

      {/* Auth Modal */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle style={{ fontFamily: 'var(--font-poppins)' }}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle><DialogDescription>{authMode === 'login' ? 'Welcome back to Bachat Bazar' : 'Join Bachat Bazar today'}</DialogDescription></DialogHeader>
      <div className="space-y-3">{authMode === 'register' && <div><Label>Name</Label><Input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Muhammad Ali"/></div>}<div><Label>Email</Label><Input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com"/></div><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold" onClick={handleAuth}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</Button><p className="text-center text-xs text-muted-foreground">{authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}<button className="text-[#006233] dark:text-[#00A651] font-medium" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Sign Up' : 'Sign In'}</button></p></div></DialogContent></Dialog>

      {/* Back to Top */}
      {showBackTop && (<button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white shadow-lg flex items-center justify-center hover:scale-110 transition animate-scaleIn"><ArrowUp size={18}/></button>)}

      {/* Cookie Consent */}
      {!cookieConsent && (<div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t p-4 shadow-lg animate-fadeUp"><div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap"><div className="flex items-center gap-3"><Cookie size={20} className="text-[#C5A028] shrink-0"/><p className="text-sm text-muted-foreground">We use cookies to enhance your experience. By continuing, you agree to our cookie policy.</p></div><div className="flex gap-2 shrink-0"><Button variant="outline" size="sm" onClick={() => { setCookieConsent(true); localStorage.setItem('bb_cookies', '1'); }}>Decline</Button><Button size="sm" className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => { setCookieConsent(true); localStorage.setItem('bb_cookies', '1'); }}>Accept</Button></div></div></div>)}
    </div>
  );
}
