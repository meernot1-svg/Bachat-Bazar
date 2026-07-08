'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { PRODUCTS, CATEGORIES, COUPONS, TESTIMONIALS, BLOGS, HERO_SLIDES, SHIPPING_METHODS, PAYMENTS, U, resolveImg, type Product, type BannerData, type SaleData } from '@/lib/data';
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
  Upload, Megaphone, Percent, Edit, Save, PlusCircle, Trash, TableProperties,
  Link, FileImage, EyeOff, RefreshCw,
  Scissors, Bed, Car, PenTool, Footprints, SprayCan, PawPrint, Dumbbell, ChefHat
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── HELPERS ───
const ICON_MAP: Record<string, React.ElementType> = { Sparkles, ShoppingCart, Tv, Smartphone, Shirt, Sofa, Watch, Baby, Tag, Scissors, Bed, Car, PenTool, Footprints, SprayCan, PawPrint, Moon, Dumbbell, ChefHat };
function getCatIcon(n: string) { return ICON_MAP[n] || Tag; }
function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, seed?: string) {
  const t = e.currentTarget;
  if (t.dataset.fallback) return;
  t.dataset.fallback = '1';
  t.onerror = null;
  // Fallback to picsum with a seed for consistent placeholder images
  const fallbackSeed = encodeURIComponent((seed || 'product').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30));
  t.src = `https://picsum.photos/seed/${fallbackSeed}/400/400`;
}

const ADMIN_PWD = 'BA56CR7VK18';
const FH = { fontFamily: "var(--font-heading), 'DM Serif Display', Georgia, serif" };
const FB = { fontFamily: "var(--font-body), 'DM Sans', system-ui, sans-serif" };

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
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const resolvedSrc = resolveImg(src, 700);
  return (
    <div className={`relative ${className}`}>
      {/* Skeleton while loading */}
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-inherit flex items-center justify-center">
          <Package size={28} className="text-muted-foreground/30" />
        </div>
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={(e) => { setErrored(true); imgFallback(e, seed); setLoaded(true); }}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

function PriceDisplay({ price, oldPrice }: { price: number; oldPrice: number }) {
  const s = useStore();
  return <span className="flex items-center gap-1.5 sm:gap-2"><span className="font-bold text-base sm:text-lg text-[#006233] dark:text-[#00A651]" style={FB}>{s.money(price)}</span>{oldPrice > price && <span className="text-xs sm:text-sm text-muted-foreground line-through">{s.money(oldPrice)}</span>}</span>;
}

// ─── IMAGE UPLOAD HELPER ───
async function uploadImage(file: File): Promise<string | null> {
  // First try: server upload (returns data URL for Vercel, local path for dev)
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch {
    // Server upload failed — fall back to client-side data URL
  }
  // Fallback: convert to base64 data URL on the client (works everywhere)
  try {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch {
    return null;
  }
}

// ─── ROUTER ───
interface RouteInfo { view: string; id: string; query: Record<string, string>; }
function parseHash(hash: string): RouteInfo { const h = hash.replace(/^#\/?/, '') || ''; const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean); const query: Record<string, string> = {}; if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); return { view: parts[0] || '', id: parts[1] || '', query }; }
function makeHash(view: string, id?: string, query?: Record<string, string>) { let h = '#/' + view; if (id) h += '/' + id; if (query && Object.keys(query).length) h += '?' + Object.entries(query).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); return h; }

// ─── PRODUCT CARD ───
function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) {
  const s = useStore(); const { toast } = useToast(); const inWish = s.inWishlist(product.id); const inComp = s.inCompare(product.id);
  const handleClick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); window.location.hash = makeHash('product', String(product.id)); };
  const handleCart = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (s.addToCart(product.id)) { toast({ title: 'Added to cart', description: product.name.slice(0, 40) }); } else { toast({ title: 'Out of stock', variant: 'destructive' }); } };
  return (
    <div className="product-card animate-cardFadeUp group bg-card rounded-xl border overflow-hidden cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage src={product.images[0]} alt={product.name} seed={product.imageId} className="product-img w-full h-full object-cover" />
        {product.badge && <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-gradient-to-r from-[#006233] to-[#00A651] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full shadow">{product.badge}</span>}
        {product.isNew && <span className="absolute top-1.5 right-8 sm:top-2 sm:right-12 bg-[#C5A028] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow">NEW</span>}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2"><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }} className="quick-view-btn w-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur text-[10px] sm:text-xs font-semibold py-1 sm:py-1.5 rounded-lg hover:bg-[#006233] hover:text-white transition flex items-center justify-center gap-1 shadow"><Eye size={12} className="sm:w-[14px]"/>Quick View</button></div>
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col gap-1 sm:opacity-0 group-hover:sm:opacity-100 transition-opacity">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const a = s.toggleWishlist(product.id); toast({ title: a ? 'Added to wishlist' : 'Removed' }); }} className={`p-1 sm:p-1.5 rounded-full shadow ${inWish ? 'bg-pink-500 text-white' : 'bg-white/90 dark:bg-zinc-800/90'} hover:scale-110 transition`}><Heart size={12} fill={inWish ? 'currentColor' : 'none'} className="sm:w-[14px] sm:h-[14px]"/></button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const ok = s.toggleCompare(product.id); toast({ title: ok ? 'Added to compare' : 'Removed / Max 4' }); }} className={`p-1 sm:p-1.5 rounded-full shadow ${inComp ? 'bg-[#006233] text-white' : 'bg-white/90 dark:bg-zinc-800/90'} hover:scale-110 transition`}><GitCompare size={12} className="sm:w-[14px] sm:h-[14px]"/></button>
        </div>
      </div>
      <div className="p-2 sm:p-3 space-y-0.5 sm:space-y-1.5">
        <p className="text-[9px] sm:text-xs text-[#C5A028] font-semibold truncate" style={FB}>{product.brand}</p>
        <p className="text-[11px] sm:text-sm font-medium line-clamp-2 leading-snug min-h-[1.75rem] sm:min-h-[2.5rem] text-slate-800 dark:text-slate-100" style={FB}>{product.name}</p>
        <div className="flex items-center gap-0.5 sm:gap-1.5"><StarRating rating={product.rating} size={9}/><span className="text-[9px] sm:text-xs text-muted-foreground">({product.reviews})</span></div>
        <PriceDisplay price={product.price} oldPrice={product.oldPrice}/>
        <Button size="sm" className="w-full mt-0.5 sm:mt-1 bg-gradient-to-r from-[#006233] to-[#00A651] hover:from-[#004D25] hover:to-[#006233] text-white border-0 font-semibold text-[10px] sm:text-sm h-7 sm:h-8" onClick={handleCart}><ShoppingCart size={11} className="mr-1 sm:w-[14px]"/> Add</Button>
      </div>
    </div>
  );
}

// ─── HOME VIEW ───
function HomeView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const [heroIdx, setHeroIdx] = useState(0);
  const allProducts = s.allProducts(); const featured = allProducts.filter(p => p.featured).slice(0, 8); const trending = allProducts.filter(p => p.trending).slice(0, 8); const newArrivals = allProducts.filter(p => p.isNew).slice(0, 8); const bestSellers = allProducts.filter(p => p.bestSeller).slice(0, 8);
  const flashSaleEnd = useMemo(() => new Date(Date.now() + 6 * 3600000), []); const flashItems = allProducts.filter(p => p.oldPrice > p.price).slice(0, 6);
  const activeSales = s.sales.filter(sale => sale.active);
  // Admin-controlled banners for hero slider
  const heroBanners = s.banners.filter(b => b.active).sort((a, b) => a.order - b.order);
  const heroSlides = heroBanners.length > 0 ? heroBanners : HERO_SLIDES;
  useEffect(() => { const id = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 5000); return () => clearInterval(id); }, [heroSlides.length]);

  return (
    <div className="animate-fadeUp">
      {/* ─── HERO SLIDER (Full Width, Admin-Managed) ─── */}
      <div className="hero-mobile relative overflow-hidden rounded-xl sm:rounded-2xl mb-4 sm:mb-8 shadow-2xl min-h-[220px] sm:min-h-[350px] md:min-h-[450px]">
        {heroSlides.map((slide, i) => {
          const isBanner = 'ctaLink' in slide;
          const title = isBanner ? (slide as BannerData).title : (slide as typeof HERO_SLIDES[0]).title;
          const sub = isBanner ? (slide as BannerData).subtitle : (slide as typeof HERO_SLIDES[0]).sub;
          const cta = isBanner ? (slide as BannerData).cta : (slide as typeof HERO_SLIDES[0]).cta;
          const ctaLink = isBanner ? (slide as BannerData).ctaLink : (slide as typeof HERO_SLIDES[0]).route;
          const img = isBanner ? (slide as BannerData).image : (slide as typeof HERO_SLIDES[0]).img;
          const bg = isBanner ? `bg-gradient-to-r ${(slide as BannerData).gradient}` : (slide as typeof HERO_SLIDES[0]).bg;
          return (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className={`absolute inset-0 ${bg}`}/>
              <div className="absolute inset-0 pk-pattern"/>
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5"/>
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5"/>
              {/* Product image on right side */}
              {img && <div className="absolute right-4 bottom-4 md:right-12 md:bottom-8 w-36 h-36 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 hidden sm:block"><ProductImage src={img} alt={title} className="w-full h-full object-cover" /></div>}
              <div className="absolute inset-0 flex items-center p-3 sm:p-6 md:p-14">
                <div className="max-w-xl text-white space-y-2 sm:space-y-5 animate-heroTextReveal">
                  <div className="inline-flex items-center gap-1 sm:gap-2 bg-white/15 backdrop-blur-sm px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-medium border border-white/20"><span className="text-[#FFD700] text-sm sm:text-lg">&#9734;</span> Bachat Bazar</div>
                  <h2 className="text-base sm:text-3xl md:text-5xl font-bold drop-shadow-lg leading-tight line-clamp-2 sm:line-clamp-none" style={FH}>{title}</h2>
                  <p className="text-xs sm:text-base md:text-xl opacity-95 drop-shadow font-medium leading-relaxed line-clamp-2" style={FB}>{sub}</p>
                  <Button className="bg-[#C5A028] hover:bg-[#B08D20] text-white font-bold px-4 sm:px-8 py-1.5 sm:py-3 shadow-lg text-xs sm:text-base rounded-xl" onClick={() => navigate(ctaLink)}>{cta} <ChevronRight size={14} className="ml-1 sm:w-[16px]"/></Button>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={() => setHeroIdx(i => (i - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur rounded-full p-1.5 sm:p-3 text-white hover:bg-white/40 transition shadow z-20"><ChevronLeft size={14} className="sm:w-[16px]"/></button>
        <button onClick={() => setHeroIdx(i => (i + 1) % heroSlides.length)} className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur rounded-full p-1.5 sm:p-3 text-white hover:bg-white/40 transition shadow z-20"><ChevronRight size={14} className="sm:w-[16px]"/></button>
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-20">{heroSlides.map((_, i) => <button key={i} onClick={() => setHeroIdx(i)} className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition shadow backdrop-blur ${i === heroIdx ? 'bg-[#FFD700] scale-125' : 'bg-white/40'}`}/>)}</div>
      </div>

      {/* Active Sales */}
      {activeSales.length > 0 && (<div className="mb-4 sm:mb-8 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">{activeSales.map(sale => (<button key={sale.id} onClick={() => navigate(makeHash('shop', undefined, { category: sale.categoryId }))} className="shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-white shadow-lg hover:scale-[1.02] transition-transform" style={{ background: `linear-gradient(135deg, ${sale.bannerColor}, ${sale.bannerColor}dd)` }}><Percent size={14} className="text-white/80 sm:w-[18px]"/><div className="text-left"><p className="font-bold text-xs sm:text-sm" style={FH}>{sale.name}</p><p className="text-[10px] sm:text-xs opacity-90 line-clamp-1">{sale.discountPercent}% off — {sale.description}</p></div><ArrowRight size={14} className="ml-1 sm:ml-2 opacity-70 sm:w-[16px]"/></button>))}</div>)}

      {/* Promo Strip */}
      <div className="mb-4 sm:mb-8 bg-gradient-to-r from-[#006233] via-[#00A651] to-[#006233] rounded-lg sm:rounded-xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-white shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3"><span className="text-base sm:text-2xl">&#127477;&#127472;</span><div><p className="font-bold text-[10px] sm:text-sm md:text-base" style={FH}>Pakistan Zindabad! Free Delivery Nationwide</p><p className="text-[9px] sm:text-xs opacity-80">On orders above Rs 25,000 — Cash on Delivery Available</p></div></div>
        <Button className="bg-[#C5A028] hover:bg-[#B08D20] text-white font-bold text-[10px] sm:text-sm shrink-0 shadow w-full sm:w-auto h-7 sm:h-auto" onClick={() => navigate(makeHash('shop'))}>Shop Now</Button>
      </div>

      {/* ─── CATEGORIES — CLEARLY VISIBLE ─── */}
      <section className="mb-4 sm:mb-10">
        <h3 className="text-sm sm:text-xl font-bold mb-3 sm:mb-5 flex items-center gap-2 text-slate-900 dark:text-slate-50" style={FH}><Store size={16} className="text-[#006233] sm:w-[20px]"/> Shop by Category</h3>
        <div className="flex sm:grid sm:grid-cols-4 gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
          {s.categories().map(cat => {
            const Icon = getCatIcon(cat.icon);
            return (
              <button key={cat.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(makeHash('shop', undefined, { category: cat.id })); }} className="category-card group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl ring-1 ring-black/5 dark:ring-white/10 aspect-[4/3] sm:aspect-[3/2] shrink-0 w-[42vw] sm:w-auto">
                <ProductImage src={U(cat.img, 600)} alt={cat.name} seed={cat.img} className="cat-img w-full h-full object-cover absolute inset-0 group-hover:scale-108 transition duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/85 group-hover:via-black/50 group-hover:to-black/30 transition-all"/>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-1 sm:p-3 z-10">
                  <div className="w-7 h-7 sm:w-14 sm:h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center mb-1 sm:mb-3 shadow-lg ring-1 ring-white/30"><Icon size={14} className="drop-shadow-lg text-white sm:w-[26px] sm:h-[26px]"/></div>
                  <span className="text-[9px] sm:text-base font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] leading-tight" style={FB}>{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Flash Sale */}{flashItems.length > 0 && (<section className="mb-4 sm:mb-10"><div className="flex items-center justify-between mb-2 sm:mb-4"><h3 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><Flame size={16} className="text-red-500 sm:w-[20px]"/> Flash Sale</h3><div className="flex items-center gap-1 text-[10px] sm:text-sm bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"><Clock size={12} className="text-red-500 sm:w-[14px]"/> Ends in <CountdownTimer targetDate={flashSaleEnd}/></div></div><div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">{flashItems.map(p => <div key={p.id} className="shrink-0 w-[45vw] sm:w-auto"><ProductCard product={p} onQuickView={onQuickView}/></div>)}</div></section>)}
      {/* Featured */}{featured.length > 0 && (<section className="mb-4 sm:mb-10"><div className="flex items-center justify-between mb-2 sm:mb-4"><h3 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><Award size={16} className="text-[#C5A028] sm:w-[20px]"/> Featured</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('shop', undefined, { featured: 'true' }))} className="text-[#006233] dark:text-[#00A651] text-[10px] sm:text-sm">View All <ChevronRight size={12} className="sm:w-[14px]"/></Button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{featured.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Eid Banner */}<div className="mb-4 sm:mb-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#006233] to-[#004D25] p-3 sm:p-6 md:p-10 text-white flex flex-col md:flex-row items-center gap-3 sm:gap-6 shadow-xl pk-pattern relative overflow-hidden"><div className="absolute top-4 right-4 text-3xl sm:text-6xl opacity-10" style={{ fontFamily: 'serif' }}>&#9734;</div><div className="flex-1 space-y-1 sm:space-y-2"><p className="text-[#FFD700] text-[9px] sm:text-sm font-bold uppercase tracking-wider" style={FB}>Limited Time Offer</p><h3 className="text-base sm:text-2xl md:text-3xl font-bold" style={FH}>Eid Mubarak Sale — 25% Off!</h3><p className="text-xs sm:text-base opacity-90 font-medium" style={FB}>Use code <span className="font-mono bg-[#C5A028] px-1.5 sm:px-2 py-0.5 rounded text-white text-[9px] sm:text-sm">EID25</span> on orders above Rs 50,000</p></div><Button className="bg-[#C5A028] hover:bg-[#B08D20] text-white font-bold shrink-0 shadow-lg text-xs sm:text-base w-full sm:w-auto" onClick={() => navigate(makeHash('deals'))}>Shop Deals <ArrowRight size={14} className="sm:w-[16px]"/></Button></div>
      {/* Trending */}{trending.length > 0 && (<section className="mb-4 sm:mb-10"><div className="flex items-center justify-between mb-2 sm:mb-4"><h3 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><TrendingUp size={16} className="text-[#00A651] sm:w-[20px]"/> Trending Now</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('shop', undefined, { trending: 'true' }))} className="text-[#006233] dark:text-[#00A651] text-[10px] sm:text-sm">View All <ChevronRight size={12} className="sm:w-[14px]"/></Button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{trending.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* New Arrivals */}{newArrivals.length > 0 && (<section className="mb-4 sm:mb-10"><div className="flex items-center justify-between mb-2 sm:mb-4"><h3 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><Zap size={16} className="text-[#C5A028] sm:w-[20px]"/> New Arrivals</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('new'))} className="text-[#006233] dark:text-[#00A651] text-[10px] sm:text-sm">View All <ChevronRight size={12} className="sm:w-[14px]"/></Button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{newArrivals.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Best Sellers */}{bestSellers.length > 0 && (<section className="mb-4 sm:mb-10"><div className="flex items-center justify-between mb-2 sm:mb-4"><h3 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><ThumbsUp size={16} className="text-[#006233] sm:w-[20px]"/> Best Sellers</h3></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{bestSellers.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
      {/* Testimonials */}<section className="mb-4 sm:mb-10"><h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><Users size={16} className="text-[#006233] sm:w-[20px]"/> What Our Customers Say</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">{TESTIMONIALS.map((t, i) => (<Card key={i} className="p-3 sm:p-4 border-t-2 border-t-[#C5A028]"><div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3"><img src={U(t.avatar, 80)} alt={t.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" onError={(e) => imgFallback(e, t.name)}/><div><p className="font-semibold text-xs sm:text-sm" style={FB}>{t.name}</p><p className="text-[10px] sm:text-xs text-[#C5A028]">{t.role}</p></div></div><StarRating rating={t.rating} size={10}/><p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-none">&ldquo;{t.text}&rdquo;</p></Card>))}</div></section>
      {/* Blog */}<section className="mb-4 sm:mb-10"><div className="flex items-center justify-between mb-2 sm:mb-4"><h3 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-slate-50" style={FH}><BookOpen size={16} className="text-[#006233] sm:w-[20px]"/> From the Blog</h3><Button variant="ghost" size="sm" onClick={() => navigate(makeHash('blog'))} className="text-[#006233] dark:text-[#00A651] text-[10px] sm:text-sm">All Posts <ChevronRight size={12} className="sm:w-[14px]"/></Button></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">{BLOGS.map((b) => (<Card key={b.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"><div className="aspect-video overflow-hidden"><ProductImage src={U(b.img, 400)} alt={b.title} seed={b.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /></div><div className="p-2 sm:p-3 space-y-1"><p className="text-[10px] sm:text-xs text-[#C5A028] font-medium">{b.date} &middot; {b.author}</p><p className="font-semibold text-xs sm:text-sm" style={FB}>{b.title}</p><p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{b.excerpt}</p></div></Card>))}</div></section>
      {/* Brands */}<section className="mb-4 sm:mb-10"><h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-4 text-slate-900 dark:text-slate-50" style={FH}>Top Brands</h3><div className="overflow-hidden"><div className="marquee-track flex gap-8 whitespace-nowrap">{[...Array(2)].map((_, si) => (<React.Fragment key={si}>{s.allProducts().slice(0, 20).map((p, i) => <span key={`${si}-${i}`} className="text-lg font-bold text-[#006233]/20 dark:text-[#00A651]/20 px-4" style={FB}>{p.brand}</span>)}</React.Fragment>))}</div></div></section>
      {/* Features */}<section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">{[{ icon: Truck, title: 'Free Shipping', desc: 'Orders over Rs 25K' },{ icon: ShieldCheck, title: 'Genuine', desc: '100% authentic' },{ icon: RotateCcw, title: '7-Day Returns', desc: 'Easy return' },{ icon: Banknote, title: 'COD', desc: 'Pay on receive' }].map((f, i) => (<div key={i} className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gradient-to-b from-[#006233]/5 to-transparent dark:from-[#00A651]/10 border border-[#006233]/10"><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#006233]/10 dark:bg-[#00A651]/20 flex items-center justify-center mb-2"><f.icon size={18} className="text-[#006233] dark:text-[#00A651] sm:w-[22px]"/></div><p className="font-semibold text-xs sm:text-sm" style={FB}>{f.title}</p><p className="text-[10px] sm:text-xs text-muted-foreground">{f.desc}</p></div>))}</section>
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
    <div className="animate-fadeUp space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50" style={FH}>Shop{activeCat !== 'all' ? ` — ${s.categories().find(c => c.id === activeCat)?.name || activeCat}` : ''}</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground sm:w-[16px]"/><Input placeholder="Search products..." value={activeSearch} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-8 sm:h-9 text-sm"/></div>
          <div className="flex gap-2">
            <Select value={activeCat} onValueChange={v => { setCat(v); setPage(1); }}><SelectTrigger className="flex-1 sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm"><SelectValue placeholder="Category"/></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{s.categories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <Select value={sort} onValueChange={setSort}><SelectTrigger className="flex-1 sm:w-[150px] h-8 sm:h-9 text-xs sm:text-sm"><SelectValue placeholder="Sort"/></SelectTrigger><SelectContent><SelectItem value="featured">Featured</SelectItem><SelectItem value="price-low">Low to High</SelectItem><SelectItem value="price-high">High to Low</SelectItem><SelectItem value="rating">Top Rated</SelectItem><SelectItem value="newest">Newest</SelectItem></SelectContent></Select>
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">{filtered.length} products found</p>
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
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [id]);
  if (!product) return <div className="text-center py-20"><p className="text-lg">Product not found</p><Button className="mt-4 bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate(makeHash('shop'))}>Back to Shop</Button></div>;
  const inWish = s.inWishlist(product.id); const related = product.related.map(rid => s.getProduct(rid)).filter(Boolean) as Product[];
  return (
    <div className="animate-fadeUp">
      <button onClick={() => navigate(makeHash('shop'))} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4 flex items-center gap-1"><ChevronLeft size={14}/>Back to Shop</button>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
        <div className="md:w-1/2 space-y-2 sm:space-y-3">
          <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-muted shadow-lg"><ProductImage src={product.images[imgIdx] || product.images[0]} alt={product.name} seed={product.imageId} className="w-full h-full object-cover"/></div>
          {product.images.length > 1 && <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">{product.images.map((img, i) => <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? 'border-[#006233]' : 'border-transparent opacity-60 hover:opacity-100'}`}><ProductImage src={img} alt="" className="w-full h-full object-cover"/></button>)}</div>}
        </div>
        <div className="md:w-1/2 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-1.5 sm:gap-2">{product.badge && <Badge className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white text-[10px] sm:text-sm">{product.badge}</Badge>}{product.isNew && <Badge className="bg-[#C5A028] text-white text-[10px] sm:text-sm">NEW</Badge>}</div>
          <p className="text-xs sm:text-sm text-[#C5A028] font-semibold" style={FB}>{product.brand}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50" style={FH}>{product.name}</h1>
          <div className="flex items-center gap-1.5 sm:gap-2"><StarRating rating={product.rating}/><span className="text-xs sm:text-sm text-muted-foreground">({product.reviews} reviews)</span></div>
          <PriceDisplay price={product.price} oldPrice={product.oldPrice}/>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed" style={FB}>{product.description}</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center border rounded-lg"><Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={12}/></Button><span className="w-8 sm:w-10 text-center font-semibold text-sm">{qty}</span><Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={12}/></Button></div>
            <Button className="flex-1 bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-2 sm:py-3 text-sm" onClick={() => { s.addToCart(product.id, qty); toast({ title: 'Added to cart' }); }}><ShoppingCart size={14} className="mr-1.5 sm:w-[16px]"/>Add to Cart</Button>
            <Button variant="outline" size="icon" className={`h-8 w-8 sm:h-9 sm:w-9 ${inWish ? 'bg-pink-50 border-pink-200 text-pink-500' : ''}`} onClick={() => { s.toggleWishlist(product.id); toast({ title: inWish ? 'Removed from wishlist' : 'Added to wishlist' }); }}><Heart size={16} fill={inWish ? 'currentColor' : 'none'}/></Button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground pt-2"><span className="flex items-center gap-1"><Truck size={12} className="sm:w-[14px]"/> Free delivery 25K+</span><span className="flex items-center gap-1"><RotateCcw size={12} className="sm:w-[14px]"/> 7-day returns</span><span className="flex items-center gap-1"><ShieldCheck size={12} className="sm:w-[14px]"/> Genuine</span></div>
          <Separator/>
          <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="desc">Description</TabsTrigger><TabsTrigger value="specs">Specifications</TabsTrigger><TabsTrigger value="features">Features</TabsTrigger><TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger></TabsList>
          <TabsContent value="desc" className="text-sm text-muted-foreground leading-relaxed" style={FB}>{product.description}</TabsContent>
          <TabsContent value="specs"><div className="space-y-1">{Object.entries(product.specs).map(([k,v]) => <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}</div></TabsContent>
          <TabsContent value="features"><ul className="space-y-1">{product.features.map((f,i) => <li key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-[#006233]"/>{f}</li>)}</ul></TabsContent>
          <TabsContent value="reviews"><div className="space-y-4">{(product.reviewList || []).map((r: any) => <div key={r.id} className="border rounded-lg p-3 sm:p-4"><div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006233] to-[#00A651] flex items-center justify-center text-white text-xs font-bold">{r.name.charAt(0)}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-sm">{r.name}</span>{r.verified && <Badge className="bg-[#006233]/10 text-[#006233] text-[9px] px-1.5 py-0">Verified</Badge>}</div><div className="flex items-center gap-2"><StarRating rating={r.rating} size={10}/><span className="text-xs text-muted-foreground">{r.date}</span></div></div></div><p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p><div className="flex items-center gap-3 mt-2"><button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><ThumbsUp size={12}/>{r.helpful} helpful</button></div></div>)}{product.reviewList && product.reviewList.length > 0 && <div className="text-center pt-2"><p className="text-xs text-muted-foreground">Showing {product.reviewList.length} of {product.reviews} reviews</p></div>}</div></TabsContent>
          </Tabs>
        </div>
      </div>
      {related.length > 0 && (<section className="mt-12"><h3 className="text-xl font-bold mb-4" style={FH}>Related Products</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{related.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></section>)}
    </div>
  );
}

// ─── ADMIN VIEW (COMPREHENSIVE) ───
function AdminView() {
  const s = useStore(); const { toast } = useToast();
  const [authed, setAuthed] = useState(() => { if (typeof window !== 'undefined' && sessionStorage.getItem('bb_admin') === '1') return true; return false; }); const [pwd, setPwd] = useState('');
  const [tab, setTab] = useState('dashboard');
  // Product dialog
  const [prodDialog, setProdDialog] = useState(false); const [editProd, setEditProd] = useState<Product | null>(null);
  const [pName, setPName] = useState(''); const [pBrand, setPBrand] = useState(''); const [pCat, setPCat] = useState('beauty'); const [pPrice, setPPrice] = useState(0); const [pOldPrice, setPOldPrice] = useState(0); const [pStock, setPStock] = useState(0); const [pImg, setPImg] = useState(''); const [pDesc, setPDesc] = useState(''); const [pFeatured, setPFeatured] = useState(false); const [pNew, setPNew] = useState(false); const [pTrending, setPTrending] = useState(false); const [pBestSeller, setPBestSeller] = useState(false); const [pSearch, setPSearch] = useState('');
  const [pImgMode, setPImgMode] = useState<'upload' | 'url'>('upload'); const [pUploading, setPUploading] = useState(false);
  const pFileRef = useRef<HTMLInputElement>(null);
  // Banner dialog
  const [banDialog, setBanDialog] = useState(false); const [editBan, setEditBan] = useState<BannerData | null>(null);
  const [bTitle, setBTitle] = useState(''); const [bSub, setBSub] = useState(''); const [bCta, setBCta] = useState(''); const [bLink, setBLink] = useState(''); const [bGrad, setBGrad] = useState('from-[#006233] to-[#00A651]'); const [bImg, setBImg] = useState(''); const [bActive, setBActive] = useState(true); const [bOrder, setBOrder] = useState(1);
  const [bImgMode, setBImgMode] = useState<'upload' | 'url'>('upload'); const [bUploading, setBUploading] = useState(false);
  const bFileRef = useRef<HTMLInputElement>(null);
  // Sale dialog
  const [saleDialog, setSaleDialog] = useState(false); const [editSale, setEditSale] = useState<SaleData | null>(null);
  const [sName, setSName] = useState(''); const [sDesc, setSDesc] = useState(''); const [sDisc, setSDisc] = useState(10); const [sStart, setSStart] = useState(''); const [sEnd, setSEnd] = useState(''); const [sCat, setSCat] = useState(''); const [sActive, setSActive] = useState(true); const [sColor, setSColor] = useState('#006233');
  // Category dialog
  const [catDialog, setCatDialog] = useState(false); const [editCatId, setEditCatId] = useState<string | null>(null);
  const [cName, setCName] = useState(''); const [cIcon, setCIcon] = useState('Tag'); const [cColor, setCColor] = useState('from-slate-500 to-slate-700'); const [cImg, setCImg] = useState('');
  const [cImgMode, setCImgMode] = useState<'upload' | 'url'>('url'); const [cUploading, setCUploading] = useState(false);
  const cFileRef = useRef<HTMLInputElement>(null);

  const orderStatusColors: Record<string, string> = { Confirmed:'bg-blue-500', Processing:'bg-yellow-500', Shipped:'bg-purple-500', Delivered:'bg-green-500', Cancelled:'bg-red-500' };

  const filteredProducts = useMemo(() => { let list = s.allProducts(); if (pSearch) { const q = pSearch.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)); } return list; }, [s, pSearch]);

  // Product handlers
  const openProdDialog = (p?: Product) => {
    if (p) { setEditProd(p); setPName(p.name); setPBrand(p.brand); setPCat(p.category); setPPrice(p.price); setPOldPrice(p.oldPrice); setPStock(p.stock); setPImg(p.images[0] || ''); setPDesc(p.description); setPFeatured(p.featured); setPNew(p.isNew); setPTrending(p.trending); setPBestSeller(p.bestSeller); setPImgMode(p.images[0] && !p.images[0].includes('/uploads/') ? 'url' : 'upload'); }
    else { setEditProd(null); setPName(''); setPBrand(''); setPCat('beauty'); setPPrice(0); setPOldPrice(0); setPStock(0); setPImg(''); setPDesc(''); setPFeatured(false); setPNew(false); setPTrending(false); setPBestSeller(false); setPImgMode('upload'); }
    setProdDialog(true);
  };
  const saveProd = () => {
    const imgUrl = pImg || '';
    const d = { name: pName, brand: pBrand, category: pCat, price: pPrice, oldPrice: pOldPrice, stock: pStock, images: imgUrl ? [imgUrl] : [], imageId: imgUrl, description: pDesc, featured: pFeatured, isNew: pNew, trending: pTrending, bestSeller: pBestSeller };
    if (editProd) { s.updateProduct(editProd.id, d); toast({ title: 'Product updated' }); }
    else { s.addProduct(d); toast({ title: 'Product added' }); }
    setProdDialog(false);
  };
  const handleProdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPUploading(true);
    const url = await uploadImage(file);
    setPUploading(false);
    if (url) { setPImg(url); toast({ title: 'Image uploaded!' }); }
    else { toast({ title: 'Upload failed', variant: 'destructive' }); }
  };

  // Banner handlers
  const openBanDialog = (b?: BannerData) => {
    if (b) { setEditBan(b); setBTitle(b.title); setBSub(b.subtitle); setBCta(b.cta); setBLink(b.ctaLink); setBGrad(b.gradient); setBImg(b.image); setBActive(b.active); setBOrder(b.order); setBImgMode(b.image && !b.image.includes('/uploads/') ? 'url' : 'upload'); }
    else { setEditBan(null); setBTitle(''); setBSub(''); setBCta('Shop Now'); setBLink('#/shop'); setBGrad('from-[#006233] to-[#00A651]'); setBImg(''); setBActive(true); setBOrder(s.banners.length + 1); setBImgMode('upload'); }
    setBanDialog(true);
  };
  const saveBan = () => {
    const d = { title: bTitle, subtitle: bSub, cta: bCta, ctaLink: bLink, gradient: bGrad, image: bImg, active: bActive, order: bOrder };
    if (editBan) { s.updateBanner(editBan.id, d); toast({ title: 'Banner updated' }); }
    else { s.addBanner(d); toast({ title: 'Banner added — it will appear on homepage!' }); }
    setBanDialog(false);
  };
  const handleBanFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBUploading(true);
    const url = await uploadImage(file);
    setBUploading(false);
    if (url) { setBImg(url); toast({ title: 'Image uploaded!' }); }
    else { toast({ title: 'Upload failed', variant: 'destructive' }); }
  };

  // Sale handlers
  const openSaleDialog = (sale?: SaleData) => {
    if (sale) { setEditSale(sale); setSName(sale.name); setSDesc(sale.description); setSDisc(sale.discountPercent); setSStart(sale.startDate); setSEnd(sale.endDate); setSCat(sale.categoryId); setSActive(sale.active); setSColor(sale.bannerColor); }
    else { setEditSale(null); setSName(''); setSDesc(''); setSDisc(10); setSStart(new Date().toISOString().split('T')[0]); setSEnd(new Date(Date.now() + 7*864e5).toISOString().split('T')[0]); setSCat(''); setSActive(true); setSColor('#006233'); }
    setSaleDialog(true);
  };
  const saveSale = () => {
    const d = { name: sName, description: sDesc, discountPercent: sDisc, startDate: sStart, endDate: sEnd, categoryId: sCat, active: sActive, bannerColor: sColor };
    if (editSale) { s.updateSale(editSale.id, d); toast({ title: 'Sale updated' }); }
    else { s.addSale(d); toast({ title: 'Sale added' }); }
    setSaleDialog(false);
  };

  // Category handlers
  const catIcons = ['Tag','Sparkles','ShoppingCart','Tv','Smartphone','Shirt','Sofa','Watch','Baby'];
  const catColors = ['from-emerald-600 to-teal-500','from-amber-500 to-orange-500','from-sky-600 to-blue-500','from-violet-600 to-purple-500','from-slate-600 to-zinc-700','from-rose-500 to-pink-500','from-yellow-500 to-amber-600','from-pink-400 to-rose-500','from-red-500 to-rose-600','from-cyan-500 to-blue-600'];
  const openCatDialog = (cat?: { id: string; name: string; icon: string; color: string; img: string }) => {
    if (cat) { setEditCatId(cat.id); setCName(cat.name); setCIcon(cat.icon); setCColor(cat.color); setCImg(cat.img); setCImgMode(cat.img && !cat.img.startsWith('/') && !cat.img.startsWith('http') ? 'url' : 'upload'); }
    else { setEditCatId(null); setCName(''); setCIcon('Tag'); setCColor('from-slate-500 to-slate-700'); setCImg(''); setCImgMode('url'); }
    setCatDialog(true);
  };
  const saveCat = () => {
    if (editCatId) { s.updateCategory(editCatId, { name: cName, icon: cIcon, color: cColor, img: cImg }); toast({ title: 'Category updated' }); }
    else { const result = s.addCategory({ name: cName, icon: cIcon, color: cColor, img: cImg }); if (result) { toast({ title: 'Category added!' }); } else { toast({ title: 'Category already exists', variant: 'destructive' }); return; } }
    setCatDialog(false);
  };
  const handleCatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCUploading(true);
    const url = await uploadImage(file);
    setCUploading(false);
    if (url) { setCImg(url); toast({ title: 'Image uploaded!' }); }
    else { toast({ title: 'Upload failed', variant: 'destructive' }); }
  };

  if (!authed) return (
    <div className="max-w-sm mx-auto mt-20 animate-fadeUp"><Card className="p-6 space-y-4"><div className="text-center"><Lock size={40} className="mx-auto mb-2 text-[#006233]"/><h2 className="text-xl font-bold" style={FH}>Admin Panel</h2><p className="text-sm text-muted-foreground">Enter admin password</p></div><Input type="password" placeholder="Password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && pwd === ADMIN_PWD) { setAuthed(true); sessionStorage.setItem('bb_admin', '1'); } }}/><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold" onClick={() => { if (pwd === ADMIN_PWD) { setAuthed(true); sessionStorage.setItem('bb_admin', '1'); } else { toast({ title: 'Wrong password', variant: 'destructive' }); } }}>Unlock</Button></Card></div>
  );

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Admin Panel</h2><Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => { setAuthed(false); sessionStorage.removeItem('bb_admin'); }}><LogOut size={12} className="mr-1 sm:w-[14px]"/>Logout</Button></div>
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="admin-tabs-mobile flex-nowrap overflow-x-auto sm:flex-wrap h-auto gap-1 w-full">
          <TabsTrigger value="dashboard" className="gap-1 text-xs sm:text-sm shrink-0"><BarChart3 size={12} className="sm:w-[14px]"/>Dashboard</TabsTrigger>
          <TabsTrigger value="banners" className="gap-1 text-xs sm:text-sm shrink-0"><Megaphone size={12} className="sm:w-[14px]"/>Banners</TabsTrigger>
          <TabsTrigger value="sales" className="gap-1 text-xs sm:text-sm shrink-0"><Percent size={12} className="sm:w-[14px]"/>Sales</TabsTrigger>
          <TabsTrigger value="products" className="gap-1 text-xs sm:text-sm shrink-0"><BoxIcon size={12} className="sm:w-[14px]"/>Products</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1 text-xs sm:text-sm shrink-0"><ClipboardList size={12} className="sm:w-[14px]"/>Orders</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1 text-xs sm:text-sm shrink-0"><Tag size={12} className="sm:w-[14px]"/>Categories</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#006233]/10 flex items-center justify-center"><BoxIcon size={18} className="text-[#006233]"/></div><div><p className="text-2xl font-bold" style={FH}>{s.allProducts().length}</p><p className="text-xs text-muted-foreground">Products</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#C5A028]/10 flex items-center justify-center"><Megaphone size={18} className="text-[#C5A028]"/></div><div><p className="text-2xl font-bold" style={FH}>{s.banners.length}</p><p className="text-xs text-muted-foreground">Banners</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><Percent size={18} className="text-red-500"/></div><div><p className="text-2xl font-bold" style={FH}>{s.sales.filter(x => x.active).length}</p><p className="text-xs text-muted-foreground">Active Sales</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center"><ClipboardList size={18} className="text-blue-500"/></div><div><p className="text-2xl font-bold" style={FH}>{s.orders.length}</p><p className="text-xs text-muted-foreground">Orders</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center"><Tag size={18} className="text-purple-500"/></div><div><p className="text-2xl font-bold" style={FH}>{s.categories().length}</p><p className="text-xs text-muted-foreground">Categories</p></div></div></Card>
          </div>
          <Card className="p-4"><h4 className="font-bold mb-2" style={FH}>Quick Actions</h4><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => openBanDialog()} className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white"><PlusCircle size={14} className="mr-1"/>Add Banner</Button><Button size="sm" onClick={() => openSaleDialog()} className="bg-[#C5A028] text-white"><PlusCircle size={14} className="mr-1"/>Add Sale</Button><Button size="sm" onClick={() => openProdDialog()} variant="outline"><PlusCircle size={14} className="mr-1"/>Add Product</Button><Button size="sm" onClick={() => openCatDialog()} variant="outline"><PlusCircle size={14} className="mr-1"/>Add Category</Button></div></Card>
        </TabsContent>

        {/* ─── BANNERS (HERO SLIDER MANAGEMENT) ─── */}
        <TabsContent value="banners" className="space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold" style={FH}>Homepage Banners ({s.banners.length})</h3><Button size="sm" onClick={() => openBanDialog()} className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white"><PlusCircle size={14} className="mr-1"/>Add Banner</Button></div>
          <p className="text-xs text-muted-foreground bg-[#C5A028]/10 p-2 rounded-lg">These banners control the main hero slider on the homepage. Add, edit, or reorder them to change what appears on the front page.</p>
          <div className="space-y-3">
            {s.banners.sort((a,b) => a.order - b.order).map(b => (
              <Card key={b.id} className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Preview */}
                  <div className={`w-full sm:w-48 h-24 rounded-lg bg-gradient-to-r ${b.gradient} flex items-center justify-center text-white p-3 overflow-hidden relative`}>
                    {b.image && <ProductImage src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                    <div className="relative z-10 text-center"><p className="font-bold text-sm" style={FB}>{b.title}</p><p className="text-xs opacity-80">{b.subtitle}</p></div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2"><h4 className="font-bold" style={FB}>{b.title}</h4><Badge variant={b.active ? 'default' : 'secondary'} className={b.active ? 'bg-green-500 text-white' : ''}>{b.active ? 'Active' : 'Inactive'}</Badge></div>
                    <p className="text-sm text-muted-foreground">{b.subtitle}</p>
                    <p className="text-xs text-muted-foreground">Order: {b.order} | CTA: {b.cta} | Link: {b.ctaLink}</p>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={() => openBanDialog(b)}><Edit size={14}/></Button>
                    <Button size="sm" variant="outline" onClick={() => { s.toggleBanner(b.id); toast({ title: b.active ? 'Banner deactivated' : 'Banner activated' }); }}>{b.active ? <EyeOff size={14}/> : <Eye size={14}/>}</Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => { s.deleteBanner(b.id); toast({ title: 'Banner deleted' }); }}><Trash2 size={14}/></Button>
                  </div>
                </div>
              </Card>
            ))}
            {s.banners.length === 0 && <p className="text-center py-8 text-muted-foreground">No banners yet. Add one to control the homepage hero slider!</p>}
          </div>
        </TabsContent>

        {/* ─── SALES ─── */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold" style={FH}>Sales & Promotions ({s.sales.length})</h3><Button size="sm" onClick={() => openSaleDialog()} className="bg-[#C5A028] text-white"><PlusCircle size={14} className="mr-1"/>Add Sale</Button></div>
          <div className="space-y-3">
            {s.sales.map(sale => (
              <Card key={sale.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: sale.bannerColor }}>{sale.discountPercent}%</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2"><h4 className="font-bold" style={FB}>{sale.name}</h4><Badge variant={sale.active ? 'default' : 'secondary'} className={sale.active ? 'bg-green-500 text-white' : ''}>{sale.active ? 'Active' : 'Inactive'}</Badge></div>
                  <p className="text-sm text-muted-foreground">{sale.description}</p>
                  <p className="text-xs text-muted-foreground">{sale.startDate} to {sale.endDate} | Category: {sale.categoryId || 'All'}</p>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => openSaleDialog(sale)}><Edit size={14}/></Button>
                  <Button size="sm" variant="outline" onClick={() => { s.toggleSale(sale.id); toast({ title: sale.active ? 'Sale deactivated' : 'Sale activated' }); }}>{sale.active ? <EyeOff size={14}/> : <Eye size={14}/>}</Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => { s.deleteSale(sale.id); toast({ title: 'Sale deleted' }); }}><Trash2 size={14}/></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── PRODUCTS (WITH IMAGE UPLOAD) ─── */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold" style={FH}>Products ({s.allProducts().length})</h3><Button size="sm" onClick={() => openProdDialog()} className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white"><PlusCircle size={14} className="mr-1"/>Add Product</Button></div>
          <div className="relative max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search products..." value={pSearch} onChange={e => setPSearch(e.target.value)} className="pl-9"/></div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={FB}>{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} | {s.categories().find(c => c.id === p.category)?.name || p.category} | Rs {p.price.toLocaleString()}</p>
                  <div className="flex gap-1 mt-1">{p.featured && <Badge className="text-[10px] px-1 py-0 bg-[#C5A028] text-white">Featured</Badge>}{p.isNew && <Badge className="text-[10px] px-1 py-0 bg-blue-500 text-white">New</Badge>}{p.trending && <Badge className="text-[10px] px-1 py-0 bg-green-500 text-white">Trending</Badge>}{p.bestSeller && <Badge className="text-[10px] px-1 py-0 bg-purple-500 text-white">Best Seller</Badge>}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openProdDialog(p)}><Edit size={14}/></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { s.deleteProduct(p.id); toast({ title: 'Product deleted' }); }}><Trash2 size={14}/></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ─── ORDERS ─── */}
        <TabsContent value="orders" className="space-y-4">
          <h3 className="font-bold" style={FH}>Orders ({s.orders.length})</h3>
          {s.orders.length === 0 && <p className="text-muted-foreground text-sm">No orders yet</p>}
          <div className="space-y-3">
            {s.orders.map(o => (
              <Card key={o.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div><span className="font-bold">#{o.id}</span><span className="text-xs text-muted-foreground ml-2">{new Date(o.date).toLocaleDateString()}</span><span className="text-xs text-muted-foreground ml-2">{o.payment}</span></div>
                  <div className="flex items-center gap-2"><Badge className={`${orderStatusColors[o.status] || 'bg-gray-500'} text-white`}>{o.status}</Badge><Select value={o.status} onValueChange={v => { s.updateOrderStatus(o.id, v); toast({ title: 'Status updated' }); }}><SelectTrigger className="w-[140px] h-7 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Processing">Processing</SelectItem><SelectItem value="Shipped">Shipped</SelectItem><SelectItem value="Delivered">Delivered</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-1">{o.items.map((it, i) => <div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{it.name?.slice(0, 40)} x{it.qty}</span><span>{s.money((it.price || 0) * it.qty)}</span></div>)}</div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t"><span>Total</span><span className="text-[#006233] dark:text-[#00A651]">{o.totals.totalDisplay}</span></div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── CATEGORIES MANAGEMENT ─── */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold" style={FH}>Categories ({s.categories().length})</h3><Button size="sm" onClick={() => openCatDialog()} className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white"><PlusCircle size={14} className="mr-1"/>Add Category</Button></div>
          <p className="text-xs text-muted-foreground bg-blue-500/10 p-2 rounded-lg">Add, edit, or delete product categories. New categories will appear in the navigation and shop filters.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {s.categories().map(cat => {
              const Icon = getCatIcon(cat.icon);
              return (
                <Card key={cat.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cat.color} flex items-center justify-center text-white shadow`}><Icon size={22}/></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={FB}>{cat.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {cat.id} | Icon: {cat.icon}</p>
                    </div>
                  </div>
                  {cat.img && <div className="w-full h-16 rounded-lg overflow-hidden bg-muted"><ProductImage src={cat.img} alt={cat.name} className="w-full h-full object-cover"/></div>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openCatDialog(cat)}><Edit size={14} className="mr-1"/>Edit</Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => { s.deleteCategory(cat.id); toast({ title: 'Category deleted' }); }}><Trash2 size={14}/></Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── PRODUCT DIALOG (WITH IMAGE UPLOAD) ─── */}
      <Dialog open={prodDialog} onOpenChange={setProdDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle style={FH}>{editProd ? 'Edit Product' : 'Add Product'}</DialogTitle><DialogDescription>Fill in product details. You can upload an image or paste a link.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label style={FB}>Product Name *</Label><Input value={pName} onChange={e => setPName(e.target.value)} placeholder="Product name"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label style={FB}>Brand</Label><Input value={pBrand} onChange={e => setPBrand(e.target.value)} placeholder="Brand name"/></div>
              <div><Label style={FB}>Category</Label><Select value={pCat} onValueChange={setPCat}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{s.categories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label style={FB}>Price (PKR)</Label><Input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))}/></div>
              <div><Label style={FB}>Old Price</Label><Input type="number" value={pOldPrice} onChange={e => setPOldPrice(Number(e.target.value))}/></div>
              <div><Label style={FB}>Stock</Label><Input type="number" value={pStock} onChange={e => setPStock(Number(e.target.value))}/></div>
            </div>
            <div><Label style={FB}>Description</Label><Textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Product description" rows={2}/></div>
            
            {/* IMAGE: Upload OR URL */}
            <div className="space-y-2">
              <Label style={FB} className="text-sm font-semibold">Product Image *</Label>
              <div className="flex gap-2 mb-2">
                <Button size="sm" variant={pImgMode === 'upload' ? 'default' : 'outline'} onClick={() => setPImgMode('upload')} className={pImgMode === 'upload' ? 'bg-[#006233] text-white' : ''}><Upload size={14} className="mr-1"/>Upload File</Button>
                <Button size="sm" variant={pImgMode === 'url' ? 'default' : 'outline'} onClick={() => setPImgMode('url')} className={pImgMode === 'url' ? 'bg-[#006233] text-white' : ''}><Link size={14} className="mr-1"/>Image URL</Button>
              </div>
              {pImgMode === 'upload' ? (
                <div>
                  <input type="file" ref={pFileRef} accept="image/*" onChange={handleProdFileUpload} className="hidden"/>
                  <div className="upload-zone rounded-xl p-6 text-center cursor-pointer" onClick={() => pFileRef.current?.click()}>
                    {pUploading ? <RefreshCw size={24} className="mx-auto animate-spin text-[#006233]"/> : <><FileImage size={24} className="mx-auto mb-2 text-muted-foreground"/><p className="text-sm text-muted-foreground">Click to upload image</p><p className="text-xs text-muted-foreground">JPEG, PNG, WebP — Max 5MB</p></>}
                  </div>
                </div>
              ) : (
                <Input value={pImg} onChange={e => setPImg(e.target.value)} placeholder="https://example.com/image.jpg or Unsplash ID"/>
              )}
              {pImg && <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border bg-muted"><ProductImage src={pImg} alt="Preview" className="w-full h-full object-cover"/></div>}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2"><Switch checked={pFeatured} onCheckedChange={setPFeatured}/><Label style={FB}>Featured</Label></div>
              <div className="flex items-center gap-2"><Switch checked={pNew} onCheckedChange={setPNew}/><Label style={FB}>New</Label></div>
              <div className="flex items-center gap-2"><Switch checked={pTrending} onCheckedChange={setPTrending}/><Label style={FB}>Trending</Label></div>
              <div className="flex items-center gap-2"><Switch checked={pBestSeller} onCheckedChange={setPBestSeller}/><Label style={FB}>Best Seller</Label></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setProdDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold" onClick={saveProd} disabled={!pName || !pImg}><Save size={14} className="mr-1"/>{editProd ? 'Update' : 'Add'} Product</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── BANNER DIALOG (WITH IMAGE UPLOAD) ─── */}
      <Dialog open={banDialog} onOpenChange={setBanDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle style={FH}>{editBan ? 'Edit Banner' : 'Add Banner'}</DialogTitle><DialogDescription>This banner will appear in the homepage hero slider.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label style={FB}>Title *</Label><Input value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder="Banner title"/></div>
            <div><Label style={FB}>Subtitle</Label><Input value={bSub} onChange={e => setBSub(e.target.value)} placeholder="Banner subtitle"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label style={FB}>CTA Text</Label><Input value={bCta} onChange={e => setBCta(e.target.value)} placeholder="Shop Now"/></div>
              <div><Label style={FB}>CTA Link</Label><Input value={bLink} onChange={e => setBLink(e.target.value)} placeholder="#/shop"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label style={FB}>Gradient</Label><Select value={bGrad} onValueChange={setBGrad}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="from-[#006233] to-[#00A651]">Green</SelectItem><SelectItem value="from-[#004D25] to-[#006233]">Dark Green</SelectItem><SelectItem value="from-[#1A4D8F] to-[#2E6BC6]">Blue</SelectItem><SelectItem value="from-[#8B1A1A] to-[#C41E3A]">Red</SelectItem><SelectItem value="from-[#006233] to-[#C5A028]">Green-Gold</SelectItem><SelectItem value="from-[#1A4D8F] to-[#00A651]">Blue-Green</SelectItem></SelectContent></Select></div>
              <div><Label style={FB}>Order</Label><Input type="number" value={bOrder} onChange={e => setBOrder(Number(e.target.value))}/></div>
            </div>
            
            {/* BANNER IMAGE: Upload OR URL */}
            <div className="space-y-2">
              <Label style={FB} className="text-sm font-semibold">Banner Image</Label>
              <div className="flex gap-2 mb-2">
                <Button size="sm" variant={bImgMode === 'upload' ? 'default' : 'outline'} onClick={() => setBImgMode('upload')} className={bImgMode === 'upload' ? 'bg-[#006233] text-white' : ''}><Upload size={14} className="mr-1"/>Upload File</Button>
                <Button size="sm" variant={bImgMode === 'url' ? 'default' : 'outline'} onClick={() => setBImgMode('url')} className={bImgMode === 'url' ? 'bg-[#006233] text-white' : ''}><Link size={14} className="mr-1"/>Image URL</Button>
              </div>
              {bImgMode === 'upload' ? (
                <div>
                  <input type="file" ref={bFileRef} accept="image/*" onChange={handleBanFileUpload} className="hidden"/>
                  <div className="upload-zone rounded-xl p-6 text-center cursor-pointer" onClick={() => bFileRef.current?.click()}>
                    {bUploading ? <RefreshCw size={24} className="mx-auto animate-spin text-[#006233]"/> : <><FileImage size={24} className="mx-auto mb-2 text-muted-foreground"/><p className="text-sm text-muted-foreground">Click to upload banner image</p><p className="text-xs text-muted-foreground">Recommended: 1200x400px</p></>}
                  </div>
                </div>
              ) : (
                <Input value={bImg} onChange={e => setBImg(e.target.value)} placeholder="https://example.com/banner.jpg or Unsplash ID"/>
              )}
              {/* Banner Preview */}
              <div className={`w-full h-28 rounded-xl bg-gradient-to-r ${bGrad} overflow-hidden relative flex items-center p-4`}>
                {bImg && <ProductImage src={bImg} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30"/>}
                <div className="relative z-10 text-white"><p className="font-bold" style={FB}>{bTitle || 'Banner Title'}</p><p className="text-xs opacity-80">{bSub || 'Subtitle'}</p>{bCta && <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded">{bCta}</span>}</div>
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={bActive} onCheckedChange={setBActive}/><Label style={FB}>Active (show on homepage)</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBanDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold" onClick={saveBan} disabled={!bTitle}><Save size={14} className="mr-1"/>{editBan ? 'Update' : 'Add'} Banner</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── SALE DIALOG ─── */}
      <Dialog open={saleDialog} onOpenChange={setSaleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle style={FH}>{editSale ? 'Edit Sale' : 'Add Sale'}</DialogTitle><DialogDescription>Configure a sale or promotion</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label style={FB}>Sale Name *</Label><Input value={sName} onChange={e => setSName(e.target.value)} placeholder="Eid Sale"/></div>
            <div><Label style={FB}>Description</Label><Input value={sDesc} onChange={e => setSDesc(e.target.value)} placeholder="25% off on beauty"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label style={FB}>Discount %</Label><Input type="number" value={sDisc} onChange={e => setSDisc(Number(e.target.value))}/></div>
              <div><Label style={FB}>Category</Label><Select value={sCat} onValueChange={setSCat}><SelectTrigger><SelectValue placeholder="All"/></SelectTrigger><SelectContent><SelectItem value="">All Categories</SelectItem>{s.categories().map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label style={FB}>Start Date</Label><Input type="date" value={sStart} onChange={e => setSStart(e.target.value)}/></div>
              <div><Label style={FB}>End Date</Label><Input type="date" value={sEnd} onChange={e => setSEnd(e.target.value)}/></div>
            </div>
            <div><Label style={FB}>Banner Color</Label><div className="flex gap-2 items-center"><input type="color" value={sColor} onChange={e => setSColor(e.target.value)} className="w-10 h-8 rounded border cursor-pointer"/><Input value={sColor} onChange={e => setSColor(e.target.value)} className="flex-1"/></div></div>
            <div className="flex items-center gap-2"><Switch checked={sActive} onCheckedChange={setSActive}/><Label style={FB}>Active</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSaleDialog(false)}>Cancel</Button><Button className="bg-[#C5A028] text-white font-bold" onClick={saveSale} disabled={!sName}><Save size={14} className="mr-1"/>{editSale ? 'Update' : 'Add'} Sale</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CATEGORY DIALOG (WITH IMAGE UPLOAD) ─── */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle style={FH}>{editCatId ? 'Edit Category' : 'Add Category'}</DialogTitle><DialogDescription>Create a new product category for your store</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label style={FB}>Category Name *</Label><Input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Sports & Outdoor"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label style={FB}>Icon</Label><Select value={cIcon} onValueChange={setCIcon}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{catIcons.map(ic => { const Ic = getCatIcon(ic); return <SelectItem key={ic} value={ic}><span className="flex items-center gap-1"><Ic size={14}/>{ic}</span></SelectItem>; })}</SelectContent></Select></div>
              <div><Label style={FB}>Gradient Color</Label><Select value={cColor} onValueChange={setCColor}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{catColors.map(c => <SelectItem key={c} value={c}><div className={`w-4 h-4 rounded bg-gradient-to-r ${c} inline-block mr-1`}/>{c.replace(/from-|to-/g,'').replace(/\s/g,' → ')}</SelectItem>)}</SelectContent></Select></div>
            </div>
            {/* Category Image */}
            <div className="space-y-2">
              <Label style={FB} className="text-sm font-semibold">Category Image</Label>
              <div className="flex gap-2 mb-2">
                <Button size="sm" variant={cImgMode === 'upload' ? 'default' : 'outline'} onClick={() => setCImgMode('upload')} className={cImgMode === 'upload' ? 'bg-[#006233] text-white' : ''}><Upload size={14} className="mr-1"/>Upload</Button>
                <Button size="sm" variant={cImgMode === 'url' ? 'default' : 'outline'} onClick={() => setCImgMode('url')} className={cImgMode === 'url' ? 'bg-[#006233] text-white' : ''}><Link size={14} className="mr-1"/>URL / Unsplash ID</Button>
              </div>
              {cImgMode === 'upload' ? (
                <div>
                  <input type="file" ref={cFileRef} accept="image/*" onChange={handleCatFileUpload} className="hidden"/>
                  <div className="upload-zone rounded-xl p-6 text-center cursor-pointer" onClick={() => cFileRef.current?.click()}>
                    {cUploading ? <RefreshCw size={24} className="mx-auto animate-spin text-[#006233]"/> : <><FileImage size={24} className="mx-auto mb-2 text-muted-foreground"/><p className="text-sm text-muted-foreground">Click to upload category image</p><p className="text-xs text-muted-foreground">Recommended: 600x400px</p></>}
                  </div>
                </div>
              ) : (
                <Input value={cImg} onChange={e => setCImg(e.target.value)} placeholder="Unsplash photo ID or full URL"/>
              )}
              {cImg && <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border bg-muted"><ProductImage src={cImg} alt="Preview" className="w-full h-full object-cover"/></div>}
            </div>
            {/* Preview */}
            {cName && <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/50"><div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cColor} flex items-center justify-center text-white shadow`}>{React.createElement(getCatIcon(cIcon), { size: 22 })}</div><span className="font-bold" style={FB}>{cName}</span></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold" onClick={saveCat} disabled={!cName}><Save size={14} className="mr-1"/>{editCatId ? 'Update' : 'Add'} Category</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN APP ───
const navLinks = [
  { href: '#/', label: 'Home' },
  { href: '#/shop', label: 'Shop' },
  { href: '#/deals', label: 'Deals' },
  { href: '#/new', label: 'New' },
  { href: '#/about', label: 'About' },
  { href: '#/contact', label: 'Contact' },
];

export default function BachatBazarApp() {
  const s = useStore(); const { toast } = useToast();
  const [route, setRoute] = useState<RouteInfo>(() => { if (typeof window !== 'undefined') return parseHash(window.location.hash); return { view: '', id: '', query: {} }; });
  const [cartOpen, setCartOpen] = useState(false); const [wishOpen, setWishOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false); const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'register'>('login');
  const [authEmail, setAuthEmail] = useState(''); const [authName, setAuthName] = useState('');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('bb_cookies') === '1'; return false; });
  const [showBackTop, setShowBackTop] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const h = () => { setRoute(parseHash(window.location.hash)); window.scrollTo({ top: 0 }); }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
  useEffect(() => { if (s.theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [s.theme]);
  useEffect(() => { const h = () => setShowBackTop(window.scrollY > 400); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const navigate = useCallback((hash: string) => { window.location.hash = hash; }, []);
  const cartCount = s.cartCount(); const wishCount = s.wishlist.length;
  const cartProducts = s.cart.map(i => ({ ...i, product: s.getProduct(i.id) }));
  const cartTotals = s.cartTotals();

  const handleAuth = () => {
    if (authMode === 'login') { if (authEmail) { s.login(authEmail); setAuthOpen(false); toast({ title: 'Welcome back!' }); } }
    else { if (authName && authEmail) { s.register(authName, authEmail); setAuthOpen(false); toast({ title: 'Account created!' }); } }
  };

  const renderView = () => {
    switch (route.view) {
      case '': case 'home': return <HomeView onQuickView={setQuickView} navigate={navigate}/>;
      case 'shop': return <ShopView query={route.query} onQuickView={setQuickView} navigate={navigate}/>;
      case 'product': return <ProductDetailView id={route.id} onQuickView={setQuickView} navigate={navigate}/>;
      case 'cart': return <CartView navigate={navigate}/>;
      case 'checkout': return <CheckoutView navigate={navigate}/>;
      case 'wishlist': return <WishlistView onQuickView={setQuickView} navigate={navigate}/>;
      case 'compare': return <CompareView navigate={navigate}/>;
      case 'orders': return <OrdersView navigate={navigate}/>;
      case 'account': return <AccountView navigate={navigate}/>;
      case 'deals': return <DealsView onQuickView={setQuickView} navigate={navigate}/>;
      case 'new': return <NewView onQuickView={setQuickView} navigate={navigate}/>;
      case 'admin': return <AdminView/>;
      case 'about': return <AboutView/>;
      case 'contact': return <ContactView/>;
      case 'faq': return <FAQView/>;
      case 'blog': return <BlogView navigate={navigate}/>;
      default: return <HomeView onQuickView={setQuickView} navigate={navigate}/>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ─── TOP BAR (Solid Green) ─── */}
      <div className="bg-[#006233] text-white text-[10px] sm:text-xs py-1 sm:py-1.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4"><span className="flex items-center gap-1"><Phone size={10} className="sm:w-[12px]"/>+92 42 3576 1234</span><span className="hidden sm:flex items-center gap-1"><Mail size={12}/>support@bachatbazar.pk</span></div>
          <div className="flex items-center gap-2 sm:gap-3"><span className="hidden sm:inline">Free Delivery on Rs 25,000+</span><span className="sm:hidden">Free Delivery 25K+</span><span className="hidden sm:inline">|</span><span>COD Available</span></div>
        </div>
      </div>

      {/* ─── MAIN NAVBAR ─── */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigate('#/')} className="flex items-center gap-1.5 sm:gap-2 shrink-0"><div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#006233] to-[#00A651] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow" style={FH}>B</div><span className="font-bold text-base sm:text-lg gradient-text hidden sm:inline" style={FH}>Bachat Bazar</span></button>
          <div className="flex-1 relative max-w-md"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground sm:w-[16px]"/><Input placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && searchQ) { navigate(makeHash('shop', undefined, { search: searchQ })); setSearchQ(''); } }} className="pl-9 h-8 sm:h-9 text-sm"/></div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9" onClick={() => setCartOpen(true)}><ShoppingCart size={18} className="sm:w-[20px]"/>{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#C5A028] text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount}</span>}</Button>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex" onClick={() => setWishOpen(true)}><Heart size={18} className="sm:w-[20px]"/>{wishCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{wishCount}</span>}</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex" onClick={() => setNotifOpen(!notifOpen)}><Bell size={18} className="sm:w-[20px]"/>{s.notifs.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"/>}</Button>
            {/* ─── ADMIN BUTTON (VISIBLE) ─── */}
            <Button variant="ghost" size="icon" className="text-[#006233] dark:text-[#00A651] hover:bg-[#006233]/10 h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate(makeHash('admin'))} title="Admin Panel"><Settings size={18} className="sm:w-[20px]"/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex" onClick={s.toggleTheme}>{s.theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex" onClick={() => s.user ? navigate(makeHash('account')) : setAuthOpen(true)}><User size={18} className="sm:w-[20px]"/></Button>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 sm:h-9 sm:w-9" onClick={() => setMobileMenu(true)}><Menu size={20}/></Button>
          </div>
        </div>
        {/* Desktop nav links */}
        <div className="hidden md:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5">{navLinks.map(l => (<button key={l.href} onClick={() => navigate(l.href)} className={`px-3 py-1 rounded-full text-sm font-medium transition ${('#/' + route.view === l.href) || (l.href === '#/' && route.view === '') ? 'bg-[#006233] text-white' : 'text-muted-foreground hover:bg-muted'}`}>{l.label}</button>))}<Separator orientation="vertical" className="h-4 mx-1"/>{s.categories().slice(0, 6).map(cat => { const Icon = getCatIcon(cat.icon); return (<button key={cat.id} onClick={() => navigate(makeHash('shop', undefined, { category: cat.id }))} className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${route.query.category === cat.id ? 'bg-[#006233] text-white' : 'text-muted-foreground hover:bg-muted'}`}><Icon size={12}/>{cat.name}</button>); })}</div>
        </div>
      </header>

      {/* Notification dropdown */}
      {notifOpen && (<div className="notif-mobile fixed top-14 sm:top-16 right-2 sm:right-4 z-50 w-[calc(100vw-16px)] sm:w-80 max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar bg-card border rounded-xl shadow-xl animate-scaleIn"><div className="p-2 sm:p-3 border-b flex items-center justify-between"><h4 className="font-bold text-xs sm:text-sm" style={FB}>Notifications</h4><Button variant="ghost" size="sm" className="text-[10px] sm:text-xs" onClick={() => { s.markAllRead(); toast({ title: 'All read' }); }}>Mark all read</Button></div>{s.notifs.length === 0 ? <p className="p-4 text-xs sm:text-sm text-muted-foreground text-center">No notifications</p> : s.notifs.slice(0, 8).map(n => (<div key={n.id} className={`p-2 sm:p-3 border-b last:border-0 ${n.read ? '' : 'bg-[#006233]/5'}`}><p className="text-xs sm:text-sm font-medium">{n.title}</p><p className="text-[10px] sm:text-xs text-muted-foreground">{n.text}</p><p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{new Date(n.time).toLocaleString()}</p></div>))}<div className="p-2 text-center"><button onClick={() => setNotifOpen(false)} className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground">Close</button></div></div>)}

      {/* Main content */}
      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 sm:py-6 pb-16 sm:pb-6">{renderView()}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#004D25] to-[#002510] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="col-span-2 md:col-span-1"><div className="flex items-center gap-2 mb-3 sm:mb-4"><div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs sm:text-sm" style={FH}>B</div><span className="font-bold text-sm sm:text-lg" style={FH}>Bachat Bazar</span></div><p className="text-xs sm:text-sm opacity-80 leading-relaxed">Pakistan&apos;s #1 Online Marketplace. Quality products at the best prices with nationwide delivery.</p><div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4"><a href="#" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Facebook size={12} className="sm:w-[14px]"/></a><a href="#" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Instagram size={12} className="sm:w-[14px]"/></a><a href="#" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Twitter size={12} className="sm:w-[14px]"/></a><a href="#" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Youtube size={12} className="sm:w-[14px]"/></a></div></div>
            <div><h4 className="font-bold text-xs sm:text-base mb-2 sm:mb-3" style={FH}>Quick Links</h4><div className="space-y-1 sm:space-y-2">{navLinks.map(l => <button key={l.href} onClick={() => navigate(l.href)} className="block text-[11px] sm:text-sm opacity-80 hover:opacity-100 transition">{l.label}</button>)}<button onClick={() => navigate(makeHash('faq'))} className="block text-[11px] sm:text-sm opacity-80 hover:opacity-100 transition">FAQ</button><button onClick={() => navigate(makeHash('blog'))} className="block text-[11px] sm:text-sm opacity-80 hover:opacity-100 transition">Blog</button></div></div>
            <div><h4 className="font-bold text-xs sm:text-base mb-2 sm:mb-3" style={FH}>Categories</h4><div className="space-y-1 sm:space-y-2">{s.categories().map(c => <button key={c.id} onClick={() => navigate(makeHash('shop', undefined, { category: c.id }))} className="block text-[11px] sm:text-sm opacity-80 hover:opacity-100 transition">{c.name}</button>)}</div></div>
            <div><h4 className="font-bold text-xs sm:text-base mb-2 sm:mb-3" style={FH}>Contact</h4><div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm opacity-80"><div className="flex items-center gap-1.5 sm:gap-2"><Phone size={12} className="sm:w-[14px]"/>+92 42 3576 1234</div><div className="flex items-center gap-1.5 sm:gap-2"><Mail size={12} className="sm:w-[14px]"/>support@bachatbazar.pk</div><div className="flex items-center gap-1.5 sm:gap-2"><MapPin size={12} className="sm:w-[14px]"/>Gulberg III, Lahore</div></div><div className="mt-3 sm:mt-4"><h5 className="font-medium text-[10px] sm:text-xs mb-1.5 sm:mb-2">We Accept</h5><div className="flex gap-1.5 sm:gap-2 flex-wrap">{['JazzCash','EasyPaisa','Visa','COD'].map(m => <span key={m} className="text-[10px] sm:text-xs bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{m}</span>)}</div></div></div>
          </div>
          <div className="border-t border-white/10 mt-4 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs opacity-60"><p>&copy; 2026 Bachat Bazar. All rights reserved.</p><p>Made with &#10084;&#65039; in Pakistan</p></div>
        </div>
      </footer>

      {/* ─── DRAWERS ─── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}><SheetContent className="w-full sm:max-w-md flex flex-col"><SheetHeader><SheetTitle style={FH}>Cart ({cartCount})</SheetTitle><SheetDescription>Your shopping cart</SheetDescription></SheetHeader>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 py-4">{cartProducts.length === 0 ? <div className="text-center py-10 text-muted-foreground"><ShoppingCart size={40} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Cart is empty</p></div> : cartProducts.map(({ id, qty, product: p }) => p && (<div key={id} className="flex gap-3 p-3 rounded-xl border"><div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><p className="text-xs text-[#C5A028]">{p.brand}</p><div className="flex items-center justify-between mt-1"><PriceDisplay price={p.price} oldPrice={p.oldPrice}/><div className="flex items-center border rounded"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => s.setQty(id, Math.max(1, qty - 1))}><Minus size={10}/></Button><span className="text-xs font-semibold w-6 text-center">{qty}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => s.setQty(id, qty + 1)}><Plus size={10}/></Button></div></div></div><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 shrink-0" onClick={() => { s.removeFromCart(id); toast({ title: 'Removed' }); }}><Trash2 size={12}/></Button></div>))}</div>
      {cartProducts.length > 0 && (<SheetFooter className="border-t pt-4 space-y-3"><div className="space-y-1 w-full"><div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{cartTotals.totalDisplay}</span></div><p className="text-xs text-muted-foreground">Shipping & tax calculated at checkout</p></div><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-3" onClick={() => { setCartOpen(false); navigate(makeHash('cart')); }}>View Cart</Button><Button variant="outline" className="w-full" onClick={() => { setCartOpen(false); navigate(makeHash('checkout')); }}>Checkout</Button></SheetFooter>)}</SheetContent></Sheet>

      <Sheet open={wishOpen} onOpenChange={setWishOpen}><SheetContent className="w-full sm:max-w-md flex flex-col"><SheetHeader><SheetTitle style={FH}>Wishlist ({wishCount})</SheetTitle><SheetDescription>Products you love</SheetDescription></SheetHeader>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 py-4">{s.wishlist.length === 0 ? <div className="text-center py-10 text-muted-foreground"><Heart size={40} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Wishlist is empty</p></div> : s.wishlist.map(id => { const p = s.getProduct(id); return p ? (<div key={id} className="flex gap-3 p-3 rounded-xl border"><div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><PriceDisplay price={p.price} oldPrice={p.oldPrice}/></div><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 shrink-0" onClick={() => { s.toggleWishlist(id); toast({ title: 'Removed' }); }}><Trash2 size={12}/></Button></div>) : null; })}</div>
      {s.wishlist.length > 0 && <SheetFooter><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => { setWishOpen(false); navigate(makeHash('wishlist')); }}>View All</Button></SheetFooter>}</SheetContent></Sheet>

      <Sheet open={mobileMenu} onOpenChange={setMobileMenu}><SheetContent className="w-full sm:max-w-xs flex flex-col" side="left"><SheetHeader><SheetTitle style={FH}><span className="gradient-text">Bachat Bazar</span></SheetTitle><SheetDescription>Pakistan&apos;s #1 Marketplace</SheetDescription></SheetHeader>
      <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-1 py-4">{[...navLinks, { href: makeHash('faq'), label: 'FAQ' }, { href: makeHash('blog'), label: 'Blog' }].map(l => (<button key={l.href} onClick={() => { navigate(l.href); setMobileMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition">{l.label}</button>))}
      <Separator className="my-3"/>
      <p className="px-3 text-xs text-muted-foreground font-medium mb-2">Categories</p>
      {s.categories().map(c => { const Icon = getCatIcon(c.icon); return (<button key={c.id} onClick={() => { navigate(makeHash('shop', undefined, { category: c.id })); setMobileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition"><Icon size={14}/>{c.name}</button>); })}
      <Separator className="my-3"/>
      <button onClick={() => { navigate(makeHash('admin')); setMobileMenu(false); }} className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white rounded-lg px-3 py-2.5 text-sm font-bold flex items-center gap-2 mb-2"><Settings size={14}/>Admin Panel</button>
      <div className="flex items-center gap-2 px-3">
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => { s.toggleTheme(); }}>{s.theme === 'dark' ? <><Sun size={14} className="mr-1"/>Light Mode</> : <><Moon size={14} className="mr-1"/>Dark Mode</>}</Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => { setMobileMenu(false); setAuthOpen(true); }}><User size={14} className="mr-1"/>Account</Button>
      </div>
      </nav></SheetContent></Sheet>

      <Dialog open={!!quickView} onOpenChange={() => setQuickView(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="sr-only">Quick View</DialogTitle><DialogDescription className="sr-only">Product quick view</DialogDescription></DialogHeader>
      {quickView && (<div className="flex flex-col md:flex-row gap-6"><div className="md:w-1/2 aspect-square rounded-xl overflow-hidden bg-muted"><ProductImage src={quickView.images[0]} alt={quickView.name} seed={quickView.imageId} className="w-full h-full object-cover"/></div><div className="md:w-1/2 space-y-3"><p className="text-sm text-[#C5A028] font-semibold" style={FB}>{quickView.brand}</p><h3 className="text-xl font-bold" style={FH}>{quickView.name}</h3><div className="flex items-center gap-2"><StarRating rating={quickView.rating}/><span className="text-xs text-muted-foreground">({quickView.reviews})</span></div><PriceDisplay price={quickView.price} oldPrice={quickView.oldPrice}/><p className="text-sm text-muted-foreground line-clamp-3">{quickView.description}</p><div className="flex gap-2 pt-2"><Button className="flex-1 bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => { s.addToCart(quickView.id); toast({ title: 'Added to cart' }); }}><ShoppingCart size={14} className="mr-1"/>Add to Cart</Button><Button variant="outline" onClick={() => { setQuickView(null); navigate(makeHash('product', String(quickView.id))); }}>View Details</Button></div></div></div>)}</DialogContent></Dialog>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle style={FH}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle><DialogDescription>{authMode === 'login' ? 'Welcome back to Bachat Bazar' : 'Join Bachat Bazar today'}</DialogDescription></DialogHeader>
      <div className="space-y-3">{authMode === 'register' && <div><Label>Name</Label><Input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Muhammad Ali"/></div>}<div><Label>Email</Label><Input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com"/></div><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold" onClick={handleAuth}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</Button><p className="text-center text-xs text-muted-foreground">{authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}<button className="text-[#006233] dark:text-[#00A651] font-medium" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Sign Up' : 'Sign In'}</button></p></div></DialogContent></Dialog>

      {showBackTop && (<button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white shadow-lg flex items-center justify-center hover:scale-110 transition animate-scaleIn"><ArrowUp size={16} className="sm:w-[18px] sm:h-[18px]"/></button>)}

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)] safe-bottom">
        <div className="flex items-center justify-around h-14">
          <button onClick={() => navigate('#/')} className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition ${route.view === '' || route.view === 'home' ? 'text-[#006233] dark:text-[#00A651]' : 'text-gray-400'}`}><Home size={18}/><span className="text-[9px] font-medium">Home</span></button>
          <button onClick={() => navigate('#/shop')} className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition ${route.view === 'shop' ? 'text-[#006233] dark:text-[#00A651]' : 'text-gray-400'}`}><Store size={18}/><span className="text-[9px] font-medium">Shop</span></button>
          <button onClick={() => navigate('#/deals')} className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition ${route.view === 'deals' ? 'text-[#006233] dark:text-[#00A651]' : 'text-gray-400'}`}><Flame size={18}/><span className="text-[9px] font-medium">Deals</span></button>
          <button onClick={() => setCartOpen(true)} className="flex flex-col items-center justify-center gap-0.5 w-16 h-full transition text-gray-400 relative"><ShoppingCart size={18}/>{cartCount > 0 && <span className="absolute top-1 right-2 w-4 h-4 bg-[#C5A028] text-white text-[8px] rounded-full flex items-center justify-center font-bold">{cartCount}</span>}<span className="text-[9px] font-medium">Cart</span></button>
          <button onClick={() => s.user ? navigate(makeHash('account')) : setMobileMenu(true)} className="flex flex-col items-center justify-center gap-0.5 w-16 h-full transition text-gray-400"><User size={18}/><span className="text-[9px] font-medium">More</span></button>
        </div>
      </nav>

      {!cookieConsent && (<div className="safe-bottom fixed bottom-14 sm:bottom-0 left-0 right-0 z-50 bg-card border-t p-2.5 sm:p-4 shadow-lg animate-fadeUp"><div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"><div className="flex items-center gap-2 sm:gap-3"><Cookie size={16} className="text-[#C5A028] shrink-0 sm:w-[20px]"/><p className="text-[10px] sm:text-sm text-muted-foreground">We use cookies to enhance your experience. By continuing, you agree to our cookie policy.</p></div><div className="flex gap-2 shrink-0 w-full sm:w-auto"><Button variant="outline" size="sm" className="flex-1 sm:flex-none text-[10px] sm:text-sm" onClick={() => { setCookieConsent(true); localStorage.setItem('bb_cookies', '1'); }}>Decline</Button><Button size="sm" className="flex-1 sm:flex-none bg-gradient-to-r from-[#006233] to-[#00A651] text-white text-[10px] sm:text-sm" onClick={() => { setCookieConsent(true); localStorage.setItem('bb_cookies', '1'); }}>Accept</Button></div></div></div>)}
    </div>
  );
}

// ─── SIMPLER VIEW COMPONENTS ───

function CartView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); const { toast } = useToast();
  const cartProducts = s.cart.map(i => ({ ...i, product: s.getProduct(i.id) }));
  const totals = s.cartTotals();
  return (
    <div className="animate-fadeUp space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-2xl font-bold" style={FH}>Shopping Cart</h2>
      {cartProducts.length === 0 ? <div className="text-center py-16 sm:py-20"><ShoppingCart size={36} className="mx-auto mb-3 opacity-30 sm:w-[48px]"/><p className="text-sm sm:text-lg font-medium">Your cart is empty</p><Button className="mt-3 sm:mt-4 bg-gradient-to-r from-[#006233] to-[#00A651] text-white text-sm" onClick={() => navigate(makeHash('shop'))}>Start Shopping</Button></div> :
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-3">{cartProducts.map(({ id, qty, product: p }) => p && (<Card key={id} className="p-2.5 sm:p-4 flex gap-2 sm:gap-4"><div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted shrink-0"><ProductImage src={p.images[0]} alt={p.name} seed={p.imageId} className="w-full h-full object-cover"/></div><div className="flex-1 space-y-0.5 sm:space-y-1"><p className="font-medium text-xs sm:text-base truncate" style={FB}>{p.name}</p><p className="text-[10px] sm:text-xs text-[#C5A028]">{p.brand}</p><PriceDisplay price={p.price} oldPrice={p.oldPrice}/><div className="flex items-center gap-1.5 sm:gap-2 mt-1"><div className="flex items-center border rounded"><Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => s.setQty(id, Math.max(1, qty - 1))}><Minus size={10} className="sm:w-[12px]"/></Button><span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{qty}</span><Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => s.setQty(id, qty + 1)}><Plus size={10} className="sm:w-[12px]"/></Button></div><Button variant="ghost" size="sm" className="text-red-500 h-6 text-[10px] sm:text-sm" onClick={() => { s.removeFromCart(id); toast({ title: 'Removed' }); }}><Trash2 size={12} className="mr-0.5 sm:w-[14px]"/>Remove</Button></div></div></Card>))}</div>
        <Card className="lg:w-80 p-3 sm:p-6 space-y-3 sm:space-y-4 h-fit"><h3 className="font-bold text-sm sm:text-base" style={FH}>Order Summary</h3><div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{totals.subDisplay}</span></div><div className="flex justify-between text-green-600"><span>Discount</span><span>-{totals.discountDisplay}</span></div><div className="flex justify-between"><span>Shipping</span><span>{totals.shipDisplay}</span></div><div className="flex justify-between"><span>Tax (8%)</span><span>{totals.taxDisplay}</span></div><Separator/><div className="flex justify-between font-bold text-sm sm:text-base"><span>Total</span><span className="text-[#006233] dark:text-[#00A651]">{totals.totalDisplay}</span></div></div><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-2 sm:py-3 text-sm" onClick={() => navigate(makeHash('checkout'))}>Proceed to Checkout</Button></Card>
      </div>}
    </div>
  );
}

function CheckoutView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); const { toast } = useToast();
  const [payMethod, setPayMethod] = useState('cod'); const totals = s.cartTotals();
  const address = s.addresses[0];
  const handlePlace = () => { if (s.cart.length === 0) return; const order = s.placeOrder(payMethod, address || { id:1, label:'Home', name:'', line:'', city:'', state:'', zip:'', country:'Pakistan', phone:'', default:true }); toast({ title: 'Order placed!', description: `Order #${order.id}` }); navigate(makeHash('orders')); };
  return (
    <div className="animate-fadeUp space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-2xl font-bold" style={FH}>Checkout</h2>
      {s.cart.length === 0 ? <p className="text-muted-foreground">Your cart is empty</p> :
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1 space-y-3 sm:space-y-4">
          <Card className="p-3 sm:p-4 space-y-2 sm:space-y-3"><h3 className="font-bold text-sm sm:text-base" style={FH}>Delivery Address</h3>{address ? <div className="text-xs sm:text-sm space-y-1"><p className="font-medium">{address.name || 'Home'}</p><p>{address.line}, {address.city}, {address.state} {address.zip}</p><p>{address.phone}</p></div> : <p className="text-xs sm:text-sm text-muted-foreground">No address set</p>}</Card>
          <Card className="p-3 sm:p-4 space-y-2 sm:space-y-3"><h3 className="font-bold text-sm sm:text-base" style={FH}>Payment Method</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{PAYMENTS.map(p => <button key={p.id} onClick={() => setPayMethod(p.id)} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border text-left transition ${payMethod === p.id ? 'border-[#006233] bg-[#006233]/5' : 'hover:bg-muted'}`}><CreditCard size={16} className="text-[#006233] sm:w-[18px]"/><div><p className="text-xs sm:text-sm font-medium" style={FB}>{p.name}</p></div></button>)}</div></Card>
        </div>
        <Card className="lg:w-80 p-3 sm:p-6 space-y-3 sm:space-y-4 h-fit"><h3 className="font-bold text-sm sm:text-base" style={FH}>Order Summary</h3><div className="space-y-1 text-xs sm:text-sm">{s.cart.map(i => { const p = s.getProduct(i.id); return p ? <div key={i.id} className="flex justify-between"><span className="truncate mr-2">{p.name.slice(0,25)} x{i.qty}</span><span>{s.money(p.price * i.qty)}</span></div> : null; })}</div><Separator/><div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm"><div className="flex justify-between font-bold text-sm sm:text-base"><span>Total</span><span className="text-[#006233]">{totals.totalDisplay}</span></div></div><Button className="w-full bg-gradient-to-r from-[#006233] to-[#00A651] text-white font-bold py-2 sm:py-3 text-sm" onClick={handlePlace}>Place Order</Button></Card>
      </div>}
    </div>
  );
}

function WishlistView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore();
  const products = s.wishlist.map(id => s.getProduct(id)).filter(Boolean) as Product[];
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Wishlist ({products.length})</h2>{products.length === 0 ? <div className="text-center py-16 sm:py-20"><Heart size={36} className="mx-auto mb-3 opacity-30 sm:w-[48px]"/><p className="text-sm sm:text-lg font-medium">Your wishlist is empty</p></div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{products.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div>}</div>);
}

function CompareView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); const products = s.compare.map(id => s.getProduct(id)).filter(Boolean) as Product[];
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Compare ({products.length})</h2>{products.length < 2 ? <p className="text-sm text-muted-foreground">Add at least 2 products to compare</p> : <div className="overflow-x-auto -mx-2 px-2"><table className="w-full text-xs sm:text-sm"><thead><tr><th className="text-left p-1.5 sm:p-2">Feature</th>{products.map(p => <th key={p.id} className="p-1.5 sm:p-2 text-center">{p.name.slice(0,15)}</th>)}</tr></thead><tbody><tr><td className="p-1.5 sm:p-2 font-medium">Price</td>{products.map(p => <td key={p.id} className="p-1.5 sm:p-2 text-center text-[#006233] font-bold">{s.money(p.price)}</td>)}</tr><tr><td className="p-1.5 sm:p-2 font-medium">Rating</td>{products.map(p => <td key={p.id} className="p-1.5 sm:p-2 text-center"><StarRating rating={p.rating} size={12}/></td>)}</tr><tr><td className="p-1.5 sm:p-2 font-medium">Brand</td>{products.map(p => <td key={p.id} className="p-1.5 sm:p-2 text-center">{p.brand}</td>)}</tr></tbody></table></div>}</div>);
}

function OrdersView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore();
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>My Orders</h2>{s.orders.length === 0 ? <div className="text-center py-16 sm:py-20"><Package size={36} className="mx-auto mb-3 opacity-30 sm:w-[48px]"/><p className="text-sm sm:text-lg font-medium">No orders yet</p><Button className="mt-3 sm:mt-4 bg-gradient-to-r from-[#006233] to-[#00A651] text-white text-sm" onClick={() => navigate(makeHash('shop'))}>Start Shopping</Button></div> : <div className="space-y-2 sm:space-y-3">{s.orders.map(o => (<Card key={o.id} className="p-3 sm:p-4 space-y-1.5 sm:space-y-2"><div className="flex items-center justify-between"><span className="font-bold text-sm">#{o.id}</span><Badge className={`${o.status === 'Delivered' ? 'bg-green-500' : o.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'} text-white text-[10px] sm:text-sm`}>{o.status}</Badge></div><p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</p><div className="space-y-0.5 sm:space-y-1">{o.items.map((it,i) => <p key={i} className="text-xs sm:text-sm">{it.name?.slice(0,30)} x{it.qty} — {s.money((it.price||0)*it.qty)}</p>)}</div><div className="flex justify-between font-bold pt-1 border-t text-sm"><span>Total</span><span className="text-[#006233]">{o.totals.totalDisplay}</span></div></Card>))}</div>}</div>);
}

function AccountView({ navigate }: { navigate: (h: string) => void }) {
  const s = useStore(); if (!s.user) return <div className="text-center py-20"><p className="text-lg">Please sign in</p><Button className="mt-4 bg-gradient-to-r from-[#006233] to-[#00A651] text-white" onClick={() => navigate('#/')}>Go Home</Button></div>;
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>My Account</h2><Card className="p-4 sm:p-6 space-y-2 sm:space-y-3"><div className="flex items-center gap-3 sm:gap-4"><div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#006233]/10 flex items-center justify-center"><User size={18} className="text-[#006233] sm:w-[24px]"/></div><div><p className="font-bold text-sm sm:text-lg" style={FB}>{s.user.name}</p><p className="text-xs sm:text-sm text-muted-foreground">{s.user.email}</p><p className="text-[10px] sm:text-xs text-muted-foreground">Joined {new Date(s.user.joined).toLocaleDateString()}</p></div></div><Separator/><div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"><div className="text-center"><p className="text-xl sm:text-2xl font-bold text-[#006233]" style={FH}>{s.orders.length}</p><p className="text-[10px] sm:text-xs text-muted-foreground">Orders</p></div><div className="text-center"><p className="text-xl sm:text-2xl font-bold text-pink-500" style={FH}>{s.wishlist.length}</p><p className="text-[10px] sm:text-xs text-muted-foreground">Wishlist</p></div><div className="text-center"><p className="text-xl sm:text-2xl font-bold text-[#C5A028]" style={FH}>{s.rewards}</p><p className="text-[10px] sm:text-xs text-muted-foreground">Rewards</p></div><div className="text-center"><p className="text-xl sm:text-2xl font-bold text-green-500" style={FH}>{s.cartCount()}</p><p className="text-[10px] sm:text-xs text-muted-foreground">In Cart</p></div></div></Card><Button variant="outline" className="text-sm" onClick={() => { s.logout(); navigate('#/'); }}>Sign Out</Button></div>);
}

function DealsView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const deals = s.allProducts().filter(p => p.oldPrice > p.price);
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Deals & Offers</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{deals.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></div>);
}

function NewView({ onQuickView, navigate }: { onQuickView: (p: Product) => void; navigate: (h: string) => void }) {
  const s = useStore(); const prods = s.allProducts().filter(p => p.isNew);
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>New Arrivals</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">{prods.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView}/>)}</div></div>);
}

function AboutView() {
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6 max-w-3xl mx-auto"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>About Bachat Bazar</h2><div className="prose dark:prose-invert max-w-none"><p className="text-xs sm:text-base leading-relaxed" style={FB}>Bachat Bazar is Pakistan&apos;s premier online marketplace, bringing you the best deals on Health & Beauty, Grocery, Electronics, Fashion, Home Appliances, and much more. Founded with a mission to make quality products accessible to every Pakistani household at unbeatable prices, we have grown to serve thousands of happy customers nationwide.</p><p className="leading-relaxed" style={FB}>With our Cash on Delivery option, free delivery on orders over Rs 25,000, and a 7-day return policy, shopping with Bachat Bazar is not just convenient — it&apos;s a promise of quality and trust. Our dedicated team works around the clock to ensure your orders reach you safely and on time.</p><p className="leading-relaxed" style={FB}>We believe in the spirit of &ldquo;Bachat&rdquo; — saving — and we pass every possible discount on to you. Whether you&apos;re shopping for daily groceries or the latest smartphones, Bachat Bazar is your one-stop destination for value and variety.</p></div></div>);
}

function ContactView() {
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6 max-w-3xl mx-auto"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Contact Us</h2><Card className="p-3 sm:p-6 space-y-3 sm:space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"><div className="flex items-center gap-3"><Phone size={20} className="text-[#006233]"/><div><p className="font-medium" style={FB}>Phone</p><p className="text-sm text-muted-foreground">+92 42 3576 1234</p></div></div><div className="flex items-center gap-3"><Mail size={20} className="text-[#006233]"/><div><p className="font-medium" style={FB}>Email</p><p className="text-sm text-muted-foreground">support@bachatbazar.pk</p></div></div><div className="flex items-center gap-3"><MapPin size={20} className="text-[#006233]"/><div><p className="font-medium" style={FB}>Address</p><p className="text-sm text-muted-foreground">Gulberg III, Lahore, Pakistan</p></div></div><div className="flex items-center gap-3"><Clock size={20} className="text-[#006233]"/><div><p className="font-medium" style={FB}>Hours</p><p className="text-sm text-muted-foreground">Mon-Sat: 9AM - 9PM</p></div></div></div></Card></div>);
}

function FAQView() {
  const faqs = [
    { q: 'What is your return policy?', a: 'We offer a 7-day return policy on all products. Items must be in original packaging and unused condition.' },
    { q: 'Do you offer Cash on Delivery?', a: 'Yes! Cash on Delivery is available nationwide across Pakistan. No advance payment required.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available for Rs 250.' },
    { q: 'Is free shipping available?', a: 'Yes, free standard shipping on all orders above Rs 25,000.' },
    { q: 'Are all products genuine?', a: 'Absolutely! We guarantee 100% authentic products sourced directly from authorized distributors.' },
  ];
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6 max-w-3xl mx-auto"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Frequently Asked Questions</h2><Accordion type="single" collapsible>{faqs.map((f, i) => <AccordionItem key={i} value={`q${i}`}><AccordionTrigger style={FB}>{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground" style={FB}>{f.a}</AccordionContent></AccordionItem>)}</Accordion></div>);
}

function BlogView({ navigate }: { navigate: (h: string) => void }) {
  return (<div className="animate-fadeUp space-y-4 sm:space-y-6"><h2 className="text-lg sm:text-2xl font-bold" style={FH}>Blog</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">{BLOGS.map(b => (<Card key={b.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"><div className="aspect-video overflow-hidden"><ProductImage src={U(b.img, 400)} alt={b.title} seed={b.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/></div><div className="p-4 space-y-2"><p className="text-xs text-[#C5A028] font-medium">{b.date} &middot; {b.author}</p><h3 className="font-bold" style={FB}>{b.title}</h3><p className="text-sm text-muted-foreground line-clamp-3">{b.excerpt}</p></div></Card>))}</div></div>);
}
