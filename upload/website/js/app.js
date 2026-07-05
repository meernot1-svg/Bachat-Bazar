/* ============================================================
   Bachat Bazar — App
   SPA router, drawer/modal rendering, event wiring, init
   ============================================================ */

const App = (() => {
  const D = window.DATA;
  let heroTimer = null, flashTimer = null, topTimer = null;
  let lastOrder = null;

  /* ---------- Router ---------- */
  function route() {
    closeAllPanels();
    let hash = location.hash.slice(1) || '/';
    const [path, query] = hash.split('?');
    const parts = path.split('/').filter(Boolean); // e.g. ['shop'] or ['product', '12']
    let view;
    const root = parts[0];

    switch(root) {
      case undefined: view = Views.home(); break;
      case 'shop': Views.shopState.page=1; view = Views.shop(query||''); break;
      case 'product': view = parts[1] ? Views.productDetail(parts[1]) : Views.notFound(); break;
      case 'cart': view = Views.cartPage(); break;
      case 'wishlist': view = Views.wishlistPage(); break;
      case 'compare': view = Views.comparePage(); break;
      case 'checkout': view = Views.checkout(); break;
      case 'order-success': view = lastOrder ? Views.orderSuccess(lastOrder) : Views.home(); break;
      case 'orders': Views.accountState.tab='orders'; view = Views.account(); break;
      case 'account': view = Views.account(); break;
      case 'admin': window.location.href='admin.html'; return;
      case 'deals': view = Views.deals(); break;
      case 'new': view = Views.newArrivals(); break;
      case 'about': view = Views.about(); break;
      case 'faq': view = Views.faq(); break;
      case 'contact': view = Views.contact(); break;
      case 'blog': view = parts[1] ? Views.blogPost(parts[1]) : Views.blog(); break;
      case 'privacy': view = Views.policy('privacy'); break;
      case 'terms': view = Views.policy('terms'); break;
      case 'shipping': view = Views.policy('shipping'); break;
      case 'returns': view = Views.policy('returns'); break;
      default: view = Views.notFound();
    }

    const app = document.getElementById('app');
    // page transition
    app.style.opacity = '0';
    setTimeout(()=>{
      app.innerHTML = view;
      app.style.transition = 'opacity .3s ease';
      app.style.opacity = '1';
      UI.icons();
      UI.attachRipple();
      UI.reveal();
      bindPageEvents();
      window.scrollTo({top:0,behavior:'auto'});
    }, 120);
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const f = document.createElement('footer');
    f.className = 'mt-16 glass border-t border-white/20';
    f.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div class="col-span-2 lg:col-span-1">
          <a href="#/" class="flex items-center gap-2 mb-3"><img src="logo.svg" alt="Bachat Bazar" class="w-9 h-9" /><span class="font-display text-xl font-extrabold">Bachat <span class="text-brand-500">Bazar</span></span></a>
          <p class="text-sm text-slate-500 max-w-xs">Premium online shopping, redefined. Quality products, delivered with care.</p>
          <div class="flex gap-2 mt-4">
            ${['facebook','instagram','twitter','youtube','linkedin'].map(s=>`<a href="#/" class="grid place-items-center w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition">${UI.icon(s==='twitter'?'twitter':s,'w-4 h-4')}</a>`).join('')}
          </div>
        </div>
        ${[['Shop',['Electronics','Fashion','Shoes','Watches','All Products']],['Customer Service',['Contact Us','FAQs','Track Order','Returns','Shipping Info']],['Company',['About Us','Blog','Careers','Affiliate Program','Privacy Policy']],['Account',['My Account','My Orders','Wishlist','Cart','Sign In']]].map(([t,links])=>`
          <div><h4 class="font-display font-bold mb-3 text-sm">${t}</h4><ul class="space-y-2 text-sm text-slate-500">${links.map(l=>`<li><a href="#/" class="hover:text-brand-500 transition">${l}</a></li>`).join('')}</ul></div>`).join('')}
      </div>
      <div class="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-sm text-slate-500">© 2026 Bachat Bazar. All rights reserved.</p>
        <div class="flex items-center gap-3 flex-wrap justify-center">
          ${['visa','mastercard','paypal','apple-pay','google-pay'].map(p=>`<span class="px-3 py-1.5 rounded-lg glass-strong text-xs font-bold text-slate-500">${UI.icon('credit-card','w-4 h-4')} ${p}</span>`).join('')}
        </div>
        <div class="flex gap-3 text-sm text-slate-500"><a href="admin.html" class="hover:text-brand-500 font-semibold flex items-center gap-1">${UI.icon('shield','w-3.5 h-3.5')} Admin Panel</a><a href="#/terms" class="hover:text-brand-500">Terms</a><a href="#/privacy" class="hover:text-brand-500">Privacy</a><a href="#/shipping" class="hover:text-brand-500">Shipping</a></div>
      </div>
    </div>`;
    document.body.appendChild(f);
  }

  /* ---------- Category dropdown ---------- */
  function renderCatMenu() {
    const menu = document.getElementById('catMenu');
    if(!menu) return;
    menu.innerHTML = Store.categories().map(c=>`
      <a href="#/shop?category=${c.id}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-500/10 transition group">
        <span class="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} text-white">${UI.icon(c.icon,'w-5 h-5')}</span>
        <span><span class="block text-sm font-semibold">${c.name}</span><span class="block text-xs text-slate-400">${Store.allProducts().filter(p=>p.category===c.id).length} items</span></span>
      </a>`).join('');
  }

  /* ---------- Mobile menu ---------- */
  function openMobileMenu() {
    const m = document.getElementById('mobileMenu');
    const aside = m.querySelector('aside');
    aside.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <span class="font-display text-xl font-extrabold">Menu</span>
        <button data-close-mobile class="p-2 rounded-xl hover:bg-slate-500/10">${UI.icon('x','w-6 h-6')}</button>
      </div>
      <nav class="space-y-1">
        ${[['home','Home','#/'],['tag','Deals','#/deals'],['sparkle','New Arrivals','#/new'],['box','Shop All','#/shop'],['heart','Wishlist','#/wishlist'],['git-compare','Compare','#/compare'],['shopping-bag','Cart','#/cart'],['package','Orders','#/orders'],['user','Account','#/account'],['shield','Admin Panel','admin.html']].map(([i,l,h])=>`<a href="${h}" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-brand-500/10 text-sm font-medium">${UI.icon(i,'w-5 h-5')} ${l}</a>`).join('')}
      </nav>
      <div class="border-t border-white/10 mt-4 pt-4">
        <p class="text-xs font-semibold text-slate-400 mb-2 px-3">CATEGORIES</p>
        ${Store.categories().map(c=>`<a href="#/shop?category=${c.id}" class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-500/10 text-sm"><span class="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br ${c.color} text-white">${UI.icon(c.icon,'w-3.5 h-3.5')}</span> ${c.name}</a>`).join('')}
      </div>`;
    m.classList.remove('hidden');
    m.querySelectorAll('[data-close-mobile]').forEach(b=>b.onclick=closeMobileMenu);
    UI.icons();
  }
  function closeMobileMenu(){ document.getElementById('mobileMenu').classList.add('hidden'); }

  /* ---------- Cart drawer ---------- */
  function renderCartDrawer() {
    const items = Store.state.cart.map(i=>({...i,p:Store.product(i.id)})).filter(x=>x.p);
    const wrap = document.getElementById('cartItems');
    const foot = document.getElementById('cartFooter');
    if(!items.length){
      wrap.innerHTML = `<div class="text-center py-16 text-slate-500">${UI.icon('shopping-bag','w-12 h-12 mx-auto mb-3 opacity-40')}<p>Your cart is empty</p><a href="#/shop" data-close-cart class="btn btn-primary mt-4 px-5 py-2.5 text-sm">Start Shopping</a></div>`;
      foot.innerHTML='';
      UI.icons(); return;
    }
    wrap.innerHTML = items.map(it=>`
      <div class="cart-drawer-item glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex gap-3" data-id="${it.p.id}">
        <a href="#/product/${it.p.id}" data-close-cart class="w-16 h-16 rounded-lg overflow-hidden shrink-0">${UI.img(D.U(it.p.imageId,160),it.p.name,'w-full h-full object-cover','cd'+it.p.id)}</a>
        <div class="flex-1 min-w-0">
          <a href="#/product/${it.p.id}" data-close-cart class="text-sm font-medium hover:text-brand-500 line-clamp-2">${UI.escapeHtml(it.p.name)}</a>
          <p class="text-xs text-slate-400">${it.p.brand}</p>
          <div class="flex items-center justify-between mt-1">
            <div class="flex items-center gap-1">
              <button class="cdq w-6 h-6 grid place-items-center rounded-md hover:bg-brand-500/10" data-act="minus">${UI.icon('minus','w-3 h-3')}</button>
              <span class="text-sm font-bold w-6 text-center">${it.qty}</span>
              <button class="cdq w-6 h-6 grid place-items-center rounded-md hover:bg-brand-500/10" data-act="plus">${UI.icon('plus','w-3 h-3')}</button>
            </div>
            <span class="text-sm font-bold text-brand-500">${Store.money(it.p.price*it.qty)}</span>
          </div>
        </div>
        <button class="cdr text-slate-400 hover:text-rose-500 self-start" title="Remove">${UI.icon('x','w-4 h-4')}</button>
      </div>`).join('');
    foot.innerHTML = drawerTotals();
    // events
    wrap.querySelectorAll('.cdq').forEach(b=> b.onclick=()=>{ const row=b.closest('[data-id]'); const id=+row.dataset.id; const it=Store.state.cart.find(i=>i.id===id); const p=Store.product(id); if(b.dataset.act==='plus') Store.setQty(id,Math.min(it.qty+1,p.stock||99)); else Store.setQty(id,it.qty-1); renderCartDrawer(); Store.updateBadges(); });
    wrap.querySelectorAll('.cdr').forEach(b=> b.onclick=()=>{ const id=+b.closest('[data-id]').dataset.id; Store.removeFromCart(id); renderCartDrawer(); });
    foot.querySelectorAll('[data-cd-act]').forEach(b=> b.onclick=()=>{ const act=b.dataset.cdAct; if(act==='save'){ Store.state.cart.forEach(i=>Store.saveForLater(i.id)); renderCartDrawer(); Store.updateBadges(); } else if(act==='checkout'){ UI.closeDrawer('cartDrawer'); location.hash='#/checkout'; } else if(act==='clear'){ Store.state.cart=[]; Store.save(); renderCartDrawer(); Store.updateBadges(); } });
    foot.querySelector('#drawerCouponApply')?.addEventListener('click',()=>{ const inp=foot.querySelector('#drawerCouponInput'); Store.applyCoupon(inp.value); renderCartDrawer(); });
    UI.icons();
  }
  function drawerTotals(){
    const t=Store.cartTotals();
    return `
    ${Store.state.coupon?`<div class="flex items-center justify-between text-sm text-emerald-500 bg-emerald-500/10 rounded-lg px-3 py-2">${UI.icon('ticket','w-4 h-4')} ${Store.state.coupon.code} applied <button id="drawerCouponRemove" class="text-rose-400 hover:text-rose-500">${UI.icon('x','w-3.5 h-3.5')}</button></div>`:`<div class="flex gap-2"><input id="drawerCouponInput" placeholder="Coupon code" class="flex-1 px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"><button id="drawerCouponApply" class="btn btn-ghost px-3 py-2 text-sm">Apply</button></div>`}
    <div class="space-y-1 text-sm border-t border-white/10 pt-3">
      <div class="flex justify-between"><span class="text-slate-500">Subtotal</span><span class="font-semibold">${t.subDisplay}</span></div>
      ${t.discount>0?`<div class="flex justify-between text-emerald-500"><span>Discount</span><span>−${t.discountDisplay}</span></div>`:''}
      <div class="flex justify-between"><span class="text-slate-500">Shipping</span><span class="${t.shipping===0?'text-emerald-500':''} font-semibold">${t.shipping===0?'FREE':t.shipDisplay}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Tax</span><span>${t.taxDisplay}</span></div>
    </div>
    <div class="flex justify-between items-center border-t border-white/10 pt-3"><span class="font-display font-bold">Total</span><span class="font-display text-xl font-extrabold text-brand-500">${t.totalDisplay}</span></div>
    <div class="grid grid-cols-2 gap-2">
      <button data-cd-act="clear" class="btn btn-ghost py-2.5 text-sm">${UI.icon('trash-2','w-4 h-4')} Clear</button>
      <button data-cd-act="save" class="btn btn-ghost py-2.5 text-sm">${UI.icon('bookmark','w-4 h-4')} Save</button>
    </div>
    <button data-cd-act="checkout" class="btn btn-primary w-full py-3.5">${UI.icon('shield-check','w-5 h-5')} Checkout · ${t.totalDisplay}</button>`;
  }

  /* ---------- Wishlist drawer ---------- */
  function renderWishlistDrawer(){
    const items = Store.state.wishlist.map(id=>Store.product(id)).filter(Boolean);
    const wrap = document.getElementById('wishlistItems');
    if(!items.length){ wrap.innerHTML=`<div class="text-center py-16 text-slate-500">${UI.icon('heart','w-12 h-12 mx-auto mb-3 opacity-40')}<p>Your wishlist is empty</p><a href="#/shop" data-close-wishlist class="btn btn-primary mt-4 px-5 py-2.5 text-sm">Discover Products</a></div>`; UI.icons(); return; }
    wrap.innerHTML = items.map(p=>`
      <div class="glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex gap-3" data-id="${p.id}">
        <a href="#/product/${p.id}" data-close-wishlist class="w-16 h-16 rounded-lg overflow-hidden shrink-0">${UI.img(D.U(p.imageId,160),p.name,'w-full h-full object-cover','wd'+p.id)}</a>
        <div class="flex-1 min-w-0"><a href="#/product/${p.id}" data-close-wishlist class="text-sm font-medium hover:text-brand-500 line-clamp-2">${UI.escapeHtml(p.name)}</a><p class="text-xs text-slate-400">${p.brand}</p><p class="text-sm font-bold text-brand-500 mt-1">${Store.money(p.price)}</p></div>
        <div class="flex flex-col gap-1"><button class="wdr-add w-8 h-8 grid place-items-center rounded-lg bg-brand-500 text-white" title="Add to cart">${UI.icon('shopping-cart','w-3.5 h-3.5')}</button><button class="wdr w-8 h-8 grid place-items-center rounded-lg hover:bg-rose-500/10 text-rose-500" title="Remove">${UI.icon('trash-2','w-3.5 h-3.5')}</button></div>
      </div>`).join('');
    wrap.querySelectorAll('.wdr-add').forEach(b=>b.onclick=()=>{ Store.addToCart(b.closest('[data-id]').dataset.id,1); });
    wrap.querySelectorAll('.wdr').forEach(b=>b.onclick=()=>{ Store.toggleWishlist(b.closest('[data-id]').dataset.id); renderWishlistDrawer(); Store.updateBadges(); });
    UI.icons();
  }

  /* ---------- Notifications panel ---------- */
  function renderNotifPanel(){
    const panel = document.getElementById('notifPanel');
    const ns = Store.state.notifs.length ? Store.state.notifs : [
      {icon:'tag', title:'Flash Sale Live!', text:'Up to 50% off selected items', read:false},
      {icon:'truck', title:'Free Shipping', text:'On all orders over $50', read:false},
      {icon:'gift', title:'Earn Rewards', text:'Get points on every purchase', read:true},
    ];
    panel.innerHTML = `
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <h3 class="font-display font-bold">Notifications</h3>
        <button id="markReadBtn" class="text-xs text-brand-500 hover:underline">Mark all read</button>
      </div>
      <div class="max-h-80 overflow-y-auto">${ns.map(n=>`
        <div class="flex gap-3 p-4 border-b border-white/5 hover:bg-brand-500/5 ${n.read?'opacity-60':''}">
          <span class="grid place-items-center w-9 h-9 rounded-lg bg-brand-500/15 text-brand-500 shrink-0">${UI.icon(n.icon,'w-4 h-4')}</span>
          <div class="flex-1 min-w-0"><p class="text-sm font-semibold">${n.title}</p><p class="text-xs text-slate-400">${n.text}</p></div>
          ${!n.read?'<span class="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></span>':''}
        </div>`).join('')}</div>`;
    panel.classList.remove('hidden');
    document.getElementById('markReadBtn').onclick=()=>{ Store.markAllRead(); renderNotifPanel(); Store.updateBadges(); };
    UI.icons();
  }

  /* ---------- Page-specific event binding ---------- */
  function bindPageEvents(){
    // Home: hero slider + counters + countdowns
    initHeroSlider();
    initCounters();
    initCountdowns();
    initNewsletter();

    // Shop: filters, sort, pagination
    initShop();

    // Product detail
    initProductDetail();

    // Cart page
    initCartPage();

    // Compare page
    initComparePage();

    // Checkout
    initCheckout();

    // Auth modal internal
    initAuthEvents();

    // Account tabs
    document.querySelectorAll('[data-acctab]').forEach(b=> b.onclick=()=>{ Views.accountState.tab=b.dataset.acctab; App.render(); });
    const lo = document.getElementById('logoutBtn'); if(lo) lo.onclick=()=>{ Store.logout(); location.hash='#/'; };

    // Admin tabs
    document.querySelectorAll('[data-admtab]').forEach(b=> b.onclick=()=>{ Views.adminState.tab=b.dataset.admtab; App.render(); });

    // generic card actions across any product grid on the page
    Views.bindCardActions(document.getElementById('app'));
  }

  function initHeroSlider(){
    const slides = document.querySelectorAll('#heroSlides .slide');
    if(!slides.length) return;
    let i=0;
    clearInterval(heroTimer);
    function go(n){ slides.forEach(s=>s.classList.add('hidden')); slides[n].classList.remove('hidden'); slides[n].classList.add('active'); document.querySelectorAll('#heroDots button').forEach((b,k)=>{ b.className = 'slide-dots h-2 rounded-full transition-all '+(k===n?'w-8 bg-brand-500':'w-2 bg-slate-300 dark:bg-slate-600'); }); i=n; }
    heroTimer = setInterval(()=>go((i+1)%slides.length),5000);
    document.querySelectorAll('#heroDots button').forEach(b=> b.onclick=()=>{ clearInterval(heroTimer); go(+b.dataset.slide); });
  }

  function initCounters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
      if(el._counted) return; el._counted=true;
      const obs = new IntersectionObserver((ents)=>{
        ents.forEach(e=>{ if(e.isIntersecting){ UI.animateCount(el,+el.dataset.count,1400,el.dataset.prefix||'',el.dataset.suffix||''); obs.disconnect(); } });
      },{threshold:.4});
      obs.observe(el);
    });
  }

  function initCountdowns(){
    const end = Date.now()+8*3600*1000 + 42*60*1000;
    const flashH=document.getElementById('flashh'),flashM=document.getElementById('flashm'),flashS=document.getElementById('flashs');
    const top=document.getElementById('topCountdown'), deals=document.getElementById('dealsCountdown');
    clearInterval(flashTimer); clearInterval(topTimer);
    function tick(){
      let d=end-Date.now(); if(d<0)d=0;
      const h=Math.floor(d/36e5),m=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);
      if(flashH)flashH.textContent=String(h).padStart(2,'0');
      if(flashM)flashM.textContent=String(m).padStart(2,'0');
      if(flashS)flashS.textContent=String(s).padStart(2,'0');
      if(top)top.textContent=`${h}h ${m}m ${s}s`;
      if(deals)deals.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    tick(); flashTimer=setInterval(tick,1000); topTimer=flashTimer;
  }

  function initNewsletter(){
    const form=document.getElementById('newsletterForm'); if(!form) return;
    form.onsubmit=e=>{ e.preventDefault(); Store.state.newsletter=true; Store.save(); form.innerHTML=`<div class="text-center"><span class="grid place-items-center w-14 h-14 mx-auto rounded-full bg-emerald-500 text-white mb-3 scale-in">${UI.icon('check','w-7 h-7')}</span><p class="font-display text-xl font-bold">Subscribed!</p><p class="text-slate-300 text-sm mt-1">Use code <strong class="text-brand-400">WELCOME10</strong> for 10% off.</p></div>`; UI.toast('Subscribed! Check your email for 10% off code.','success'); UI.icons(); };
  }

  /* ---- Shop events ---- */
  function initShop(){
    const grid=document.getElementById('shopGrid'); if(!grid) return;
    // initial render with skeleton then results
    Views.renderShopGrid();
    // sort
    const sort=document.getElementById('sortSelect'); if(sort) sort.onchange=()=>{ Views.shopState.sort=sort.value; Views.shopState.page=1; Views.renderShopGrid(); };
    // filters
    document.querySelectorAll('input[name="fcat"]').forEach(r=> r.onchange=()=>{ Views.shopState.filters.category=r.value||null; Views.shopState.page=1; Views.renderShopGrid(); });
    document.querySelectorAll('input[name="frating"]').forEach(r=> r.onchange=()=>{ Views.shopState.filters.rating=+r.value; Views.shopState.page=1; Views.renderShopGrid(); });
    const pr=document.getElementById('priceRange'); if(pr) pr.oninput=()=>{ Views.shopState.filters.priceMax=+pr.value; document.getElementById('priceVal').textContent=Store.money(pr.value); pr.style.setProperty('--val',(pr.value/200000)*100+'%'); Views.shopState.page=1; Views.renderShopGrid(); };
    document.querySelectorAll('.brand-cb').forEach(c=> c.onchange=()=>{ const brands=[...document.querySelectorAll('.brand-cb:checked')].map(x=>x.value); Views.shopState.filters.brand=brands; Views.shopState.page=1; Views.renderShopGrid(); });
    const fs=document.getElementById('fStock'); if(fs) fs.onchange=()=>{ Views.shopState.filters.inStock=fs.checked; Views.shopState.page=1; Views.renderShopGrid(); };
    const fd=document.getElementById('fDiscount'); if(fd) fd.onchange=()=>{ Views.shopState.filters.discount=fd.checked; Views.shopState.page=1; Views.renderShopGrid(); };
    const clear=()=>{ Views.shopState.filters={category:null,brand:[],priceMax:200000,rating:0,inStock:false,discount:false}; Views.shopState.page=1; App.render(); };
    document.getElementById('clearFilters')?.addEventListener('click',clear);
    document.getElementById('clearFilters2')?.addEventListener('click',clear);
    const mfb=document.getElementById('mobileFilterBtn');
    if(mfb) mfb.onclick=()=>{ const f=document.getElementById('filters'); f.classList.toggle('hidden'); };
  }

  /* ---- Product detail events ---- */
  function initProductDetail(){
    const root=document.getElementById('app');
    // thumbnails
    root.querySelectorAll('.thumb').forEach(t=> t.onclick=()=>{ const box=document.getElementById('zoomBox'); box.querySelector('img').src=t.dataset.img; box.querySelector('img').setAttribute('onerror',`this.onerror=null;this.src='https://picsum.photos/seed/${t.dataset.seed}/900'`); root.querySelectorAll('.thumb').forEach(x=>x.classList.replace('border-brand-500','border-transparent')); t.classList.add('border-brand-500'); t.classList.remove('border-transparent'); });
    // zoom
    const zt=document.getElementById('zoomToggle'), zb=document.getElementById('zoomBox');
    if(zt&&zb){ zt.onclick=()=>{ zb.classList.toggle('zoomed'); zt.querySelector('i')?.setAttribute('data-lucide', zb.classList.contains('zoomed')?'zoom-out':'zoom-in'); UI.icons(); }; if(zb){ let move=false; zb.addEventListener('mousemove',e=>{ if(!zb.classList.contains('zoomed'))return; const r=zb.getBoundingClientRect(); const x=((e.clientX-r.left)/r.width)*100, y=((e.clientY-r.top)/r.height)*100; zb.querySelector('img').style.transformOrigin=`${x}% ${y}%`; }); } }
    const v360=document.getElementById('view360'); if(v360) v360.onclick=()=>UI.toast('360° view loading… (demo)','info');
    const vv=document.getElementById('viewVideo'); if(vv) vv.onclick=()=>UI.openModal('genericModal',`<div class="p-2"><button onclick="UI.closeModal('genericModal')" class="absolute top-3 right-3 z-10 p-2 rounded-xl hover:bg-slate-500/10">${UI.icon('x','w-5 h-5')}</button><video controls class="w-full rounded-2xl" poster="${D.U(Store.product(location.hash.split('/')[2])?.imageId||'1498049794561-7780e7231661',900)}"><source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"></video></div>`);
    // qty
    const qm=document.getElementById('qtyMinus'), qp=document.getElementById('qtyPlus'), qi=document.getElementById('qtyInput');
    if(qm) qm.onclick=()=>{ qi.value=Math.max(1,+qi.value-1); };
    if(qp) qp.onclick=()=>{ const p=Store.product(location.hash.split('/')[2]); qi.value=Math.min(p?.stock||99,+qi.value+1); };
    // add to cart / buy now
    const add=document.getElementById('addCartBtn'); if(add) add.onclick=()=>{ const id=location.hash.split('/')[2]; if(Store.addToCart(id,+qi.value)){ renderCartDrawer(); Store.updateBadges(); } };
    const buy=document.getElementById('buyNowBtn'); if(buy) buy.onclick=()=>{ const id=location.hash.split('/')[2]; if(Store.addToCart(id,+qi.value)){ Store.updateBadges(); location.hash='#/checkout'; } };
    const wb=document.getElementById('wishBtn'); if(wb) wb.onclick=()=>{ const id=location.hash.split('/')[2]; const on=Store.toggleWishlist(id); wb.classList.toggle('text-accent-500',on); };
    const cb=document.getElementById('cmpBtn'); if(cb) cb.onclick=()=>{ const id=location.hash.split('/')[2]; const on=Store.toggleCompare(id); cb.classList.toggle('text-brand-500',on); };
    const sb=document.getElementById('shareBtn'); if(sb) sb.onclick=()=>{ navigator.clipboard?.writeText(location.href).then(()=>UI.toast('Link copied!','success')) || UI.toast('Share: '+location.href,'info'); };
    const fbt=document.getElementById('fbtAdd'); if(fbt) fbt.onclick=()=>{ const id=location.hash.split('/')[2]; const p=Store.product(id); const fbtP=Store.allProducts().filter(x=>x.category===p.category&&x.id!==p.id).slice(0,2); [p,...fbtP].forEach(x=>Store.addToCart(x.id,1)); renderCartDrawer(); Store.updateBadges(); };
    // tabs
    root.querySelectorAll('.tab-btn').forEach(b=> b.onclick=()=>{ root.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const p=Store.product(location.hash.split('/')[2]); document.getElementById('tabContent').innerHTML=Views.productTab(b.dataset.tab,p); UI.icons(); initReviewEvents(); });
    const wr=document.getElementById('writeReviewBtn'); if(wr) wr.onclick=()=>UI.toast('Review form opened (demo)','info');
    initReviewEvents();
  }
  function initReviewEvents(){ document.querySelectorAll('[data-helpful]').forEach(b=> b.onclick=()=>{ const c=b.textContent.match(/\d+/); const n=c?+c[0]+1:1; b.innerHTML=UI.icon('thumbs-up','w-4 h-4')+` Helpful (${n})`; b.classList.add('text-brand-500'); UI.icons(); UI.toast('Thanks for your feedback!','success',1500); }); }

  /* ---- Cart page events ---- */
  function initCartPage(){
    const root=document.getElementById('app');
    root.querySelectorAll('.qbtn').forEach(b=> b.onclick=()=>{ const row=b.closest('.cart-row'); const id=+row.dataset.id; const it=Store.state.cart.find(i=>i.id===id); const p=Store.product(id); const inp=row.querySelector('.qty-val'); let q=+inp.value; if(b.dataset.act==='plus') q=Math.min(it.qty+1,p.stock||99); else q=Math.max(1,it.qty-1); Store.setQty(id,q); App.render(); });
    root.querySelectorAll('.qty-val').forEach(inp=> inp.onchange=()=>{ const id=+inp.closest('.cart-row').dataset.id; Store.setQty(id,Math.max(1,+inp.value)); App.render(); });
    root.querySelectorAll('.cart-remove').forEach(b=> b.onclick=()=>{ Store.removeFromCart(b.dataset.id); App.render(); renderCartDrawer(); });
    root.querySelectorAll('.move-cart').forEach(b=> b.onclick=()=>{ Store.moveToCart(b.dataset.id); App.render(); renderCartDrawer(); });
    const clr=document.getElementById('clearCartBtn'); if(clr) clr.onclick=()=>UI.confirm('Clear entire cart?',()=>{ Store.state.cart=[]; Store.save(); Store.updateBadges(); App.render(); renderCartDrawer(); });
    const ac=document.getElementById('applyCouponBtn'); if(ac) ac.onclick=()=>{ const inp=document.getElementById('couponInput'); if(Store.applyCoupon(inp.value)) App.render(); };
    document.querySelectorAll('.coupon-chip').forEach(c=> c.onclick=()=>{ document.getElementById('couponInput').value=c.dataset.code; Store.applyCoupon(c.dataset.code); App.render(); });
  }

  /* ---- Compare page events ---- */
  function initComparePage(){
    const root=document.getElementById('app');
    root.querySelectorAll('.cmp-remove').forEach(b=> b.onclick=()=>{ Store.toggleCompare(b.dataset.id); App.render(); Store.updateBadges(); });
    root.querySelectorAll('.cmp-add').forEach(b=> b.onclick=()=> Store.addToCart(b.dataset.id,1));
  }

  /* ---- Checkout events ---- */
  function initCheckout(){
    const root=document.getElementById('app');
    const form=document.getElementById('checkoutForm');
    if(form) form.onsubmit=e=>{ e.preventDefault(); Views.checkoutState.step=2; App.render(); };
    const back=root.querySelector('#stepBack'); if(back) back.onclick=()=>{ Views.checkoutState.step=Math.max(1,Views.checkoutState.step-1); App.render(); };
    const next=root.querySelector('#stepNext');
    if(next) next.onclick=()=>{ if(Views.checkoutState.step===2){ const sel=document.querySelector('input[name="ship"]:checked'); if(sel) Views.checkoutState.shipping=sel.value; Views.checkoutState.giftWrap=document.getElementById('giftWrap')?.checked||false; } if(Views.checkoutState.step===3){ const sel=document.querySelector('input[name="pay"]:checked'); if(sel) Views.checkoutState.payment=sel.value; } Views.checkoutState.step++; App.render(); };
    // payment method change -> refresh fields
    root.querySelectorAll('input[name="pay"]').forEach(r=> r.onchange=()=>{ Views.checkoutState.payment=r.value; document.getElementById('payFields').innerHTML=Views.payFields(r.value); UI.icons(); });
    // shipping method change
    root.querySelectorAll('input[name="ship"]').forEach(r=> r.onchange=()=>{ Views.checkoutState.shipping=r.value; });
    const place=root.getElementById('placeOrderBtn'); if(place) place.onclick=()=>placeOrder();
  }
  function placeOrder(){
    const order=Store.placeOrder(Views.checkoutState.payment, Store.state.addresses[0]);
    lastOrder=order;
    UI.toast('Payment processed successfully','success');
    setTimeout(()=>{ location.hash='#/order-success'; },500);
  }

  /* ---- Auth events ---- */
  function initAuthEvents(){
    const modal=document.getElementById('authModal');
    if(modal.classList.contains('hidden')) return;
    const body=document.getElementById('authBody'); if(!body) return;
    body.querySelectorAll('[data-auth]').forEach(b=> b.onclick=()=>{ Views.authState.mode=b.dataset.auth; Views.auth(); });
    const form=document.getElementById('authForm');
    if(form) form.onsubmit=e=>{ e.preventDefault(); const m=Views.authState.mode;
      if(m==='login'){ const email=form.email?.value||'demo@bachatbazar.com'; Store.login(email); UI.closeModal('authModal'); App.render(); }
      else if(m==='register'){ const name=form.name?.value||'New User'; const email=form.email?.value||'new@bachatbazar.com'; Store.register(name,email); UI.closeModal('authModal'); App.render(); }
      else if(m==='forgot'){ Views.authState.mode='otp'; Views.auth(); }
      else if(m==='otp'){ UI.closeModal('authModal'); const email=Store.state.user?.email||'demo@bachatbazar.com'; Store.login(email); App.render(); UI.toast('Email verified! Welcome back.','success'); }
    };
    // social
    body.querySelectorAll('.social-login').forEach(b=> b.onclick=()=>{ UI.toast(`${b.dataset.social} sign in (demo)`,'info'); setTimeout(()=>{ Store.login(`user@${b.dataset.social.toLowerCase()}.com`); UI.closeModal('authModal'); App.render(); },600); });
    // otp auto-advance
    const otps=body.querySelectorAll('.otp-input'); if(otps.length){ otps.forEach((inp,i)=> inp.addEventListener('input',()=>{ if(inp.value&&i<otps.length-1) otps[i+1].focus(); })); }
  }

  /* ---------- helpers ---------- */
  function closeAllPanels(){ document.getElementById('notifPanel')?.classList.add('hidden'); }
  function openAccount(){ if(Store.state.user) location.hash='#/account'; else { Views.authState.mode='login'; Views.auth(); } }

  /* ---------- global wiring ---------- */
  function wireGlobal(){
    // nav icon buttons
    document.querySelectorAll('[data-route]').forEach(b=> b.onclick=()=> location.hash=b.dataset.route);
    document.getElementById('cartBtn').onclick=()=>{ renderCartDrawer(); UI.openDrawer('cartDrawer'); };
    document.getElementById('wishlistBtn').onclick=()=>{ renderWishlistDrawer(); UI.openDrawer('wishlistDrawer'); };
    document.getElementById('compareNavBtn').onclick=()=> location.hash='#/compare';
    document.getElementById('accountBtn').onclick=openAccount;
    document.getElementById('menuBtn').onclick=openMobileMenu;
    document.getElementById('themeToggle').onclick=()=> Store.toggleTheme();
    document.getElementById('notifBtn').onclick=()=> renderNotifPanel();
    document.querySelector('[data-currency-toggle]').onclick=()=> Store.cycleCurrency();
    document.querySelector('[data-lang-toggle]').onclick=()=> UI.toast('Language: English (demo multi-language)','info');

    // drawer/modal close
    document.querySelectorAll('[data-close-cart]').forEach(b=> b.onclick=()=> UI.closeDrawer('cartDrawer'));
    document.querySelectorAll('[data-close-wishlist]').forEach(b=> b.onclick=()=> UI.closeDrawer('wishlistDrawer'));
    document.querySelectorAll('[data-close-quickview]').forEach(b=> b.onclick=()=> UI.closeModal('quickViewModal'));
    document.querySelectorAll('[data-close-auth]').forEach(b=> b.onclick=()=> UI.closeModal('authModal'));
    document.querySelectorAll('[data-close-generic]').forEach(b=> b.onclick=()=> UI.closeModal('genericModal'));
    document.getElementById('catDropdown')?.querySelector('button').addEventListener('click',()=> document.getElementById('catMenu').classList.toggle('hidden'));
    // close cat menu on outside click
    document.addEventListener('click',e=>{ if(!e.target.closest('#catDropdown')) document.getElementById('catMenu')?.classList.add('hidden'); });

    // back to top
    const btt=document.getElementById('backToTop');
    window.addEventListener('scroll',()=>{ btt.classList.toggle('hidden', window.scrollY<400); document.getElementById('navbar').classList.toggle('scrolled', window.scrollY>20); });
    btt.onclick=UI.scrollTop;

    // chat widget
    document.getElementById('chatWidget').onclick=()=> UI.openModal('genericModal', Views.chatBox());

    // cookie consent
    const cc=document.getElementById('cookieConsent');
    if(Store.state.cookieConsent===null){ cc.classList.remove('hidden'); }
    document.getElementById('cookieAccept').onclick=()=>{ Store.state.cookieConsent=true; Store.save(); cc.classList.add('hidden'); UI.toast('Cookies accepted','success',1500); };
    document.getElementById('cookieDecline').onclick=()=>{ Store.state.cookieConsent=false; Store.save(); cc.classList.add('hidden'); };

    // ESC closes modals/drawers
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ ['quickViewModal','authModal','genericModal'].forEach(id=>UI.closeModal(id)); ['cartDrawer','wishlistDrawer'].forEach(id=>UI.closeDrawer(id)); closeMobileMenu(); } });

    // hash change -> route
    window.addEventListener('hashchange', route);
  }

  /* ---------- Chat box ---------- */
  Views.chatBox = function(){
    return `<div class="p-5"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><span class="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white">${UI.icon('headphones','w-5 h-5')}</span><div><p class="font-bold text-sm">Bachat Bazar Support</p><p class="text-xs text-emerald-500 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Online</p></div></div><button onclick="UI.closeModal('genericModal')" class="p-2 rounded-xl hover:bg-slate-500/10">${UI.icon('x','w-5 h-5')}</button></div>
    <div id="chatLog" class="h-64 overflow-y-auto space-y-2 mb-3 pr-1"><div class="flex gap-2"><span class="w-7 h-7 rounded-full bg-brand-500 text-white grid place-items-center text-xs shrink-0">L</span><div class="glass-strong rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[80%]">Hi! 👋 Welcome to Bachat Bazar. How can I help you today?</div></div></div>
    <div class="flex gap-2 flex-wrap mb-3">${['Track my order','Return policy','Talk to human'].map(q=>`<button class="chat-quick text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-500 hover:bg-brand-500/20">${q}</button>`).join('')}</div>
    <form id="chatForm" class="flex gap-2"><input id="chatInput" placeholder="Type a message…" class="flex-1 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-sm"><button class="btn btn-primary px-4 py-2.5">${UI.icon('send','w-4 h-4')}</button></form></div>`;
  };

  /* ---------- init ---------- */
  function init(){
    Store.applyTheme();
    Store.updateBadges();
    renderCatMenu();
    renderFooter();
    UI.initSearch();
    UI.attachRipple();
    wireGlobal();
    route();
    UI.icons();
    // seed a welcome notification
    if(!Store.state.notifs.length){ Store.addNotif({icon:'gift', title:'Welcome to Bachat Bazar!', text:'Use code WELCOME10 for 10% off your first order'}); Store.updateBadges(); }
  }

  return { init, render: route, renderCartDrawer, renderWishlistDrawer, route };
})();

window.App = App;
document.addEventListener('DOMContentLoaded', App.init);
