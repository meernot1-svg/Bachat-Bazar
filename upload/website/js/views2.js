/* ============================================================
   Bachat Bazar — Views (part 2)
   Cart page, Checkout, Account Dashboard, Admin Dashboard,
   Auth views, static pages (about, faq, contact, blog, policies)
   ============================================================ */

const D2 = window.DATA;

/* ============================================================
   CART PAGE (full page)
   ============================================================ */
Views.cartPage = function(){
  const items = Store.state.cart.map(i=>({...i, p:Store.product(i.id)})).filter(x=>x.p);
  const saved = Store.state.saved.map(i=>({...i, p:Store.product(i.id)})).filter(x=>x.p);
  const t = Store.cartTotals();
  if(items.length===0 && saved.length===0){
    return Views.emptyState('shopping-cart','Your cart is empty','Looks like you haven\'t added anything yet.','#/shop','Start Shopping');
  }
  return `
  <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <h1 class="font-display text-3xl font-extrabold mb-6">Shopping Cart</h1>
    <div class="grid lg:grid-cols-[1fr_22rem] gap-6">
      <div class="space-y-4">
        ${items.length?`
        <div class="glass rounded-2xl border border-white/20 overflow-hidden">
          <div class="hidden md:grid grid-cols-[1fr_7rem_7rem_2rem] gap-4 px-5 py-3 text-xs font-semibold text-slate-400 uppercase border-b border-white/10">
            <span>Product</span><span class="text-center">Quantity</span><span class="text-right">Total</span><span></span>
          </div>
          ${items.map(it=>`
            <div class="cart-row grid grid-cols-[1fr] md:grid-cols-[1fr_7rem_7rem_2rem] gap-4 items-center px-5 py-4 border-b border-white/5 last:border-0" data-id="${it.p.id}">
              <div class="flex items-center gap-4">
                <a href="#/product/${it.p.id}" class="w-20 h-20 rounded-xl overflow-hidden shrink-0">${UI.img(D2.U(it.p.imageId,200),it.p.name,'w-full h-full object-cover','cr'+it.p.id)}</a>
                <div>
                  <p class="text-xs text-brand-500 font-semibold uppercase">${it.p.brand}</p>
                  <a href="#/product/${it.p.id}" class="font-medium text-sm hover:text-brand-500">${UI.escapeHtml(it.p.name)}</a>
                  <p class="text-sm text-slate-500 mt-1">${Store.money(it.p.price)}</p>
                  <button class="text-xs text-brand-500 hover:underline md:hidden cart-remove" data-id="${it.p.id}">Remove</button>
                </div>
              </div>
              <div class="qty-box flex items-center justify-center">
                <button class="qbtn px-3 py-2 hover:bg-brand-500/10 rounded-lg" data-act="minus">−</button>
                <input type="number" value="${it.qty}" min="1" max="${it.p.stock||99}" class="qty-val w-10 text-center bg-transparent outline-none font-bold">
                <button class="qbtn px-3 py-2 hover:bg-brand-500/10 rounded-lg" data-act="plus">+</button>
              </div>
              <div class="text-right font-bold">${Store.money(it.p.price*it.qty)}</div>
              <div class="text-right">
                <button class="cart-remove hidden md:grid place-items-center w-9 h-9 rounded-lg hover:bg-rose-500/10 text-rose-500" data-id="${it.p.id}" title="Remove">${UI.icon('trash-2','w-4 h-4')}</button>
              </div>
            </div>`).join('')}
        </div>
        <div class="flex gap-2 flex-wrap">
          <button id="clearCartBtn" class="btn btn-ghost px-5 py-2.5 text-sm">${UI.icon('trash-2','w-4 h-4')} Clear Cart</button>
          <a href="#/shop" class="btn btn-light px-5 py-2.5 text-sm">${UI.icon('arrow-left','w-4 h-4')} Continue Shopping</a>
        </div>`:'<div class="glass rounded-2xl border border-white/20 p-8 text-center text-slate-500">Your cart is empty.</div>'}

        ${saved.length?`
        <div class="mt-8">
          <h2 class="font-display text-xl font-bold mb-3">Saved for Later (${saved.length})</h2>
          <div class="space-y-3">
            ${saved.map(it=>`
              <div class="glass rounded-2xl border border-white/20 p-4 flex items-center gap-4">
                <a href="#/product/${it.p.id}" class="w-16 h-16 rounded-xl overflow-hidden">${UI.img(D2.U(it.p.imageId,160),it.p.name,'w-full h-full object-cover','sv'+it.p.id)}</a>
                <div class="flex-1"><p class="font-medium text-sm">${UI.escapeHtml(it.p.name)}</p><p class="text-brand-500 font-bold">${Store.money(it.p.price)}</p></div>
                <button class="move-cart btn btn-ghost px-4 py-2 text-sm" data-id="${it.p.id}">${UI.icon('shopping-cart','w-4 h-4')} Move to Cart</button>
                <button class="cart-remove btn btn-ghost px-3 py-2 text-sm text-rose-500" data-id="${it.p.id}">${UI.icon('trash-2','w-4 h-4')}</button>
              </div>`).join('')}
          </div>
        </div>`:''}
      </div>

      <!-- Summary -->
      <aside class="lg:sticky lg:top-32 self-start">
        <div class="glass rounded-2xl border border-white/20 p-5 space-y-3">
          <h3 class="font-display text-lg font-bold">Order Summary</h3>
          <!-- coupon -->
          <div>
            <div class="flex gap-2">
              <input id="couponInput" type="text" placeholder="Coupon code" value="${Store.state.coupon?.code||''}" class="flex-1 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <button id="applyCouponBtn" class="btn btn-ghost px-4 py-2.5 text-sm">Apply</button>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              ${D2.COUPONS.slice(0,3).map(c=>`<button class="coupon-chip text-[.65rem] px-2 py-1 rounded-md bg-brand-500/10 text-brand-500 font-semibold" data-code="${c.code}">${c.code}</button>`).join('')}
            </div>
          </div>
          <!-- gift card -->
          <details class="text-sm"><summary class="cursor-pointer font-semibold flex items-center gap-1">${UI.icon('gift','w-4 h-4')} Gift Card</summary><div class="flex gap-2 mt-2"><input placeholder="Gift card number" class="flex-1 px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm"><button class="btn btn-ghost px-3 py-2 text-sm" onclick="UI.toast('Gift card applied','success')">Apply</button></div></details>
          <div class="border-t border-white/10 pt-3 space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-500">Subtotal</span><span class="font-semibold">${t.subDisplay}</span></div>
            ${t.discount>0?`<div class="flex justify-between text-emerald-500"><span>Discount (${Store.state.coupon?.code||''})</span><span>−${t.discountDisplay}</span></div>`:''}
            <div class="flex justify-between"><span class="text-slate-500">Shipping</span><span class="${t.shipping===0?'text-emerald-500 font-semibold':'font-semibold'}">${t.shipping===0?'FREE':t.shipDisplay}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Tax (8%)</span><span class="font-semibold">${t.taxDisplay}</span></div>
          </div>
          <div class="border-t border-white/10 pt-3 flex justify-between items-center">
            <span class="font-display font-bold">Grand Total</span>
            <span class="font-display text-2xl font-extrabold text-brand-500">${t.totalDisplay}</span>
          </div>
          <a href="#/checkout" class="btn btn-primary w-full py-3.5 mt-2">${UI.icon('shield-check','w-5 h-5')} Proceed to Checkout</a>
          <div class="flex items-center justify-center gap-2 text-xs text-slate-400">${UI.icon('lock','w-3.5 h-3.5')} Secure SSL encrypted checkout</div>
        </div>
      </aside>
    </div>
  </div>`;
};

Views.emptyState = function(iconName,title,sub,link,btn){
  return `<div class="max-w-xl mx-auto text-center py-24 px-4"><span class="grid place-items-center w-24 h-24 mx-auto rounded-full bg-brand-500/10 text-brand-500 mb-5">${UI.icon(iconName,'w-12 h-12')}</span><h1 class="font-display text-3xl font-extrabold">${title}</h1><p class="text-slate-500 mt-2">${sub}</p><a href="${link}" class="btn btn-primary mt-6 px-7 py-3">${UI.icon('shopping-bag','w-5 h-5')} ${btn}</a></div>`;
};

/* ============================================================
   WISHLIST PAGE
   ============================================================ */
Views.wishlistPage = function(){
  const items = Store.state.wishlist.map(id=>Store.product(id)).filter(Boolean);
  if(!items.length) return Views.emptyState('heart','Your wishlist is empty','Save items you love to find them quickly later.','#/shop','Start Shopping');
  return `<div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <div class="flex items-center justify-between mb-6"><h1 class="font-display text-3xl font-extrabold">My Wishlist</h1><span class="text-slate-500">${items.length} items</span></div>
    ${Views.productGrid(items)}</div>`;
};

/* ============================================================
   COMPARE PAGE
   ============================================================ */
Views.comparePage = function(){
  const items = Store.state.compare.map(id=>Store.product(id)).filter(Boolean);
  if(!items.length) return Views.emptyState('git-compare','Nothing to compare yet','Add products to compare their features side by side.','#/shop','Browse Products');
  const rows = [['Price', p=>Store.money(p.price)],['Brand',p=>p.brand],['Rating',p=>`${UI.stars(p.rating,'w-4 h-4')} ${p.rating}`],['Reviews',p=>p.reviews.toLocaleString()],['Stock',p=>p.stock>0?`<span class="text-emerald-500">${p.stock} left</span>`:'<span class="text-rose-500">Out</span>'],['Category',p=>p.category],['SKU',p=>p.sku]];
  return `<div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <h1 class="font-display text-3xl font-extrabold mb-6">Compare Products</h1>
    <div class="overflow-x-auto"><table class="w-full border-collapse">
      <thead><tr><th class="p-3"></th>${items.map(p=>`<th class="p-3 min-w-[14rem]"><div class="relative group">
        <button class="absolute -top-2 -right-2 z-10 w-7 h-7 grid place-items-center rounded-full bg-rose-500 text-white text-xs cmp-remove" data-id="${p.id}">${UI.icon('x','w-3.5 h-3.5')}</button>
        <a href="#/product/${p.id}" class="block aspect-product rounded-xl overflow-hidden mb-2">${UI.img(D2.U(p.imageId,300),p.name,'w-full h-full object-cover','cmp'+p.id)}</a>
        <a href="#/product/${p.id}" class="text-sm font-medium hover:text-brand-500">${UI.escapeHtml(p.name)}</a>
      </div></th>`).join('')}</tr></thead>
      <tbody>${rows.map(([label,fn])=>`<tr class="border-t border-slate-200 dark:border-slate-800"><td class="p-3 font-semibold text-slate-500 text-sm">${label}</td>${items.map(p=>`<td class="p-3 text-sm text-center">${fn(p)}</td>`).join('')}</tr>`).join('')}
        <tr class="border-t border-slate-200 dark:border-slate-800"><td class="p-3"></td>${items.map(p=>`<td class="p-3 text-center"><button class="btn btn-primary px-5 py-2 text-sm cmp-add" data-id="${p.id}">${UI.icon('shopping-cart','w-4 h-4')} Add</button></td>`).join('')}</tr>
      </tbody>
    </table></div></div>`;
};

/* ============================================================
   CHECKOUT (multi-step)
   ============================================================ */
Views.checkoutState = { step:1, shipping:'standard', payment:'card', giftWrap:false };
Views.checkout = function(){
  if(Store.cartCount()===0){ return Views.emptyState('shopping-cart','Your cart is empty','Add items before checking out.','#/shop','Start Shopping'); }
  const steps=['Details','Shipping','Payment','Review'];
  const t = Store.cartTotals();
  return `<div class="max-w-5xl mx-auto px-4 py-8 fade-in">
    <h1 class="font-display text-3xl font-extrabold mb-6">Checkout</h1>
    <!-- stepper -->
    <div class="flex items-center justify-between mb-8 max-w-3xl mx-auto" id="stepper">
      ${steps.map((s,i)=>`<div class="flex items-center flex-1 last:flex-none">
        <div class="flex flex-col items-center"><span class="step-dot grid place-items-center w-10 h-10 rounded-full font-bold text-sm ${i+1<=Views.checkoutState.step?'bg-brand-500 text-white':'bg-slate-200 dark:bg-slate-700 text-slate-500'}">${i+1<=Views.checkoutState.step?UI.icon('check','w-5 h-5'):i+1}</span><span class="text-[.7rem] mt-1 font-semibold ${i+1===Views.checkoutState.step?'text-brand-500':'text-slate-400'}">${s}</span></div>
        ${i<steps.length-1?`<div class="flex-1 h-0.5 mx-2 ${i+1<Views.checkoutState.step?'bg-brand-500':'bg-slate-200 dark:bg-slate-700'}"></div>`:''}
      </div>`).join('')}
    </div>

    <div class="grid lg:grid-cols-[1fr_20rem] gap-6">
      <div class="glass rounded-2xl border border-white/20 p-6" id="checkoutBody">
        ${Views.checkoutStep()}
      </div>
      <aside class="lg:sticky lg:top-32 self-start">
        <div class="glass rounded-2xl border border-white/20 p-5">
          <h3 class="font-display font-bold mb-3">Order Summary</h3>
          <div class="space-y-2 max-h-52 overflow-auto pr-1">
            ${Store.state.cart.map(i=>{const p=Store.product(i.id);return p?`<div class="flex items-center gap-2"><img src="${D2.U(p.imageId,80)}" class="w-10 h-10 rounded-lg object-cover" loading="lazy"><div class="flex-1 min-w-0"><p class="text-xs font-medium truncate">${UI.escapeHtml(p.name)}</p><p class="text-xs text-slate-400">x${i.qty}</p></div><span class="text-xs font-semibold">${Store.money(p.price*i.qty)}</span></div>`:'';}).join('')}
          </div>
          <div class="border-t border-white/10 mt-3 pt-3 space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-500">Subtotal</span><span>${t.subDisplay}</span></div>
            ${t.discount>0?`<div class="flex justify-between text-emerald-500"><span>Discount</span><span>−${t.discountDisplay}</span></div>`:''}
            <div class="flex justify-between"><span class="text-slate-500">Shipping</span><span>${t.shipping===0?'FREE':t.shipDisplay}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Tax</span><span>${t.taxDisplay}</span></div>
            ${Views.checkoutState.giftWrap?`<div class="flex justify-between"><span class="text-slate-500">Gift Wrap</span><span>$5.00</span></div>`:''}
          </div>
          <div class="border-t border-white/10 mt-3 pt-3 flex justify-between font-bold"><span>Total</span><span class="text-brand-500 text-xl">${t.totalDisplay}${Views.checkoutState.giftWrap?'+$5':''}</span></div>
        </div>
      </aside>
    </div>
  </div>`;
};

Views.checkoutStep = function(){
  const s = Views.checkoutState.step;
  if(s===1) return Views.checkoutDetails();
  if(s===2) return Views.checkoutShipping();
  if(s===3) return Views.checkoutPayment();
  return Views.checkoutReview();
};

Views.field = (label,name,type='text',val='',req=true)=>`<label class="block"><span class="text-sm font-medium text-slate-500">${label}</span><input type="${type}" name="${name}" value="${UI.escapeHtml(val||'')}" ${req?'required':''} class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"></label>`;

Views.checkoutDetails = function(){
  const u = Store.state.user; const a = Store.state.addresses[0]||{};
  return `<h2 class="font-display text-xl font-bold mb-4">Customer & Shipping Details</h2>
    <form id="checkoutForm" class="grid sm:grid-cols-2 gap-4">
      ${Views.field('First Name','fname','text',u?.name?.split(' ')[0]||'')}
      ${Views.field('Last Name','lname','text',u?.name?.split(' ')[1]||'')}
      ${Views.field('Email','email','email',u?.email||'')}
      ${Views.field('Phone','phone','tel',a?.phone||'')}
      <div class="sm:col-span-2">${Views.field('Address','address','text',a?.line||'')}</div>
      ${Views.field('City','city','text',a?.city||'')}
      ${Views.field('State / Province','state','text',a?.state||'')}
      ${Views.field('ZIP / Postal Code','zip','text',a?.zip||'')}
      ${Views.field('Country','country','text',a?.country||'USA')}
      <label class="flex items-center gap-2 text-sm sm:col-span-2 cursor-pointer"><input type="checkbox" id="billSame" class="accent-brand-500" checked> Billing address same as shipping</label>
      <div class="sm:col-span-2 flex justify-between mt-2"><a href="#/cart" class="btn btn-ghost px-5 py-2.5">${UI.icon('arrow-left','w-4 h-4')} Back to Cart</a><button type="submit" class="btn btn-primary px-7 py-3">Continue to Shipping ${UI.icon('arrow-right','w-5 h-5')}</button></div>
    </form>`;
};

Views.checkoutShipping = function(){
  return `<h2 class="font-display text-xl font-bold mb-4">Shipping Method</h2>
    <div class="space-y-3" id="shipMethods">
      ${D2.SHIPPING_METHODS.map(m=>`
        <label class="flex items-center gap-3 glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/40">
          <input type="radio" name="ship" value="${m.id}" ${Views.checkoutState.shipping===m.id?'checked':''} class="accent-brand-500">
          <span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon(m.id==='overnight'?'zap':m.id==='express'?'truck':'package','w-5 h-5')}</span>
          <div class="flex-1"><p class="font-semibold text-sm">${m.name}</p><p class="text-xs text-slate-500">${m.desc}</p></div>
          <span class="font-bold text-sm">${m.cost===0?'FREE':Store.money(m.cost)}</span>
        </label>`).join('')}
    </div>
    <label class="flex items-center gap-2 text-sm mt-4 cursor-pointer glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4"><input type="checkbox" id="giftWrap" ${Views.checkoutState.giftWrap?'checked':''} class="accent-brand-500"> ${UI.icon('gift','w-4 h-4 text-accent-500')} Add premium gift wrapping (+$5.00)</label>
    <div class="flex justify-between mt-5"><button id="stepBack" class="btn btn-ghost px-5 py-2.5">${UI.icon('arrow-left','w-4 h-4')} Back</button><button id="stepNext" class="btn btn-primary px-7 py-3">Continue to Payment ${UI.icon('arrow-right','w-5 h-5')}</button></div>`;
};

Views.checkoutPayment = function(){
  return `<h2 class="font-display text-xl font-bold mb-4">Payment Method</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="payMethods">
      ${D2.PAYMENTS.map(pay=>`
        <label class="flex flex-col items-center gap-2 glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/40 text-center">
          <input type="radio" name="pay" value="${pay.id}" ${Views.checkoutState.payment===pay.id?'checked':''} class="hidden">
          <span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon(pay.icon,'w-5 h-5')}</span>
          <span class="text-xs font-semibold">${pay.name}</span>
        </label>`).join('')}
    </div>
    <div id="payFields" class="mt-5">${Views.payFields(Views.checkoutState.payment)}</div>
    <div class="flex justify-between mt-5"><button id="stepBack" class="btn btn-ghost px-5 py-2.5">${UI.icon('arrow-left','w-4 h-4')} Back</button><button id="stepNext" class="btn btn-primary px-7 py-3">Review Order ${UI.icon('arrow-right','w-5 h-5')}</button></div>`;
};

Views.payFields = function(id){
  if(id==='card'||id==='stripe'){ return `<div class="grid sm:grid-cols-2 gap-4">${Views.field('Card Number','card','text','4242 4242 4242 4242')}<div class="grid grid-cols-2 gap-4">${Views.field('Expiry','exp','text','12/28')}${Views.field('CVC','cvc','text','123')}</div></div>`; }
  if(id==='upi'){ return Views.field('UPI ID','upi','text','name@bank'); }
  if(id==='cod') return `<div class="glass-strong rounded-xl p-4 text-sm text-slate-500">${UI.icon('info','w-4 h-4 inline')} Pay with cash when your order is delivered. A small handling fee may apply.</div>`;
  return `<div class="glass-strong rounded-xl p-4 text-sm text-slate-500 flex items-center gap-2">${UI.icon('shield-check','w-5 h-5 text-emerald-500')} You'll be redirected to complete your payment securely.</div>`;
};

Views.checkoutReview = function(){
  const t = Store.cartTotals();
  const ship = D2.SHIPPING_METHODS.find(m=>m.id===Views.checkoutState.shipping);
  const pay = D2.PAYMENTS.find(p=>p.id===Views.checkoutState.payment);
  return `<h2 class="font-display text-xl font-bold mb-4">Review & Place Order</h2>
    <div class="space-y-3 text-sm">
      <div class="glass-strong rounded-xl p-4"><p class="font-semibold mb-1">Shipping to</p><p class="text-slate-500">Shahrah-e-Faisal, Karachi, Pakistan</p><p class="text-slate-500">${ship?.name} · ${ship?.desc}</p></div>
      <div class="glass-strong rounded-xl p-4"><p class="font-semibold mb-1">Payment</p><p class="text-slate-500 capitalize">${pay?.name}</p></div>
      <div class="glass-strong rounded-xl p-4"><p class="font-semibold mb-1">Items (${Store.cartCount()})</p>${Store.state.cart.map(i=>{const p=Store.product(i.id);return `<p class="text-slate-500">${p?.name} × ${i.qty}</p>`;}).join('')}</div>
    </div>
    <div class="flex justify-between mt-6"><button id="stepBack" class="btn btn-ghost px-5 py-2.5">${UI.icon('arrow-left','w-4 h-4')} Back</button><button id="placeOrderBtn" class="btn btn-accent px-8 py-3.5">${UI.icon('shield-check','w-5 h-5')} Place Order · ${t.totalDisplay}${Views.checkoutState.giftWrap?'+$5':''}</button></div>`;
};

Views.orderSuccess = function(order){
  return `<div class="max-w-2xl mx-auto text-center py-16 px-4 fade-in">
    <div class="grid place-items-center w-24 h-24 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 mb-5 scale-in">${UI.icon('check-circle-2','w-14 h-14')}</div>
    <h1 class="font-display text-4xl font-extrabold">Order Confirmed!</h1>
    <p class="text-slate-500 mt-2">Thank you for your purchase. A confirmation email has been sent.</p>
    <div class="glass rounded-2xl border border-white/20 p-5 mt-6 text-left text-sm">
      <div class="flex justify-between py-1"><span class="text-slate-500">Order Number</span><span class="font-bold">${order.id}</span></div>
      <div class="flex justify-between py-1"><span class="text-slate-500">Total</span><span class="font-bold text-brand-500">${order.totals.totalDisplay}</span></div>
      <div class="flex justify-between py-1"><span class="text-slate-500">Payment</span><span class="capitalize">${order.payment}</span></div>
      <div class="flex justify-between py-1"><span class="text-slate-500">Estimated Delivery</span><span class="font-bold">${new Date(order.eta).toLocaleDateString()}</span></div>
    </div>
    <div class="flex gap-3 justify-center mt-6">
      <a href="#/orders" class="btn btn-primary px-6 py-3">${UI.icon('package','w-5 h-5')} Track Order</a>
      <a href="#/shop" class="btn btn-light px-6 py-3">Continue Shopping</a>
    </div>
    <p class="text-xs text-slate-400 mt-4">You earned <strong class="text-amber-500">${Math.round(order.totals.total)} loyalty points!</strong></p>
  </div>`;
};

/* ============================================================
   AUTH VIEWS (in modal)
   ============================================================ */
Views.authState = { mode:'login' };
Views.auth = function(){
  const m = Views.authState.mode;
  const titles = { login:'Welcome Back', register:'Create Account', forgot:'Reset Password', otp:'Verify OTP' };
  UI.openModal('authModal', `
    <button onclick="UI.closeModal('authModal')" class="absolute top-3 right-3 z-10 p-2 rounded-xl hover:bg-slate-500/10">${UI.icon('x','w-5 h-5')}</button>
    <div class="grid sm:grid-cols-2">
      <div class="hidden sm:block relative">
        <img src="${D2.U('1571902943202-507ec2618e8f',500)}" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/auth/500'">
        <div class="absolute inset-0 bg-gradient-to-br from-brand-600/90 to-accent-500/80 mix-blend-multiply"></div>
        <div class="absolute inset-0 p-6 flex flex-col justify-end text-white">
          <span class="grid place-items-center w-11 h-11 rounded-xl bg-white/20 mb-3">${UI.icon('gem','w-6 h-6')}</span>
          <h3 class="font-display text-2xl font-extrabold">Bachat Bazar</h3>
          <p class="text-sm text-white/80 mt-1">Premium shopping, redefined.</p>
        </div>
      </div>
      <div class="p-6">
        <h2 class="font-display text-2xl font-bold">${titles[m]}</h2>
        <p class="text-sm text-slate-500 mt-1">${m==='login'?'Sign in to your account':m==='register'?'Join us and start shopping':m==='forgot'?'Enter your email to reset password':'Enter the 6-digit code sent to your email'}</p>
        <div id="authBody" class="mt-5">${Views.authForm(m)}</div>
      </div>
    </div>`);
};

Views.authForm = function(m){
  if(m==='login') return `
    <form id="authForm" class="space-y-3">
      ${Views.field('Email','email','email','demo@bachatbazar.com')}
      ${Views.field('Password','password','password','demo1234')}
      <div class="flex items-center justify-between text-sm"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="accent-brand-500"> Remember me</label><button type="button" class="text-brand-500 hover:underline" data-auth="forgot">Forgot password?</button></div>
      <button type="submit" class="btn btn-primary w-full py-3">Sign In</button>
    </form>
    <div class="relative my-4 text-center"><span class="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 relative z-10">or continue with</span><div class="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700"></div></div>
    <div class="grid grid-cols-2 gap-3">
      <button class="btn btn-light py-2.5 social-login" data-social="Google">${UI.icon('chrome','w-4 h-4')} Google</button>
      <button class="btn btn-light py-2.5 social-login" data-social="Facebook">${UI.icon('facebook','w-4 h-4')} Facebook</button>
    </div>
    <p class="text-sm text-center mt-5 text-slate-500">Don't have an account? <button class="text-brand-500 font-semibold hover:underline" data-auth="register">Sign up</button></p>`;

  if(m==='register') return `
    <form id="authForm" class="space-y-3">
      ${Views.field('Full Name','name','text','')}
      ${Views.field('Email','email','email','')}
      ${Views.field('Password','password','password','')}
      <label class="flex items-start gap-2 text-xs text-slate-500 cursor-pointer"><input type="checkbox" required class="accent-brand-500 mt-0.5"> I agree to the <a href="#/terms" class="text-brand-500">Terms</a> and <a href="#/privacy" class="text-brand-500">Privacy Policy</a></label>
      <button type="submit" class="btn btn-primary w-full py-3">Create Account</button>
      <div class="grid grid-cols-2 gap-3 mt-2">
        <button class="btn btn-light py-2.5 social-login" data-social="Google">${UI.icon('chrome','w-4 h-4')} Google</button>
        <button class="btn btn-light py-2.5 social-login" data-social="Facebook">${UI.icon('facebook','w-4 h-4')} Facebook</button>
      </div>
    </form>
    <p class="text-sm text-center mt-5 text-slate-500">Already have an account? <button class="text-brand-500 font-semibold hover:underline" data-auth="login">Sign in</button></p>`;

  if(m==='forgot') return `
    <form id="authForm" class="space-y-3">
      ${Views.field('Email','email','email','')}
      <button type="submit" class="btn btn-primary w-full py-3">Send Reset Code</button>
      <button type="button" class="text-sm text-brand-500 hover:underline w-full text-center" data-auth="login">Back to login</button>
    </form>`;

  if(m==='otp') return `
    <form id="authForm" class="space-y-3">
      <div class="flex justify-center gap-2" id="otpInputs">${Array.from({length:6}).map((_,i)=>`<input maxlength="1" class="otp-input w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500">`).join('')}</div>
      <button type="submit" class="btn btn-primary w-full py-3">Verify & Continue</button>
      <p class="text-sm text-center text-slate-500">Didn't receive code? <button type="button" class="text-brand-500 hover:underline">Resend in 0:30</button></p>
      <button type="button" class="text-sm text-brand-500 hover:underline w-full text-center" data-auth="login">Back to login</button>
    </form>`;
  return '';
};

/* ============================================================
   ACCOUNT / USER DASHBOARD
   ============================================================ */
Views.accountState = { tab:'profile' };
Views.account = function(){
  if(!Store.state.user){ Views.authState.mode='login'; Views.auth(); return `<div class="max-w-xl mx-auto text-center py-24 px-4"><span class="grid place-items-center w-20 h-20 mx-auto rounded-full bg-brand-500/10 text-brand-500 mb-4">${UI.icon('user','w-10 h-10')}</span><h1 class="font-display text-2xl font-bold">Please sign in</h1><p class="text-slate-500 mt-2">Sign in to access your dashboard.</p><button id="authOpen" class="btn btn-primary mt-5 px-6 py-3">Sign In</button></div>`; }
  const u = Store.state.user; const tab = Views.accountState.tab;
  const nav = [['profile','Profile','user-circle'],['orders','My Orders','package'],['wishlist','Wishlist','heart'],['addresses','Addresses','map-pin'],['payments','Payment Methods','credit-card'],['tracking','Order Tracking','truck'],['invoices','Invoices','file-text'],['returns','Returns','rotate-ccw'],['rewards','Loyalty Rewards','gift'],['settings','Settings','settings']];
  return `<div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <div class="grid lg:grid-cols-[16rem_1fr] gap-6">
      <aside class="glass rounded-2xl border border-white/20 p-4 lg:sticky lg:top-32 self-start">
        <div class="flex items-center gap-3 p-3">
          <img src="${D2.U('1494790108377-be9c29b29330',100)}" class="w-12 h-12 rounded-full object-cover" onerror="this.src='https://picsum.photos/seed/me/80'">
          <div><p class="font-bold">${UI.escapeHtml(u.name)}</p><p class="text-xs text-slate-400 truncate">${u.email}</p></div>
        </div>
        <nav class="mt-3 space-y-1">
          ${nav.map(([k,l,i])=>`<button data-acctab="${k}" class="acctab w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left ${tab===k?'bg-brand-500 text-white':'hover:bg-brand-500/10'}">${UI.icon(i,'w-4 h-4')} ${l}</button>`).join('')}
          <button id="logoutBtn" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left text-rose-500 hover:bg-rose-500/10">${UI.icon('log-out','w-4 h-4')} Logout</button>
        </nav>
      </aside>
      <div class="glass rounded-2xl border border-white/20 p-6 min-h-[30rem]">${Views.accountTab(tab,u)}</div>
    </div>
  </div>`;
};

Views.accountTab = function(tab,u){
  if(tab==='profile') return `<h2 class="font-display text-xl font-bold mb-4">Profile Information</h2><form class="grid sm:grid-cols-2 gap-4 max-w-2xl" onsubmit="event.preventDefault();UI.toast('Profile updated','success')">
    ${Views.field('First Name','fname','text',u.name?.split(' ')[0]||'')}${Views.field('Last Name','lname','text',u.name?.split(' ')[1]||'')}${Views.field('Email','email','email',u.email)}${Views.field('Phone','phone','tel','+1 555 0100')}
    <div class="sm:col-span-2"><button class="btn btn-primary px-6 py-2.5">${UI.icon('save','w-4 h-4')} Save Changes</button></div></form>`;
  if(tab==='orders') return Views.accountOrders();
  if(tab==='wishlist') { const items=Store.state.wishlist.map(id=>Store.product(id)).filter(Boolean); return items.length?Views.productGrid(items):`<div class="text-center py-16 text-slate-500">${UI.icon('heart','w-10 h-10 mx-auto mb-3 opacity-50')}No items in wishlist</div>`; }
  if(tab==='addresses') return `<h2 class="font-display text-xl font-bold mb-4">Saved Addresses</h2>${(Store.state.addresses.length?Store.state.addresses:[]).map(a=>`<div class="glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 flex items-start gap-3"><span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon('home','w-5 h-5')}</span><div class="flex-1"><p class="font-semibold text-sm">${a.label} ${a.default?'<span class="text-xs text-emerald-500">Default</span>':''}</p><p class="text-sm text-slate-500">${a.line}, ${a.city}, ${a.state} ${a.zip}, ${a.country}</p><p class="text-xs text-slate-400">${a.phone}</p></div><button class="text-brand-500 text-sm">${UI.icon('edit','w-4 h-4')}</button></div>`).join('')}<button class="btn btn-ghost px-5 py-2.5 text-sm" onclick="UI.toast('Add address form','info')">${UI.icon('plus','w-4 h-4')} Add New Address</button>`;
  if(tab==='payments') return `<h2 class="font-display text-xl font-bold mb-4">Payment Methods</h2>${[['Visa','•••• 4242','credit-card'],['Mastercard','•••• 5318','credit-card']].map(([b,n,i])=>`<div class="glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 flex items-center gap-3"><span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon(i,'w-5 h-5')}</span><div class="flex-1"><p class="font-semibold text-sm">${b}</p><p class="text-sm text-slate-500">${n}</p></div><button class="text-rose-500">${UI.icon('trash-2','w-4 h-4')}</button></div>`).join('')}<button class="btn btn-ghost px-5 py-2.5 text-sm" onclick="UI.toast('Add card','info')">${UI.icon('plus','w-4 h-4')} Add Card</button>`;
  if(tab==='tracking') return Views.orderTracking();
  if(tab==='invoices') { const ords=Store.state.orders; return `<h2 class="font-display text-xl font-bold mb-4">Invoices</h2>${ords.length?ords.map(o=>`<div class="glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 flex items-center gap-3"><span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon('file-text','w-5 h-5')}</span><div class="flex-1"><p class="font-semibold text-sm">Invoice ${o.id}</p><p class="text-xs text-slate-400">${new Date(o.date).toLocaleDateString()}</p></div><span class="font-bold text-sm">${o.totals.totalDisplay}</span><button class="btn btn-ghost px-3 py-2 text-sm" onclick="Views.invoice('${o.id}')">${UI.icon('download','w-4 h-4')} PDF</button></div>`).join(''):'<div class="text-center py-16 text-slate-500">No invoices yet</div>'}`; }
  if(tab==='returns') return `<h2 class="font-display text-xl font-bold mb-4">Returns & Refunds</h2>${Store.state.orders.length?`<div class="glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 flex items-center gap-3"><span class="grid place-items-center w-10 h-10 rounded-lg bg-amber-500/15 text-amber-500">${UI.icon('rotate-ccw','w-5 h-5')}</span><div class="flex-1"><p class="font-semibold text-sm">Return request</p><p class="text-xs text-slate-400">30-day return window open</p></div><button class="btn btn-ghost px-4 py-2 text-sm" onclick="UI.toast('Return request submitted','success')">Request Return</button></div>`:'<div class="text-center py-16 text-slate-500">No orders to return</div>'}`;
  if(tab==='rewards') return `<div class="text-center py-8"><div class="text-5xl font-extrabold text-amber-500">${Store.state.rewards.toLocaleString()}</div><p class="text-slate-500 mt-1">Loyalty Points</p><div class="grid grid-cols-3 gap-3 mt-6 max-w-md mx-auto">${[['Bronze','0-1K','🥉'],['Silver','1K-5K','🥈'],['Gold','5K+','🥇']].map(([t,r,e])=>`<div class="glass-strong rounded-xl p-4"><div class="text-3xl">${e}</div><p class="font-semibold text-sm mt-1">${t}</p><p class="text-xs text-slate-400">${r}</p></div>`).join('')}</div><button class="btn btn-primary mt-5 px-6 py-2.5" onclick="UI.toast('Redeemed 100 points for \$5 off','success')">${UI.icon('gift','w-4 h-4')} Redeem Points</button></div>`;
  if(tab==='settings') return `<h2 class="font-display text-xl font-bold mb-4">Settings</h2><div class="space-y-3 max-w-md">${[['Email notifications',true],['SMS notifications',false],['Push notifications',true],['Newsletter',true],['Personalized ads',false]].map(([l,v])=>`<label class="flex items-center justify-between glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer"><span class="text-sm">${l}</span><input type="checkbox" ${v?'checked':''} class="accent-brand-500 w-5 h-5"></label>`).join('')}</div>`;
  return '';
};

Views.accountOrders = function(){
  const ords = Store.state.orders;
  if(!ords.length) return `<div class="text-center py-16 text-slate-500">${UI.icon('package','w-10 h-10 mx-auto mb-3 opacity-50')}No orders yet</div>`;
  const statusColor={Confirmed:'text-blue-500 bg-blue-500/10',Delivered:'text-emerald-500 bg-emerald-500/10',Shipped:'text-amber-500 bg-amber-500/10',Cancelled:'text-rose-500 bg-rose-500/10'};
  return `<h2 class="font-display text-xl font-bold mb-4">My Orders (${ords.length})</h2>
  <div class="space-y-3">${ords.map(o=>`
    <div class="glass-strong rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div class="flex items-center justify-between flex-wrap gap-2"><div><p class="font-bold text-sm">${o.id}</p><p class="text-xs text-slate-400">${new Date(o.date).toLocaleDateString()}</p></div><span class="text-xs font-semibold px-3 py-1 rounded-full ${statusColor[o.status]||'text-slate-500 bg-slate-500/10'}">${o.status}</span></div>
      <div class="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">${o.items.map(it=>`<img src="${D2.U(it.imageId,80)}" class="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" onerror="this.src='https://picsum.photos/seed/o${it.id}/80'">`).join('')}</div>
      <div class="flex items-center justify-between mt-3"><span class="font-bold">${o.totals.totalDisplay}</span><div class="flex gap-2"><button class="btn btn-ghost px-3 py-2 text-xs" onclick="Views.invoice('${o.id}')">${UI.icon('download','w-3.5 h-3.5')} Invoice</button>${o.status!=='Cancelled'&&o.status!=='Delivered'?`<button class="btn btn-ghost px-3 py-2 text-xs text-rose-500" onclick="UI.confirm('Cancel order ${o.id}?',()=>{Store.cancelOrder('${o.id}');App.render()})">${UI.icon('x','w-3.5 h-3.5')} Cancel</button>`:''}</div></div>
    </div>`).join('')}</div>`;
};

Views.orderTracking = function(){
  const o = Store.state.orders[0];
  if(!o) return `<div class="text-center py-16 text-slate-500">${UI.icon('truck','w-10 h-10 mx-auto mb-3 opacity-50')}No orders to track</div>`;
  const stages=[['Order Placed','Confirmed','check-circle-2'],['Packed','Processing','box'],['Shipped','In transit','truck'],['Out for Delivery','On the way','bike'],['Delivered','Arriving '+new Date(o.eta).toLocaleDateString(),'package-check']];
  const cur = o.status==='Cancelled'?0:o.status==='Delivered'?4:2;
  return `<h2 class="font-display text-xl font-bold mb-4">Track Order ${o.id}</h2>
    <div class="relative pl-8">${stages.map((s,i)=>`<div class="relative pb-8 last:pb-0"><div class="absolute -left-8 top-0 grid place-items-center w-7 h-7 rounded-full ${i<=cur?'bg-brand-500 text-white':'bg-slate-200 dark:bg-slate-700 text-slate-400'}">${UI.icon(s[2],'w-4 h-4')}</div>${i<stages.length-1?`<div class="absolute -left-[1.4rem] top-7 w-0.5 h-[calc(100%-1rem)] ${i<cur?'bg-brand-500':'bg-slate-200 dark:bg-slate-700'}"></div>`:''}<p class="font-semibold text-sm">${s[0]}</p><p class="text-xs text-slate-400">${s[1]}</p></div>`).join('')}</div>`;
};

Views.invoice = function(orderId){
  const o = Store.state.orders.find(x=>x.id===orderId); if(!o){ UI.toast('Order not found','error'); return; }
  const html = `<html><head><title>Invoice ${o.id}</title><style>body{font-family:Inter,Arial,sans-serif;padding:40px;color:#1e293b}h1{color:#6366f1}.row{display:flex;justify-content:space-between;margin:4px 0}.tot{font-weight:bold;font-size:18px;color:#6366f1}</style></head><body><h1>Bachat Bazar</h1><p>Invoice #${o.id}<br>Date: ${new Date(o.date).toLocaleString()}<br>Payment: ${o.payment}</p><hr><h3>Items</h3>${o.items.map(it=>`<div class="row"><span>${it.name} × ${it.qty}</span><span>Rs ${(it.price*it.qty).toLocaleString()}</span></div>`).join('')}<hr><div class="row"><span>Subtotal</span><span>Rs ${o.totals.sub.toLocaleString()}</span></div><div class="row"><span>Shipping</span><span>Rs ${o.totals.shipping.toLocaleString()}</span></div><div class="row"><span>Tax</span><span>Rs ${o.totals.tax.toLocaleString()}</span></div><div class="row tot"><span>Total</span><span>Rs ${o.totals.total.toLocaleString()}</span></div><p style="margin-top:40px;color:#64748b">Thank you for shopping with Bachat Bazar!</p></body></html>`;
  const w = window.open('','_blank'); if(w){ w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400); } else UI.toast('Allow popups to view invoice','info');
};

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
Views.adminState = { tab:'overview' };
Views.admin = function(){
  const tab = Views.adminState.tab;
  const nav = [['overview','Overview','bar-chart-3'],['products','Products','box'],['orders','Orders','package'],['customers','Customers','users'],['inventory','Inventory','warehouse'],['coupons','Coupons','ticket'],['banners','Banners','image'],['reviews','Reviews','star'],['tickets','Support','life-buoy']];
  return `<div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <div class="flex items-center gap-3 mb-6"><span class="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">${UI.icon('shield','w-6 h-6')}</span><div><h1 class="font-display text-2xl font-extrabold">Admin Dashboard</h1><p class="text-sm text-slate-500">Manage your store</p></div></div>
    <div class="grid lg:grid-cols-[15rem_1fr] gap-6">
      <aside class="glass rounded-2xl border border-white/20 p-3 lg:sticky lg:top-32 self-start">
        <nav class="space-y-1">${nav.map(([k,l,i])=>`<button data-admtab="${k}" class="admtab w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left ${tab===k?'bg-brand-500 text-white':'hover:bg-brand-500/10'}">${UI.icon(i,'w-4 h-4')} ${l}</button>`).join('')}</nav>
        <a href="#/" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left text-slate-500 hover:bg-slate-500/10 mt-2">${UI.icon('external-link','w-4 h-4')} View Store</a>
      </aside>
      <div class="min-h-[30rem]">${Views.adminTab(tab)}</div>
    </div>
  </div>`;
};

Views.adminTab = function(tab){
  const D = window.DATA;
  if(tab==='overview'){
    const revenue = Store.state.orders.reduce((s,o)=>s+o.totals.total,0) + 48230;
    const orders = Store.state.orders.length + 1284;
    return `<div class="space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${[['Revenue',`$${revenue.toLocaleString(undefined,{maximumFractionDigits:0})}`,'dollar-sign','from-emerald-500 to-green-600',12.5],['Orders',orders.toLocaleString(),'shopping-bag','from-brand-500 to-indigo-600',8.2],['Products',Store.allProducts().length,'box','from-amber-500 to-orange-600',3.1],['Customers',8420,'users','from-accent-500 to-rose-600',5.7]].map(([l,v,i,c,d])=>`
          <div class="glass rounded-2xl border border-white/20 p-5">
            <div class="flex items-center justify-between"><span class="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br ${c} text-white">${UI.icon(i,'w-5 h-5')}</span><span class="text-xs font-semibold text-emerald-500 flex items-center gap-1">${UI.icon('trending-up','w-3.5 h-3.5')} +${d}%</span></div>
            <div class="text-2xl font-extrabold font-display mt-3" data-count="${parseInt(String(v).replace(/[^0-9]/g,''))}" data-prefix="${String(v).match(/^[^0-9]*/)?.[0]||''}" data-suffix="${String(v).match(/[^0-9]*$/)?.[0]||''}">0</div>
            <p class="text-sm text-slate-500">${l}</p>
          </div>`).join('')}
      </div>
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-4">Sales Analytics</h3>${Views.salesChart()}</div>
        <div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-4">Top Categories</h3><div class="space-y-3">${Store.categories().slice(0,5).map((c,i)=>{const pct=[85,72,64,51,38][i];return `<div><div class="flex justify-between text-sm mb-1"><span>${c.name}</span><span class="text-slate-400">${pct}%</span></div><div class="h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div class="h-full rounded-full bg-gradient-to-r ${c.color}" style="width:${pct}%"></div></div></div>`;}).join('')}</div></div>
      </div>
      <div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-3">Recent Orders</h3>${Views.adminOrderTable(5)}</div>
    </div>`;
  }
  if(tab==='products') return Views.adminProducts();
  if(tab==='orders') return `<div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-3">All Orders</h3>${Views.adminOrderTable(20)}</div>`;
  if(tab==='customers') return `<div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-3">Customers</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-400 border-b border-white/10"><th class="py-2">Customer</th><th>Orders</th><th>Spent</th><th>Status</th></tr></thead><tbody>${[['Amelia Carter',12,'$2,340','VIP'],['Daniel Kim',5,'$890','Active'],['Sofia Martinez',8,'$1,250','Active'],['Liam O\'Brien',3,'$420','New'],['Yuki Tanaka',15,'$4,820','VIP']].map(r=>`<tr class="border-b border-white/5"><td class="py-3 font-medium">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="text-xs px-2 py-1 rounded-full ${r[3]==='VIP'?'bg-amber-500/15 text-amber-500':'bg-emerald-500/15 text-emerald-500'}">${r[3]}</span></td></tr>`).join('')}</tbody></table></div></div>`;
  if(tab==='inventory') return `<div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-3">Inventory & Low Stock Alerts</h3><div class="space-y-2">${Store.allProducts().filter(p=>p.stock<15).map(p=>`<div class="flex items-center gap-3 glass-strong rounded-xl border p-3"><img src="${D2.U(p.imageId,80)}" class="w-10 h-10 rounded-lg object-cover" loading="lazy"><div class="flex-1"><p class="text-sm font-medium">${UI.escapeHtml(p.name)}</p><p class="text-xs text-slate-400">SKU ${p.sku}</p></div><span class="text-sm font-bold ${p.stock===0?'text-rose-500':'text-amber-500'}">${p.stock} left</span><div class="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div class="h-full ${p.stock===0?'bg-rose-500':'bg-amber-500'}" style="width:${Math.max(5,p.stock/15*100)}%"></div></div></div>`).join('')}</div></div>`;
  if(tab==='coupons') return `<div class="glass rounded-2xl border border-white/20 p-5"><div class="flex justify-between items-center mb-3"><h3 class="font-bold">Coupons & Discounts</h3><button class="btn btn-primary px-4 py-2 text-sm" onclick="UI.toast('Coupon created','success')">${UI.icon('plus','w-4 h-4')} New Coupon</button></div><div class="grid sm:grid-cols-2 gap-3">${D.COUPONS.map(c=>`<div class="glass-strong rounded-xl border border-dashed border-brand-500/40 p-4"><div class="flex justify-between"><span class="font-bold text-brand-500">${c.code}</span><span class="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500">Active</span></div><p class="text-sm text-slate-500 mt-1">${c.label}</p><p class="text-xs text-slate-400 mt-2">Min order: ${Store.money(c.min)} · ${c.type}</p></div>`).join('')}</div></div>`;
  if(tab==='banners') return `<div class="glass rounded-2xl border border-white/20 p-5"><div class="flex justify-between items-center mb-3"><h3 class="font-bold">Banner Management</h3><button class="btn btn-primary px-4 py-2 text-sm" onclick="UI.toast('Banner upload','info')">${UI.icon('upload','w-4 h-4')} Upload Banner</button></div><div class="grid sm:grid-cols-2 gap-3">${D.HERO_SLIDES.map((s,i)=>`<div class="glass-strong rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"><div class="relative h-28"><img src="${D2.U(s.img,400)}" class="w-full h-full object-cover" loading="lazy"><div class="absolute inset-0 bg-gradient-to-r ${s.grad} opacity-70"></div><span class="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/40 text-white">Slide ${i+1}</span></div><div class="p-3"><p class="font-semibold text-sm">${s.title}</p><div class="flex gap-2 mt-2"><button class="text-xs text-brand-500" onclick="UI.toast('Edit banner','info')">Edit</button><button class="text-xs text-rose-500" onclick="UI.toast('Banner deleted','info')">Delete</button></div></div></div>`).join('')}</div></div>`;
  if(tab==='reviews') return `<div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-3">Reviews Moderation</h3><div class="space-y-3">${Store.allProducts().slice(0,5).map(p=>`<div class="glass-strong rounded-xl border p-4 flex items-start gap-3"><img src="${D2.U(p.imageId,80)}" class="w-10 h-10 rounded-lg object-cover"><div class="flex-1"><p class="text-sm font-medium">${UI.escapeHtml(p.name)}</p><div class="flex gap-1 text-amber-400 text-xs">${'★'.repeat(Math.round(p.rating))}</div><p class="text-xs text-slate-500 mt-1">Great product, highly recommended!</p></div><div class="flex gap-2"><button class="text-xs text-emerald-500" onclick="UI.toast('Approved','success')">Approve</button><button class="text-xs text-rose-500" onclick="UI.toast('Rejected','info')">Reject</button></div></div>`).join('')}</div></div>`;
  if(tab==='tickets') return `<div class="glass rounded-2xl border border-white/20 p-5"><h3 class="font-bold mb-3">Support Tickets</h3><div class="space-y-2">${[['#2041','Delivery delay','Open','amber'],['#2038','Refund request','Pending','blue'],['#2035','Product query','Closed','slate']].map(t=>`<div class="glass-strong rounded-xl border p-4 flex items-center gap-3"><span class="grid place-items-center w-10 h-10 rounded-lg bg-brand-500/15 text-brand-500">${UI.icon('life-buoy','w-5 h-5')}</span><div class="flex-1"><p class="text-sm font-medium">${t[0]} · ${t[1]}</p><p class="text-xs text-slate-400">2 hours ago</p></div><span class="text-xs px-3 py-1 rounded-full bg-${t[3]}-500/15 text-${t[3]}-500">${t[2]}</span><button class="btn btn-ghost px-3 py-1.5 text-xs">View</button></div>`).join('')}</div></div>`;
  return '';
};

Views.salesChart = function(){
  const data=[42,58,47,65,72,68,84,79,92,88,96,110];
  const max=Math.max(...data);
  const months=['J','F','M','A','M','J','J','A','S','O','N','D'];
  return `<div class="flex items-end gap-1.5 h-48">${data.map((v,i)=>`<div class="flex-1 flex flex-col items-center justify-end h-full"><div class="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-accent-500 hover:opacity-80 transition" style="height:${(v/max)*100}%" title="$${v}k"></div><span class="text-[.6rem] text-slate-400 mt-1">${months[i]}</span></div>`).join('')}</div>`;
};

Views.adminOrderTable = function(limit){
  const ords=[...Store.state.orders];
  // pad with sample if needed
  const sample=[['LUM100234','Amelia Carter','$129.00','Delivered'],['LUM100231','Daniel Kim','$349.00','Shipped'],['LUM100228','Sofia Martinez','$59.00','Packed'],['LUM100225','Liam O\'Brien','$899.00','Confirmed'],['LUM100220','Yuki Tanaka','$179.00','Cancelled']];
  const rows=[...ords.map(o=>[o.id,o.totals.totalDisplay,o.status]), ...sample].slice(0,limit);
  const color={Confirmed:'blue',Packed:'amber',Shipped:'amber',Delivered:'emerald',Cancelled:'rose',Refunded:'slate'};
  return `<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-400 border-b border-white/10"><th class="py-2">Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(r=>`<tr class="border-b border-white/5"><td class="py-3 font-medium">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><select class="text-xs px-2 py-1 rounded-lg bg-transparent border border-slate-200 dark:border-slate-700 outline-none adm-status" data-id="${r[0]}">${['Pending','Confirmed','Packed','Shipped','Delivered','Cancelled','Refunded'].map(s=>`<option ${s===r[2]?'selected':''}>${s}</option>`).join('')}</select></td><td><button class="text-brand-500 text-xs" onclick="UI.toast('Viewing order','info')">View</button></td></tr>`).join('')}</tbody></table></div>`;
};

Views.adminProducts = function(){
  const D=window.DATA;
  return `<div class="glass rounded-2xl border border-white/20 p-5"><div class="flex justify-between items-center mb-3"><h3 class="font-bold">Products (${Store.allProducts().length})</h3><div class="flex gap-2"><button class="btn btn-ghost px-4 py-2 text-sm" onclick="UI.toast('Export started','info')">${UI.icon('download','w-4 h-4')} Export</button><button class="btn btn-primary px-4 py-2 text-sm" onclick="UI.openModal('genericModal',Views.adminAddProduct());UI.attachRipple()">${UI.icon('plus','w-4 h-4')} Add Product</button></div></div>
  <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-400 border-b border-white/10"><th class="py-2">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead><tbody>${Store.allProducts().map(p=>`<tr class="border-b border-white/5"><td class="py-3"><div class="flex items-center gap-2"><img src="${D2.U(p.imageId,60)}" class="w-8 h-8 rounded-lg object-cover" loading="lazy"><span class="font-medium">${UI.escapeHtml(p.name)}</span></div></td><td class="capitalize">${p.category}</td><td>${Store.money(p.price)}</td><td class="${p.stock===0?'text-rose-500':'text-emerald-500'}">${p.stock}</td><td>${UI.stars(p.rating,'w-3.5 h-3.5')}</td><td><div class="flex gap-1"><button class="p-1.5 rounded-lg hover:bg-brand-500/10 text-brand-500" onclick="UI.toast('Edit ${UI.escapeHtml(p.name)}','info')">${UI.icon('edit','w-4 h-4')}</button><button class="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500" onclick="UI.confirm('Delete ${UI.escapeHtml(p.name)}?',()=>UI.toast('Product deleted','info'))">${UI.icon('trash-2','w-4 h-4')}</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
};

Views.adminAddProduct = function(){
  return `<div class="p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-display text-lg font-bold">Add New Product</h3><button onclick="UI.closeModal('genericModal')" class="p-2 rounded-xl hover:bg-slate-500/10">${UI.icon('x','w-5 h-5')}</button></div>
  <form class="space-y-3" onsubmit="event.preventDefault();UI.closeModal('genericModal');UI.toast('Product added successfully','success')">
    ${Views.field('Product Name','pname','text','')}
    <div class="grid grid-cols-2 gap-3">${Views.field('Brand','pbrand','text','')}${Views.field('Price','pprice','number','')}</div>
    <label class="block"><span class="text-sm font-medium text-slate-500">Category</span><select class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500">${Store.categories().map(c=>`<option>${c.name}</option>`).join('')}</select></label>
    <label class="block"><span class="text-sm font-medium text-slate-500">Description</span><textarea rows="3" class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"></textarea></label>
    <label class="block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500"><input type="file" multiple class="hidden">${UI.icon('upload-cloud','w-8 h-8 mx-auto text-slate-400')}<p class="text-sm text-slate-500 mt-2">Click or drag images to upload</p></label>
    <button type="submit" class="btn btn-primary w-full py-3">${UI.icon('save','w-5 h-5')} Save Product</button>
  </form></div>`;
};

/* ============================================================
   STATIC PAGES
   ============================================================ */
Views.deals = function(){
  const deals = Store.allProducts().filter(p=>p.oldPrice && p.oldPrice>p.price);
  return `<div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <div class="relative rounded-3xl overflow-hidden gradient-bg p-8 text-white mb-8 text-center"><span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">${UI.icon('flame','w-4 h-4')} FLASH SALE</span><h1 class="font-display text-4xl font-extrabold mt-3">Today's Deals</h1><p class="text-white/80 mt-2">Save big on top products. Ends in <span id="dealsCountdown" class="font-bold tabular-nums"></span></p></div>
    ${Views.productGrid(deals)}</div>`;
};
Views.newArrivals = function(){ const items=Store.allProducts().filter(p=>p.isNew); return `<div class="max-w-7xl mx-auto px-4 py-8 fade-in"><h1 class="font-display text-3xl font-extrabold mb-6">New Arrivals</h1>${Views.productGrid(items.length?items:Store.allProducts().slice(0,8))}</div>`; };

Views.about = function(){
  return `<div class="fade-in">
    <section class="relative py-20 text-center overflow-hidden"><div class="blob w-96 h-96 bg-brand-500/30 -top-20 left-1/3"></div><div class="relative max-w-3xl mx-auto px-4"><span class="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white mb-5">${UI.icon('gem','w-8 h-8')}</span><h1 class="font-display text-4xl md:text-5xl font-extrabold">Our Story</h1><p class="text-slate-500 mt-4 text-lg">Bachat Bazar was born from a simple idea: premium shopping should be effortless, beautiful, and accessible to everyone. Since 2020, we've delivered joy to over 50,000 customers across the globe.</p></div></section>
    <section class="max-w-7xl mx-auto px-4 pb-12 grid md:grid-cols-3 gap-5">${[['target','Our Mission','To make premium products accessible with a delightful, seamless shopping experience.'],['heart','Our Values','Quality, transparency, and customer obsession in everything we do.'],['leaf','Sustainability','Eco-friendly packaging and carbon-neutral shipping on every order.']].map(([i,t,d])=>`<div class="glass rounded-2xl border border-white/20 p-6 text-center"><span class="grid place-items-center w-14 h-14 mx-auto rounded-xl bg-brand-500/15 text-brand-500 mb-3">${UI.icon(i,'w-7 h-7')}</span><h3 class="font-display text-xl font-bold">${t}</h3><p class="text-slate-500 mt-2 text-sm">${d}</p></div>`).join('')}</section>
    <section class="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-2 md:grid-cols-4 gap-5 text-center">${[['50K+','Customers'],['1M+','Orders'],['150+','Countries'],['4.8★','Rating']].map(([n,l])=>`<div class="glass rounded-2xl border border-white/20 p-6"><div class="text-3xl font-extrabold font-display text-brand-500" data-count="${parseInt(n)}" data-suffix="${n.replace(/[0-9]/g,'')||''}">0</div><p class="text-slate-500 mt-1">${l}</p></div>`).join('')}</section>
    ${Views.newsletterSection()}
  </div>`;
};

Views.faq = function(){
  const faqs=[['How long does delivery take?','Standard delivery takes 5-7 business days. Express is 2-3 days and overnight is next business day.'],['What is your return policy?','You can return any item within 30 days for a full refund, no questions asked.'],['Do you ship internationally?','Yes! We ship to over 150 countries worldwide. Shipping costs are calculated at checkout.'],['How can I track my order?','Once your order ships, you\'ll receive a tracking number. You can also track it in your account dashboard.'],['What payment methods do you accept?','We accept all major credit/debit cards, PayPal, Stripe, Google Pay, Apple Pay, UPI and Cash on Delivery.'],['Are my payments secure?','Absolutely. We use 256-bit SSL encryption and are PCI-DSS compliant. Your data is never stored on our servers.']];
  return `<div class="max-w-3xl mx-auto px-4 py-12 fade-in"><h1 class="font-display text-4xl font-extrabold text-center mb-2">Frequently Asked Questions</h1><p class="text-slate-500 text-center mb-8">Find quick answers to common questions</p>
  <div class="space-y-3">${faqs.map(([q,a],i)=>`<details class="glass rounded-2xl border border-white/20 p-5 group"><summary class="font-semibold cursor-pointer flex items-center justify-between">${q}<span class="text-brand-500 transition-transform group-open:rotate-180">${UI.icon('chevron-down','w-5 h-5')}</span></summary><p class="text-slate-500 mt-3 text-sm">${a}</p></details>`).join('')}</div></div>`;
};

Views.contact = function(){
  return `<div class="max-w-5xl mx-auto px-4 py-12 fade-in"><h1 class="font-display text-4xl font-extrabold text-center mb-2">Get in Touch</h1><p class="text-slate-500 text-center mb-8">We'd love to hear from you</p>
  <div class="grid md:grid-cols-3 gap-4 mb-8">${[['mail','Email','support@bachatbazar.com'],['phone','Phone','+92 21 111 222 333'],['map-pin','Address','Shahrah-e-Faisal, Karachi']].map(([i,t,d])=>`<div class="glass rounded-2xl border border-white/20 p-5 text-center"><span class="grid place-items-center w-12 h-12 mx-auto rounded-xl bg-brand-500/15 text-brand-500 mb-2">${UI.icon(i,'w-6 h-6')}</span><p class="font-bold">${t}</p><p class="text-sm text-slate-500">${d}</p></div>`).join('')}</div>
  <form class="glass rounded-2xl border border-white/20 p-6 space-y-4" onsubmit="event.preventDefault();UI.toast('Message sent! We\\'ll reply within 24 hours.','success');this.reset()">
    <div class="grid sm:grid-cols-2 gap-4">${Views.field('Name','name','text','')}${Views.field('Email','email','email','')}</div>
    <label class="block"><span class="text-sm font-medium text-slate-500">Subject</span><input class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"></label>
    <label class="block"><span class="text-sm font-medium text-slate-500">Message</span><textarea rows="5" class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"></textarea></label>
    <button class="btn btn-primary px-7 py-3">${UI.icon('send','w-5 h-5')} Send Message</button>
  </form></div>`;
};

Views.blog = function(){
  return `<div class="max-w-7xl mx-auto px-4 py-12 fade-in"><h1 class="font-display text-4xl font-extrabold mb-2">The Bachat Bazar Blog</h1><p class="text-slate-500 mb-8">Insights, trends and stories</p>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">${window.DATA.BLOGS.map(b=>`<a href="#/blog/${b.id}" class="group glass rounded-2xl border border-white/20 overflow-hidden"><div class="aspect-[16/10] overflow-hidden">${UI.img(window.DATA.U(b.img,500),b.title,'w-full h-full object-cover group-hover:scale-110 transition-transform duration-500','blog'+b.id)}</div><div class="p-5"><p class="text-xs text-slate-400">${b.date} · ${b.author}</p><h3 class="font-display text-lg font-bold mt-1 group-hover:text-brand-500 transition">${b.title}</h3><p class="text-sm text-slate-500 mt-2 line-clamp-2">${b.excerpt}</p><span class="text-sm text-brand-500 mt-3 inline-flex items-center gap-1">Read more ${UI.icon('arrow-right','w-4 h-4')}</span></div></a>`).join('')}</div></div>`;
};

Views.blogPost = function(id){
  const b=window.DATA.BLOGS.find(x=>x.id===Number(id))||window.DATA.BLOGS[0];
  return `<article class="max-w-3xl mx-auto px-4 py-12 fade-in"><a href="#/blog" class="text-brand-500 text-sm flex items-center gap-1 mb-6">${UI.icon('arrow-left','w-4 h-4')} Back to Blog</a>
  <div class="rounded-3xl overflow-hidden mb-6 aspect-[16/8]">${UI.img(window.DATA.U(b.img,900),b.title,'w-full h-full object-cover','bp'+b.id)}</div>
  <p class="text-sm text-slate-400">${b.date} · ${b.author} · 5 min read</p><h1 class="font-display text-4xl font-extrabold mt-2">${b.title}</h1>
  <div class="prose mt-6 text-slate-600 dark:text-slate-300 leading-relaxed space-y-4"><p>${b.excerpt} In this article, we dive deep into everything you need to know, sharing expert insights and practical tips you can apply right away.</p><p>The world of online shopping is evolving rapidly, and staying ahead means understanding the trends that shape consumer behavior. From AI-powered recommendations to immersive product experiences, technology is redefining how we discover and buy products.</p><p>At Bachat Bazar, we're committed to bringing you not just great products, but a shopping experience that feels effortless and joyful. Our curated collections, smart search, and personalized recommendations are all designed to help you find exactly what you're looking for.</p><blockquote class="border-l-4 border-brand-500 pl-4 italic text-slate-500">"The best shopping experiences feel less like transactions and more like discoveries."</blockquote><p>Thank you for reading. Stay tuned for more insights, and happy shopping!</p></div>
  </article>`;
};

Views.policy = function(type){
  const content={ privacy:['Privacy Policy','Your privacy is our priority. This policy explains how we collect, use and protect your personal information when you use our website and services.',['Information We Collect','How We Use Information','Cookie Policy','Data Security','Your Rights','Third-Party Services','Changes to This Policy']],
    terms:['Terms & Conditions','Welcome to Bachat Bazar. By accessing our website, you agree to the following terms and conditions. Please read them carefully.',['Acceptance of Terms','Use of Services','Account Registration','Pricing & Payment','Shipping & Delivery','Returns & Refunds','Limitation of Liability']],
    shipping:['Shipping Policy','We want you to receive your orders as quickly and safely as possible. Here\'s everything you need to know about our shipping.',['Processing Time','Domestic Shipping','International Shipping','Tracking Orders','Shipping Costs','Delayed or Lost Orders']],
    returns:['Return Policy','Not satisfied with your purchase? No problem. We offer a hassle-free 30-day return policy.',['30-Day Return Window','Eligible Items','How to Return','Refund Process','Exchanges','Damaged or Defective Items']]};
  const [title,intro,sections]=content[type]||content.privacy;
  return `<div class="max-w-3xl mx-auto px-4 py-12 fade-in"><h1 class="font-display text-4xl font-extrabold mb-3">${title}</h1><p class="text-slate-500 mb-8">Last updated: July 3, 2026</p><p class="text-slate-600 dark:text-slate-300 mb-8">${intro}</p>${sections.map((s,i)=>`<div class="mb-6"><h2 class="font-display text-xl font-bold mb-2">${i+1}. ${s}</h2><p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">We are committed to transparency and protecting your interests. This section outlines our practices regarding ${s.toLowerCase()}. Our policies are designed to be fair, clear, and in full compliance with applicable regulations. If you have any questions, our support team is always available to help.</p></div>`).join('')}</div>`;
};
