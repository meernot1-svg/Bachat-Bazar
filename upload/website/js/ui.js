/* ============================================================
   Lumière — UI Utilities
   Toasts, modals, skeletons, image helper, counters, search,
   ripple, generic render helpers
   ============================================================ */

const UI = (() => {
  /* ---- Icons ---- */
  function icons(){ if (window.lucide) lucide.createIcons(); }
  function icon(name, cls='w-5 h-5'){ return `<i data-lucide="${name}" class="${cls}"></i>`; }

  /* ---- Image helper with picsum fallback ---- */
  function img(src, alt='', cls='', seed='lum') {
    const fallback = `https://picsum.photos/seed/${seed}/700/700`;
    return `<img src="${src}" alt="${alt}" class="${cls}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallback}'">`;
  }

  /* ---- Toast ---- */
  function toast(msg, type='info', timeout=3000) {
    const wrap = document.getElementById('toastContainer');
    if (!wrap) return;
    const cfg = {
      success:{ icon:'check-circle-2', color:'text-emerald-500' },
      error:  { icon:'alert-circle', color:'text-rose-500' },
      info:   { icon:'info', color:'text-brand-500' },
    }[type] || {icon:'info',color:'text-brand-500'};
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="${cfg.color} mt-0.5">${icon(cfg.icon,'w-5 h-5')}</span><p class="text-sm flex-1">${escapeHtml(msg)}</p><button class="text-slate-400 hover:text-slate-600">${icon('x','w-4 h-4')}</button>`;
    el.querySelector('button').onclick = ()=>close(el);
    wrap.appendChild(el); icons();
    const t = setTimeout(()=>close(el), timeout);
    function close(n){ n.classList.add('exit'); setTimeout(()=>n.remove(),300); }
  }

  /* ---- Escape html ---- */
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ---- Star rating ---- */
  function stars(rating=0, size='w-4 h-4') {
    let html = '<span class="stars">';
    for (let i=1;i<=5;i++) html += `<i data-lucide="star" class="${size} ${i<=Math.round(rating)?'':'empty'}" ${i<=Math.round(rating)?'fill="currentColor"':''}></i>`;
    html += '</span>';
    return html;
  }

  /* ---- Modal control ---- */
  function openModal(id, html) {
    const m = document.getElementById(id);
    if (!m) return;
    if (html !== undefined) m.querySelector('.modal-panel').innerHTML = html;
    m.classList.remove('hidden');
    document.body.style.overflow='hidden';
    icons();
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('hidden');
    document.body.style.overflow='';
  }

  /* ---- Drawer control ---- */
  function openDrawer(id){ const d=document.getElementById(id); if(!d)return; d.classList.remove('hidden'); document.body.style.overflow='hidden'; }
  function closeDrawer(id){ const d=document.getElementById(id); if(!d)return; d.classList.add('hidden'); document.body.style.overflow=''; }

  /* ---- Ripple effect ---- */
  function attachRipple(root=document) {
    root.querySelectorAll('.btn, .btn-primary, .btn-accent, .btn-ghost, .btn-light').forEach(btn=>{
      if (btn._ripple) return; btn._ripple = true;
      btn.addEventListener('click', e=>{
        const r = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        r.className='ripple'; r.style.width=r.style.height=size+'px';
        r.style.left=(e.clientX-rect.left-size/2)+'px';
        r.style.top=(e.clientY-rect.top-size/2)+'px';
        btn.appendChild(r); setTimeout(()=>r.remove(),600);
      });
    });
  }

  /* ---- Skeleton card ---- */
  function skeletonCard() {
    return `<div class="product-card p-3">
      <div class="skeleton aspect-product rounded-xl"></div>
      <div class="space-y-2 mt-3">
        <div class="skeleton skeleton-text w-3/4"></div>
        <div class="skeleton skeleton-text w-1/2"></div>
        <div class="skeleton skeleton-text w-1/3"></div>
        <div class="skeleton h-9 rounded-xl mt-2"></div>
      </div>
    </div>`;
  }
  function skeletonGrid(n=8){ return `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">${Array(n).fill(skeletonCard()).join('')}</div>`; }

  /* ---- Animated counter ---- */
  function animateCount(el, to, duration=1400, prefix='', suffix='') {
    if (!el) return;
    const start = 0, t0 = performance.now();
    function step(now){
      const p = Math.min((now-t0)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = prefix + Math.floor(eased*to).toLocaleString() + suffix;
      if (p<1) requestAnimationFrame(step);
      else el.textContent = prefix + to.toLocaleString() + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- Countdown ---- */
  function countdown(el, deadlineMs) {
    function tick(){
      let d = deadlineMs - Date.now();
      if (d<0) d=0;
      const h=Math.floor(d/36e5), m=Math.floor(d%36e5/6e4), s=Math.floor(d%6e4/1e3);
      el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    tick(); return setInterval(tick,1000);
  }

  /* ---- Scroll to top ---- */
  function scrollTop(){ window.scrollTo({top:0,behavior:'smooth'}); }

  /* ---- Search suggestions ---- */
  function initSearch() {
    const inputs = [document.getElementById('searchInput'), document.getElementById('searchInputMobile')].filter(Boolean);
    const box = document.getElementById('searchSuggest');
    const recent = JSON.parse(localStorage.getItem('lumiere_recent_search')||'[]');
    const popular = ['Wireless Earbuds','Running Shoes','Smart Watch','Gaming Mouse','Face Serum','Backpack','Mechanical Keyboard'];

    inputs.forEach(input=>{
      input.addEventListener('input', ()=>suggest(input, box));
      input.addEventListener('focus', ()=>suggest(input, box));
      input.addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(input.value); });
    });
    document.addEventListener('click', e=>{
      if (!e.target.closest('#searchInput') && !e.target.closest('#searchSuggest')) box?.classList.add('hidden');
    });

    function suggest(input, box){
      if (!box) return;
      const q = input.value.trim().toLowerCase();
      let html = '';
      if (!q) {
        html += `<div class="p-3"><p class="text-xs font-semibold text-slate-400 px-2 mb-1">RECENT</p>`;
        html += recent.slice(0,4).map(r=>`<button class="suggestion w-full text-left px-3 py-2 rounded-lg hover:bg-brand-500/10 flex items-center gap-2">${icon('clock','w-4 h-4 text-slate-400')} ${escapeHtml(r)}</button>`).join('') || '<p class="px-3 text-sm text-slate-400">No recent searches</p>';
        html += `</div><div class="p-3 border-t border-white/10"><p class="text-xs font-semibold text-slate-400 px-2 mb-1">POPULAR</p>`;
        html += popular.slice(0,5).map(r=>`<button class="suggestion w-full text-left px-3 py-2 rounded-lg hover:bg-brand-500/10 flex items-center gap-2">${icon('trending-up','w-4 h-4 text-rose-500')} ${escapeHtml(r)}</button>`).join('');
        html += `</div>`;
      } else {
        const matches = Store.allProducts().filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.includes(q)).slice(0,6);
        if (matches.length) {
          html = `<div class="p-2">`;
          html += matches.map(p=>`<button data-quick="${p.id}" class="suggestion w-full text-left px-2 py-2 rounded-lg hover:bg-brand-500/10 flex items-center gap-3">
            <img src="${p.images[0]}" class="w-10 h-10 rounded-lg object-cover" loading="lazy" onerror="this.src='https://picsum.photos/seed/p${p.id}/80'">
            <span class="flex-1"><span class="block text-sm font-medium">${escapeHtml(p.name)}</span><span class="block text-xs text-slate-400">${p.brand} · ${Store.money(p.price)}</span></span>
          </button>`).join('');
          html += `</div>`;
        } else html = `<div class="p-6 text-center text-sm text-slate-400">No products found for "${escapeHtml(q)}"</div>`;
      }
      box.innerHTML = html;
      box.classList.remove('hidden');
      icons();
      box.querySelectorAll('.suggestion').forEach(b=>{
        b.onclick = ()=>{ if (b.dataset.quick){ UI.openModal('quickViewModal'); Views.quickView(b.dataset.quick); } else doSearch(b.textContent.trim()); };
      });
    }

    function doSearch(q){
      q = q.trim(); if(!q) return;
      const r = JSON.parse(localStorage.getItem('lumiere_recent_search')||'[]');
      localStorage.setItem('lumiere_recent_search', JSON.stringify([q, ...r.filter(x=>x!==q)].slice(0,6)));
      box?.classList.add('hidden');
      location.hash = `#/shop?q=${encodeURIComponent(q)}`;
    }

    const submit = document.getElementById('searchSubmit');
    if (submit) submit.onclick = ()=>doSearch(document.getElementById('searchInput')?.value || '');
    const voice = document.getElementById('voiceSearchBtn');
    if (voice) voice.onclick = voiceSearch;
  }

  /* ---- Voice search (Web Speech API) ---- */
  function voiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice search not supported in this browser','error'); return; }
    const rec = new SR();
    rec.lang='en-US'; rec.interimResults=false;
    toast('Listening… speak now','info',1500);
    rec.onresult = e=>{
      const text = e.results[0][0].transcript;
      const input = document.getElementById('searchInput'); if (input){ input.value=text; location.hash=`#/shop?q=${encodeURIComponent(text)}`; }
    };
    rec.onerror = ()=>toast('Voice search failed','error');
    rec.start();
  }

  /* ---- Scroll reveal ---- */
  function reveal(root=document) {
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('fade-up'); obs.unobserve(en.target); } });
    }, { threshold:0.1 });
    root.querySelectorAll('[data-reveal]').forEach(el=>obs.observe(el));
  }

  /* ---- Confirm dialog ---- */
  function confirm(message, onYes) {
    openModal('genericModal', `
      <div class="p-6">
        <div class="flex items-start gap-3">
          <span class="grid place-items-center w-11 h-11 rounded-full bg-amber-500/15 text-amber-500">${icon('alert-triangle','w-6 h-6')}</span>
          <div><h3 class="font-display text-lg font-bold">Please Confirm</h3><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${escapeHtml(message)}</p></div>
        </div>
        <div class="flex gap-2 mt-6 justify-end">
          <button class="btn btn-ghost px-5 py-2.5" data-close-generic>Cancel</button>
          <button class="btn btn-primary px-5 py-2.5" id="confirmYes">Confirm</button>
        </div>
      </div>`);
    document.getElementById('confirmYes').onclick = ()=>{ closeModal('genericModal'); onYes(); };
  }

  return {
    icons, icon, img, toast, escapeHtml, stars,
    openModal, closeModal, openDrawer, closeDrawer,
    attachRipple, skeletonCard, skeletonGrid,
    animateCount, countdown, scrollTop,
    initSearch, voiceSearch, reveal, confirm
  };
})();
