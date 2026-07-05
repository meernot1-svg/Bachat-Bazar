/* ============================================================
   Bachat Bazar — Admin Console
   Separate management app: products, categories, orders, inventory,
   coupons, banners, reviews, customers, settings (premium dark theme)
   ============================================================ */

const Admin = (() => {
  const D = window.DATA;
  let tab = 'overview';
  let productSearch = '';
  let editingProduct = null;
  let editingCategory = null;

  const NAV = [
    ['overview','Overview','layout-dashboard'],
    ['products','Products','package'],
    ['categories','Categories','layout-grid'],
    ['orders','Orders','shopping-cart'],
    ['inventory','Inventory','warehouse'],
    ['customers','Customers','users'],
    ['coupons','Coupons','ticket'],
    ['banners','Banners','image'],
    ['reviews','Reviews','message-square'],
    ['tickets','Support','life-buoy'],
    ['settings','Settings','settings'],
  ];

  /* ---------- helpers ---------- */
  const $ = s => document.querySelector(s);
  const esc = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (n,c='w-4 h-4') => `<i data-lucide="${n}" class="${c}"></i>`;
  const img = (src,cls='',seed='a') => `<img src="${src}" class="${cls}" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${seed}/300'">`;
  const money = u => Store.money(u);
  function icons(){ if(window.lucide) lucide.createIcons(); }

  function toast(msg,type='info'){
    const cfg={success:['check-circle-2','text-emerald-400'],error:['alert-circle','text-rose-400'],info:['info','text-brand-400']}[type]||['info','text-brand-400'];
    const el=document.createElement('div');
    el.className='toast';
    el.innerHTML=`<span class="${cfg[1]} mt-0.5">${icon(cfg[0],'w-5 h-5')}</span><p class="text-sm flex-1">${esc(msg)}</p>`;
    $('#toastContainer').appendChild(el); icons();
    setTimeout(()=>{ el.classList.add('exit'); setTimeout(()=>el.remove(),300); },2800);
  }

  function openModal(html, wide){
    const m=$('#adminModal');
    m.querySelector('.modal-panel').className = `modal-panel relative card ${wide?'max-w-4xl':'max-w-2xl'} w-full max-h-[90vh] overflow-y-auto shadow-2xl`;
    m.querySelector('.modal-panel').innerHTML = html;
    m.classList.remove('hidden'); document.body.style.overflow='hidden'; icons();
  }
  function closeModal(){ $('#adminModal').classList.add('hidden'); document.body.style.overflow=''; }

  function toggleSidebar(){ const s=$('#sidebar'); s.classList.toggle('-translate-x-full'); $('#overlay').classList.toggle('hidden'); }

  /* ---------- render ---------- */
  function render(){
    renderNav();
    const app = $('#adminApp');
    app.style.opacity='0';
    setTimeout(()=>{ app.innerHTML = TABS[tab] ? TABS[tab]() : TABS.overview(); app.style.transition='opacity .25s'; app.style.opacity='1'; icons(); bind(); window.scrollTo({top:0,behavior:'smooth'}); },80);
  }

  function renderNav(){
    $('#nav').innerHTML = NAV.map(([k,l,i])=>`<a class="nav-item ${tab===k?'active':''}" data-nav="${k}">${icon(i,'w-4 h-4')} ${l}</a>`).join('');
    $('#nav').querySelectorAll('[data-nav]').forEach(a=> a.onclick=()=>{ tab=a.dataset.nav; if(window.innerWidth<1024) toggleSidebar(); render(); });
    icons();
  }

  /* ---------- section shells ---------- */
  const head = (title,sub,action='') => `<div class="flex items-center justify-between gap-3 flex-wrap mb-6">
    <div><h1 class="font-display text-2xl font-extrabold text-white">${title}</h1>${sub?`<p class="text-sm text-slate-400 mt-0.5">${sub}</p>`:''}</div>
    <div class="flex gap-2">${action}</div></div>`;
  const btn = (label,ic,cls='btn-pri',attr='') => `<button class="btn2 ${cls} px-4 py-2.5" ${attr}>${icon(ic,'w-4 h-4')} ${label}</button>`;

  /* =========================================================
     OVERVIEW
     ========================================================= */
  const TABS = {};
  TABS.overview = function(){
    const prods = Store.allProducts();
    const orders = Store.state.orders;
    const revenue = orders.reduce((s,o)=>s+o.totals.total,0) + 24000000;
    const lowStock = prods.filter(p=>p.stock<15).length;
    const statCards = [
      ['Revenue', money(revenue), 'dollar-sign','from-emerald-500 to-green-600', 12.5],
      ['Orders', (orders.length+1284).toLocaleString(), 'shopping-cart','from-brand-500 to-indigo-600', 8.2],
      ['Products', prods.length, 'box','from-amber-500 to-orange-600', 3.1],
      ['Low Stock', lowStock, 'alert-triangle','from-rose-500 to-accent-500', -2.4],
    ].map(([l,v,i,c,d])=>`
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <span class="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br ${c} text-white">${icon(i,'w-5 h-5')}</span>
          <span class="text-xs font-semibold ${d>=0?'text-emerald-400':'text-rose-400'} flex items-center gap-1">${icon(d>=0?'trending-up':'trending-down','w-3.5 h-3.5')} ${d>=0?'+':''}${d}%</span>
        </div>
        <div class="text-2xl font-extrabold font-display mt-3 text-white">${v}</div>
        <p class="text-sm text-slate-400">${l}</p>
      </div>`).join('');

    return head('Dashboard Overview','Welcome back, here is what is happening with your store today.') + `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">${statCards}</div>
    <div class="grid lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 card p-5">
        <div class="flex items-center justify-between mb-4"><h3 class="font-bold text-white">Sales Analytics</h3><span class="chip bg-emerald-500/15 text-emerald-400">+18% YoY</span></div>
        ${chart()}
      </div>
      <div class="card p-5">
        <h3 class="font-bold text-white mb-4">Top Categories</h3>
        <div class="space-y-3">${Store.categories().slice(0,5).map((c,i)=>{const pct=[85,72,64,51,38][i]||30;return `<div><div class="flex justify-between text-sm mb-1"><span class="text-slate-300">${c.name}</span><span class="text-slate-500">${pct}%</span></div><div class="h-2 rounded-full bg-slate-700/60"><div class="h-full rounded-full bg-gradient-to-r ${c.color}" style="width:${pct}%"></div></div></div>`;}).join('')}</div>
      </div>
    </div>
    <div class="grid lg:grid-cols-2 gap-4 mt-4">
      <div class="card p-5"><h3 class="font-bold text-white mb-3">Recent Orders</h3>${ordersTable(orders.slice(0,5), true)}</div>
      <div class="card p-5"><h3 class="font-bold text-white mb-3">Low Stock Alerts</h3>${lowStockList()}</div>
    </div>`;
  };

  function chart(){
    const data=[21000,29000,23500,32500,36000,34000,42000,39500,46000,44000,48000,55000]; const max=Math.max(...data); const m=['J','F','M','A','M','J','J','A','S','O','N','D'];
    return `<div class="flex items-end gap-2 h-48">${data.map((v,i)=>`<div class="flex-1 flex flex-col items-center justify-end h-full"><div class="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-accent-500 hover:opacity-80 transition relative group" style="height:${(v/max)*100}%"><span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[.6rem] text-slate-400 opacity-0 group-hover:opacity-100">Rs ${v.toLocaleString()}</span></div><span class="text-[.6rem] text-slate-500 mt-1">${m[i]}</span></div>`).join('')}</div>`;
  }

  function lowStockList(){
    const items = Store.allProducts().filter(p=>p.stock<15).slice(0,6);
    if(!items.length) return `<p class="text-sm text-slate-400 py-6 text-center">All products well stocked 🎉</p>`;
    return items.map(p=>`<div class="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      ${img(D.U(p.imageId,80),'w-9 h-9 rounded-lg object-cover','p'+p.id)}
      <div class="flex-1 min-w-0"><p class="text-sm font-medium text-slate-200 truncate">${esc(p.name)}</p><p class="text-[.7rem] text-slate-500">SKU ${p.sku}</p></div>
      <span class="text-sm font-bold ${p.stock===0?'text-rose-400':'text-amber-400'}">${p.stock} left</span>
      <button class="btn2 btn-gh px-3 py-1.5 text-xs" data-restock="${p.id}">${icon('plus','w-3.5 h-3.5')} Restock</button>
    </div>`).join('');
  }

  /* =========================================================
     PRODUCTS
     ========================================================= */
  TABS.products = function(){
    return head('Products', 'Add, edit and manage your product catalog.',
      btn('Add Product','plus','btn-pri','data-add-product') +
      `<button class="btn2 btn-gh px-4 py-2.5" onclick="Admin.exportProducts()">${icon('download','w-4 h-4')} Export CSV</button>`) + `
    <div class="card p-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="relative flex-1 max-w-sm"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i><input id="psearch" class="input pl-9" placeholder="Search by name, brand, SKU…" value="${esc(productSearch)}"></div>
        <select id="pcat" class="input max-w-[12rem]"><option value="">All categories</option>${Store.categories().map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="overflow-x-auto"><table class="w-full text-sm">
        <thead><tr class="text-left text-slate-400 border-b border-white/10 text-xs uppercase tracking-wider">
          <th class="py-3 px-2">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Status</th><th class="text-right pr-2">Actions</th>
        </tr></thead>
        <tbody id="prows">${productRows()}</tbody>
      </table></div>
      <p class="text-xs text-slate-500 mt-3" id="pcount"></p>
    </div>`;
  };

  function productRows(){
    const q=productSearch.toLowerCase();
    let list = Store.allProducts().filter(p => !q || p.name.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q));
    const catf = $('#pcat')?.value; if(catf) list=list.filter(p=>p.category===catf);
    const c=$('#pcount'); if(c) c.textContent=`Showing ${list.length} of ${Store.allProducts().length} products`;
    return list.map(p=>`<tr class="border-b border-white/5">
      <td class="py-3 px-2"><div class="flex items-center gap-3">${img(D.U(p.imageId,80),'w-10 h-10 rounded-lg object-cover','p'+p.id)}<div class="min-w-0"><p class="font-medium text-slate-200 truncate max-w-[16rem]">${esc(p.name)}</p><p class="text-[.7rem] text-slate-500">${esc(p.brand)} · ${p.sku}</p></div></div></td>
      <td><span class="chip bg-brand-500/15 text-brand-300 capitalize">${esc(p.category)}</span></td>
      <td class="font-semibold">${money(p.price)}${p.oldPrice>p.price?`<span class="text-[.7rem] text-slate-500 line-through ml-1">${money(p.oldPrice)}</span>`:''}</td>
      <td><span class="${p.stock===0?'text-rose-400':p.stock<10?'text-amber-400':'text-emerald-400'} font-semibold">${p.stock}</span></td>
      <td class="text-amber-400">★ ${p.rating}</td>
      <td>${p.stock>0?`<span class="chip bg-emerald-500/15 text-emerald-400">Active</span>`:`<span class="chip bg-slate-500/20 text-slate-400">Out of stock</span>`}</td>
      <td class="text-right pr-2"><div class="inline-flex gap-1">
        <button class="p-1.5 rounded-lg hover:bg-brand-500/15 text-brand-300" data-edit="${p.id}" title="Edit">${icon('pencil','w-4 h-4')}</button>
        <button class="p-1.5 rounded-lg hover:bg-amber-500/15 text-amber-300" data-view="${p.id}" title="View">${icon('eye','w-4 h-4')}</button>
        <button class="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-400" data-del="${p.id}" title="Delete">${icon('trash-2','w-4 h-4')}</button>
      </div></td>
    </tr>`).join('') || `<tr><td colspan="7" class="py-10 text-center text-slate-500">No products match your search.</td></tr>`;
  }

  function productForm(p){
    editingProduct = p ? p.id : null;
    const v = p || {};
    return `<div class="p-6">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3"><span class="grid place-items-center w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300">${icon(p?'pencil':'plus','w-5 h-5')}</span><div><h3 class="font-display text-lg font-bold text-white">${p?'Edit Product':'Add New Product'}</h3><p class="text-xs text-slate-400">${p?'Update product details':'Fill in the details below'}</p></div></div>
        <button onclick="Admin.closeModal()" class="p-2 rounded-lg hover:bg-white/5">${icon('x','w-5 h-5')}</button>
      </div>
      <form id="pform" class="space-y-4">
        <div><label class="block text-xs font-semibold text-slate-400 mb-1">Product Images (one URL or Unsplash ID per line)</label>
          <textarea id="f_images" rows="3" class="input" placeholder="https://images.unsplash.com/photo-...&#10;1498049794561-7780e7231661">${esc((v.images||[]).join('\n'))}</textarea>
          <p class="text-[.7rem] text-slate-500 mt-1">Tip: paste full image URLs or Unsplash photo IDs. Used as the product gallery.</p>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          ${f('Product Name','f_name','text',v.name||'')}
          ${f('Brand','f_brand','text',v.brand||'')}
          ${f('Price (Rs)','f_price','number',v.price??'')}
          ${f('Compare-at Price (Rs)','f_old','number',v.oldPrice??'')}
          ${f('Stock Quantity','f_stock','number',v.stock??'')}
          ${f('SKU (optional)','f_sku','text',v.sku||'')}
          ${f('Rating (0-5)','f_rating','number',v.rating??'0',0.1)}
          ${f('Reviews Count','f_reviews','number',v.reviews??'0')}
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">Category</span>
            <select id="f_cat" class="input">${Store.categories().map(c=>`<option value="${c.id}" ${v.category===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label>
          <label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">Tags</span>
            <div class="flex flex-wrap gap-3 pt-2">
              ${['featured','bestSeller','trending','isNew'].map(t=>`<label class="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer"><input type="checkbox" id="f_${t}" class="accent-brand-500" ${v[t]?'checked':''}> ${t}</label>`).join('')}
            </div></label>
        </div>
        <label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">Description</span><textarea id="f_desc" rows="3" class="input">${esc(v.description||'')}</textarea></label>
        <label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">Features (one per line)</span><textarea id="f_feat" rows="3" class="input" placeholder="Premium materials&#10;1 year warranty">${esc((v.features||[]).join('\n'))}</textarea></label>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn2 btn-gh px-5 py-2.5" onclick="Admin.closeModal()">Cancel</button>
          <button type="submit" class="btn2 btn-pri px-6 py-2.5">${icon('save','w-4 h-4')} ${p?'Save Changes':'Create Product'}</button>
        </div>
      </form></div>`;
  }
  function f(label,id,type,val,step){
    return `<label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">${label}</span><input id="${id}" type="${type}" ${step?`step="${step}"`:''} value="${esc(val??'')}" class="input"></label>`;
  }
  function saveProduct(e){
    e.preventDefault();
    const imgs = ($('#f_images').value).split(/[\n,]/).map(s=>s.trim()).filter(Boolean);
    const data = {
      name: $('#f_name').value.trim(),
      brand: $('#f_brand').value.trim(),
      price: +$('#f_price').value||0,
      oldPrice: +$('#f_old').value||0,
      stock: +$('#f_stock').value||0,
      sku: $('#f_sku').value.trim(),
      rating: +$('#f_rating').value||0,
      reviews: +$('#f_reviews').value||0,
      category: $('#f_cat').value,
      description: $('#f_desc').value.trim(),
      features: $('#f_feat').value.split('\n').map(s=>s.trim()).filter(Boolean),
      featured: $('#f_featured').checked, bestSeller: $('#f_bestSeller').checked, trending: $('#f_trending').checked, isNew: $('#f_isNew').checked,
      images: imgs.length?imgs:['1498049794561-7780e7231661'],
    };
    if(!data.name){ toast('Product name is required','error'); return; }
    if(editingProduct) { Store.updateProduct(editingProduct, data); toast('Product updated','success'); }
    else { Store.addProduct(data); toast('Product created','success'); }
    closeModal(); render();
  }

  /* =========================================================
     CATEGORIES
     ========================================================= */
  TABS.categories = function(){
    return head('Categories','Organize your store into browsable categories.', btn('Add Category','plus','btn-pri','data-add-cat')) + `
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" id="catGrid">
      ${Store.categories().map(c=>{
        const count = Store.allProducts().filter(p=>p.category===c.id).length;
        return `<div class="card overflow-hidden group">
          <div class="relative h-28 bg-gradient-to-br ${c.color} flex items-center justify-center">
            ${c.img?img(D.U(c.img,400),'absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60','cat'+c.id):''}
            <span class="relative grid place-items-center w-12 h-12 rounded-xl bg-white/20 text-white">${icon(c.icon,'w-6 h-6')}</span>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div><p class="font-bold text-white">${esc(c.name)}</p><p class="text-xs text-slate-400">${count} products · ${c.id}</p></div>
            <div class="flex gap-1">
              <button class="p-1.5 rounded-lg hover:bg-brand-500/15 text-brand-300" data-editcat="${c.id}">${icon('pencil','w-4 h-4')}</button>
              <button class="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-400" data-delcat="${c.id}">${icon('trash-2','w-4 h-4')}</button>
            </div>
          </div>
        </div>`;}).join('')}
    </div>`;
  };
  function categoryForm(c){
    editingCategory = c ? c.id : null;
    const v=c||{};
    const colors=['from-blue-500 to-cyan-500','from-pink-500 to-rose-500','from-orange-500 to-amber-500','from-slate-600 to-slate-800','from-fuchsia-500 to-pink-500','from-emerald-500 to-green-600','from-amber-500 to-yellow-600','from-lime-500 to-green-500','from-violet-500 to-purple-600','from-indigo-500 to-blue-600'];
    return `<div class="p-6">
      <div class="flex items-center justify-between mb-5"><div class="flex items-center gap-3"><span class="grid place-items-center w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300">${icon(c?'pencil':'plus','w-5 h-5')}</span><h3 class="font-display text-lg font-bold text-white">${c?'Edit Category':'Add Category'}</h3></div><button onclick="Admin.closeModal()" class="p-2 rounded-lg hover:bg-white/5">${icon('x','w-5 h-5')}</button></div>
      <form id="cform" class="space-y-4">
        ${f('Category Name','c_name','text',v.name||'')}
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">Icon (Lucide name)</span><input id="c_icon" class="input" value="${v.icon||'tag'}"></label>
          ${f('Image (Unsplash ID or URL)','c_img','text',v.img||'')}
        </div>
        <div><span class="block text-xs font-semibold text-slate-400 mb-2">Color Theme</span><div class="grid grid-cols-5 gap-2">${colors.map(col=>`<label class="cursor-pointer"><input type="radio" name="ccolor" value="${col}" class="hidden" ${v.color===col?'checked':''}><div class="h-10 rounded-lg bg-gradient-to-br ${col} ring-2 ring-transparent hover:ring-white/40 has-[:checked]:ring-white"></div></label>`).join('')}</div></div>
        <div class="flex justify-end gap-2 pt-2"><button type="button" class="btn2 btn-gh px-5 py-2.5" onclick="Admin.closeModal()">Cancel</button><button type="submit" class="btn2 btn-pri px-6 py-2.5">${icon('save','w-4 h-4')} Save</button></div>
      </form></div>`;
  }
  function saveCategory(e){
    e.preventDefault();
    const data={ name:$('#c_name').value.trim(), icon:$('#c_icon').value.trim()||'tag', img:$('#c_img').value.trim(), color: document.querySelector('input[name="ccolor"]:checked')?.value || 'from-slate-500 to-slate-700' };
    if(!data.name){ toast('Name required','error'); return; }
    if(editingCategory){ Store.updateCategory(editingCategory,data); toast('Category updated','success'); }
    else { const r=Store.addCategory(data); if(!r){ toast('Category already exists','error'); return; } toast('Category created','success'); }
    closeModal(); render();
  }

  /* =========================================================
     ORDERS
     ========================================================= */
  TABS.orders = function(){
    const orders = Store.state.orders;
    const sample = [['BB100234','Amelia Carter','amelia@mail.com','64,500','Delivered','2026-06-28'],['BB100231','Daniel Kim','daniel@mail.com','174,500','Shipped','2026-06-27'],['BB100228','Sofia Martinez','sofia@mail.com','29,500','Packed','2026-06-26'],['BB100225','Liam O\'Brien','liam@mail.com','449,500','Confirmed','2026-06-25'],['BB100220','Yuki Tanaka','yuki@mail.com','89,500','Cancelled','2026-06-24'],['BB100215','Marco Rossi','marco@mail.com','229,500','Refunded','2026-06-22']];
    const rows=[...orders.map(o=>[o.id, o.address?.name||o.items[0]?.name||'Customer','',o.totals.total.toFixed(2),o.status, new Date(o.date).toISOString().slice(0,10)]), ...sample];
    const color={Confirmed:'blue',Packed:'amber',Shipped:'cyan',Delivered:'emerald',Cancelled:'rose',Refunded:'slate',Pending:'amber'};
    return head('Orders','Manage and update order statuses.') + `
    <div class="card p-4">
      <div class="overflow-x-auto"><table class="w-full text-sm">
        <thead><tr class="text-left text-slate-400 border-b border-white/10 text-xs uppercase tracking-wider"><th class="py-3 px-2">Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Items</th><th>Status</th><th class="text-right pr-2">Action</th></tr></thead>
        <tbody>${rows.map(r=>`<tr class="border-b border-white/5">
          <td class="py-3 px-2 font-mono text-xs text-brand-300">${r[0]}</td>
          <td><p class="font-medium text-slate-200">${esc(r[1])}</p><p class="text-[.7rem] text-slate-500">${esc(r[2])}</p></td>
          <td class="text-slate-400">${r[5]}</td>
          <td class="font-semibold">Rs ${r[3]}</td>
          <td class="text-slate-400">${1+Math.floor(Math.random()*4)}</td>
          <td><select class="bg-transparent text-xs rounded-lg border border-slate-600 px-2 py-1 outline-none ostatus" data-id="${r[0]}" data-cur="${r[4]}">${['Pending','Confirmed','Packed','Shipped','Delivered','Cancelled','Refunded'].map(s=>`<option ${s===r[4]?'selected':''}>${s}</option>`).join('')}</select></td>
          <td class="text-right pr-2"><button class="p-1.5 rounded-lg hover:bg-brand-500/15 text-brand-300" data-order="${r[0]}" title="View">${icon('eye','w-4 h-4')}</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
  };

  function ordersTable(list, compact){
    if(!list.length) return `<p class="text-sm text-slate-400 py-6 text-center">No orders yet.</p>`;
    return `<div class="space-y-2">${list.map(o=>`<div class="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span class="grid place-items-center w-9 h-9 rounded-lg bg-brand-500/15 text-brand-300">${icon('package','w-4 h-4')}</span>
      <div class="flex-1 min-w-0"><p class="text-sm font-medium text-slate-200">${o.id}</p><p class="text-[.7rem] text-slate-500">${o.items.length} items · ${new Date(o.date).toLocaleDateString()}</p></div>
      <span class="text-sm font-semibold">${money(o.totals.total)}</span>
      <span class="chip bg-brand-500/15 text-brand-300">${o.status}</span>
    </div>`).join('')}</div>`;
  }

  /* =========================================================
     INVENTORY
     ========================================================= */
  TABS.inventory = function(){
    const prods = Store.allProducts();
    const total = prods.length, outOfStock = prods.filter(p=>p.stock===0).length, low = prods.filter(p=>p.stock>0&&p.stock<10).length;
    const invValue = prods.reduce((s,p)=>s+p.price*p.stock,0);
    return head('Inventory','Track stock levels and restock products.') + `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${[['Total SKUs',total,'box','from-brand-500 to-indigo-600'],['Out of Stock',outOfStock,'x-circle','from-rose-500 to-accent-500'],['Low Stock (<10)',low,'alert-triangle','from-amber-500 to-orange-600'],['Inventory Value',money(invValue),'dollar-sign','from-emerald-500 to-green-600']].map(([l,v,i,c])=>`<div class="card p-5"><span class="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br ${c} text-white mb-2">${icon(i,'w-5 h-5')}</span><div class="text-xl font-bold text-white">${v}</div><p class="text-xs text-slate-400">${l}</p></div>`).join('')}
    </div>
    <div class="card p-4">
      <h3 class="font-bold text-white mb-3">Stock Management</h3>
      <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-400 border-b border-white/10 text-xs uppercase tracking-wider"><th class="py-2 px-2">Product</th><th>SKU</th><th>Current</th><th>Status</th><th>Adjust Stock</th></tr></thead>
      <tbody>${prods.map(p=>`<tr class="border-b border-white/5">
        <td class="py-2 px-2 flex items-center gap-2">${img(D.U(p.imageId,60),'w-8 h-8 rounded-lg object-cover','p'+p.id)}<span class="font-medium text-slate-200">${esc(p.name)}</span></td>
        <td class="font-mono text-xs text-slate-400">${p.sku}</td>
        <td class="font-semibold">${p.stock}</td>
        <td>${p.stock===0?`<span class="chip bg-rose-500/15 text-rose-400">Out</span>`:p.stock<10?`<span class="chip bg-amber-500/15 text-amber-400">Low</span>`:`<span class="chip bg-emerald-500/15 text-emerald-400">OK</span>`}</td>
        <td><div class="inline-flex items-center gap-1"><button class="adj w-7 h-7 rounded-md bg-slate-700/50 hover:bg-brand-500/30" data-id="${p.id}" data-d="-1">−</button><input type="number" value="${p.stock}" class="w-14 text-center bg-transparent border border-slate-600 rounded-md py-1 stk" data-id="${p.id}"><button class="adj w-7 h-7 rounded-md bg-slate-700/50 hover:bg-brand-500/30" data-id="${p.id}" data-d="1">+</button></div></td>
      </tr>`).join('')}</tbody></table></div>
    </div>`;
  }

  /* =========================================================
     CUSTOMERS
     ========================================================= */
  TABS.customers = function(){
    const cust=[['Amelia Carter','amelia@mail.com','12','Rs 1,170,000','VIP','2024-03-12'],['Daniel Kim','daniel@mail.com','5','Rs 445,000','Active','2024-07-21'],['Sofia Martinez','sofia@mail.com','8','Rs 625,000','Active','2025-01-05'],['Liam O\'Brien','liam@mail.com','3','Rs 210,000','New','2025-05-18'],['Yuki Tanaka','yuki@mail.com','15','Rs 2,410,000','VIP','2023-11-09'],['Marco Rossi','marco@mail.com','7','Rs 545,000','Active','2024-09-30']];
    return head('Customers','View and segment your customer base.') + `
    <div class="card p-4"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-400 border-b border-white/10 text-xs uppercase tracking-wider"><th class="py-3 px-2">Customer</th><th>Email</th><th>Orders</th><th>Spent</th><th>Status</th><th>Joined</th><th></th></tr></thead>
      <tbody>${cust.map(c=>`<tr class="border-b border-white/5"><td class="py-3 px-2 flex items-center gap-2"><img src="https://i.pravatar.cc/40?u=${encodeURIComponent(c[0])}" class="w-8 h-8 rounded-full" onerror="this.src='https://picsum.photos/seed/${encodeURIComponent(c[0])}/80'"><span class="font-medium text-slate-200">${esc(c[0])}</span></td><td class="text-slate-400">${esc(c[1])}</td><td>${c[2]}</td><td class="font-semibold">${c[3]}</td><td><span class="chip ${c[4]==='VIP'?'bg-amber-500/15 text-amber-400':'bg-emerald-500/15 text-emerald-400'}">${c[4]}</span></td><td class="text-slate-400">${c[5]}</td><td class="text-right"><button class="p-1.5 rounded-lg hover:bg-brand-500/15 text-brand-300" onclick="Admin.toast('Viewing ${esc(c[0])}','info')">${icon('eye','w-4 h-4')}</button></td></tr>`).join('')}</tbody></table></div></div>`;
  };

  /* =========================================================
     COUPONS
     ========================================================= */
  TABS.coupons = function(){
    return head('Coupons & Discounts','Create promotional offers.') + `
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${D.COUPONS.map(c=>`<div class="card p-5 border-dashed border-2 border-brand-500/30">
        <div class="flex justify-between items-start"><span class="font-bold text-brand-300 text-lg">${c.code}</span><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <p class="text-sm text-slate-300 mt-1">${esc(c.label)}</p>
        <div class="flex items-center justify-between mt-3 text-xs text-slate-400"><span>Min: ${money(c.min)}</span><span class="chip bg-brand-500/15 text-brand-300 capitalize">${c.type}</span></div>
        <div class="flex gap-2 mt-3"><button class="btn2 btn-gh px-3 py-1.5 text-xs flex-1" onclick="Admin.toast('Editing ${c.code}','info')">${icon('pencil','w-3.5 h-3.5')} Edit</button><button class="btn2 btn-gh px-3 py-1.5 text-xs text-rose-400" onclick="Admin.toast('Coupon deleted','info')">${icon('trash-2','w-3.5 h-3.5')}</button></div>
      </div>`).join('')}
      <button class="card p-5 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-500 hover:text-brand-300 transition" onclick="Admin.toast('New coupon form','info')">${icon('plus','w-8 h-8')}<span class="text-sm font-semibold">Create Coupon</span></button>
    </div>`;
  };

  /* =========================================================
     BANNERS
     ========================================================= */
  TABS.banners = function(){
    return head('Banner Management','Manage homepage hero slides and promo banners.') + `
    <div class="grid sm:grid-cols-2 gap-4">
      ${D.HERO_SLIDES.map((s,i)=>`<div class="card overflow-hidden">
        <div class="relative h-36"><img src="${D.U(s.img,500)}" class="w-full h-full object-cover" loading="lazy"><div class="absolute inset-0 bg-gradient-to-r ${s.grad} opacity-70"></div><span class="absolute top-2 left-2 chip bg-black/50 text-white">Slide ${i+1}</span><span class="absolute top-2 right-2 chip bg-emerald-500/80 text-white">Active</span></div>
        <div class="p-4"><h4 class="font-bold text-white">${esc(s.title)}</h4><p class="text-xs text-slate-400 mt-0.5">${esc(s.sub)}</p>
        <div class="flex gap-2 mt-3"><button class="btn2 btn-gh px-3 py-1.5 text-xs" onclick="Admin.toast('Edit slide ${i+1}','info')">${icon('pencil','w-3.5 h-3.5')} Edit</button><button class="btn2 btn-gh px-3 py-1.5 text-xs" onclick="Admin.toast('Reordered','info')">${icon('arrow-up-down','w-3.5 h-3.5')} Reorder</button><button class="btn2 btn-gh px-3 py-1.5 text-xs text-rose-400" onclick="Admin.toast('Banner removed','info')">${icon('trash-2','w-3.5 h-3.5')}</button></div>
        </div></div>`).join('')}
    </div>`;
  };

  /* =========================================================
     REVIEWS
     ========================================================= */
  TABS.reviews = function(){
    const prods = Store.allProducts().slice(0,6);
    return head('Reviews Moderation','Approve or reject customer reviews.') + `
    <div class="space-y-3">${prods.map(p=>`<div class="card p-4 flex items-start gap-3">
      ${img(D.U(p.imageId,80),'w-10 h-10 rounded-lg object-cover','p'+p.id)}
      <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><p class="font-medium text-slate-200 truncate">${esc(p.name)}</p><span class="text-amber-400 text-xs">${'★'.repeat(Math.max(1,Math.round(p.rating)))}</span><span class="chip bg-emerald-500/15 text-emerald-400">Verified</span></div>
      <p class="text-sm text-slate-400 mt-1">"Great product, exceeded my expectations! Delivery was fast and quality is premium."</p>
      <p class="text-[.7rem] text-slate-500 mt-1">by Customer · 2 days ago</p></div>
      <div class="flex gap-2 shrink-0"><button class="btn2 btn-gh px-3 py-1.5 text-xs text-emerald-400" onclick="Admin.toast('Review approved','success')">${icon('check','w-3.5 h-3.5')} Approve</button><button class="btn2 btn-gh px-3 py-1.5 text-xs text-rose-400" onclick="Admin.toast('Review rejected','info')">${icon('x','w-3.5 h-3.5')} Reject</button></div>
    </div>`).join('')}</div>`;
  };

  /* =========================================================
     SUPPORT TICKETS
     ========================================================= */
  TABS.tickets = function(){
    const t=[['#2041','Delivery delay','amelia@mail.com','Open','amber','2 hours ago'],['#2038','Refund request','daniel@mail.com','Pending','blue','5 hours ago'],['#2035','Product question','sofia@mail.com','Closed','slate','1 day ago'],['#2031','Damaged item','marco@mail.com','Open','amber','2 days ago']];
    return head('Support Tickets','Handle customer inquiries.') + `
    <div class="space-y-2">${t.map(r=>`<div class="card p-4 flex items-center gap-3">
      <span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-300">${icon('life-buoy','w-5 h-5')}</span>
      <div class="flex-1 min-w-0"><p class="text-sm font-medium text-slate-200">${r[0]} · ${esc(r[1])}</p><p class="text-[.7rem] text-slate-500">${esc(r[2])} · ${r[5]}</p></div>
      <span class="chip bg-${r[4]}-500/15 text-${r[4]}-400">${r[3]}</span>
      <button class="btn2 btn-gh px-3 py-1.5 text-xs" onclick="Admin.toast('Opening ticket ${r[0]}','info')">View</button>
    </div>`).join('')}</div>`;
  };

  /* =========================================================
     SETTINGS
     ========================================================= */
  TABS.settings = function(){
    return head('Settings','Configure your store.') + `
    <div class="grid lg:grid-cols-2 gap-4">
      <div class="card p-5"><h3 class="font-bold text-white mb-4">Store Information</h3>
        <div class="space-y-3">
          ${f('Store Name','s_name','text','Bachat Bazar')}
          ${f('Support Email','s_email','text','support@bachatbazar.com')}
          ${f('Support Phone','s_phone','text','+92 42 111 222 333')}
          <label class="block"><span class="block text-xs font-semibold text-slate-400 mb-1">Default Currency</span><select class="input"><option>PKR (Rs)</option><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>INR (₹)</option></select></label>
        </div>
        <button class="btn2 btn-pri px-5 py-2.5 mt-4" onclick="Admin.toast('Settings saved','success')">${icon('save','w-4 h-4')} Save Settings</button>
      </div>
      <div class="card p-5"><h3 class="font-bold text-white mb-4">Preferences</h3>
        <div class="space-y-3">${[['Email notifications',true],['New order alerts',true],['Low stock alerts',true],['Customer review alerts',false],['Weekly reports',true]].map(([l,v])=>`<div class="flex items-center justify-between py-1"><span class="text-sm text-slate-300">${l}</span><div class="switch ${v?'on':''}" onclick="this.classList.toggle('on')"></div></div>`).join('')}</div>
        <div class="border-t border-white/10 mt-5 pt-5">
          <h4 class="text-sm font-semibold text-rose-400 mb-2">Danger Zone</h4>
          <p class="text-xs text-slate-400 mb-3">Reset all products and categories to the original demo data. This cannot be undone.</p>
          <button class="btn2 btn-gh px-5 py-2.5 text-rose-400 border border-rose-500/30" onclick="Admin.confirmReset()">${icon('rotate-ccw','w-4 h-4')} Reset Catalog to Demo</button>
        </div>
      </div>
    </div>`;
  };

  /* ---------- export ---------- */
  function exportProducts(){
    const rows=[['Name','Brand','Category','Price','Stock','SKU'], ...Store.allProducts().map(p=>[p.name,p.brand,p.category,p.price,p.stock,p.sku])];
    const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='lumiere-products.csv'; a.click();
    toast('Products exported','success');
  }

  function confirmReset(){
    openModal(`<div class="p-6"><div class="flex items-start gap-3"><span class="grid place-items-center w-11 h-11 rounded-full bg-rose-500/15 text-rose-400">${icon('alert-triangle','w-6 h-6')}</span><div><h3 class="font-display text-lg font-bold text-white">Reset Catalog?</h3><p class="text-sm text-slate-400 mt-1">This will restore the original demo products and categories, discarding all your admin changes.</p></div></div>
      <div class="flex justify-end gap-2 mt-6"><button class="btn2 btn-gh px-5 py-2.5" onclick="Admin.closeModal()">Cancel</button><button class="btn2 btn-acc px-5 py-2.5" onclick="Admin.doReset()">Reset Now</button></div></div>`);
  }
  function doReset(){ Store.resetCatalog(); closeModal(); toast('Catalog reset to demo data','success'); render(); }

  /* ---------- view product modal ---------- */
  function viewProduct(id){
    const p=Store.product(id); if(!p) return;
    openModal(`<div class="p-6">
      <div class="flex items-center justify-between mb-4"><h3 class="font-display text-lg font-bold text-white">Product Details</h3><button onclick="Admin.closeModal()" class="p-2 rounded-lg hover:bg-white/5">${icon('x','w-5 h-5')}</button></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="rounded-xl overflow-hidden aspect-product">${img(D.U(p.imageId,500),'w-full h-full object-cover','vp'+p.id)}</div>
        <div class="space-y-2 text-sm">
          <p><span class="chip bg-brand-500/15 text-brand-300">${esc(p.brand)}</span></p>
          <h4 class="text-lg font-bold text-white">${esc(p.name)}</h4>
          <p class="text-slate-400">${esc(p.description)}</p>
          <div class="grid grid-cols-2 gap-2 pt-2">${[['SKU',p.sku],['Price',money(p.price)],['Stock',p.stock],['Rating',p.rating+' ★'],['Reviews',p.reviews],['Category',p.category]].map(([k,v])=>`<div class="card p-2"><p class="text-[.7rem] text-slate-500">${k}</p><p class="font-semibold text-slate-200">${esc(v)}</p></div>`).join('')}</div>
          <div class="flex gap-2 pt-2"><button class="btn2 btn-pri px-4 py-2 flex-1" onclick="Admin.closeModal();Admin.editProduct(${p.id})">${icon('pencil','w-4 h-4')} Edit</button><a class="btn2 btn-gh px-4 py-2 flex-1 justify-center" href="index.html#/product/${p.id}" target="_blank">${icon('external-link','w-4 h-4')} View Store</a></div>
        </div>
      </div></div>`, true);
  }

  function editProduct(id){ const p=Store.product(id); if(!p) return; openModal(productForm(p), true); bindForm(); }

  /* ---------- bind page actions ---------- */
  function bind(){
    // add buttons
    $('[data-add-product]')?.addEventListener('click',()=>{ openModal(productForm(null),true); bindForm(); });
    $('[data-add-cat]')?.addEventListener('click',()=>{ openModal(categoryForm(null)); bindCatForm(); });
    // products search
    const ps=$('#psearch'); if(ps) ps.oninput=()=>{ productSearch=ps.value; $('#prows').innerHTML=productRows(); icons(); };
    $('#pcat')?.addEventListener('change',()=>{ $('#prows').innerHTML=productRows(); });
    // product actions
    document.querySelectorAll('[data-edit]').forEach(b=> b.onclick=()=>editProduct(b.dataset.edit));
    document.querySelectorAll('[data-view]').forEach(b=> b.onclick=()=>viewProduct(b.dataset.view));
    document.querySelectorAll('[data-del]').forEach(b=> b.onclick=()=>{
      const p=Store.product(b.dataset.del);
      openModal(`<div class="p-6"><div class="flex items-start gap-3"><span class="grid place-items-center w-11 h-11 rounded-full bg-rose-500/15 text-rose-400">${icon('alert-triangle','w-6 h-6')}</span><div><h3 class="font-display text-lg font-bold text-white">Delete product?</h3><p class="text-sm text-slate-400 mt-1">"${esc(p.name)}" will be permanently removed.</p></div></div><div class="flex justify-end gap-2 mt-6"><button class="btn2 btn-gh px-5 py-2.5" onclick="Admin.closeModal()">Cancel</button><button class="btn2 btn-acc px-5 py-2.5" data-conf-del="${p.id}">Delete</button></div></div>`);
      $('[data-conf-del]').onclick=()=>{ Store.deleteProduct(p.id); closeModal(); toast('Product deleted','success'); render(); };
    });
    // restock (overview)
    document.querySelectorAll('[data-restock]').forEach(b=> b.onclick=()=>{ const p=Store.product(b.dataset.restock); Store.updateProduct(p.id,{...p, stock:50}); toast(`${p.name} restocked to 50`,'success'); render(); });
    // categories
    document.querySelectorAll('[data-editcat]').forEach(b=> b.onclick=()=>{ const c=Store.categories().find(x=>x.id===b.dataset.editcat); openModal(categoryForm(c)); bindCatForm(); });
    document.querySelectorAll('[data-delcat]').forEach(b=> b.onclick=()=>{ Store.deleteCategory(b.dataset.delcat); toast('Category deleted','success'); render(); });
    // orders status
    document.querySelectorAll('.ostatus').forEach(sel=> sel.onchange=()=>{ const id=sel.dataset.id; const o=Store.state.orders.find(o=>o.id===id); if(o){ o.status=sel.value; Store.save(); toast(`Order ${id} → ${sel.value}`,'success'); } else toast(`Order ${id} marked ${sel.value} (demo)`,'info'); });
    document.querySelectorAll('[data-order]').forEach(b=> b.onclick=()=>toast('Viewing order '+b.dataset.order,'info'));
    // inventory adjust
    document.querySelectorAll('.adj').forEach(b=> b.onclick=()=>{ const p=Store.product(b.dataset.id); Store.updateProduct(p.id,{...p, stock:Math.max(0,p.stock+ +b.dataset.d)}); render(); });
    document.querySelectorAll('.stk').forEach(inp=> inp.onchange=()=>{ const p=Store.product(inp.dataset.id); Store.updateProduct(p.id,{...p, stock:Math.max(0,+inp.value)}); toast('Stock updated','success'); });
    // ripple-ish
    document.querySelectorAll('.btn2').forEach(btn2=> btn2.addEventListener('click',e=>{ const r=document.createElement('span'); r.className='ripple'; const rc=btn2.getBoundingClientRect(); const s=Math.max(rc.width,rc.height); r.style.width=r.style.height=s+'px'; r.style.left=(e.clientX-rc.left-s/2)+'px'; r.style.top=(e.clientY-rc.top-s/2)+'px'; btn2.appendChild(r); setTimeout(()=>r.remove(),600); }));
    // topbar search
    $('#adminSearch')?.addEventListener('input',e=>{
      const v=e.target.value;
      if(tab==='products'){ productSearch=v; const ps=$('#psearch'); if(ps) ps.value=v; const rows=$('#prows'); if(rows){ rows.innerHTML=productRows(); icons(); } }
    });
  }
  function bindForm(){ const f=$('#pform'); if(f) f.onsubmit=saveProduct; }
  function bindCatForm(){ const f=$('#cform'); if(f) f.onsubmit=saveCategory; }

  function init(){
    if(Admin._locked) return;
    // ensure catalog seeded
    if(!Store.state.catalog) Store.save();
    render();
  }

  return { init, render, toast, openModal, closeModal, toggleSidebar, editProduct, viewProduct, exportProducts, confirmReset, doReset, saveProduct, saveCategory };
})();

document.addEventListener('DOMContentLoaded', Admin.init);
