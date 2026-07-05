/* ============================================================
   Lumière — Views (part 1)
   Shared components, Home, Shop, Product Detail, Cart/Wishlist/Compare pages
   ============================================================ */

const Views = {};

/* ---------- Shared component: product card ---------- */
Views.productCard = function(p, opts={}) {
  const inWish = Store.inWishlist(p.id);
  const inCmp = Store.inCompare(p.id);
  const out = p.stock <= 0;
  const disc = p.oldPrice && p.oldPrice>p.price ? Math.round((1-p.price/p.oldPrice)*100) : 0;
  return `
  <div class="product-card group fade-up" data-id="${p.id}">
    <div class="card-img-wrap relative aspect-product">
      <a href="#/product/${p.id}" class="block h-full">
        ${UI.img(p.images[0], p.name, 'card-img w-full h-full object-cover', 'p'+p.id)}
      </a>
      ${disc?`<span class="absolute top-2 left-2 badge-discount">-${disc}%</span>`:''}
      ${p.isNew?`<span class="absolute top-2 ${disc?'left-16':'left-2'} badge-new text-[.7rem] font-bold px-2 py-1 rounded-lg">NEW</span>`:''}
      ${out?`<span class="absolute top-2 right-2 badge-stock-out text-[.7rem] font-bold px-2 py-1 rounded-lg">OUT OF STOCK</span>`:''}
      <!-- action buttons -->
      <button data-wish="${p.id}" class="card-action right-2 ${inWish?'active':''}" title="Wishlist">${UI.icon('heart','w-4 h-4')}</button>
      <button data-cmp="${p.id}" class="card-action right-12 ${inCmp?'active':''}" title="Compare">${UI.icon('git-compare','w-4 h-4')}</button>
      <!-- quick view -->
      <div class="card-quick p-3 glass-strong border-t border-white/10">
        <button data-quick="${p.id}" class="btn btn-ghost w-full py-2 text-sm">${UI.icon('eye','w-4 h-4')} Quick View</button>
      </div>
    </div>
    <div class="p-3 flex flex-col flex-1">
      <div class="flex items-center justify-between">
        <span class="text-[.7rem] font-semibold text-brand-500 uppercase tracking-wide">${p.brand}</span>
        <span class="text-[.7rem] ${out?'text-rose-500':'text-emerald-500'}">${out?'Out of stock':`In stock (${p.stock})`}</span>
      </div>
      <a href="#/product/${p.id}" class="font-medium text-sm mt-1 line-clamp-2 hover:text-brand-500 transition">${UI.escapeHtml(p.name)}</a>
      <div class="flex items-center gap-1 mt-1">
        ${UI.stars(p.rating,'w-3.5 h-3.5')}
        <span class="text-xs text-slate-400">(${p.reviews.toLocaleString()})</span>
      </div>
      <div class="flex items-end gap-2 mt-2">
        <span class="text-lg font-bold">${Store.money(p.price)}</span>
        ${p.oldPrice>p.price?`<span class="text-xs text-slate-400 line-through mb-0.5">${Store.money(p.oldPrice)}</span>`:''}
      </div>
      <button data-add="${p.id}" class="btn btn-primary w-full mt-3 py-2.5 text-sm ${out?'opacity-50 pointer-events-none':''}" ${out?'disabled':''}>
        ${UI.icon('shopping-cart','w-4 h-4')} Add to Cart
      </button>
    </div>
  </div>`;
};

/* grid wrapper */
Views.productGrid = function(list){ return `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 stagger">${list.map(p=>Views.productCard(p)).join('')}</div>`; };

Views.sectionHeading = function(title, sub, link){ return `
  <div class="flex items-end justify-between gap-4 mb-6" data-reveal>
    <div>
      ${sub?`<p class="text-brand-500 font-semibold text-sm uppercase tracking-wider">${sub}</p>`:''}
      <h2 class="font-display text-2xl md:text-3xl font-extrabold tracking-tight">${title}</h2>
    </div>
    ${link?`<a href="${link}" class="btn btn-ghost px-4 py-2 text-sm shrink-0">View all ${UI.icon('arrow-right','w-4 h-4')}</a>`:''}
  </div>`; };

/* ============================================================
   HOME PAGE
   ============================================================ */
Views.home = function() {
  const D = window.DATA;
  return `
  <div class="fade-in">
    <!-- HERO -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 -z-0">
        <div class="blob w-[40rem] h-[40rem] bg-brand-500/30 -top-40 -left-40 animate-float"></div>
        <div class="blob w-[30rem] h-[30rem] bg-accent-500/30 top-20 right-0" style="animation-delay:-3s"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 py-10 md:py-16 relative">
        <div class="grid lg:grid-cols-2 gap-8 items-center">
          <!-- text + slides -->
          <div class="relative min-h-[18rem]">
            <div id="heroSlides" class="relative h-full">
              ${D.HERO_SLIDES.map((s,i)=>`
                <div class="slide ${i===0?'active':''} ${i===0?'':'hidden'}">
                  <p class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-500 text-xs font-semibold mb-4"><span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span> Limited time offer</p>
                  <h1 class="font-display text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">${s.title}</h1>
                  <p class="text-slate-500 dark:text-slate-300 text-lg mt-4">${s.sub}</p>
                  <div class="flex flex-wrap gap-3 mt-7">
                    <a href="${s.route}" class="btn btn-primary px-7 py-3.5">${s.cta} ${UI.icon('arrow-right','w-5 h-5')}</a>
                    <a href="#/shop" class="btn btn-light px-7 py-3.5">Browse All</a>
                  </div>
                </div>`).join('')}
            </div>
            <div class="flex gap-2 mt-6" id="heroDots">
              ${D.HERO_SLIDES.map((_,i)=>`<button data-slide="${i}" class="slide-dots h-2 rounded-full ${i===0?'w-8 bg-brand-500':'w-2 bg-slate-300 dark:bg-slate-600'}"></button>`).join('')}
            </div>
          </div>
          <!-- featured visual -->
          <div class="relative hidden lg:block">
            <div class="relative rounded-[2rem] overflow-hidden shadow-card aspect-[4/3]">
              ${UI.img(D.U(D.HERO_SLIDES[0].img, 900), 'Featured products', 'w-full h-full object-cover','hero')}
            </div>
            <div class="absolute -bottom-5 -left-5 glass rounded-2xl border border-white/20 shadow-card p-4 flex items-center gap-3 animate-float">
              <span class="grid place-items-center w-12 h-12 rounded-xl bg-emerald-500 text-white">${UI.icon('truck','w-6 h-6')}</span>
              <div><p class="font-bold text-sm">Free Shipping</p><p class="text-xs text-slate-500">On orders over $50</p></div>
            </div>
            <div class="absolute -top-5 -right-5 glass rounded-2xl border border-white/20 shadow-card p-4 flex items-center gap-3" style="animation-delay:-2s">
              <span class="grid place-items-center w-12 h-12 rounded-xl bg-amber-500 text-white">${UI.icon('shield-check','w-6 h-6')}</span>
              <div><p class="font-bold text-sm">Secure Payment</p><p class="text-xs text-slate-500">100% protected</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST MARQUEE -->
    <section class="py-5 border-y border-slate-200/60 dark:border-slate-800 overflow-hidden">
      <div class="marquee whitespace-nowrap text-slate-400 font-semibold text-sm">
        ${['Apple','Nike','Samsung','Sony','Adidas','Zara','Rolex','Bose','Logitech','IKEA','Nintendo'].map(b=>`<span class="flex items-center gap-3">${UI.icon('star','w-4 h-4 text-amber-400')} ${b}</span>`).join('')}
        ${['Apple','Nike','Samsung','Sony','Adidas','Zara','Rolex','Bose','Logitech','IKEA','Nintendo'].map(b=>`<span class="flex items-center gap-3">${UI.icon('star','w-4 h-4 text-amber-400')} ${b}</span>`).join('')}
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="max-w-7xl mx-auto px-4 py-12">
      ${Views.sectionHeading('Shop by Category','Browse')}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4" data-reveal>
        ${Store.categories().map(c=>`
          <a href="#/shop?category=${c.id}" class="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-card">
            <div class="absolute inset-0 bg-gradient-to-br ${c.color} opacity-90"></div>
            ${UI.img(D.U(c.img,400), c.name, 'w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500','cat'+c.id)}
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div class="absolute inset-0 p-4 flex flex-col justify-end text-white">
              <span class="grid place-items-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur mb-2">${UI.icon(c.icon,'w-5 h-5')}</span>
              <span class="font-display font-bold">${c.name}</span>
            </div>
          </a>`).join('')}
      </div>
    </section>

    <!-- FLASH SALE COUNTDOWN -->
    <section class="max-w-7xl mx-auto px-4 pb-12">
      <div class="relative rounded-3xl overflow-hidden gradient-bg p-8 md:p-12 text-white shadow-glow" data-reveal>
        <div class="blob w-72 h-72 bg-white/20 -top-20 -right-20"></div>
        <div class="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">${UI.icon('zap','w-3.5 h-3.5')} FLASH SALE</span>
            <h2 class="font-display text-3xl md:text-4xl font-extrabold">Mega Deals, Ends Soon!</h2>
            <p class="text-white/80 mt-2">Up to 50% off selected items. Hurry before they're gone.</p>
          </div>
          <div class="flex gap-3">
            ${[['Hours','h'],['Mins','m'],['Secs','s']].map(([l,k])=>`
              <div class="glass-strong rounded-2xl text-center px-4 py-3 min-w-[4.5rem] text-slate-800">
                <div id="flash${k}" class="text-3xl font-extrabold tabular-nums">00</div>
                <div class="text-[.65rem] font-semibold text-slate-500 uppercase">${l}</div>
              </div>`).join('')}
          </div>
        </div>
        <a href="#/deals" class="btn btn-light mt-7 px-7 py-3 self-start">${UI.icon('flame','w-5 h-5')} Shop Flash Deals</a>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      ${Views.sectionHeading('Featured Products','Handpicked', '#/shop?filter=featured')}
      ${Views.productGrid(Store.allProducts().filter(p=>p.featured).slice(0,8))}
    </section>

    <!-- PROMO BANNERS -->
    <section class="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-5">
      ${[
        {t:'New Arrivals',d:'Fresh drops every week',r:'#/new',c:'from-brand-600 to-indigo-600',i:'sparkles',img:'1469334021218-15f7d4f88cd1'},
        {t:'Best Sellers',d:'Customer favorites',r:'#/shop?sort=best-selling',c:'from-rose-500 to-accent-500',i:'flame',img:'1542291026-7eec264c27ff'}
      ].map(b=>`
        <a href="${b.r}" class="group relative rounded-3xl overflow-hidden aspect-[16/8] shadow-card" data-reveal>
          <div class="absolute inset-0 bg-gradient-to-r ${b.c} opacity-90"></div>
          ${UI.img(D.U(b.img,700),'', 'w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700','ban'+b.t)}
          <div class="absolute inset-0 flex flex-col justify-center p-8 text-white">
            <span class="grid place-items-center w-12 h-12 rounded-xl bg-white/20 mb-3">${UI.icon(b.i,'w-6 h-6')}</span>
            <h3 class="font-display text-2xl font-extrabold">${b.t}</h3>
            <p class="text-white/80">${b.d}</p>
            <span class="btn btn-light mt-4 px-5 py-2.5 self-start text-sm">Explore ${UI.icon('arrow-right','w-4 h-4')}</span>
          </div>
        </a>`).join('')}
    </section>

    <!-- BEST SELLERS -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      ${Views.sectionHeading('Best Sellers','Top rated', '#/shop?sort=top-rated')}
      ${Views.productGrid(Store.allProducts().filter(p=>p.bestSeller).slice(0,8))}
    </section>

    <!-- STATS COUNTERS -->
    <section class="max-w-7xl mx-auto px-4 py-12">
      <div class="glass rounded-3xl border border-white/20 p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" data-reveal>
        ${[['50K+','Happy Customers','users'],['1M+','Orders Delivered','package'],['10K+','Products','box'],['4.8★','Average Rating','star']].map(([n,l,i])=>`
          <div>
            <span class="grid place-items-center w-12 h-12 mx-auto rounded-xl bg-brand-500/15 text-brand-500 mb-2">${UI.icon(i,'w-6 h-6')}</span>
            <div class="text-3xl font-extrabold font-display" data-count="${parseInt(n)}" data-prefix="${n.includes('+')?'+':n.includes('★')?'':''}" data-suffix="${n.includes('★')?'★':n.includes('K')?'K+':n.includes('M')?'M+':''}">0</div>
            <div class="text-sm text-slate-500">${l}</div>
          </div>`).join('')}
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      ${Views.sectionHeading('What Our Customers Say','Testimonials')}
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5" data-reveal>
        ${D.TESTIMONIALS.map(t=>`
          <div class="glass rounded-2xl border border-white/20 p-5 fade-up">
            ${UI.stars(t.rating)}
            <p class="text-sm mt-3 text-slate-600 dark:text-slate-300">"${UI.escapeHtml(t.text)}"</p>
            <div class="flex items-center gap-3 mt-4">
              <img src="${D.U(t.avatar,100)}" class="w-10 h-10 rounded-full object-cover" onerror="this.src='https://picsum.photos/seed/u${t.name}/80'">
              <div><p class="font-semibold text-sm">${t.name}</p><p class="text-xs text-emerald-500 flex items-center gap-1">${UI.icon('badge-check','w-3.5 h-3.5')} ${t.role}</p></div>
            </div>
          </div>`).join('')}
      </div>
    </section>

    <!-- BLOG -->
    <section class="max-w-7xl mx-auto px-4 py-12">
      ${Views.sectionHeading('From Our Blog','Insights', '#/blog')}
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5" data-reveal>
        ${D.BLOGS.map(b=>`
          <a href="#/blog/${b.id}" class="group glass rounded-2xl border border-white/20 overflow-hidden fade-up">
            <div class="aspect-[16/10] overflow-hidden">${UI.img(D.U(b.img,500),b.title,'w-full h-full object-cover group-hover:scale-110 transition-transform duration-500','blog'+b.id)}</div>
            <div class="p-4">
              <p class="text-xs text-slate-400">${b.date} · ${b.author}</p>
              <h3 class="font-display font-bold mt-1 group-hover:text-brand-500 transition">${b.title}</h3>
              <p class="text-sm text-slate-500 mt-1 line-clamp-2">${b.excerpt}</p>
            </div>
          </a>`).join('')}
      </div>
    </section>

    <!-- NEWSLETTER -->
    ${Views.newsletterSection()}
  </div>`;
};

Views.newsletterSection = function(){
  return `<section class="max-w-7xl mx-auto px-4 py-12">
    <div class="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-14 text-center" data-reveal>
      <div class="blob w-96 h-96 bg-brand-500/40 -top-40 left-1/4"></div>
      <div class="blob w-80 h-80 bg-accent-500/40 -bottom-40 right-1/4"></div>
      <div class="relative">
        ${UI.icon('mail-open','w-10 h-10 mx-auto text-brand-400')}
        <h2 class="font-display text-3xl md:text-4xl font-extrabold mt-3">Join Our Newsletter</h2>
        <p class="text-slate-300 mt-2 max-w-md mx-auto">Subscribe and get <strong>10% off</strong> your first order plus exclusive deals and early access.</p>
        <form id="newsletterForm" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6">
          <input type="email" required placeholder="Enter your email" class="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500">
          <button class="btn btn-primary px-6 py-3">${UI.icon('send','w-5 h-5')} Subscribe</button>
        </form>
      </div>
    </div>
  </section>`;
};

/* ============================================================
   SHOP PAGE — filters, sorting, pagination, infinite scroll toggle
   ============================================================ */
Views.shopState = { page:1, perPage:8, sort:'featured', view:'grid', filters:{category:null,brand:[],priceMax:200000,rating:0,inStock:false,discount:false}, query:null };

Views.shop = function(params={}) {
  // parse query string
  const q = {};
  if (params.q) { const u=new URLSearchParams(params); for(const [k,v] of u) q[k]=v; }
  if (q.category) Views.shopState.filters.category = q.category;
  if (q.sort) Views.shopState.sort = q.sort;
  if (q.q) Views.shopState.query = q.q; else Views.shopState.query = null;

  return `
  <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    ${q.category?`<div class="mb-4"><span class="text-sm text-slate-500">Home / Shop / </span><span class="text-sm font-semibold capitalize">${q.category}</span></div>`:''}
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="font-display text-3xl font-extrabold">${q.q?`Results for "${UI.escapeHtml(q.q)}"`:'All Products'}</h1>
        <p class="text-slate-500 text-sm mt-1" id="resultCount"></p>
      </div>
      <div class="flex items-center gap-2">
        <button id="mobileFilterBtn" class="btn btn-ghost px-4 py-2 text-sm lg:hidden">${UI.icon('sliders-horizontal','w-4 h-4')} Filters</button>
        <select id="sortSelect" class="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500">
          ${[['featured','Featured'],['price-low','Price: Low to High'],['price-high','Price: High to Low'],['newest','Newest'],['best-selling','Best Selling'],['top-rated','Top Rated']].map(([v,l])=>`<option value="${v}" ${Views.shopState.sort===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="grid lg:grid-cols-[18rem_1fr] gap-6">
      <!-- Filters -->
      <aside id="filters" class="lg:block">
        ${Views.filterPanel()}
      </aside>

      <!-- Products -->
      <div>
        <div id="shopGrid" class="min-h-[40vh]">${UI.skeletonGrid(8)}</div>
        <div id="pagination" class="mt-8 flex justify-center"></div>
      </div>
    </div>
  </div>`;
};

Views.filterPanel = function(){
  const D = window.DATA;
  const f = Views.shopState.filters;
  return `
  <div class="glass rounded-2xl border border-white/20 p-5 space-y-6 sticky top-32">
    <div class="flex items-center justify-between">
      <h3 class="font-display font-bold">Filters</h3>
      <button id="clearFilters" class="text-xs text-brand-500 hover:underline">Clear all</button>
    </div>

    <!-- Category -->
    <div>
      <p class="text-sm font-semibold mb-2">Category</p>
      <div class="space-y-1 max-h-44 overflow-auto pr-1">
        <label class="flex items-center gap-2 text-sm py-1 cursor-pointer"><input type="radio" name="fcat" value="" ${!f.category?'checked':''} class="accent-brand-500"> All</label>
        ${Store.categories().map(c=>`<label class="flex items-center gap-2 text-sm py-1 cursor-pointer"><input type="radio" name="fcat" value="${c.id}" ${f.category===c.id?'checked':''} class="accent-brand-500"> ${c.name}</label>`).join('')}
      </div>
    </div>

    <!-- Price -->
    <div>
      <div class="flex justify-between text-sm mb-2"><span class="font-semibold">Max Price</span><span id="priceVal" class="text-brand-500 font-bold">${Store.money(f.priceMax)}</span></div>
      <input type="range" min="0" max="200000" step="500" value="${f.priceMax}" id="priceRange" class="range w-full" style="--val:${(f.priceMax/200000)*100}%">
    </div>

    <!-- Rating -->
    <div>
      <p class="text-sm font-semibold mb-2">Rating</p>
      <div class="space-y-1">
        ${[4,3,2,1].map(r=>`<label class="flex items-center gap-2 text-sm py-1 cursor-pointer"><input type="radio" name="frating" value="${r}" ${f.rating===r?'checked':''} class="accent-brand-500"> ${UI.stars(r,'w-3.5 h-3.5')} & up</label>`).join('')}
        <label class="flex items-center gap-2 text-sm py-1 cursor-pointer"><input type="radio" name="frating" value="0" ${f.rating===0?'checked':''} class="accent-brand-500"> Any</label>
      </div>
    </div>

    <!-- Brand -->
    <div>
      <p class="text-sm font-semibold mb-2">Brand</p>
      <div class="space-y-1 max-h-40 overflow-auto pr-1">
        ${Array.from(new Set([...D.BRANDS, ...Store.allProducts().map(p=>p.brand)])).map(b=>`<label class="flex items-center gap-2 text-sm py-1 cursor-pointer"><input type="checkbox" value="${b}" class="accent-brand-500 brand-cb"> ${b}</label>`).join('')}
      </div>
    </div>

    <!-- Toggles -->
    <div class="space-y-2">
      <label class="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" id="fStock" ${f.inStock?'checked':''} class="accent-brand-500"> In stock only</label>
      <label class="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" id="fDiscount" ${f.discount?'checked':''} class="accent-brand-500"> On sale only</label>
    </div>
  </div>`;
};

Views.applyFilters = function(){
  const D = window.DATA;
  let list = [...Store.allProducts()];
  const f = Views.shopState.filters;
  if (Views.shopState.query) {
    const q = Views.shopState.query.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.includes(q));
  }
  if (f.category) list = list.filter(p => p.category === f.category);
  if (f.brand.length) list = list.filter(p => f.brand.includes(p.brand));
  list = list.filter(p => p.price <= f.priceMax);
  if (f.rating) list = list.filter(p => p.rating >= f.rating);
  if (f.inStock) list = list.filter(p => p.stock > 0);
  if (f.discount) list = list.filter(p => p.oldPrice && p.oldPrice > p.price);

  switch(Views.shopState.sort){
    case 'price-low': list.sort((a,b)=>a.price-b.price); break;
    case 'price-high': list.sort((a,b)=>b.price-a.price); break;
    case 'newest': list.sort((a,b)=>(b.isNew-a.isNew)); break;
    case 'best-selling': list.sort((a,b)=>b.reviews-a.reviews); break;
    case 'top-rated': list.sort((a,b)=>b.rating-a.rating); break;
    default: list.sort((a,b)=>(b.featured-a.featured));
  }
  return list;
};

Views.renderShopGrid = function(){
  const grid = document.getElementById('shopGrid'); if(!grid) return;
  const all = Views.applyFilters();
  const s = Views.shopState;
  const start = (s.page-1)*s.perPage;
  const pageItems = all.slice(start, start+s.perPage);
  const count = document.getElementById('resultCount');
  if(count) count.textContent = `${all.length} products found`;
  if (pageItems.length===0){
    grid.innerHTML = `<div class="text-center py-20"><span class="grid place-items-center w-20 h-20 mx-auto rounded-full bg-slate-200/60 text-slate-400 mb-4">${UI.icon('search-x','w-10 h-10')}</span><h3 class="font-display text-xl font-bold">No products found</h3><p class="text-slate-500 mt-1">Try adjusting your filters</p><button id="clearFilters2" class="btn btn-primary mt-5 px-6 py-2.5">Clear filters</button></div>`;
    document.getElementById('pagination').innerHTML='';
    UI.attachRipple(grid);
    return;
  }
  // skeleton flash then render
  grid.innerHTML = UI.skeletonGrid(Math.min(s.perPage,8));
  setTimeout(()=>{
    grid.innerHTML = Views.productGrid(pageItems);
    UI.icons(); UI.attachRipple(grid); Views.bindCardActions(grid);
    // pagination
    const pages = Math.ceil(all.length/s.perPage);
    const pg = document.getElementById('pagination');
    if (pages>1){
      pg.innerHTML = `<div class="flex items-center gap-1">${Array.from({length:pages}).map((_,i)=>{
        const n=i+1; return `<button class="page-btn w-10 h-10 rounded-xl text-sm font-semibold ${n===s.page?'btn btn-primary':'btn btn-ghost'}">${n}</button>`;
      }).join('')}</div>`;
      pg.querySelectorAll('.page-btn').forEach((b,i)=>b.onclick=()=>{ Views.shopState.page=i+1; Views.renderShopGrid(); window.scrollTo({top:0,behavior:'smooth'}); });
    } else pg.innerHTML='';
  }, 350);
};

/* bind product card actions (shared) */
Views.bindCardActions = function(root){
  root.querySelectorAll('[data-add]').forEach(b=> b.onclick = ()=> Store.addToCart(b.dataset.add,1));
  root.querySelectorAll('[data-wish]').forEach(b=> b.onclick = (e)=>{ e.preventDefault(); const on=Store.toggleWishlist(b.dataset.wish); b.classList.toggle('active',on); });
  root.querySelectorAll('[data-cmp]').forEach(b=> b.onclick = (e)=>{ e.preventDefault(); const on=Store.toggleCompare(b.dataset.cmp); b.classList.toggle('active',on); });
  root.querySelectorAll('[data-quick]').forEach(b=> b.onclick = (e)=>{ e.preventDefault(); UI.openModal('quickViewModal'); Views.quickView(b.dataset.quick); });
};

/* ============================================================
   PRODUCT DETAIL PAGE
   ============================================================ */
Views.productDetail = function(id){
  const p = Store.product(id);
  if(!p) return Views.notFound();
  Store.pushRecent(p.id);
  const D = window.DATA;
  const gallery = [p.imageId, ...Store.allProducts().filter(x=>x.category===p.category && x.id!==p.id).slice(0,3).map(x=>x.imageId)].slice(0,4);
  const related = p.related.map(rid=>Store.product(rid)).filter(Boolean);
  const fbt = Store.allProducts().filter(x=>x.category===p.category && x.id!==p.id).slice(0,2);
  const reviews = Views.mockReviews(p);
  const inWish = Store.inWishlist(p.id);
  const inCmp = Store.inCompare(p.id);
  const disc = p.oldPrice>p.price ? Math.round((1-p.price/p.oldPrice)*100) : 0;

  return `
  <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <div class="text-sm text-slate-500 mb-5"><a href="#/" class="hover:text-brand-500">Home</a> / <a href="#/shop?category=${p.category}" class="hover:text-brand-500 capitalize">${p.category}</a> / <span class="text-slate-700 dark:text-slate-300">${UI.escapeHtml(p.name)}</span></div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Gallery -->
      <div>
        <div class="zoom-container rounded-3xl overflow-hidden shadow-card aspect-product relative" id="zoomBox">
          ${UI.img(D.U(p.imageId,900), p.name, 'w-full h-full object-cover','pd'+p.id)}
          ${disc?`<span class="absolute top-4 left-4 badge-discount text-sm">-${disc}%</span>`:''}
          <button class="absolute top-4 right-4 glass-strong rounded-xl p-2" id="zoomToggle" title="Zoom">${UI.icon('zoom-in','w-5 h-5')}</button>
        </div>
        <div class="grid grid-cols-4 gap-3 mt-3">
          ${gallery.map((g,i)=>`<button class="thumb rounded-xl overflow-hidden border-2 ${i===0?'border-brand-500':'border-transparent'} aspect-product" data-img="${D.U(g,900)}" data-seed="g${p.id}${i}">${UI.img(D.U(g,400),'', 'w-full h-full object-cover hover:opacity-80','g'+p.id+i)}</button>`).join('')}
        </div>
        <div class="flex gap-2 mt-3">
          <button id="view360" class="btn btn-ghost flex-1 py-2.5 text-sm">${UI.icon('rotate-3d','w-4 h-4')} 360° View</button>
          <button id="viewVideo" class="btn btn-ghost flex-1 py-2.5 text-sm">${UI.icon('play-circle','w-4 h-4')} Product Video</button>
        </div>
      </div>

      <!-- Info -->
      <div>
        <div class="flex items-center gap-2">
          <span class="text-brand-500 font-semibold text-sm uppercase">${p.brand}</span>
          ${p.isNew?`<span class="badge-new text-[.7rem] font-bold px-2 py-0.5 rounded">NEW</span>`:''}
        </div>
        <h1 class="font-display text-3xl md:text-4xl font-extrabold mt-1">${UI.escapeHtml(p.name)}</h1>
        <div class="flex items-center gap-3 mt-3">
          ${UI.stars(p.rating,'w-5 h-5')}
          <span class="text-sm text-slate-500">${p.rating} · ${p.reviews.toLocaleString()} reviews</span>
          <span class="text-slate-300">|</span>
          <span class="text-sm ${p.stock>0?'text-emerald-500':'text-rose-500'} font-semibold">${p.stock>0?`In stock (${p.stock})`:'Out of stock'}</span>
        </div>

        <div class="flex items-end gap-3 mt-5">
          <span class="text-4xl font-extrabold">${Store.money(p.price)}</span>
          ${p.oldPrice>p.price?`<span class="text-lg text-slate-400 line-through mb-1">${Store.money(p.oldPrice)}</span><span class="badge-discount mb-1">Save ${disc}%</span>`:''}
        </div>
        <p class="text-xs text-slate-400 mt-1">SKU: ${p.sku}</p>

        <p class="text-slate-600 dark:text-slate-300 mt-5 leading-relaxed">${UI.escapeHtml(p.description)}</p>

        <!-- qty + actions -->
        <div class="flex flex-wrap items-center gap-3 mt-6">
          <div class="flex items-center glass rounded-xl border border-white/20 overflow-hidden">
            <button id="qtyMinus" class="px-4 py-3 hover:bg-brand-500/10">${UI.icon('minus','w-4 h-4')}</button>
            <input id="qtyInput" type="number" value="1" min="1" max="${p.stock||1}" class="w-12 text-center bg-transparent outline-none font-bold">
            <button id="qtyPlus" class="px-4 py-3 hover:bg-brand-500/10">${UI.icon('plus','w-4 h-4')}</button>
          </div>
          <button id="addCartBtn" class="btn btn-primary px-7 py-3.5 flex-1 min-w-[12rem]">${UI.icon('shopping-cart','w-5 h-5')} Add to Cart</button>
          <button id="buyNowBtn" class="btn btn-accent px-7 py-3.5">${UI.icon('zap','w-5 h-5')} Buy Now</button>
        </div>
        <div class="flex gap-2 mt-3">
          <button id="wishBtn" class="btn btn-ghost px-5 py-2.5 text-sm ${inWish?'text-accent-500':''}">${UI.icon('heart','w-4 h-4')} ${inWish?'Wishlisted':'Wishlist'}</button>
          <button id="cmpBtn" class="btn btn-ghost px-5 py-2.5 text-sm ${inCmp?'text-brand-500':''}">${UI.icon('git-compare','w-4 h-4')} Compare</button>
          <button id="shareBtn" class="btn btn-ghost px-5 py-2.5 text-sm">${UI.icon('share-2','w-4 h-4')} Share</button>
        </div>

        <!-- delivery info -->
        <div class="glass rounded-2xl border border-white/20 p-4 mt-6 grid grid-cols-2 gap-3 text-sm">
          ${[['truck','Free Delivery','2-4 days'],['rotate-ccw','30-Day Returns','No questions'],['shield-check','2-Year Warranty','Official'],['credit-card','Secure Payment','Encrypted']].map(([i,t,d])=>`
            <div class="flex items-center gap-2"><span class="grid place-items-center w-9 h-9 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon(i,'w-4 h-4')}</span><div><p class="font-semibold text-xs">${t}</p><p class="text-slate-400 text-xs">${d}</p></div></div>`).join('')}
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="mt-12">
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        ${[['desc','Description'],['specs','Specifications'],['feat','Features'],['reviews','Reviews ('+p.reviews+')'],['qa','Q & A']].map(([k,l],i)=>`<button class="tab-btn ${i===0?'active':''}" data-tab="${k}">${l}</button>`).join('')}
      </div>
      <div class="py-6" id="tabContent">
        ${Views.productTab('desc', p)}
      </div>
    </div>

    <!-- Frequently bought together -->
    <section class="mt-10">
      ${Views.sectionHeading('Frequently Bought Together','Bundle')}
      <div class="glass rounded-2xl border border-white/20 p-5 flex flex-wrap items-center gap-4" data-reveal>
        ${[p,...fbt].map((pr,i)=>`
          <div class="flex items-center gap-4">
            <a href="#/product/${pr.id}" class="w-24 h-24 rounded-xl overflow-hidden">${UI.img(D.U(pr.imageId,200),pr.name,'w-full h-full object-cover','fbt'+pr.id)}</a>
            <div class="min-w-[8rem]"><p class="text-sm font-medium line-clamp-1">${UI.escapeHtml(pr.name)}</p><p class="text-sm text-brand-500 font-bold">${Store.money(pr.price)}</p></div>
          </div>${i<[p,...fbt].length-1?`<span class="text-2xl text-slate-300">+</span>`:''}`).join('')}
        <div class="ml-auto text-right">
          <p class="text-sm text-slate-500">Total: <span class="text-lg font-bold text-brand-500">${Store.money([p,...fbt].reduce((s,x)=>s+x.price,0))}</span></p>
          <button id="fbtAdd" class="btn btn-primary px-5 py-2.5 text-sm mt-2">${UI.icon('shopping-cart','w-4 h-4')} Add all to cart</button>
        </div>
      </div>
    </section>

    <!-- Related -->
    ${related.length?`<section class="mt-10">${Views.sectionHeading('Related Products','You may also like')}<div class="grid grid-cols-2 md:grid-cols-4 gap-4">${related.slice(0,4).map(p=>Views.productCard(p)).join('')}</div></section>`:''}
  </div>`;
};

Views.productTab = function(key, p){
  const D = window.DATA;
  if(key==='desc') return `<p class="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">${UI.escapeHtml(p.description)}</p><p class="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mt-3">Experience uncompromising quality with the ${UI.escapeHtml(p.name)}. Designed and crafted to deliver outstanding performance, it combines premium materials with meticulous attention to detail. Backed by our satisfaction guarantee and dedicated customer support.</p>`;
  if(key==='specs') return `<table class="w-full max-w-2xl text-sm"><tbody>${Object.entries(p.specs).map(([k,v])=>`<tr class="border-b border-slate-100 dark:border-slate-800"><td class="py-3 font-semibold text-slate-500 w-1/3">${k}</td><td class="py-3">${UI.escapeHtml(String(v))}</td></tr>`).join('')}</tbody></table>`;
  if(key==='feat') return `<ul class="grid md:grid-cols-2 gap-3 max-w-3xl">${p.features.map(f=>`<li class="flex items-center gap-2 glass rounded-xl border border-white/20 px-4 py-3">${UI.icon('check-circle-2','w-5 h-5 text-emerald-500')} ${UI.escapeHtml(f)}</li>`).join('')}</ul>`;
  if(key==='reviews') return Views.reviewSection(p);
  if(key==='qa') return Views.qaSection(p);
  return '';
};

Views.mockReviews = function(p){
  const names=['Jordan Lee','Priya Sharma','Marco Rossi','Yuki Tanaka','Emma Wilson','Ahmed Hassan','Sofia Lopez','David Chen'];
  const texts=[
    'Exceeded my expectations! The quality is outstanding and delivery was super fast.',
    'Great value for money. Would definitely recommend to friends and family.',
    'Good product overall, minor packaging issue but the item itself is perfect.',
    'Absolutely love it! Looks even better in person than in the photos.',
    'Solid build quality and works exactly as described. Very happy with my purchase.',
    'Premium feel and excellent performance. Worth every penny.'
  ];
  const n = Math.min(6, Math.max(3, Math.round(p.reviews/200)));
  return Array.from({length:n}).map((_,i)=>({
    name: names[(p.id+i)%names.length],
    avatar: ['1494790108377-be9c29b29330','1500648767791-00dcc994a43e','1438761681033-6461ffad8d80','1507003211169-0a1dd7228f2d'][i%4],
    rating: Math.min(5, Math.max(3, Math.round(p.rating) - (i%2))),
    date: ['2 days ago','1 week ago','3 weeks ago','1 month ago'][i%4],
    text: texts[(p.id+i)%texts.length],
    helpful: 5+((p.id*i)%40),
    verified: true,
    images: i%3===0 ? [p.imageId] : []
  }));
};

Views.reviewSection = function(p){
  const reviews = Views.mockReviews(p);
  const dist = [5,4,3,2,1].map(r=>({r, count: Math.round(p.reviews * (r===5?0.62:r===4?0.22:r===3?0.1:r===2?0.04:0.02))}));
  return `
  <div class="grid lg:grid-cols-[18rem_1fr] gap-8">
    <div>
      <div class="glass rounded-2xl border border-white/20 p-5 text-center">
        <div class="text-5xl font-extrabold font-display">${p.rating}</div>
        ${UI.stars(p.rating,'w-5 h-5')}
        <p class="text-sm text-slate-500 mt-1">${p.reviews.toLocaleString()} reviews</p>
        <button id="writeReviewBtn" class="btn btn-primary w-full mt-4 py-2.5 text-sm">${UI.icon('pen-square','w-4 h-4')} Write a Review</button>
      </div>
      <div class="mt-4 space-y-1">
        ${dist.map(d=>`<div class="flex items-center gap-2 text-sm"><span class="w-3">${d.r}</span>${UI.icon('star','w-3 h-3 text-amber-400')}<div class="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div class="h-full bg-amber-400" style="width:${(d.count/p.reviews)*100}%"></div></div><span class="text-xs text-slate-400 w-10 text-right">${d.count}</span></div>`).join('')}
      </div>
    </div>
    <div class="space-y-4" id="reviewList">
      ${reviews.map(r=>`
        <div class="glass rounded-2xl border border-white/20 p-5">
          <div class="flex items-center gap-3">
            <img src="${window.DATA.U(r.avatar,80)}" class="w-10 h-10 rounded-full object-cover" onerror="this.src='https://picsum.photos/seed/rev${r.name}/80'">
            <div class="flex-1"><p class="font-semibold text-sm flex items-center gap-1">${r.name} ${r.verified?`<span class="text-[.65rem] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified</span>`:''}</p><p class="text-xs text-slate-400">${r.date}</p></div>
            ${UI.stars(r.rating,'w-4 h-4')}
          </div>
          <p class="text-sm mt-3 text-slate-600 dark:text-slate-300">${UI.escapeHtml(r.text)}</p>
          ${r.images.length?`<div class="flex gap-2 mt-3">${r.images.map(im=>`<img src="${window.DATA.U(im,120)}" class="w-16 h-16 rounded-lg object-cover" loading="lazy">`).join('')}</div>`:''}
          <div class="flex items-center gap-4 mt-3 text-sm text-slate-400">
            <button class="helpful-btn flex items-center gap-1 hover:text-brand-500" data-helpful>${UI.icon('thumbs-up','w-4 h-4')} Helpful (${r.helpful})</button>
            <button class="hover:text-brand-500">${UI.icon('flag','w-4 h-4')} Report</button>
          </div>
          <div class="mt-3 glass-strong rounded-xl border border-white/10 p-3 text-sm">
            <p class="font-semibold text-xs text-brand-500 mb-1">${UI.icon('store','w-3.5 h-3.5 inline')} Seller Reply</p>
            <p class="text-slate-500 text-xs">Thank you for your wonderful review! We're thrilled you love your ${UI.escapeHtml(p.name)}.</p>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
};

Views.qaSection = function(p){
  const qa=[['Is this product covered by warranty?','Yes, it comes with a 1-year official manufacturer warranty.'],['Does it support free returns?','Absolutely. You can return it within 30 days for a full refund.'],['Is the color exactly as shown?','Yes, the product photos are color-accurate. Slight variation may occur due to screen settings.']];
  return `<div class="max-w-3xl space-y-4">
    ${qa.map(([q,a])=>`<div class="glass rounded-2xl border border-white/20 p-5"><div class="flex gap-3"><span class="text-brand-500 font-bold">Q.</span><div><p class="font-semibold text-sm">${q}</p><div class="flex gap-3 mt-2"><span class="text-emerald-500 font-bold">A.</span><p class="text-sm text-slate-600 dark:text-slate-300">${a}</p></div></div></div></div>`).join('')}
    <div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-display font-bold mb-3">Ask a question</h3><textarea class="w-full p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-sm" rows="3" placeholder="Type your question…"></textarea><button class="btn btn-primary mt-2 px-5 py-2 text-sm" onclick="UI.toast('Question submitted! We will answer shortly.','success')">${UI.icon('send','w-4 h-4')} Submit Question</button></div>
  </div>`;
};

/* Quick view modal content */
Views.quickView = function(id){
  const p = Store.product(id); if(!p) return;
  const D = window.DATA;
  const inWish = Store.inWishlist(p.id);
  UI.openModal('quickViewModal', `
    <div class="grid md:grid-cols-2">
      <div class="aspect-product overflow-hidden">${UI.img(D.U(p.imageId,700),p.name,'w-full h-full object-cover','qv'+p.id)}</div>
      <div class="p-6">
        <button onclick="UI.closeModal('quickViewModal')" class="absolute top-3 right-3 p-2 rounded-xl hover:bg-slate-500/10">${UI.icon('x','w-5 h-5')}</button>
        <span class="text-brand-500 text-xs font-semibold uppercase">${p.brand}</span>
        <h2 class="font-display text-2xl font-bold mt-1">${UI.escapeHtml(p.name)}</h2>
        <div class="flex items-center gap-2 mt-2">${UI.stars(p.rating,'w-4 h-5')}<span class="text-sm text-slate-400">(${p.reviews})</span></div>
        <div class="flex items-end gap-2 mt-3"><span class="text-3xl font-extrabold">${Store.money(p.price)}</span>${p.oldPrice>p.price?`<span class="text-slate-400 line-through">${Store.money(p.oldPrice)}</span>`:''}</div>
        <p class="text-sm text-slate-500 mt-3 line-clamp-3">${UI.escapeHtml(p.description)}</p>
        <div class="flex gap-2 mt-5">
          <button onclick="Store.addToCart(${p.id},1);UI.closeModal('quickViewModal')" class="btn btn-primary flex-1 py-3">${UI.icon('shopping-cart','w-5 h-5')} Add to Cart</button>
          <button onclick="const o=Store.toggleWishlist(${p.id});this.classList.toggle('text-accent-500',o)" class="btn btn-ghost py-3 ${inWish?'text-accent-500':''}">${UI.icon('heart','w-5 h-5')}</button>
          <a href="#/product/${p.id}" onclick="UI.closeModal('quickViewModal')" class="btn btn-light py-3">${UI.icon('external-link','w-5 h-5')}</a>
        </div>
      </div>
    </div>`);
};

Views.notFound = function(){
  return `<div class="max-w-2xl mx-auto text-center py-24 px-4"><span class="grid place-items-center w-24 h-24 mx-auto rounded-full bg-rose-500/15 text-rose-500 mb-5">${UI.icon('search-x','w-12 h-12')}</span><h1 class="font-display text-4xl font-extrabold">404</h1><p class="text-slate-500 mt-2">Oops! The page you're looking for doesn't exist.</p><a href="#/" class="btn btn-primary mt-6 px-7 py-3">${UI.icon('home','w-5 h-5')} Back to Home</a></div>`;
};
