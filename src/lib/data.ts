/* ============================================================
   Bachat Bazar — Data Layer
   Catalog based on Naheed.pk products & categories
   Prices in PKR
   Pakistani-themed color scheme & proper product images
   ============================================================ */

// Direct image URL builder - uses reliable product image sources
export const U = (id: string, w = 700) => {
  if (typeof id === 'string' && /^https?:\/\//.test(id)) return id;
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
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

export const CATEGORIES: Category[] = [
  { id:'beauty', name:'Health & Beauty', icon:'Sparkles', color:'from-emerald-500 to-teal-500', img:'1596462502278-27bfdc403348' },
  { id:'grocery', name:'Grocery & Pet Care', icon:'ShoppingCart', color:'from-amber-500 to-orange-500', img:'1604724399219-3e0d6e6d0b3d' },
  { id:'appliances', name:'TV & Home Appliances', icon:'Tv', color:'from-sky-500 to-blue-500', img:'1556909114-f6e7ad7d3136' },
  { id:'electronics', name:'Phones & Computers', icon:'Smartphone', color:'from-indigo-500 to-purple-500', img:'1511707171634-5f897ff02aa9' },
  { id:'mens-fashion', name:"Men's Fashion", icon:'Shirt', color:'from-slate-600 to-zinc-700', img:'1483985988355-763728e1935b' },
  { id:'home-lifestyle', name:'Home & Lifestyle', icon:'Sofa', color:'from-rose-400 to-pink-500', img:'1556228453-efd6c1ff04f6' },
  { id:'watches-bags', name:'Watches, Bags & Jewellery', icon:'Watch', color:'from-yellow-500 to-amber-600', img:'1523275335684-37898b6baf30' },
  { id:'kids-babies', name:'Kids & Babies', icon:'Baby', color:'from-pink-400 to-rose-500', img:'1515488042361-ee00e0ddd4e4' },
];

export const BRANDS = ['Maybelline','Garnier','L\'Oreal','Johnson\'s','Nivea','Neutrogena','Medicube','Aveeno','Clean & Clear','Listerine','Wella','Schwarzkopf','Fresh Street','Bisconni','Knorr','Daffodils','Aero','Haut Notch','Mr. Muscle','Remia','Santan','Glam Gas','West Point','Anex','Redmi','Xiaomi','Samsung','TP-LINK','Joyroom','HOCO','Basix','Indus','Pace Setters','Echou','Warq Notes','Walkeaze','SJ','Avent'];

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

export const PRODUCTS: Product[] = [
  // ---- Health & Beauty ----
  P(1,'Maybelline Superstay Teddy Tint Lip & Cheek Color 5ml','Maybelline','beauty',3650,0,4.5,1,35,'1631214524020-7e01db6533e3',{featured:true,bestSeller:true,description:'Superstay Teddy Tint lip and cheek color, 5ml. Long-lasting vibrant color.'}),
  P(2,'Garnier Vitamin C Booster Serum 15ML','Garnier','beauty',1099,0,4.6,21,60,'1571781926291-c477ebfd024b',{featured:true,trending:true,description:'Bright Complete Vitamin C Booster Serum with Niacinamide. 15ML bottle for radiant skin.'}),
  P(3,'L\'Oreal Hyaluron Expert Night Cream Mask 50ML','L\'Oreal','beauty',4099,0,4.7,43,25,'1612817288484-6f916006738a',{bestSeller:true,description:'Replumping moisturizing night cream mask with Hyaluronic Acid. 50ML for hydrating glass skin.'}),
  P(4,'Garnier Vitamin C Face Wash 100ml','Garnier','beauty',579,0,4.5,2,80,'1556228841-a3cde7ed8d66',{trending:true,description:'Bright Complete Vitamin C Face Wash, 100ml. Cleanse, remove impurities and brighten skin.'}),
  P(5,'Johnson\'s Rose Water Micellar Cleansing Jelly 200ml','Johnson\'s','beauty',1700,0,4.4,85,40,'1596462502278-27bfdc403348',{description:'Fresh Hydration Rose Water Micellar Cleansing Jelly for normal skin, 200ml.'}),
  P(6,'Listerine Total Care Zero Mouth Wash 500ml','Listerine','beauty',1200,0,4.3,55,50,'1585428103455-9b8c6e0f1f8c',{description:'Total Care Zero alcohol mouth wash, 500ml. Complete oral protection.'}),
  P(7,'Aveeno Dermexa Unscented Balm 75ml','Aveeno','beauty',3000,0,4.5,30,18,'1612817288484-6f916006738a',{description:'Fast & long-lasting unscented balm with Citric Acid and Glycerin for dry skin, 75ml.'}),
  P(8,'Clean & Clear Morning Energy Facial Scrub 150g','Clean & Clear','beauty',1500,0,4.2,42,35,'1556228579-7582f4d40f7c',{isNew:true,description:'Skin energising facial scrub for all skin types, 150g. Start your day fresh!'}),
  P(9,'Nivea Men Hydro Care 3X Face Wash 100ml','Nivea','beauty',1800,0,4.4,67,30,'1556228720-195a672e8a03',{description:'3X clean effect face wash with Citric Acid and Aloe Vera for men, 100ml.'}),
  P(10,'Nivea Aloe & Hydration Body Lotion 400ml','Nivea','beauty',2200,0,4.6,95,45,'1571781926291-c477ebfd024b',{trending:true,description:'72H moisture refreshing body lotion with Glycerin for normal to dry skin, 400ml.'}),
  P(11,'Neutrogena Ultra Sheer Sunscreen SPF50 200ml','Neutrogena','beauty',6500,0,4.8,120,12,'1612817288484-6f916006738a',{featured:true,description:'Invisible sunscreen lotion, water resistant SPF50 with Glycerin and Niacinamide, 200ml.'}),
  P(12,'Medicube Zero Pore Cream 2.0 50ml','Medicube','beauty',6300,0,4.5,38,8,'1571781926291-c477ebfd024b',{isNew:true,description:'Zero Pore Cream 2.0 with Hyaluronic Acid for oily & combination skin, 50ml.'}),
  // ---- Grocery & Pet Care ----
  P(13,'Remia Thousand Island Salad Dressing 250ml','Remia','grocery',1030,0,4.3,25,60,'1604724399219-3e0d6e6d0b3d',{description:'Classic Thousand Island salad dressing, 250ml bottle.'}),
  P(14,'Santan Instant Coconut Milk Powder 50g','Santan','grocery',225,0,4.2,15,80,'1604724399219-3e0d6e6d0b3d',{description:'Instant coconut milk powder, 50g. Quick and convenient for cooking.'}),
  P(15,'Mr. Muscle Washroom Cleaner 750ml','Mr. Muscle','grocery',1050,0,4.4,48,55,'1585428103455-9b8c6e0f1f8c',{trending:true,description:'Washroom cleaner with trigger spray, 750ml. Powerful cleaning action.'}),
  P(16,'Bisconni Chai Wala Plain Cake 20g','Bisconni','grocery',20,0,4.0,200,100,'1509365390695-33aee7543016',{bestSeller:true,description:'Chai Wala plain cake, 20g pack. Perfect with tea!'}),
  P(17,'Knorr Italian Creamy Fettuccine Noodles 132g','Knorr','grocery',450,0,4.3,35,70,'1610334295032-1cf6e1c4f4d4',{description:'Italian creamy fettuccine spicy noodles, 132g. Quick meal solution.'}),
  P(18,'Daffodils Space Rocket Jelly Beans 68g','Daffodils','grocery',325,0,4.1,18,90,'1509365390695-33aee7543016',{isNew:true,description:'Space rocket jelly beans candy, 68g. Fun treat for kids.'}),
  P(19,'Fresh Street Himalayan Pink Salt Onion 125g','Fresh Street','grocery',510,0,4.4,28,50,'1604724399219-3e0d6e6d0b3d',{featured:true,description:'Himalayan pink salt with onion flavor, 125g. Premium seasoning.'}),
  P(20,'Fresh Street Himalayan Pink Salt Jar 2.25KG','Fresh Street','grocery',750,0,4.5,22,30,'1604724399219-3e0d6e6d0b3d',{description:'Himalayan pink salt, 2.25KG jar. Bulk value pack.'}),
  P(21,'Aero Mint Assorted Candy Sugar Free 300g','Aero','grocery',925,0,4.2,12,40,'1509365390695-33aee7543016',{description:'Assorted mint candy, sugar free, 300g. Refreshing and guilt-free.'}),
  P(22,'Haut Notch Red Kidney Beans Tin 400g','Haut Notch','grocery',585,0,4.3,8,45,'1610334295032-1cf6e1c4f4d4',{description:'Red kidney beans tin, 400g. Ready to cook premium quality beans.'}),
  // ---- TV & Home Appliances ----
  P(23,'Glam Gas Built In Hob 3 Brass Burner Black','Glam Gas','appliances',43500,0,4.5,12,5,'1556909114-f6e7ad7d3136',{featured:true,description:'Stainless steel auto ignition 3 brass burner built-in hob, natural gas.'}),
  P(24,'Glam Gas Built In Hob Tempered Glass 3 Burner Digital','Glam Gas','appliances',25500,0,4.3,8,7,'1585515320310-8a7f85f1cce0',{description:'Tempered glass auto ignition 3 heatrayz burner built-in hob, digital model.'}),
  P(25,'Glam Gas 6 Function Range Hood 90CM Windy-12','Glam Gas','appliances',73200,0,4.6,5,3,'1556909114-f6e7ad7d3136',{bestSeller:true,description:'Smart smoke sensor, auto clean & voice control chimney range hood, 90CM.'}),
  P(26,'Glam Gas 5 Function Range Hood 90CM Orbit-12','Glam Gas','appliances',70500,0,4.4,7,4,'1556909114-f6e7ad7d3136',{description:'Smart touch, auto clean & voice control kitchen chimney range hood, 90CM.'}),
  P(27,'Glam Gas Multi Function Range Hood 90CM','Glam Gas','appliances',44400,0,4.3,10,6,'1585515320310-8a7f85f1cce0',{description:'Multi function range hood with auto clean kitchen chimney, 90CM.'}),
  P(28,'West Point Deluxe Stand Mixer 500W','West Point','appliances',11500,0,4.5,22,12,'1585515320310-8a7f85f1cce0',{trending:true,description:'Deluxe stand mixer, 500W, 220-240V, 4 liter bowl.'}),
  P(29,'West Point Deluxe Hand Mixer 500W','West Point','appliances',7200,0,4.3,18,15,'1585515320310-8a7f85f1cce0',{description:'Deluxe hand mixer, 500W, 220-240V.'}),
  P(30,'Anex Deluxe Blender & Grinder AG-6139SS','Anex','appliances',16150,0,4.4,15,8,'1585515320310-8a7f85f1cce0',{bestSeller:true,description:'Deluxe blender & grinder, 500W, 1.5 liter jar.'}),
  P(31,'Anex Deluxe Blender & Grinder AG-6138SS','Anex','appliances',14675,0,4.2,12,10,'1585515320310-8a7f85f1cce0',{description:'Deluxe blender & grinder, 500W, 1.5 liter jar.'}),
  P(32,'Glam Gas Built In Hob Single Burner Grey','Glam Gas','appliances',16500,0,4.1,6,8,'1556909114-f6e7ad7d3136',{isNew:true,description:'Tempered glass auto ignition brass single heatrayz burner, natural gas.'}),
  // ---- Phones & Computers ----
  P(33,'Redmi Buds 8 Lite Earbuds ANC White','Redmi','electronics',8500,0,4.5,85,20,'1590650060673-8bef0f2b8e1c',{featured:true,bestSeller:true,trending:true,description:'Redmi Buds 8 Lite earbuds with ANC, 475mAh case battery, IP54 water resistant.'}),
  P(34,'Redmi Buds 8 Active Blue','Redmi','electronics',7600,0,4.4,62,25,'1590650060673-8bef0f2b8e1c',{description:'Redmi Buds 8 Active, 475mAh case battery, IP54 water & dust resistant.'}),
  P(35,'Xiaomi MI Power Bank 22.5W 20000mAh Dark Gray','Xiaomi','electronics',7800,0,4.6,45,30,'1586495985370-3f0b7b4e1c0d',{trending:true,description:'MI power bank with integrated cable, 22.5W, 20000mAh.'}),
  P(36,'Xiaomi MI 67W Power Bank 20000mAh Tan','Xiaomi','electronics',14500,0,4.5,28,12,'1586495985370-3f0b7b4e1c0d',{description:'67W power bank with integrated cable, 20000mAh.'}),
  P(37,'Joyroom PD Fast Charger 30W With Cable','Joyroom','electronics',3325,3500,4.3,15,40,'1586495985370-3f0b7b4e1c0d',{isNew:true,description:'PD fast charger 30W PD + QC 3.0 with 1-meter Type-C cable. 5% OFF!'}),
  P(38,'Samsung A37 Smartphone 8+256GB White','Samsung','electronics',149999,0,4.7,95,4,'1511707171634-5f897ff02aa9',{featured:true,description:'6.7" Super AMOLED display, 8+256GB, 5000mAh battery, IP68.'}),
  P(39,'TP-LINK AX1800 Wi-Fi 6 PCIe Adapter','TP-LINK','electronics',9400,10000,4.4,12,15,'1586495985370-3f0b7b4e1c0d',{description:'AX1800 dual band Wi-Fi 6 Bluetooth 5.2 PCI Express adapter. 6% OFF!'}),
  P(40,'TP-LINK 4G LTE Router 300Mbps','TP-LINK','electronics',15886,16900,4.3,8,10,'1586495985370-3f0b7b4e1c0d',{description:'Wireless N 4G LTE router, 300Mbps, 2 antennas. 6% OFF!'}),
  P(41,'TP-LINK AX3000 Wi-Fi 6 Range Extender','TP-LINK','electronics',24346,25900,4.5,5,6,'1586495985370-3f0b7b4e1c0d',{description:'AX3000 Wi-Fi 6 range extender, 2402 Mbps. 6% OFF!'}),
  P(42,'HOCO Sonar Sports Bluetooth Speaker','HOCO','electronics',4059,0,4.2,20,35,'1586495985370-3f0b7b4e1c0d',{bestSeller:true,description:'Sonar sports Bluetooth speaker, 1200mAh battery, 3 hours playtime.'}),
  // ---- Men's Fashion ----
  P(43,'Basix Men\'s Zipper Mesh 3 Quarter Black & White','Basix','mens-fashion',1900,0,4.3,15,30,'1483985988355-763728e1935b',{featured:true,description:'Men\'s zipper pockets mesh 3 quarter. Black & White.'}),
  P(44,'Indus Men\'s Cotton T-Shirt Sky Blue','Indus','mens-fashion',1250,0,4.4,48,50,'1483985988355-763728e1935b',{bestSeller:true,trending:true,description:'Men\'s cotton t-shirt in sky blue. Comfortable everyday wear.'}),
  P(45,'Basix Men\'s Jacquard Collar Polo Shirt Blue','Basix','mens-fashion',1950,0,4.5,22,25,'1483985988355-763728e1935b',{description:'Textured jacquard collar embroidered logo marine shirt.'}),
  P(46,'Pace Setters Men\'s Cotton Cargo Pants Beige','Pace Setters','mens-fashion',2495,0,4.4,35,40,'1551232864-3f0870fc6ff3',{bestSeller:true,description:'Men\'s cotton cargo pants in beige. Durable and stylish.'}),
  P(47,'Pace Setters Men\'s Dress Pants Light Grey','Pace Setters','mens-fashion',2495,0,4.3,28,35,'1551232864-3f0870fc6ff3',{description:'Men\'s dress pants in light grey, open length. Professional fit.'}),
  P(48,'Pace Setters Blue Fuel Denim Jeans Dark Blue','Pace Setters','mens-fashion',2295,0,4.5,42,30,'1542291026-7eec264c27ff',{trending:true,description:'Blue Fuel denim jeans in dark blue. Premium quality denim.'}),
  P(49,'Pace Setters Blue Fuel Collar Shirt Camel','Pace Setters','mens-fashion',2595,0,4.2,12,20,'1483985988355-763728e1935b',{isNew:true,description:'Blue Fuel collar front open shirt in camel. Smart casual style.'}),
  // ---- Home & Lifestyle ----
  P(50,'Echou Glass Dispenser + Glass + Stand Set 10 Pack','Echou','home-lifestyle',7600,0,4.5,8,10,'1556228453-efd6c1ff04f6',{featured:true,description:'High borosilicate glass dispenser + glass + stand set, 1850ml + 270ml, 10 pack.'}),
  P(51,'Echou Glass Dispenser 2600ml','Echou','home-lifestyle',3000,0,4.3,15,20,'1556228453-efd6c1ff04f6',{description:'High borosilicate glass dispenser, 2600ml.'}),
  P(52,'Warq Notes Cartoon Stationery Box Assorted','Warq Notes','home-lifestyle',370,0,4.1,25,50,'1556228453-efd6c1ff04f6',{bestSeller:true,description:'Cartoon character metallic stationery box, assorted designs.'}),
  P(53,'Warq Notes Avengers Stationery Box Blue','Warq Notes','home-lifestyle',545,0,4.3,18,40,'1556228453-efd6c1ff04f6',{trending:true,description:'Avengers double sided stationery box, blue.'}),
  P(54,'Warq Notes Mini Stapler Set Assorted','Warq Notes','home-lifestyle',385,0,4.0,10,60,'1556228453-efd6c1ff04f6',{description:'Mini stapler set, assorted colors. Perfect for school and office.'}),
  P(55,'Warq Notes Fancy Unicorn Pen Assorted','Warq Notes','home-lifestyle',265,0,4.2,30,80,'1556228453-efd6c1ff04f6',{isNew:true,description:'Fancy unicorn pen, assorted colors. Fun writing accessory.'}),
  P(56,'Warq Notes Study Elegant Diary A5','Warq Notes','home-lifestyle',600,0,4.4,12,35,'1556228453-efd6c1ff04f6',{description:'Study elegant diary, assorted, A5-6000. Premium quality notebook.'}),
  P(57,'Warq Notes Soft Pastel Colors 24-Colors','Warq Notes','home-lifestyle',640,0,4.3,8,45,'1556228453-efd6c1ff04f6',{description:'Keep smiling soft pastel colors, 24-colors.'}),
  P(58,'Warq Notes Yalong Water Color Kit 12-Colors','Warq Notes','home-lifestyle',510,0,4.2,14,40,'1556228453-efd6c1ff04f6',{description:'Yalong water color kit, 12-colors. Great for artists.'}),
  P(59,'Warq Notes Fancy Swan Diary Green','Warq Notes','home-lifestyle',1110,0,4.5,6,15,'1556228453-efd6c1ff04f6',{description:'Fancy swan diary in green. Elegant design with quality pages.'}),
  // ---- Watches, Bags & Jewellery ----
  P(60,'Walkeaze Women\'s Ring Jewelry Golden 004476j','Walkeaze','watches-bags',1828,2150,4.3,12,25,'1523275335684-37898b6baf30',{featured:true,description:'Women\'s ring jewelry in golden, small size. 15% OFF!'}),
  P(61,'Walkeaze Women\'s Ring Jewelry Golden 004471j','Walkeaze','watches-bags',1998,2350,4.4,8,20,'1523275335684-37898b6baf30',{description:'Women\'s ring jewelry in golden, small size. 15% OFF!'}),
  P(62,'Walkeaze Women\'s Bracelet Jewelry Golden 004397J','Walkeaze','watches-bags',3680,4600,4.5,15,12,'1523275335684-37898b6baf30',{bestSeller:true,description:'Women\'s bracelet jewelry in golden. 20% OFF!'}),
  P(63,'Walkeaze Women\'s Bracelet Jewelry Silver 004396J','Walkeaze','watches-bags',3680,4600,4.4,10,15,'1523275335684-37898b6baf30',{description:'Women\'s bracelet jewelry in silver. 20% OFF!'}),
  P(64,'SJ Laptop Office Bag Black PL6661-5','SJ','watches-bags',13990,0,4.5,22,8,'1553062407-98eeb64c6a62',{trending:true,description:'Laptop office bag in black. Professional and stylish.'}),
  P(65,'SJ Laptop Office Bag Brown A930011-5','SJ','watches-bags',15190,0,4.6,18,6,'1553062407-98eeb64c6a62',{description:'Laptop office bag in brown. Premium leather finish.'}),
  P(66,'SJ Women\'s Earring Jewelry Golden Ruby','SJ','watches-bags',2295,0,4.3,14,30,'1523275335684-37898b6baf30',{isNew:true,description:'Women\'s earring jewelry in golden ruby. Elegant design.'}),
  P(67,'SJ Women\'s Earring Jewelry Golden Blue','SJ','watches-bags',2295,0,4.2,10,35,'1523275335684-37898b6baf30',{description:'Women\'s earring jewelry in golden blue. Stunning look.'}),
  // ---- Kids & Babies ----
  P(68,'Johnson\'s Scented Baby Jelly 250ml','Johnson\'s','kids-babies',1300,0,4.6,85,50,'1515488042361-ee00e0ddd4e4',{featured:true,bestSeller:true,description:'Scented baby jelly, 250ml. Gentle care for baby\'s soft skin.'}),
  P(69,'Johnson\'s Baby Top-To-Toe 3-In-1 Wash 500ml','Johnson\'s','kids-babies',1700,0,4.7,120,40,'1515488042361-ee00e0ddd4e4',{trending:true,description:'3-In-1 hair, face and body wash for newborns, 500ml.'}),
  P(70,'Johnson\'s No More Tears Kids Shampoo 300ml','Johnson\'s','kids-babies',1300,0,4.5,65,45,'1515488042361-ee00e0ddd4e4',{description:'No more tears shiny drops kids shampoo with argan oil, 300ml.'}),
  P(71,'Avent Anti Colic Silicone Teat Flow 2 2-Pack','Avent','kids-babies',3680,0,4.6,22,20,'1515488042361-ee00e0ddd4e4',{description:'Anti colic flow 2 silicone teat, BPA free, 1+ months.'}),
  P(72,'Basix Boy\'s Brazil Football Kit FK-103','Basix','kids-babies',2400,0,4.4,18,30,'1503454537195-1dcabb78c2b9',{bestSeller:true,description:'Boy\'s No 10 Brazil football kit. Perfect for young fans!'}),
  P(73,'Basix Girl\'s Sweetheart Nightwear 2 Piece Set','Basix','kids-babies',2500,0,4.5,12,25,'1503454537195-1dcabb78c2b9',{isNew:true,description:'Girl\'s sweetheart short sleeves nightwear 2 piece set.'}),
  P(74,'Warq Notes Elastic Bouncy Ball Small','Warq Notes','kids-babies',190,0,4.0,35,80,'1503454537195-1dcabb78c2b9',{description:'Elastic bouncy ball, small. Fun toy for kids of all ages.'}),
  P(75,'Warq Notes Cute Jeep Clay Dough Blue','Warq Notes','kids-babies',630,0,4.2,15,50,'1503454537195-1dcabb78c2b9',{description:'Cute jeep clay dough in blue. Creative fun for little hands.'}),
  P(76,'Warq Notes Mermaid Slime With Keychain Pink','Warq Notes','kids-babies',770,0,4.3,20,40,'1503454537195-1dcabb78c2b9',{trending:true,description:'Mermaid slime with keychain in pink. Stretchy, fun, and collectible!'}),
  P(77,'Warq Notes Bubble Slime With Free Toy Blue','Warq Notes','kids-babies',515,0,4.1,28,60,'1503454537195-1dcabb78c2b9',{description:'Bubble slime with free toy in blue. Hours of sensory fun!'}),
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

// Pakistani-themed hero slides with vibrant cultural colors
export const HERO_SLIDES: HeroSlide[] = [
  { title:'Eid Mubarak Sale!', sub:'Up to 30% off on Health & Beauty essentials', cta:'Shop Now', route:'#/shop?category=beauty', img:'1596462502278-27bfdc403348', grad:'from-[#006233] to-[#00A651]' },
  { title:'Ramzan Kitchen Deals', sub:'Premium appliances at unbeatable prices', cta:'Shop Appliances', route:'#/shop?category=appliances', img:'1556909114-f6e7ad7d3136', grad:'from-[#004D25] to-[#006233]' },
  { title:'Latest Phones & Gadgets', sub:'Smartphones, earbuds & accessories', cta:'Shop Electronics', route:'#/shop?category=electronics', img:'1511707171634-5f897ff02aa9', grad:'from-[#0C2340] to-[#1A4D8F]' },
  { title:'Bachat ka Vaade!', sub:'Best prices on Fashion, Home & more', cta:'Shop All', route:'#/shop', img:'1483985988355-763728e1935b', grad:'from-[#8B1A1A] to-[#C41E3A]' },
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
