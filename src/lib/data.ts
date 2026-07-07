/* ============================================================
   Bachat Bazar — Data Layer
   Catalog based on Naheed.pk products & categories
   Prices in PKR
   Pakistani-themed color scheme & proper product images
   ============================================================ */

// Direct image URL builder - uses reliable product image sources
// Handles: data URLs (data:...), full URLs (https://...), local paths (/uploads/...), Unsplash IDs
export const U = (id: string, w = 700) => {
  if (typeof id !== 'string' || !id) return `https://picsum.photos/seed/placeholder/${w}/${w}`;
  if (/^data:/i.test(id)) return id;          // Base64 data URL — use as-is
  if (/^https?:\/\//.test(id)) return id;   // Full URL — use as-is
  if (/^\//.test(id)) return id;            // Local path like /uploads/... — use as-is
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
};

// Helper: resolve image src — same logic as U() for inline use
export const resolveImg = (src: string, w = 400) => {
  if (!src) return '';
  if (/^data:/i.test(src)) return src;
  if (/^https?:\/\//.test(src)) return src;
  if (/^\//.test(src)) return src;
  return U(src, w);
};

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  img: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  sku: string;
  images: string[];
  imageId: string;
  badge: string;
  isNew: boolean;
  trending: boolean;
  bestSeller: boolean;
  featured: boolean;
  description: string;
  features: string[];
  specs: Record<string, string>;
  video: string | null;
  related: number[];
}

export interface Coupon {
  code: string;
  type: 'percent' | 'flat' | 'ship';
  value: number;
  label: string;
  min: number;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

export interface BlogPost {
  id: number;
  title: string;
  img: string;
  date: string;
  author: string;
  excerpt: string;
}

export interface HeroSlide {
  title: string;
  sub: string;
  cta: string;
  route: string;
  img: string;
  grad: string;
  bg: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  desc: string;
  cost: number;
}

export interface Payment {
  id: string;
  name: string;
  icon: string;
}

export interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
  gradient: string;
  active: boolean;
  order: number;
}

export interface SaleData {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  categoryId: string;
  active: boolean;
  bannerColor: string;
}

// Category images - each with a correct, category-appropriate Unsplash photo
export const CATEGORIES: Category[] = [
  { id:'beauty', name:'Health & Beauty', icon:'Sparkles', color:'from-emerald-600 to-teal-500', img:'1596462502278-27bfdc403348' },
  { id:'grocery', name:'Grocery & Pet Care', icon:'ShoppingCart', color:'from-amber-500 to-orange-500', img:'1542838132-92f5d5c0b1bc' },
  { id:'appliances', name:'TV & Home Appliances', icon:'Tv', color:'from-sky-600 to-blue-500', img:'1556909114-f6e7ad7d3136' },
  { id:'electronics', name:'Phones & Computers', icon:'Smartphone', color:'from-violet-600 to-purple-500', img:'1511707171634-5f897ff02aa9' },
  { id:'mens-fashion', name:"Men's Fashion", icon:'Shirt', color:'from-slate-600 to-zinc-700', img:'1483985988355-763728e1935b' },
  { id:'home-lifestyle', name:'Home & Lifestyle', icon:'Sofa', color:'from-rose-500 to-pink-500', img:'1556228453-efd6c1ff04f6' },
  { id:'watches-bags', name:'Watches, Bags & Jewellery', icon:'Watch', color:'from-yellow-500 to-amber-600', img:'1523275335684-37898b6baf30' },
  { id:'kids-babies', name:'Kids & Babies', icon:'Baby', color:'from-pink-400 to-rose-500', img:'1515488042361-ee00e0ddd4e4' },
  { id:'womens-fashion', name:"Women's Fashion", icon:'Shirt', color:'from-fuchsia-500 to-purple-500', img:'1595771055363-048d76554a2f' },
];

export const BRANDS = ['YourMart','J Premium','Remington','CX16','Memo','Herbiotics','SQ11','Markaz','Sapphire','Rukh','Zarar','Janan','Zafarani','MILANO','M25'];

function P(id: number, name: string, brand: string, cat: string, price: number, old: number, rating: number, reviews: number, stock: number, img: string | string[], opts: Partial<Product> = {}): Product {
  const imgArr = Array.isArray(img) ? img : [img];
  return {
    id, name, brand, category: cat,
    price: Math.round(price), oldPrice: Math.round(old || 0), rating, reviews, stock,
    sku: `BB-${String(id).padStart(4,'0')}`,
    images: imgArr.map((i: string) => U(i, 700)),
    imageId: imgArr[0],
    badge: opts.badge || (old && old>price ? Math.round((1-price/old)*100)+'% OFF' : ''),
    isNew: opts.isNew || false,
    trending: opts.trending || false,
    bestSeller: opts.bestSeller || false,
    featured: opts.featured || false,
    description: opts.description || `${name} by ${brand}. Available at Bachat Bazar with fast delivery across Pakistan. 7-day return policy.`,
    features: opts.features || ['Genuine product','Fast delivery','7-day returns','Quality guaranteed'],
    specs: opts.specs || { 'Brand':brand, 'Category':cat, 'SKU':`BB-${String(id).padStart(4,'0')}` },
    video: opts.video || null,
    related: opts.related || []
  };
}

// Product catalog with CORRECT category-matching images
export const PRODUCTS: Product[] = [
  // ---- Health & Beauty (skincare, makeup, beauty products) ----
  // ---- Grocery & Pet Care (food, snacks, kitchen items) ----
  // ---- TV & Home Appliances (kitchen appliances, hobs, hoods) ----
  // ---- Phones & Computers (smartphones, earbuds, tech) ----
  // ---- Men's Fashion (shirts, pants, shoes) ----
  // ---- Home & Lifestyle (stationery, home decor, accessories) ----
  // ---- Watches, Bags & Jewellery (rings, bracelets, bags) ----
  // ---- Kids & Babies (baby products, toys, kids clothing) ----

  // ══════════ YourMart.pk — Trending & Best Products ══════════
  // ---- Smart Gadgets (from YourMart) ----
  P(1,'Cordless Drill Machine Kit with 2 Batteries & 26 Accessories','YourMart','appliances',6500,7200,4.6,55,18,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Yourmartproducts(76)_17809',{trending:true,bestSeller:true,description:'Portable rechargeable impact drill set with 2 lithium batteries and 26 accessories. Perfect for home repairs and DIY projects. Variable speed control with LED work light.',features:['2 Rechargeable lithium batteries','26 accessories included','Variable speed control','LED work light','Portable & lightweight'],specs:{'Brand':'YourMart','Power':'21V','Battery':'2×1500mAh Lithium','Chuck':'10mm Keyless','Accessories':'26 pieces'}}),
  P(2,'Oscillating Desktop Circulating Fan FT-905','YourMart','appliances',3900,4500,4.4,38,22,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(34)_1783344374',{trending:true,description:'Rechargeable mini table fan with LED display and 3 speed modes. Oscillating desktop design perfect for office and home use. Built-in 4000mAh battery for hours of cooling.',features:['3 speed modes','LED display','Rechargeable 4000mAh battery','Oscillating head','USB charging'],specs:{'Brand':'YourMart','Model':'FT-905','Battery':'4000mAh','Speeds':'3 levels','Type':'Desktop/Circulating'}}),
  P(3,'Long Handle Fascial Gun Massager BLD-339','YourMart','beauty',2850,3200,4.5,62,25,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(56)_1783403862',{trending:true,bestSeller:true,description:'Rechargeable massage gun with 4 interchangeable heads for full body muscle relaxation. Long handle design for hard-to-reach areas. LCD display with 6 speed levels.',features:['4 interchangeable massage heads','6 speed levels','Long handle design','LCD display','Rechargeable battery'],specs:{'Brand':'YourMart','Model':'BLD-339','Heads':'4 interchangeable','Speeds':'6 levels','Battery':'Rechargeable Lithium'}}),
  P(4,'Five Head Massage Gun Deep Tissue Massager BLD-780','YourMart','beauty',2500,2800,4.4,48,20,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(43)_1783346944',{trending:true,description:'Five-head deep tissue muscle massager with 9 massage heads and 6 speed levels. Revolutionary 5-head design covers larger muscle groups for faster recovery.',features:['5-head innovative design','9 massage heads included','6 speed levels','Deep tissue percussion','Random color'],specs:{'Brand':'YourMart','Model':'BLD-780','Heads':'9 massage heads','Speeds':'6 levels','Design':'5-head'}}),
  P(5,'Remington Proluxe Hair Straightener FR-2105','YourMart','beauty',2200,2600,4.7,72,15,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(48)_1783401974',{featured:true,trending:true,description:'Professional salon styling hair straightener with advanced ceramic plates. OPTIHEAT technology for consistent temperature. Floating plates for even pressure distribution.',features:['Advanced ceramic coated plates','OPTIHEAT technology','Floating plates','Fast heat-up (15 sec)','Auto shut-off'],specs:{'Brand':'Remington','Model':'FR-2105','Plate Material':'Advanced Ceramic','Temperature':'Up to 230°C','Heat-up':'15 seconds'}}),
  P(6,'CX16 Magnetic Mobile Cooling Fan for Gaming','YourMart','electronics',2100,2400,4.3,35,30,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(62)_1781613673',{trending:true,description:'Semiconductor phone cooler with RGB lights for gaming. Magnetic attachment for easy mounting. Fast cooling technology prevents phone overheating during intense gaming sessions.',features:['Semiconductor cooling chip','RGB lights','Magnetic attachment','Universal for Android/iPhone','15W fast cooling'],specs:{'Brand':'CX16','Type':'Semiconductor Cooler','Power':'15W','Compatibility':'All smartphones','Mount':'Magnetic'}}),
  P(7,'J Premium Fragrance Collection 20 Pcs Perfume Set','YourMart','beauty',1850,2200,4.5,88,12,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(35)_1783345950',{featured:true,bestSeller:true,description:'20-piece long-lasting eau de perfume set for men and women. Luxury gift pack with assorted fragrances. Premium quality scents that last all day.',features:['20 unique fragrances','Long-lasting formula','For men and women','Luxury gift packaging','Eau de perfume concentration'],specs:{'Brand':'J Premium','Type':'Eau de Perfume','Pieces':'20','For':'Unisex','Packaging':'Gift Box'}}),
  P(8,'12-in-1 Home Tool Kit Multi-Purpose Repair Set','YourMart','home-lifestyle',1650,1900,4.4,42,28,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(27)_1783342820',{trending:true,description:'Multi-purpose household repair tool set with durable storage box. 12 essential tools for everyday repairs. Chrome vanadium steel construction for durability.',features:['12 essential tools','Chrome vanadium steel','Durable storage box','Non-slip handles','Multi-purpose use'],specs:{'Brand':'YourMart','Pieces':'12','Material':'Chrome Vanadium Steel','Storage':'Plastic box','Use':'Household repair'}}),
  P(9,'46-Piece Socket Wrench Set with Storage Case','YourMart','home-lifestyle',1500,1800,4.3,28,22,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(19)_1783340117',{description:'Complete ratchet socket and screwdriver bit tool kit. Chrome vanadium steel construction with storage case. 46 pieces for professional and home use.',features:['46 professional pieces','Chrome vanadium steel','Complete ratchet set','Screwdriver bits included','Portable storage case'],specs:{'Brand':'YourMart','Pieces':'46','Material':'Chrome Vanadium Steel','Type':'Socket Wrench Set','Storage':'Blow mold case'}}),
  P(10,'2-in-1 Ocean Wave Projector Light Aurora Lamp','YourMart','home-lifestyle',1375,1600,4.5,55,18,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(6)_1783335160',{trending:true,description:'Northern aurora lamp with 16 colors RGB night light projector. Creates stunning ocean wave and aurora effects for bedroom mood lighting. Rechargeable with remote control.',features:['16 RGB colors','Ocean wave + aurora effects','Remote control','Rechargeable battery','Timer function'],specs:{'Brand':'YourMart','Colors':'16 RGB','Effects':'Ocean wave + Aurora','Power':'USB rechargeable','Control':'Remote'}}),
  P(11,'SQ11 Mini Camera HD 1080P Night Vision','YourMart','electronics',1350,1500,4.2,32,20,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/OXIPRO(1)_1783332935',{description:'HD 1080P mini camera with night vision and motion detection. Compact DVR camcorder for home security. Supports TF card for video storage.',features:['HD 1080P recording','Night vision','Motion detection','Compact mini design','TF card support'],specs:{'Brand':'SQ11','Resolution':'1080P HD','Night Vision':'IR LEDs','Storage':'TF Card (up to 32GB)','Size':'Mini portable'}}),
  P(12,'Automatic Charging Disconnector LX-007','YourMart','electronics',1250,1400,4.3,25,35,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(63)_1783315541',{trending:true,description:'Smart auto power cut-off battery protector. Type-C to Type-C fast charging guardian. Prevents overcharging and extends battery life. LED indicator shows charging status.',features:['Auto power cut-off','Overcharge protection','Type-C to Type-C','LED indicator','Fast charging support'],specs:{'Brand':'YourMart','Model':'LX-007','Type':'Auto Disconnector','Connector':'Type-C to Type-C','Protection':'Overcharge/Overvoltage'}}),
  P(13,'16 Colors Northern Lights Water Ripple Lamp','YourMart','home-lifestyle',975,1200,4.6,65,24,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(43)_1782903960',{trending:true,bestSeller:true,description:'RGB ocean wave projector light with remote control. Rechargeable ceiling room atmosphere lamp. Creates mesmerizing water ripple and northern lights effects for relaxation.',features:['16 RGB colors','Water ripple effect','Remote control','Rechargeable battery','Ceiling projection'],specs:{'Brand':'YourMart','Colors':'16 RGB','Effect':'Water Ripple + Northern Lights','Power':'USB rechargeable','Use':'Bedroom/Living room'}}),
  P(14,'16 Colors Crystal Cube Ambient Light','YourMart','home-lifestyle',950,1100,4.4,48,20,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(53)_1782903960',{description:'RGB water ripple lamp projector with remote control. Dynamic underwater effect mood light for bedroom and living room. Crystal cube design creates stunning visual effects.',features:['Crystal cube design','Dynamic underwater effect','Remote control','16 RGB colors','USB powered'],specs:{'Brand':'YourMart','Design':'Crystal Cube','Colors':'16 RGB','Effect':'Water Ripple','Power':'USB'}}),
  P(15,'3D Moving Sand Art LED Lamp','YourMart','home-lifestyle',850,1000,4.5,38,15,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(34)_1782724541',{trending:true,description:'Flowing sandscape painting display with USB decorative table lamp. 3D dynamic deep sea sand art with LED lighting. Creates ever-changing landscape art with every turn.',features:['3D moving sand art','LED backlit display','USB powered','Ever-changing landscapes','Decorative design'],specs:{'Brand':'YourMart','Type':'Sand Art LED Lamp','Power':'USB','Design':'3D Deep Sea','Color':'Random'}}),
  P(16,'LED Jellyfish Lamp RGB Mood Light','YourMart','home-lifestyle',880,1050,4.3,30,18,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(25)_1782721302',{description:'Voice control fantasy jellyfish night light with RGB mood lighting. Creates realistic jellyfish movement effect. Perfect decorative lamp for bedroom and living room.',features:['Voice control activated','Realistic jellyfish effect','RGB mood lighting','Decorative night light','USB powered'],specs:{'Brand':'YourMart','Type':'Jellyfish Lamp','Control':'Voice + Remote','Light':'RGB LED','Power':'USB','Use':'Bedroom decor'}}),
  P(17,'Deep Tissue Muscle Massage Gun Fascia Relaxation','YourMart','beauty',1450,1700,4.3,35,22,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(12)_1781767720',{description:'Fascia relaxation massage gun with 6 speed levels and 4 massage heads. Deep tissue percussion for muscle recovery and pain relief. Compact and lightweight design.',features:['6 speed levels','4 massage heads','Deep tissue percussion','Compact design','Random color'],specs:{'Brand':'YourMart','Speeds':'6 levels','Heads':'4 pieces','Type':'Fascia Gun','Battery':'Rechargeable'}}),
  P(18,'Remington Keratin Protect Intelligent Straightener FR-2028','YourMart','beauty',1750,2000,4.6,52,14,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(10)_1781766238',{featured:true,description:'Intelligent hair straightener with advanced ceramic plates and heat protection sensor. Keratin Protect technology for healthier styling. Auto-adjusts temperature for your hair type.',features:['Keratin Protect technology','Intelligent heat sensor','Advanced ceramic plates','Auto temperature adjustment','Floating plates'],specs:{'Brand':'Remington','Model':'FR-2028','Technology':'Keratin Protect + Sensor','Plates':'Advanced Ceramic','Temp':'Auto-adjust'}}),
  P(19,'LED Night Light with Motion Sensor Rechargeable','YourMart','home-lifestyle',780,950,4.4,55,30,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(37)(1)_1781695014',{trending:true,description:'Wireless wall lamp with dimmable smart night light. Magnetic indoor/outdoor wall light with motion sensor. Rechargeable battery for easy installation anywhere.',features:['Motion sensor activated','Magnetic mount','Dimmable brightness','Rechargeable battery','Indoor/outdoor use'],specs:{'Brand':'YourMart','Type':'Motion Sensor Night Light','Power':'Rechargeable','Mount':'Magnetic','Sensor':'PIR Motion'}}),
  P(20,'6x6 Inches LED Acrylic Writing Board with USB Light','YourMart','kids-babies',910,1050,4.2,22,20,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(16)_1781681829',{description:'LED acrylic writing board with 7 colorful erasable pens. USB powered message board with markers and stand. Perfect for kids, restaurants, and creative messaging.',features:['7 colorful erasable pens','LED backlight','USB powered','Includes stand','Acrylic material'],specs:{'Brand':'YourMart','Size':'6x6 inches','Type':'LED Writing Board','Power':'USB','Pens':'7 colors'}}),
  P(21,'Memo CX07 Mobile Cooling Fan 15W Semiconductor','YourMart','electronics',1100,1300,4.3,28,25,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(5)_1781674516',{trending:true,description:'15W semiconductor phone cooler for gaming with magnetic mount. Fast cooling radiator for Android and iPhone. Prevents overheating and lag during gaming sessions.',features:['15W semiconductor cooling','Magnetic mount','RGB lighting','Universal compatibility','Fast heat dissipation'],specs:{'Brand':'Memo','Model':'CX07','Power':'15W','Type':'Semiconductor Cooler','Mount':'Magnetic'}}),
  P(22,'Herbiotics Oxipro Diabetic Foot Cream 75g','YourMart','beauty',975,1100,4.5,42,18,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/OXIPRO(2)_1783332935',{description:'Intensive moisturizing cream for dry, cracked, itchy feet. Specially formulated for diabetic foot care. 75g tube with natural ingredients for gentle healing.',features:['Diabetic foot care formula','Intensive moisturizing','Natural ingredients','For dry & cracked feet','75g tube'],specs:{'Brand':'Herbiotics','Product':'Oxipro','Size':'75g','Type':'Foot Cream','For':'Diabetic foot care'}}),
  P(23,'Fast Nail Fungus Treatment Serum','YourMart','beauty',850,1000,4.2,30,22,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(11)_1783335160',{description:'Nail repair essence for fingernails and toenails. Natural nail care formula for fungus treatment. Easy application with brush for targeted treatment.',features:['Natural formula','Nail repair essence','Fungus treatment','Brush applicator','For fingers & toes'],specs:{'Brand':'YourMart','Type':'Treatment Serum','Target':'Nail Fungus','Application':'Brush','Formula':'Natural'}}),
  P(24,'Catapult Gun Aircraft Toy for Kids','YourMart','kids-babies',650,750,4.3,35,40,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(14)_1783340117',{trending:true,description:'Foam airplane launcher glider flying toy for kids. 2-in-1 catapult gun with foam airplanes. Safe outdoor fun for children with durable foam planes.',features:['2-in-1 catapult gun','Foam airplanes included','Safe for kids','Outdoor fun','Durable foam material'],specs:{'Brand':'YourMart','Type':'Catapult Aircraft Toy','Material':'Foam','Age':'3+ years','Mode':'2-in-1 launch'}}),
  P(25,'Adjustable Mobile Phone Stand Flexible Gooseneck','YourMart','electronics',950,1100,4.4,28,30,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(18)(1)_1781685626',{description:'Flexible gooseneck arm for recording, live streaming, and video calls. Stable desk mount stand with adjustable angle. Compatible with all smartphones.',features:['Flexible gooseneck arm','Stable desk mount','Adjustable angle','Universal phone holder','For recording & streaming'],specs:{'Brand':'YourMart','Type':'Phone Stand','Arm':'Flexible Gooseneck','Mount':'Desk clamp','Compatibility':'All smartphones'}}),
  P(26,'Pack of 3 LED Remote Control Tap Lights','YourMart','home-lifestyle',880,1000,4.3,40,25,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(27)_1781691824',{bestSeller:true,description:'Self-adhesive cabinet, wardrobe, and kitchen lights with remote control. 3-pack LED tap lights for easy installation. Wireless and battery operated for convenient lighting anywhere.',features:['Pack of 3 lights','Remote control included','Self-adhesive backing','Wireless battery operated','Multiple lighting modes'],specs:{'Brand':'YourMart','Type':'LED Tap Light','Quantity':'3 pack','Control':'Remote','Power':'Battery'}}),
  P(27,'Moving Sand Art Picture 3D Dynamic Deep Sea','YourMart','home-lifestyle',810,950,4.4,32,15,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/Untitleddesign(37)_1782724541',{description:'3D dynamic deep sea sandscape with display stand. Ever-changing sand art creates beautiful landscapes. Relaxing and mesmerizing decorative piece for home and office.',features:['3D dynamic sand art','Deep sea theme','Display stand included','Ever-changing patterns','Random color'],specs:{'Brand':'YourMart','Type':'Sand Art Picture','Design':'3D Deep Sea','Stand':'Included','Color':'Random'}}),
  P(28,'5-Hole Squeeze Sauce Bottle Refillable Dispenser','YourMart','grocery',230,280,4.1,18,50,'https://admin.yourmart.pk/storage/uploads/inventory/products/media/yourmartproduct(51)_1783401974',{description:'Refillable condiment dispenser with lid and 5 holes. Multipurpose ketchup and hot sauce bottle for kitchen. Black cap design with easy squeeze body.',features:['5-hole dispenser','Refillable design','Multipurpose use','Easy squeeze body','Black cap with lid'],specs:{'Brand':'YourMart','Type':'Sauce Bottle','Holes':'5','Material':'Food-grade plastic','Cap':'Black'}}),

  // ═══════════════════════════════════════════════════════════════
  //  Markaz.app — Trending & Best Products Import
  // ═══════════════════════════════════════════════════════════════

  // ---- Health & Beauty (Markaz) ----
  P(29,'19 in 1 Makeup Kit for Pakistani Brides & Party Goers','Markaz','beauty',2429,2800,4.7,85,12,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_644275.png',{trending:true,bestSeller:true,description:'Complete 19-in-1 makeup kit designed for Pakistani brides and party enthusiasts. Includes foundation, eyeshadow palette, lipsticks, blush, highlighter, and more. All-in-one kit for flawless bridal and party looks.',features:['19 essential makeup items','Bridal & party ready','All-in-one kit','Long-lasting formulas','Pakistani skin tone friendly'],specs:{'Brand':'Markaz','Type':'Makeup Kit','Items':'19','Skin Type':'All','Occasion':'Bridal & Party'}}),
  P(30,'Ultimate Makeup Kit 20 Items for Women','Markaz','beauty',2070,2400,4.6,72,18,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_581802.png',{trending:true,description:'Ultimate 20-item makeup kit curated for women who love variety. Includes lipsticks, eyeliners, mascara, blush, compact powder, and more. Professional quality at an affordable price.',features:['20 makeup items','Professional quality','Wide variety','Affordable price','Travel-friendly case'],specs:{'Brand':'Markaz','Type':'Makeup Kit','Items':'20','Quality':'Professional','Packaging':'Travel case'}}),
  P(31,'16-in-1 Makeup Set for Flawless Long-Lasting Wear','Markaz','beauty',1600,1900,4.5,64,25,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_630536.png',{trending:true,description:'16-in-1 makeup set formulated for long-lasting wear throughout the day. Includes eyeshadows, lip colors, blush, and contour shades. Perfect for daily wear and special occasions.',features:['16 makeup pieces','Long-lasting wear','Smudge-proof','Daily & special wear','Compact design'],specs:{'Brand':'Markaz','Type':'Makeup Set','Items':'16','Wear':'Long-lasting','Use':'Daily & Special'}}),
  P(32,'Whitening Zafarani Cream Set of 2 for All Skin Types','Markaz','beauty',1080,1300,4.4,58,30,'https://static.markaz.app/pakistan/thumbnails/products/1718-77-669889-product-1.webp',{trending:true,description:'Zafarani whitening cream set of 2 for brighter, more even-toned skin. Enriched with saffron extract known for its skin-brightening properties. Suitable for all skin types and gentle on sensitive skin.',features:['Set of 2 creams','Saffron enriched','Skin brightening','All skin types','Gentle formula'],specs:{'Brand':'Zafarani','Type':'Whitening Cream','Quantity':'2 pcs','Skin Type':'All','Key Ingredient':'Saffron'}}),
  P(33,'Whitening Brightening Facial Kit with Rice Extract','Markaz','beauty',750,900,4.5,45,35,'https://static.markaz.app/pakistan/thumbnails/products/1004-77-600572-product-1.jpeg',{bestSeller:true,description:'Complete facial kit with rice extract for skin whitening and brightening. Multi-step facial treatment that cleanses, exfoliates, and nourishes. Professional facial results at home.',features:['Rice extract formula','Multi-step facial','Whitening & brightening','Professional results','Home use kit'],specs:{'Brand':'Markaz','Type':'Facial Kit','Key Ingredient':'Rice Extract','Use':'Home facial','Result':'Brightening'}}),
  P(34,'Keratin Hair Mask 500ml for Dry Frizzy Hair Repair','Markaz','beauty',550,700,4.6,92,40,'https://static.markaz.app/pakistan/thumbnails/products/658-44443-242890-product-2.jpeg',{trending:true,description:'Deep conditioning keratin hair mask in 500ml jar for repairing dry and frizzy hair. Infused with keratin protein to restore hair strength and shine. Salon-quality treatment for home use.',features:['500ml jar','Keratin protein','Deep conditioning','Frizz repair','Salon quality at home'],specs:{'Brand':'Markaz','Type':'Hair Mask','Volume':'500ml','Key Ingredient':'Keratin','Hair Type':'Dry & Frizzy'}}),
  P(35,'5-in-1 Premium Skincare Set for Pakistani Skin','Markaz','beauty',2019,2500,4.7,55,15,'https://static.markaz.app/pakistan/thumbnails/products/1183-287-647460-product-1.webp',{featured:true,description:'Premium 5-in-1 skincare set specially formulated for Pakistani skin. Includes cleanser, toner, serum, moisturizer, and sunblock. Complete daily skincare routine in one set.',features:['5-piece skincare set','Pakistani skin formula','Complete daily routine','Premium quality','All-in-one regimen'],specs:{'Brand':'Markaz','Type':'Skincare Set','Items':'5','Skin Type':'Pakistani Skin','Routine':'Complete Daily'}}),
  P(36,'Zafarani Freckle Cream 5ml Glutathione Serum','Markaz','beauty',750,900,4.3,38,20,'https://static.markaz.app/pakistan/thumbnails/products/1149-375-411014-product-1.jpeg',{description:'Zafarani freckle cream with glutathione serum for targeted spot treatment. 5ml precision applicator for direct application on freckles and dark spots. Visible results in 2-4 weeks of regular use.',features:['Glutathione serum','Freckle treatment','5ml precision applicator','Spot reduction','Visible results in 2-4 weeks'],specs:{'Brand':'Zafarani','Type':'Freckle Cream','Volume':'5ml','Key Ingredient':'Glutathione','Results':'2-4 weeks'}}),
  P(37,'Baby Skin Pore Eraser Primer for Flawless Matte Finish','Markaz','beauty',400,500,4.4,42,45,'https://static.markaz.app/pakistan/thumbnails/products/56-54-316851-product-1.jpg',{trending:true,description:'Baby Skin pore eraser primer that creates a smooth, flawless matte finish. Minimizes the appearance of pores and fine lines instantly. Perfect base for long-lasting makeup application.',features:['Pore minimizing','Matte finish','Smooth base','Long-lasting','Instant results'],specs:{'Brand':'Markaz','Type':'Primer','Finish':'Matte','Effect':'Pore erasing','Use':'Before makeup'}}),
  P(38,'Premium Exfoliating Gel 100ml Face & Body Use','Markaz','beauty',415,550,4.3,28,35,'https://static.markaz.app/pakistan/thumbnails/products/221-77-590049-product-1.jpg',{description:'Premium exfoliating gel for both face and body use. Gentle yet effective formula removes dead skin cells for smoother, brighter skin. 100ml bottle for convenient application.',features:['Face & body use','Gentle exfoliation','Dead skin removal','100ml bottle','Brighter skin'],specs:{'Brand':'Markaz','Type':'Exfoliating Gel','Volume':'100ml','Use':'Face & Body','Effect':'Exfoliation'}}),
  P(39,'Derma Suction Facial Cleanser 50ml Sensitive Skin','Markaz','beauty',1410,1700,4.2,22,10,'https://static.markaz.app/pakistan/thumbnails/products/2190-241-741676-product-1.webp',{description:'Derma suction facial cleanser designed for sensitive skin. 50ml formula gently removes blackheads, dirt, and impurities from pores. Vacuum suction technology for deep cleansing without irritation.',features:['Vacuum suction technology','Sensitive skin safe','Blackhead removal','50ml capacity','Deep pore cleansing'],specs:{'Brand':'Markaz','Type':'Facial Cleanser','Volume':'50ml','Skin Type':'Sensitive','Technology':'Vacuum suction'}}),

  // ---- Women's Fashion / Unstitched (Markaz) ----
  P(40,'Rukh - U2A Embroidered Premium Lawn Suit 4 Pcs Set','Markaz','womens-fashion',13979,16000,4.9,15,5,'https://content.public.markaz.app/markazimagevideo/public/thumbnails/products/2587-10-733725-product-1.webp',{featured:true,description:'Rukh U2A premium embroidered lawn suit in a luxurious 4-piece set. Exquisite embroidery with premium quality lawn fabric. Perfect for Eid, weddings, and special occasions.',features:['4-piece set','Premium lawn fabric','Exquisite embroidery','Eid & wedding wear','Luxury packaging'],specs:{'Brand':'Rukh','Type':'Lawn Suit','Pieces':'4','Fabric':'Premium Lawn','Occasion':'Eid & Wedding'}}),
  P(41,'Teal Majestique Lawn Cotton Embroidered Dress','Markaz','womens-fashion',6979,8000,4.8,28,8,'https://content.public.markaz.app/markazimagevideo/public/thumbnails/products/2587-10-734032-product-1.webp',{featured:true,trending:true,description:'Teal Majestique embroidered dress in premium lawn cotton. Stunning teal color with intricate embroidery work. Elegant design perfect for formal gatherings and celebrations.',features:['Premium lawn cotton','Intricate embroidery','Teal color','Formal wear','Elegant design'],specs:{'Brand':'Markaz','Type':'Embroidered Dress','Fabric':'Lawn Cotton','Color':'Teal','Occasion':'Formal'}}),
  P(42,'Zarar - U1A Embroidered Lawn Suit Set 4 Pcs Tea Pink','Markaz','womens-fashion',12979,15000,4.9,12,4,'https://content.public.markaz.app/markazimagevideo/public/thumbnails/products/2587-10-733724-product-1.webp',{featured:true,description:'Zarar U1A embroidered lawn suit in beautiful tea pink. 4-piece premium set with detailed embroidery on pure lawn fabric. A timeless choice for festive occasions and wedding events.',features:['4-piece set','Tea pink color','Detailed embroidery','Pure lawn fabric','Festive wear'],specs:{'Brand':'Zarar','Type':'Lawn Suit','Pieces':'4','Fabric':'Pure Lawn','Color':'Tea Pink'}}),
  P(43,'Women Cotton Lawn Embroidered 3 Pcs Suit Mint Green','Markaz','womens-fashion',2880,3400,4.6,35,15,'https://static.markaz.app/pakistan/thumbnails/products/2479-10-727718-product-1.webp',{trending:true,description:'Beautiful mint green cotton lawn suit with elegant embroidery. 3-piece set including shirt, dupatta, and trouser fabric. Fresh pastel shade perfect for summer gatherings.',features:['3-piece set','Cotton lawn fabric','Mint green shade','Embroidered design','Summer collection'],specs:{'Brand':'Markaz','Type':'Lawn Suit','Pieces':'3','Fabric':'Cotton Lawn','Color':'Mint Green'}}),
  P(44,'Pink Embroidered Lawn 3Pcs Set with Khaadi Dupatta','Markaz','womens-fashion',4229,5000,4.7,42,10,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_716559.png',{trending:true,bestSeller:true,description:'Pink embroidered lawn 3-piece set with premium khaadi dupatta. Delicate embroidery on soft lawn fabric with a beautifully crafted dupatta. Ideal for Eid celebrations and family gatherings.',features:['3-piece set','Khaadi dupatta','Pink embroidered','Soft lawn fabric','Eid collection'],specs:{'Brand':'Markaz','Type':'Lawn Suit','Pieces':'3','Dupatta':'Khaadi','Color':'Pink'}}),
  P(45,'Blue Digital Print Lawn 3Pcs Set','Markaz','womens-fashion',3329,3800,4.5,38,20,'https://static.markaz.app/pakistan/thumbnails/products/962-2-725126-product-1.webp',{trending:true,description:'Stylish blue digital print lawn 3-piece set. Modern digital printing on premium lawn fabric with vibrant colors. Includes shirt, dupatta, and trouser for a complete look.',features:['3-piece set','Digital print','Premium lawn','Vibrant blue','Modern design'],specs:{'Brand':'Markaz','Type':'Printed Lawn Suit','Pieces':'3','Print':'Digital','Color':'Blue'}}),
  P(46,'Maroon Embroidered 3-Piece Lawn Suit with Printed Dupatta','Markaz','womens-fashion',3430,4000,4.6,33,12,'https://static.markaz.app/pakistan/thumbnails/products/78-2-703997-product-1.webp',{description:'Rich maroon embroidered 3-piece lawn suit with printed dupatta. Deep maroon shade with intricate embroidery work perfect for evening events. Printed dupatta adds a beautiful contrast.',features:['3-piece set','Rich maroon shade','Intricate embroidery','Printed dupatta','Evening wear'],specs:{'Brand':'Markaz','Type':'Lawn Suit','Pieces':'3','Color':'Maroon','Dupatta':'Printed'}}),
  P(47,'Green Embroidered 3-Piece Lawn Suit for Women','Markaz','womens-fashion',3480,4100,4.7,40,8,'https://static.markaz.app/pakistan/thumbnails/products/1734-2-704913-product-1.webp',{trending:true,description:'Elegant green embroidered 3-piece lawn suit for women. Beautiful green shade with detailed thread embroidery on pure lawn. Perfect for Eid, mehndi, and festive celebrations.',features:['3-piece set','Green shade','Thread embroidery','Pure lawn fabric','Festive wear'],specs:{'Brand':'Markaz','Type':'Lawn Suit','Pieces':'3','Fabric':'Pure Lawn','Color':'Green'}}),
  P(48,'MIX TRENDING DESIGNS 3 Pcs Unstitched Embroidered Suit','Markaz','womens-fashion',3500,4200,4.5,55,25,'https://static.markaz.app/pakistan/thumbnails/products/1914-2-733923-product-1.webp',{trending:true,bestSeller:true,description:'Mix trending designs 3-piece unstitched embroidered suit collection. Features the latest trending embroidery patterns on premium fabric. Multiple designs available for a fashionable wardrobe.',features:['3-piece unstitched','Trending designs','Embroidered patterns','Premium fabric','Latest collection'],specs:{'Brand':'Markaz','Type':'Unstitched Suit','Pieces':'3','Design':'Trending Embroidered','Fabric':'Premium'}}),
  P(49,'Black Embroidered Kurta Set with Printed Dupatta for Women','Markaz','womens-fashion',3055,3600,4.4,29,14,'https://static.markaz.app/pakistan/thumbnails/products/322-2-723612-product-1.webp',{description:'Stunning black embroidered kurta set with printed dupatta for women. Elegant black kurta with delicate embroidery paired with a printed dupatta. Versatile outfit for both casual and semi-formal occasions.',features:['Embroidered kurta','Printed dupatta','Black color','Semi-formal wear','Versatile styling'],specs:{'Brand':'Markaz','Type':'Kurta Set','Color':'Black','Dupatta':'Printed','Occasion':'Semi-formal'}}),

  // ---- Men's Fashion (Markaz) ----
  P(50,'Multicolor Swiss Lawn Printed Shirt for Men','Markaz','mens-fashion',1000,1200,4.5,67,30,'https://static.markaz.app/pakistan/thumbnails/products/1176-6-400030-product-1.jpg',{trending:true,description:'Premium Swiss lawn printed shirt for men in multicolor design. Lightweight and breathable fabric perfect for Pakistani summers. Stylish prints that stand out in any casual setting.',features:['Swiss lawn fabric','Multicolor print','Breathable material','Summer wear','Casual style'],specs:{'Brand':'Markaz','Type':'Printed Shirt','Fabric':'Swiss Lawn','Pattern':'Multicolor Print','Season':'Summer'}}),
  P(51,'Men Synthetic Leather Casual Calf Boots Black','Markaz','mens-fashion',1850,2200,4.4,45,18,'https://static.markaz.app/pakistan/thumbnails/products/1322-400-457092-product-1331.jpg',{description:'Premium synthetic leather casual calf boots in black for men. Size 40-44 available with comfortable fit and durable construction. Versatile boots suitable for both casual and semi-formal occasions.',features:['Synthetic leather','Black color','Size 40-44','Comfortable fit','Durable construction'],specs:{'Brand':'Markaz','Type':'Calf Boots','Material':'Synthetic Leather','Color':'Black','Size':'40-44'}}),
  P(52,'Sapphire Wash & Wear Plain Suit Winter Pakistan','Markaz','mens-fashion',2060,2500,4.6,52,20,'https://static.markaz.app/pakistan/thumbnails/products/225-70-264638-product-1.jpeg',{bestSeller:true,description:'Sapphire wash and wear plain suit designed for Pakistani winters. Premium quality fabric that requires minimal ironing. Classic design perfect for office, daily wear, and formal occasions.',features:['Wash & wear fabric','No ironing needed','Winter suitable','Premium quality','Formal & casual'],specs:{'Brand':'Sapphire','Type':'Shalwar Kameez','Fabric':'Wash & Wear','Season':'Winter','Style':'Plain'}}),
  P(53,'Men Printed Track Suit White Black MILANO Polyester','Markaz','mens-fashion',1399,1700,4.4,38,22,'https://static.markaz.app/pakistan/thumbnails/products/515-167-702261-product-1.webp',{trending:true,description:'MILANO polyester printed track suit in white and black for men. Comfortable and breathable fabric ideal for workouts and casual wear. Modern printed design that combines style with functionality.',features:['MILANO polyester','White & black print','Breathable fabric','Workout & casual','Modern design'],specs:{'Brand':'MILANO','Type':'Track Suit','Fabric':'Polyester','Color':'White Black','Use':'Sports & Casual'}}),
  P(54,'Men Cotton Markhor Graphic Track Suit Black White','Markaz','mens-fashion',850,1050,4.3,42,35,'https://static.markaz.app/pakistan/thumbnails/products/237-167-535427-product-1.jpg',{trending:true,description:'Cotton Markhor graphic track suit in black and white for men. Featuring the iconic Markhor design on comfortable cotton fabric. Perfect for fitness activities and everyday casual wear.',features:['Cotton fabric','Markhor graphic','Black & white','Fitness wear','Comfortable fit'],specs:{'Brand':'Markaz','Type':'Track Suit','Fabric':'Cotton','Design':'Markhor Graphic','Color':'Black White'}}),
  P(55,'Men Black Synthetic Leather Sandals Size 6-11','Markaz','mens-fashion',609,750,4.2,55,40,'https://static.markaz.app/pakistan/thumbnails/products/1497-190-628127-product-1.jpeg',{bestSeller:true,description:'Durable black synthetic leather sandals for men in sizes 6-11. Comfortable sole with anti-slip design for everyday wear. Perfect for summer and casual outings across Pakistan.',features:['Synthetic leather','Anti-slip sole','Size 6-11','Comfortable fit','Summer sandals'],specs:{'Brand':'Markaz','Type':'Sandals','Material':'Synthetic Leather','Color':'Black','Size':'6-11'}}),

  // ---- Kids & Babies (Markaz) ----
  P(56,'360 Rotating Musical Car Toy for Kids Multicolor','Markaz','kids-babies',1229,1500,4.5,78,25,'https://static.markaz.app/pakistan/thumbnails/products/1010-394-628081-product-1.jpg',{trending:true,bestSeller:true,description:'360-degree rotating musical car toy for kids in vibrant multicolor plastic. Plays fun music and sounds while rotating in all directions. Safe, durable, and engaging toy for toddlers and young children.',features:['360-degree rotation','Musical sounds','Multicolor design','Safe plastic','Toddler friendly'],specs:{'Brand':'Markaz','Type':'Musical Toy','Material':'Plastic','Motion':'360 Rotating','Age':'1-5 years'}}),
  P(57,'Kids Bubble Blaster Gun Blue Purple 36 Nozzle','Markaz','kids-babies',1590,1900,4.6,62,15,'https://static.markaz.app/pakistan/thumbnails/products/943-394-461501-product-1.jpg',{trending:true,description:'Exciting bubble blaster gun in blue and purple with 36 nozzles for maximum bubbles. Automatic bubble generation for hours of outdoor fun. Safe and easy to use for kids of all ages.',features:['36 nozzles','Blue & purple design','Automatic bubbles','Outdoor fun','Safe for kids'],specs:{'Brand':'Markaz','Type':'Bubble Gun','Nozzles':'36','Color':'Blue Purple','Power':'Battery'}}),
  P(58,'3-in-1 LCD Writing Tablet for Kids Educational Playset','Markaz','kids-babies',980,1200,4.4,55,30,'https://static.markaz.app/pakistan/thumbnails/products/511-392-396001-product-1.jpg',{trending:true,description:'3-in-1 LCD writing tablet educational playset for kids. Colorful screen for drawing, writing, and learning. Pressure-sensitive display with one-click erase for endless creativity.',features:['3-in-1 educational','LCD writing screen','Pressure sensitive','One-click erase','Battery powered'],specs:{'Brand':'Markaz','Type':'Writing Tablet','Screen':'LCD','Function':'Draw & Write','Power':'Battery'}}),
  P(59,'Rainbow Pop-it Unicorn Shoulder Bag for Kids','Markaz','kids-babies',1070,1300,4.8,48,20,'https://static.markaz.app/pakistan/thumbnails/products/66-20319-137400-product-1.jpeg',{trending:true,description:'Adorable rainbow pop-it unicorn shoulder bag for kids. Combines a fun pop-it fidget toy with a practical shoulder bag. Colorful unicorn design that kids will love for school and play.',features:['Pop-it fidget toy','Unicorn design','Shoulder bag','Rainbow colors','Multi-purpose'],specs:{'Brand':'Markaz','Type':'Shoulder Bag','Design':'Unicorn Pop-it','Color':'Rainbow','Use':'School & Play'}}),
  P(60,'2 Pcs Girls Lawn Printed Frock And Trouser Set','Markaz','kids-babies',1729,2100,4.5,35,12,'https://static.markaz.app/pakistan/thumbnails/products/2479-35-741403-product-1.webp',{description:'Beautiful 2-piece girls lawn printed frock and trouser set. Vibrant printed design on soft lawn fabric for comfort and style. Perfect for parties, Eid, and special occasions for little girls.',features:['2-piece set','Printed lawn fabric','Frock & trouser','Vibrant design','Party wear'],specs:{'Brand':'Markaz','Type':'Girls Suit','Pieces':'2','Fabric':'Lawn','Occasion':'Party & Eid'}}),
  P(61,'Rainbow Inflatable Pool for Kids Balcony Play','Markaz','kids-babies',1470,1800,4.6,52,18,'https://static.markaz.app/pakistan/thumbnails/products/1126-45-383904-product-2.jpg',{trending:true,description:'Rainbow inflatable pool designed for kids balcony and outdoor play. Easy to inflate and deflate for convenient storage. Safe and durable PVC material for hours of summer water fun.',features:['Inflatable design','Rainbow colors','Balcony friendly','PVC material','Easy storage'],specs:{'Brand':'Markaz','Type':'Inflatable Pool','Material':'PVC','Color':'Rainbow','Use':'Balcony & Outdoor'}}),
  P(62,'Scooty for Kids Heavy-Duty Outdoor with Hand Brakes','Markaz','kids-babies',4599,5500,4.7,32,8,'https://static.markaz.app/pakistan/thumbnails/products/691-410-738904-product-1.webp',{featured:true,description:'Heavy-duty kids scooty with adjustable handlebar, hand brakes, and tyre lights. Strong frame with lightweight design for smooth and fun rides. E-wheels scooty perfect for outdoor play and exercise.',features:['Heavy-duty frame','Hand brakes','Adjustable handlebar','Tyre lights','E-wheels'],specs:{'Brand':'Markaz','Type':'Kids Scooty','Brakes':'Hand brakes','Wheels':'E-wheels','Features':'Tyre Lights'}}),
  P(63,'Kids Embroidered Bunch Maxi Set Navy Blue 2Pcs','Markaz','kids-babies',1670,2000,4.5,28,15,'https://static.markaz.app/pakistan/thumbnails/products/1995-35-689911-product-1.webp',{description:'Elegant navy blue embroidered bunch maxi set for kids in 2 pieces. Beautiful embroidery work on comfortable fabric for special occasions. 2-piece set includes maxi and matching trouser.',features:['2-piece set','Navy blue color','Embroidered design','Comfortable fabric','Special occasions'],specs:{'Brand':'Markaz','Type':'Kids Maxi Set','Pieces':'2','Color':'Navy Blue','Design':'Embroidered'}}),

  // ---- Electronics & Tech (Markaz) ----
  P(64,'Portable Rechargeable Fan with Stand & Fast Charge','Markaz','appliances',980,1200,4.6,88,30,'https://static.markaz.app/pakistan/thumbnails/products/854-121-402783-product-1.jpg',{trending:true,bestSeller:true,description:'Portable rechargeable fan with adjustable stand and fast charging capability. Powerful airflow with multiple speed settings for hot summer days. USB rechargeable for convenient use anywhere, anytime.',features:['Rechargeable battery','Adjustable stand','Fast charging','Multiple speeds','USB powered'],specs:{'Brand':'Markaz','Type':'Portable Fan','Power':'USB Rechargeable','Speeds':'Multiple','Feature':'Fast Charge'}}),
  P(65,'Portable Mini Air Cooler White ABS 2X Pro','Markaz','appliances',2679,3200,4.4,42,15,'https://static.markaz.app/pakistan/thumbnails/products/1518-121-610430-product-1.jpeg',{trending:true,description:'Portable mini air cooler in white ABS body with 2X Pro cooling technology. Compact design perfect for bedrooms, offices, and small spaces. Water tank for evaporative cooling with low power consumption.',features:['2X Pro cooling','White ABS body','Water tank','Low power usage','Compact design'],specs:{'Brand':'Markaz','Type':'Air Cooler','Model':'2X Pro','Material':'ABS','Cooling':'Evaporative'}}),
  P(66,'White Mini Air Cooler with 3-Speed Wind & ABS Body','Markaz','appliances',2950,3500,4.5,35,12,'https://static.markaz.app/pakistan/thumbnails/products/943-121-601412-product-1.jpg',{description:'White mini air cooler with 3-speed wind control and durable ABS body. Adjustable airflow direction for personalized cooling experience. Energy-efficient design ideal for Pakistani summer heat.',features:['3-speed control','ABS body','Adjustable airflow','Energy efficient','White design'],specs:{'Brand':'Markaz','Type':'Air Cooler','Speeds':'3','Material':'ABS','Color':'White'}}),
  P(67,'Premium Wireless Earbuds Black Yellow Bluetooth 5.3','Markaz','electronics',1170,1500,4.5,55,25,'https://static.markaz.app/pakistan/thumbnails/products/704-86-661215-product-1.webp',{trending:true,description:'Premium wireless earbuds in black and yellow with Bluetooth 5.3 technology. Crystal clear sound with deep bass and noise isolation. Compact charging case with long battery life for all-day listening.',features:['Bluetooth 5.3','Noise isolation','Deep bass','Charging case','Long battery life'],specs:{'Brand':'Markaz','Type':'Wireless Earbuds','Bluetooth':'5.3','Color':'Black Yellow','Feature':'Noise Isolation'}}),
  P(68,'M25 Wireless Gaming Earbuds Black ABS Bluetooth 5.0','Markaz','electronics',2470,4500,4.6,40,10,'https://static.markaz.app/pakistan/thumbnails/products/704-86-371311-product-1.jpg',{trending:true,featured:true,description:'M25 wireless gaming earbuds in black ABS with Bluetooth 5.0 and ultra-low latency. Designed for competitive gaming with zero audio delay. Premium sound quality for gaming, music, and calls.',features:['Gaming optimized','Ultra-low latency','Bluetooth 5.0','Premium sound','ABS construction'],specs:{'Brand':'M25','Type':'Gaming Earbuds','Bluetooth':'5.0','Latency':'Ultra-low','Color':'Black'}}),
  P(69,'Rechargeable Zoomable XPE+COB Flashlight Black','Markaz','electronics',480,600,4.3,62,40,'https://static.markaz.app/pakistan/thumbnails/products/1172-116-642507-product-2.webp',{bestSeller:true,description:'Rechargeable zoomable flashlight with XPE+COB dual LED technology. Black body with adjustable focus from wide flood to narrow spotlight. USB rechargeable with long-lasting battery for outdoor and emergency use.',features:['XPE+COB dual LED','Zoomable focus','USB rechargeable','Long battery life','Emergency ready'],specs:{'Brand':'Markaz','Type':'Flashlight','LED':'XPE+COB','Power':'USB Rechargeable','Color':'Black'}}),
  P(70,'Video Amplifying Screen Multicolor','Markaz','electronics',459,600,4.2,45,35,'https://content.public.markaz.app/markazimagevideo/public/thumbnails/products/1518-97-629990-product-1.jpg',{description:'Video amplifying screen in multicolor for enlarged phone display viewing. Magnifies screen content for comfortable viewing of videos and movies. Compatible with all smartphones and portable design.',features:['Screen magnification','Multicolor display','Universal phone fit','Portable design','Comfortable viewing'],specs:{'Brand':'Markaz','Type':'Screen Magnifier','Color':'Multicolor','Compatibility':'All phones','Use':'Video viewing'}}),

  // ---- Home & Lifestyle (Markaz) ----
  P(71,'Premium Bubble Turkish Sofa Cover 5 Seater Grey Jersey','Markaz','home-lifestyle',3800,4500,4.7,38,10,'https://static.markaz.app/pakistan/thumbnails/products/133-57-385083-product-1.jpg',{trending:true,description:'Premium bubble Turkish sofa cover for 5-seater in grey jersey fabric. Elastic stretch material fits snugly over any sofa shape. Machine washable and wrinkle-resistant for easy maintenance.',features:['5-seater cover','Grey jersey fabric','Elastic stretch fit','Machine washable','Wrinkle resistant'],specs:{'Brand':'Markaz','Type':'Sofa Cover','Size':'5 Seater','Fabric':'Jersey','Color':'Grey'}}),
  P(72,'Waterproof Terry Cotton Mattress Cover 72x78','Markaz','home-lifestyle',1090,1300,4.5,65,25,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_208964.png',{bestSeller:true,description:'Waterproof terry cotton mattress cover in 72x78 inch size. Protects mattress from spills, stains, and moisture while remaining breathable. Fitted sheet style with elastic corners for secure placement.',features:['Waterproof protection','Terry cotton top','72x78 inch','Breathable material','Elastic corners'],specs:{'Brand':'Markaz','Type':'Mattress Cover','Size':'72x78 inch','Material':'Terry Cotton','Feature':'Waterproof'}}),
  P(73,'Crystal Cotton Double Bedsheet Set Mustard Yellow Floral','Markaz','home-lifestyle',1450,1800,4.6,52,20,'https://static.markaz.app/pakistan/thumbnails/products/78-60-309342-product-1.jpeg',{trending:true,description:'Crystal cotton double bedsheet set in mustard yellow with floral print. Soft and durable cotton fabric for comfortable sleep. Includes bedsheet and pillow covers for a complete bedroom makeover.',features:['Crystal cotton','Floral print','Double bed size','Pillow covers included','Soft & durable'],specs:{'Brand':'Markaz','Type':'Bedsheet Set','Fabric':'Crystal Cotton','Color':'Mustard Yellow','Print':'Floral'}}),
  P(74,'5-Layer Iron Kitchen Storage Rack Brown 80x80x80cm','Markaz','home-lifestyle',12930,15000,4.8,22,5,'https://static.markaz.app/pakistan/thumbnails/products/271-377-488962-product-1.jpg',{featured:true,description:'5-layer iron kitchen storage rack in brown finish, 80x80x80cm. Heavy-duty iron construction with ample storage space for kitchen essentials. Rust-resistant coating for long-lasting use in Pakistani kitchens.',features:['5 layers','Iron construction','80x80x80cm','Rust-resistant','Heavy duty'],specs:{'Brand':'Markaz','Type':'Storage Rack','Layers':'5','Material':'Iron','Dimensions':'80x80x80cm'}}),
  P(75,'Orange Velvet Bath Towel Set 2 Pcs 54x27 inch','Markaz','home-lifestyle',1829,2200,4.5,42,15,'https://static.markaz.app/pakistan/thumbnails/products/1473-58-718595-product-1.webp',{description:'Luxurious orange velvet bath towel set of 2 pieces, 54x27 inches. Ultra-soft velvet texture for gentle drying and comfort. Highly absorbent with vibrant orange color that brightens any bathroom.',features:['2-piece set','Velvet texture','54x27 inch','Ultra-soft','Highly absorbent'],specs:{'Brand':'Markaz','Type':'Bath Towel','Pieces':'2','Size':'54x27 inch','Material':'Velvet','Color':'Orange'}}),
  P(76,'Set of 4 Black Storage Bags with Red Trim','Markaz','home-lifestyle',790,950,4.3,55,30,'https://static.markaz.app/pakistan/thumbnails/products/133-12750-78539-product-1.jpg',{bestSeller:true,description:'Set of 4 black storage bags with red trim for home organization. Multiple sizes for organizing clothes, bedding, and household items. Zip closure with clear window for easy identification of contents.',features:['4-piece set','Black with red trim','Zip closure','Clear window','Multiple sizes'],specs:{'Brand':'Markaz','Type':'Storage Bags','Quantity':'4','Color':'Black/Red','Closure':'Zip'}}),
  P(77,'Waterproof Washing Machine Cover Black Silver Zipper','Markaz','home-lifestyle',820,1000,4.4,48,35,'https://static.markaz.app/pakistan/thumbnails/products/360-99-295835-product-1.jpeg',{description:'Waterproof washing machine cover in black with silver zipper. Full protection against dust, water, and rust for your washing machine. Universal fit with zipper access for easy machine operation.',features:['Waterproof material','Silver zipper','Dust protection','Universal fit','Easy access'],specs:{'Brand':'Markaz','Type':'Machine Cover','Material':'Waterproof','Color':'Black','Closure':'Zipper'}}),

  // ---- Watches, Bags & Jewellery (Markaz) ----
  P(78,'Women Blue Heart Dial Chain Strap Watch 6cm Stainless Steel','Markaz','watches-bags',1330,1600,4.5,42,18,'https://static.markaz.app/pakistan/thumbnails/products/1885-133-730168-product-2.webp',{trending:true,description:'Elegant women watch with blue heart dial and stainless steel chain strap. 6cm dial size with a romantic heart design in beautiful blue. Premium stainless steel chain strap for durability and style.',features:['Blue heart dial','Stainless steel','Chain strap','6cm dial','Elegant design'],specs:{'Brand':'Markaz','Type':'Women Watch','Dial':'Heart Shape','Material':'Stainless Steel','Strap':'Chain'}}),
  P(79,'Black Skeleton Chronograph Watch for Men','Markaz','watches-bags',2649,3200,4.7,35,12,'https://static.markaz.app/pakistan/thumbnails/products/1156-132-666375-product-1.webp',{featured:true,trending:true,description:'Sophisticated black skeleton chronograph watch for men. Exposed mechanical movement visible through the skeleton dial design. Premium craftsmanship with leather strap for a bold statement look.',features:['Skeleton dial','Chronograph function','Exposed movement','Leather strap','Premium craftsmanship'],specs:{'Brand':'Markaz','Type':'Men Watch','Dial':'Skeleton','Function':'Chronograph','Strap':'Leather'}}),
  P(80,'Turkish-Inspired Mens Ring Set of 3 Silver Plated','Markaz','watches-bags',430,550,4.3,58,40,'https://static.markaz.app/pakistan/thumbnails/products/1013-44-446645-product-1.jpg',{bestSeller:true,description:'Turkish-inspired mens ring set of 3 in silver plated finish. Features black turquoise and red stone accents with intricate Turkish patterns. Adjustable sizes for comfortable fit and versatile styling.',features:['Set of 3 rings','Silver plated','Turkish design','Black turquoise stone','Adjustable fit'],specs:{'Brand':'Markaz','Type':'Ring Set','Quantity':'3','Material':'Silver Plated','Stones':'Turquoise & Red'}}),
  P(81,'Colorful Charm Bracelet 1 Pc Multicolor Alloy','Markaz','watches-bags',1229,1500,4.4,45,22,'https://content.public.markaz.app/markazimagevideo/public/thumbnails/products/1771-78-735445-product-1.webp',{trending:true,description:'Beautiful colorful charm bracelet in multicolor alloy material. Multiple vibrant charms on a durable alloy chain. Perfect accessory for women and girls to complement any outfit.',features:['Multicolor charms','Alloy material','Durable chain','Versatile accessory','Gift ready'],specs:{'Brand':'Markaz','Type':'Charm Bracelet','Material':'Alloy','Color':'Multicolor','Style':'Fashion'}}),
  P(82,'Jewellery Box Premium Storage','Markaz','watches-bags',779,950,4.5,38,25,'https://static.markaz.app/pakistan/thumbnails/products/2060-403-739586-product-1.webp',{description:'Premium jewellery storage box with multiple compartments for organized accessory management. Elegant design with secure clasp closure to protect precious items. Compact size perfect for dressing tables and travel.',features:['Multiple compartments','Secure clasp','Compact design','Elegant finish','Travel friendly'],specs:{'Brand':'Markaz','Type':'Jewellery Box','Closure':'Clasp','Use':'Storage','Feature':'Multi-compartment'}}),

  // ---- Perfumes & Fragrances (Markaz - beauty) ----
  P(83,'Janan Gold & Wasim Akram 502 Perfume Set for Her & Him','Markaz','beauty',1009,1200,4.6,72,20,'https://static.markaz.app/pakistan/thumbnails/products/1296-281-691456-product-1.webp',{trending:true,description:'Janan Gold and Wasim Akram 502 perfume set for her and him. Two premium Pakistani fragrances in one elegant gift set. Long-lasting scents perfect for daily wear and special occasions.',features:['2 perfumes set','Her & Him','Long lasting','Pakistani fragrances','Gift set'],specs:{'Brand':'Janan / Wasim Akram','Type':'Perfume Set','Quantity':'2','Scents':'Janan Gold & 502','For':'Her & Him'}}),
  P(84,'Junaid J. Jamshed 5 Pcs Wooden Perfume Set','Markaz','beauty',900,1100,4.7,85,15,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_468274.png',{bestSeller:true,description:'Junaid Jamshed 5-piece wooden perfume set in elegant packaging. Premium J. fragrances in a beautiful wooden gift box. Perfect gift for Eid, weddings, and special celebrations.',features:['5-piece set','Wooden gift box','J. premium fragrances','Eid gift','Elegant packaging'],specs:{'Brand':'J. By Junaid Jamshed','Type':'Perfume Set','Pieces':'5','Packaging':'Wooden Box','Occasion':'Gift'}}),
  P(85,'Pack of 2 Perfume Janan & Zarar Gold','Markaz','beauty',929,1100,4.5,65,25,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_713273.png',{description:'Pack of 2 premium Pakistani perfumes featuring Janan and Zarar Gold. Two iconic fragrances that represent Pakistani craftsmanship. Long-lasting formula suitable for all occasions and seasons.',features:['2 perfumes','Janan & Zarar Gold','Long lasting','Pakistani brand','All occasions'],specs:{'Brand':'Janan / Zarar','Type':'Perfume Pack','Quantity':'2','Origin':'Pakistan','Wear':'All occasions'}}),

  // ---- More Home Essentials (Markaz) ----
  P(86,'Double Bedsheet Set Brown Velvet Jacquard 4 Pcs','Markaz','home-lifestyle',4010,4800,4.7,28,8,'https://static.markaz.app/GenerativeMedia/Pakistan/thumbnails/pakistan_566000.png',{description:'Luxurious brown velvet jacquard double bedsheet set in 4 pieces. Premium velvet fabric with intricate jacquard weave pattern. Includes bedsheet and 3 pillow covers for a complete bedroom ensemble.',features:['4-piece set','Velvet jacquard','Brown color','Premium fabric','Complete ensemble'],specs:{'Brand':'Markaz','Type':'Bedsheet Set','Pieces':'4','Fabric':'Velvet Jacquard','Color':'Brown'}}),
  P(87,'Umrah Savings Box Golden Black Wood 210k','Markaz','home-lifestyle',472,600,4.3,82,35,'https://static.markaz.app/pakistan/thumbnails/products/1261-273-673374-product-1.webp',{description:'Beautiful Umrah savings box in golden black wood design. Helps you save money for your Umrah journey with a dedicated 210k target. Elegant wooden construction with secure lock for safe savings.',features:['Umrah themed','Golden black wood','210k savings target','Secure lock','Elegant design'],specs:{'Brand':'Markaz','Type':'Savings Box','Material':'Wood','Color':'Golden Black','Target':'210k'}}),
  P(88,'3 Pcs Cotton Patchwork Double Bedsheet','Markaz','home-lifestyle',960,1200,4.4,48,25,'https://static.markaz.app/pakistan/thumbnails/products/615-60-742134-product-1.webp',{description:'3-piece cotton patchwork double bedsheet set with colorful patchwork design. Soft cotton fabric for comfortable sleep throughout the year. Unique patchwork pattern adds character to any bedroom decor.',features:['3-piece set','Cotton fabric','Patchwork design','Double bed size','Year-round comfort'],specs:{'Brand':'Markaz','Type':'Bedsheet Set','Pieces':'3','Fabric':'Cotton','Design':'Patchwork'}}),
  P(89,'Quilted Microwave Cover Waterproof Cotton 33x11 Inch','Markaz','home-lifestyle',400,500,4.2,55,40,'https://static.markaz.app/pakistan/thumbnails/products/451-39319-215826-product-2.jpeg',{bestSeller:true,description:'Quilted microwave cover in waterproof cotton, 33x11 inch size. Protects microwave from dust, splatters, and scratches. Waterproof cotton material is easy to clean and maintain.',features:['Quilted design','Waterproof cotton','33x11 inch','Dust protection','Easy to clean'],specs:{'Brand':'Markaz','Type':'Microwave Cover','Material':'Cotton','Size':'33x11 inch','Feature':'Waterproof'}}),
  P(90,'Metal Laundry Clips Adjustable Rope Multicolor 12 Pcs','Markaz','home-lifestyle',596,750,4.6,72,30,'https://static.markaz.app/pakistan/thumbnails/products/1472-46-589819-product-1.jpeg',{trending:true,description:'Set of 12 metal laundry clips with adjustable rope in multicolor. Strong grip clips that hold clothes securely on the line in windy conditions. Adjustable rope length for versatile hanging options.',features:['12 clips','Adjustable rope','Metal construction','Multicolor','Strong grip'],specs:{'Brand':'Markaz','Type':'Laundry Clips','Quantity':'12','Material':'Metal','Rope':'Adjustable'}}),
  P(91,'Keratin & Collagen Hair Mask Pack of 2','Markaz','beauty',779,950,4.5,45,22,'https://static.markaz.app/pakistan/thumbnails/products/221-55-502373-product-1.jpg',{trending:true,description:'Keratin and collagen hair mask pack of 2 for intensive hair repair. Dual-action formula strengthens hair from root to tip while adding shine. Salon-quality treatment for damaged, color-treated, or heat-styled hair.',features:['Pack of 2','Keratin & collagen','Hair repair','Salon quality','Adds shine'],specs:{'Brand':'Markaz','Type':'Hair Mask','Quantity':'2','Key Ingredients':'Keratin & Collagen','Use':'Intensive repair'}}),
];

// Build related ids by same category
PRODUCTS.forEach(p => {
  if (!p.related.length) p.related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0,4).map(x=>x.id);
});

export const COUPONS: Coupon[] = [
  { code:'WELCOME10', type:'percent', value:10, label:'10% off your first order', min:0 },
  { code:'SAVE15', type:'percent', value:15, label:'15% off orders over Rs 10,000', min:10000 },
  { code:'FLAT500', type:'flat', value:500, label:'Rs 500 off orders over Rs 5,000', min:5000 },
  { code:'FREESHIP', type:'ship', value:0, label:'Free shipping on any order', min:0 },
  { code:'EID25', type:'percent', value:25, label:'25% off orders over Rs 50,000', min:50000 },
];

export const TESTIMONIALS: Testimonial[] = [
  { name:'Ayesha Khan', role:'Verified Buyer', avatar:'1494790108377-be9c29b29330', rating:5, text:'Best online shopping experience in Pakistan! Fast delivery and genuine products every time.' },
  { name:'Bilal Ahmed', role:'Verified Buyer', avatar:'1500648767791-00dcc994a43e', rating:5, text:'Bachat Bazar has everything I need at great prices. The Cash on Delivery option is so convenient!' },
  { name:'Fatima Ali', role:'Verified Buyer', avatar:'1438761681033-6461ffad8d80', rating:4, text:'Love the variety of products. Quality is excellent and prices are very reasonable compared to other stores.' },
  { name:'Usman Malik', role:'Verified Buyer', avatar:'1507003211169-0a1dd7228f2d', rating:5, text:'Ordered groceries and they arrived the same day. Amazing service and the website is so easy to use!' },
];

export const BLOGS: BlogPost[] = [
  { id:1, title:'10 Best Beauty Products for Glowing Skin', img:'1596462502278-27bfdc403348', date:'Jul 1, 2026', author:'Beauty Desk', excerpt:'Discover the top skincare picks that will give you that radiant glow this season.' },
  { id:2, title:'Smart Home Appliances That Save Time', img:'1556909114-f6e7ad7d3136', date:'Jun 25, 2026', author:'Home Team', excerpt:'Upgrade your kitchen with these time-saving appliances that make cooking a breeze.' },
  { id:3, title:'Men\'s Fashion Trends for 2026', img:'1483985988355-763728e1935b', date:'Jun 18, 2026', author:'Fashion Edit', excerpt:'Stay stylish with the latest fashion trends for men this year.' },
  { id:4, title:'Best Phone Accessories Under Rs 5,000', img:'1505740420928-5e560c06d30e', date:'Jun 10, 2026', author:'Tech Desk', excerpt:'From earbuds to chargers, here are the best accessories that won\'t break the bank.' },
];

// Pakistani-themed hero slides - controlled by admin banners
export const HERO_SLIDES: HeroSlide[] = [
  { title:'Eid Mubarak Sale!', sub:'Up to 30% off on Health & Beauty essentials', cta:'Shop Now', route:'#/shop?category=beauty', img:'1596462502278-27bfdc403348', grad:'from-[#006233] to-[#00A651]', bg:'bg-gradient-to-br from-[#004D25] via-[#006233] to-[#00A651]' },
  { title:'Ramzan Kitchen Deals', sub:'Premium appliances at unbeatable prices', cta:'Shop Appliances', route:'#/shop?category=appliances', img:'1556909114-f6e7ad7d3136', grad:'from-[#004D25] to-[#006233]', bg:'bg-gradient-to-br from-[#002510] via-[#004D25] to-[#006233]' },
  { title:'Latest Phones & Gadgets', sub:'Smartphones, earbuds & accessories', cta:'Shop Electronics', route:'#/shop?category=electronics', img:'1511707171634-5f897ff02aa9', grad:'from-[#0C2340] to-[#1A4D8F]', bg:'bg-gradient-to-br from-[#0C2340] via-[#1A4D8F] to-[#2E6BC6]' },
  { title:'Bachat ka Vaade!', sub:'Best prices on Fashion, Home & more', cta:'Shop All', route:'#/shop', img:'1483985988355-763728e1935b', grad:'from-[#8B1A1A] to-[#C41E3A]', bg:'bg-gradient-to-br from-[#5C1010] via-[#8B1A1A] to-[#C41E3A]' },
];

// Default banners for admin management - these control the hero slider AND banner cards
export const DEFAULT_BANNERS: BannerData[] = [
  { id:'b1', title:'Eid Collection 2026', subtitle:'Exclusive deals on Fashion & Beauty', cta:'Explore Now', ctaLink:'#/shop?category=beauty', image:'1596462502278-27bfdc403348', gradient:'from-[#006233] to-[#C5A028]', active:true, order:1 },
  { id:'b2', title:'Mega Sale Weekend', subtitle:'Flat 20% off on all Electronics', cta:'Shop Electronics', ctaLink:'#/shop?category=electronics', image:'1511707171634-5f897ff02aa9', gradient:'from-[#1A4D8F] to-[#00A651]', active:true, order:2 },
  { id:'b3', title:'Free Delivery Nationwide', subtitle:'On orders above Rs 25,000', cta:'Start Shopping', ctaLink:'#/shop', image:'', gradient:'from-[#8B1A1A] to-[#C41E3A]', active:true, order:3 },
];

// Default sales for admin management
export const DEFAULT_SALES: SaleData[] = [
  { id:'s1', name:'Eid Mubarak Sale', description:'25% off on all beauty products', discountPercent:25, startDate:'2026-06-25', endDate:'2026-07-15', categoryId:'beauty', active:true, bannerColor:'#006233' },
  { id:'s2', name:'Tech Week', description:'15% off on electronics', discountPercent:15, startDate:'2026-07-01', endDate:'2026-07-10', categoryId:'electronics', active:true, bannerColor:'#1A4D8F' },
  { id:'s3', name:'Ramzan Special', description:'20% off on groceries', discountPercent:20, startDate:'2026-07-05', endDate:'2026-07-20', categoryId:'grocery', active:true, bannerColor:'#C5A028' },
];

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id:'standard', name:'Standard Shipping', desc:'3-5 business days', cost:0 },
  { id:'express', name:'Express Shipping', desc:'1-2 business days', cost:250 },
  { id:'overnight', name:'Overnight Delivery', desc:'Next business day', cost:500 },
];

export const PAYMENTS: Payment[] = [
  { id:'card', name:'Credit / Debit Card', icon:'CreditCard' },
  { id:'jazzcash', name:'JazzCash', icon:'Wallet' },
  { id:'easypaisa', name:'EasyPaisa', icon:'Wallet' },
  { id:'bank', name:'Bank Transfer', icon:'Building2' },
  { id:'cod', name:'Cash on Delivery', icon:'Banknote' },
];
