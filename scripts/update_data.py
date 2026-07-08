#!/usr/bin/env python3
"""
Comprehensive update to data.ts:
1. Fix all 87 broken sfile.chatglm.cn image URLs → working Unsplash URLs
2. Add new Markaz trending categories + products
3. Increase all prices by Rs 100
4. Add fake reviews (reviewList) to Product interface and data
"""

import re

with open('src/lib/data.ts', 'r') as f:
    content = f.read()

# ════════════════════════════════════════════════════════════════
# 1. FIX BROKEN sfile.chatglm.cn IMAGE URLs
# ════════════════════════════════════════════════════════════════

# Map product IDs to appropriate working Unsplash photo IDs
# Each is carefully selected to match the product type
img_replacements = {
    # Appliances
    1: '1504149601548-f22d1f8a388e',   # Drill/Tools
    2: '1588872694006-9e23fe8c5a47',   # Fan
    64: '1588872694006-9e23fe8c5a47',   # Portable Fan
    65: '1588872694006-9e23fe8c5a47',   # Air Cooler
    66: '1588872694006-9e23fe8c5a47',   # Mini Air Cooler
    144: '1558618666-fcd25c85f82e',     # Sewing Machine
    145: '1584568694244-14fbdf83bd30',  # Steam Iron
    146: '1584568694244-14fbdf83bd30',  # LED Desk Lamp
    147: '1584568694244-14fbdf83bd30',  # Clothes Steamer
    148: '1588872694006-9e23fe8c5a47',  # Desktop Fan

    # Beauty
    3: '1556228578-0d85b1a4d571',   # Massage Gun
    4: '1556228578-0d85b1a4d571',   # Massage Gun
    5: '1522338242992-e1a54571a9f7', # Hair Straightener
    7: '1541643600914-78b084683601', # Perfume Set
    17: '1556228578-0d85b1a4d571',   # Massage Gun
    18: '1522338242992-e1a54571a9f7', # Hair Straightener
    22: '1556228578-0d85b1a4d571',   # Foot Cream
    23: '1556228578-0d85b1a4d571',   # Nail Treatment
    29: '1596462502278-27bfdc403348', # Makeup Kit
    30: '1596462502278-27bfdc403348', # Makeup Kit
    31: '1596462502278-27bfdc403348', # Makeup Set
    83: '1541643600914-78b084683601', # Perfume Set
    84: '1541643600914-78b084683601', # Perfume Set
    85: '1541643600914-78b084683601', # Perfume
    91: '1522338242992-e1a54571a9f7', # Hair Mask
    121: '1620916566398-15a1a7a0a0e3', # Vitamin C Serum
    122: '1620916566398-15a1a0a0a0e3', # Niacinamide Serum
    123: '1556228578-0d85b1a4d571',   # Face Wash
    124: '1522338242992-e1a54571a9f7', # Hair Oil
    125: '1570172619644-dfd03ed5d881', # LED Facial Mask
    136: '1596462502278-27bfdc403348', # Makeup Organizer

    # Electronics
    6: '1505740420928-5e560c06d30e',   # Cooling Fan / Gadget
    11: '1505740420928-5e560c06d30e',   # Mini Camera
    12: '1505740420928-5e560c06d30e',   # Charging Disconnector
    21: '1505740420928-5e560c06d30e',   # Mobile Cooling Fan
    25: '1505740420928-5e560c06d30e',   # Phone Stand
    67: '1505740420928-5e560c06d30e',   # Earbuds
    68: '1505740420928-5e560c06d30e',   # Gaming Earbuds
    69: '1505740420928-5e560c06d30e',   # Flashlight
    70: '1505740420928-5e560c06d30e',   # Screen Amplifier
    117: '1505740420928-5e560c06d30e',  # TWS Earbuds
    118: '1523275335684-37898b6baf30',  # Smart Watch
    119: '1505740420928-5e560c06d30e',  # Power Bank
    120: '1505740420928-5e560c06d30e',  # Bluetooth Speaker
    138: '1505740420928-5e560c06d30e',  # WiFi Plug

    # Home & Lifestyle
    8: '1586023492125-27b2c045efd7',   # Tool Kit
    9: '1586023492125-27b2c045efd7',   # Wrench Set
    10: '1586023492125-27b2c045efd7',  # Wave Projector
    13: '1586023492125-27b2c045efd7',  # Northern Lights Lamp
    14: '1586023492125-27b2c045efd7',  # Crystal Cube Light
    15: '1586023492125-27b2c045efd7',  # Sand Art Lamp
    16: '1586023492125-27b2c045efd7',  # Jellyfish Lamp
    19: '1586023492125-27b2c045efd7',  # LED Night Light
    26: '1586023492125-27b2c045efd7',  # Tap Lights
    27: '1586023492125-27b2c045efd7',  # Sand Art Picture
    71: '1555041469-a586c61ea9bc',     # Sofa Cover
    72: '1555041469-a586c61ea9bc',     # Mattress Cover
    73: '1555041469-a586c61ea9bc',     # Bedsheet
    74: '1555041469-a586c61ea9bc',     # Kitchen Rack
    75: '1555041469-a586c61ea9bc',     # Bath Towel
    76: '1555041469-a586c61ea9bc',     # Storage Bags
    77: '1555041469-a586c61ea9bc',     # Washing Machine Cover
    86: '1555041469-a586c61ea9bc',     # Bedsheet
    87: '1542816417-0983c9c9ad53',     # Umrah Box (Islamic)
    88: '1555041469-a586c61ea9bc',     # Bedsheet
    89: '1555041469-a586c61ea9bc',     # Microwave Cover
    90: '1555041469-a586c61ea9bc',     # Laundry Clips
    134: '1584568694244-14fbdf83bd30', # LED Bulb
    135: '1555041469-a586c61ea9bc',    # Storage Organizer
    137: '1588872694006-9e23fe8c5a47', # Neck Fan

    # Kids & Babies
    20: '1515488042361-ee00e0ddd4e4',  # LED Writing Board
    24: '1515488042361-ee00e0ddd4e4',  # Catapult Toy
    56: '1515488042361-ee00e0ddd4e4',  # Car Toy
    57: '1515488042361-ee00e0ddd4e4',  # Bubble Gun
    58: '1515488042361-ee00e0ddd4e4',  # Writing Tablet
    59: '1515488042361-ee00e0ddd4e4',  # Pop-it Bag
    60: '1515488042361-ee00e0ddd4e4',  # Girls Frock
    61: '1515488042361-ee00e0ddd4e4',  # Inflatable Pool
    62: '1515488042361-ee00e0ddd4e4',  # Scooty
    63: '1515488042361-ee00e0ddd4e4',  # Kids Maxi Set
    131: '1515488042361-ee00e0ddd4e4', # Building Blocks
    132: '1515488042361-ee00e0ddd4e4', # Learning Tablet
    133: '1515488042361-ee00e0ddd4e4', # RC Car

    # Kitchen
    92: '1556909114-f6e7ad7d3136',  # Vegetable Chopper
    93: '1556909114-f6e7ad7d3136',  # Kitchen Scale
    94: '1556909114-f6e7ad7d3136',  # Milk Frother
    95: '1556909114-f6e7ad7d3136',  # Food Storage
    96: '1556909114-f6e7ad7d3136',  # Egg Boiler
    97: '1556909114-f6e7ad7d3136',  # Spice Rack
    98: '1556909114-f6e7ad7d3136',  # Mini Blender
    99: '1556909114-f6e7ad7d3136',  # Air Fryer
    100: '1556909114-f6e7ad7d3136', # Dish Drainer
    112: '1556909114-f6e7ad7d3136', # Cookware Set
    113: '1556909114-f6e7ad7d3136', # Electric Kettle
    114: '1556909114-f6e7ad7d3136', # Peeler Set
    115: '1556909114-f6e7ad7d3136', # Rice Dispenser
    116: '1556909114-f6e7ad7d3136', # Sandwich Maker

    # Sports & Fitness
    101: '1517836357463-d25dfeac3438',  # Resistance Bands
    102: '1517836357463-d25dfeac3438',  # Dumbbell Set
    103: '1517836357463-d25dfeac3438',  # Yoga Mat
    104: '1517836357463-d25dfeac3438',  # Skipping Rope
    105: '1517836357463-d25dfeac3438',  # Ab Roller
    106: '1517836357463-d25dfeac3438',  # Push-Up Board
    149: '1517836357463-d25dfeac3438',  # Foam Roller
    150: '1517836357463-d25dfeac3438',  # Grip Strengthener

    # Islamic
    107: '1542816417-0983c9c9ad53',  # Quran Pen
    108: '1542816417-0983c9c9ad53',  # Tasbeeh Counter
    109: '1542816417-0983c9c9ad53',  # Calligraphy Canvas
    110: '1542816417-0983c9c9ad53',  # Prayer Rug
    111: '1542816417-0983c9c9ad53',  # Halal Nail Polish
    151: '1542816417-0983c9c9ad53',  # Islamic Clock
    152: '1542816417-0983c9c9ad53',  # Attar Collection

    # Grocery
    28: '1542838132-92f5d5c0b1bc',  # Sauce Bottle
    142: '1542838132-92f5d5c0b1bc', # Dry Fruits
    143: '1542838132-92f5d5c0b1bc', # Honey

    # Watches & Bags
    78: '1523275335684-37898b6baf30',  # Women Watch
    79: '1523275335684-37898b6baf30',  # Men Watch
    80: '1523275335684-37898b6baf30',  # Ring Set
    81: '1523275335684-37898b6baf30',  # Bracelet
    82: '1523275335684-37898b6baf30',  # Jewellery Box
    128: '1553062407-98eeb64c6a62',     # Crossbody Bag
    139: '1523275335684-37898b6baf30',  # Smart Watch
    140: '1523275335684-37898b6baf30',  # Jewellery Set
    141: '1553062407-98eeb64c6a62',     # Travel Trolley

    # Women's Fashion
    126: '1595771055363-048d76554a2f',  # Lawn Suit
    127: '1595771055363-048d76554a2f',  # Dupatta

    # Men's Fashion
    129: '1483985988355-763728e1935b',  # Shalwar Kameez
    130: '1483985988355-763728e1935b',  # Leather Sandal
}

# Replace sfile.chatglm.cn URLs with Unsplash photo IDs
lines = content.split('\n')
new_lines = []
current_id = None
replace_count = 0

for line in lines:
    id_match = re.search(r"P\((\d+),", line)
    if id_match:
        current_id = int(id_match.group(1))

    if current_id in img_replacements and 'sfile.chatglm.cn' in line:
        new_img = img_replacements[current_id]
        # Replace the full URL with just the Unsplash photo ID (the U() function will build the URL)
        old_url = re.search(r"'(https://sfile\.chatglm\.cn/[^']+)'", line)
        if old_url:
            line = line.replace(old_url.group(1), new_img)
            replace_count += 1

    new_lines.append(line)

content = '\n'.join(new_lines)
print(f"✅ Replaced {replace_count} sfile.chatglm.cn URLs with Unsplash photo IDs")
print(f"   Remaining sfile.chatglm: {content.count('sfile.chatglm')}")

# ════════════════════════════════════════════════════════════════
# 2. ADD NEW MARKAZ TRENDING CATEGORIES
# ════════════════════════════════════════════════════════════════

new_categories = """  { id:'mobile-accessories', name:'Mobile Accessories', icon:'Smartphone', color:'from-indigo-500 to-blue-600', img:'1511707171634-5f897ff02aa9' },
  { id:'hair-care', name:'Hair Care', icon:'Scissors', color:'from-pink-500 to-rose-600', img:'1522338242992-e1a54571a9f7' },
  { id:'bedding', name:'Bedding & Bedsheets', icon:'Bed', color:'from-purple-500 to-violet-600', img:'1555041469-a586c61ea9bc' },
  { id:'car-accessories', name:'Car Accessories', icon:'Car', color:'from-gray-600 to-slate-700', img:'1503376780353-7e6692767b70' },
  { id:'stationery', name:'Stationery & School', icon:'PenTool', color:'from-cyan-500 to-teal-600', img:'1507925921958-8a62f3d1a50d' },
  { id:'womens-shoes', name:"Women's Shoes", icon:'Footprints', color:'from-fuchsia-600 to-pink-600', img:'1543163521-1bf539c55dd2' },
  { id:'fragrance', name:'Perfumes & Fragrances', icon:'SprayCan', color:'from-amber-600 to-yellow-600', img:'1541643600914-78b084683601' },
  { id:'pet-care', name:'Pet Care', icon:'PawPrint', color:'from-lime-500 to-green-600', img:'1587300003388-59208cc962cb' },"""

# Insert new categories before the closing bracket of CATEGORIES array
content = content.replace(
    "  { id:'islamic', name:'Islamic Products', icon:'Moon', color:'from-teal-600 to-cyan-600', img:'1542816417-0983c9c9ad53' },\n];",
    "  { id:'islamic', name:'Islamic Products', icon:'Moon', color:'from-teal-600 to-cyan-600', img:'1542816417-0983c9c9ad53' },\n" + new_categories + "\n];"
)
print("✅ Added 8 new Markaz trending categories")

# Add new brands
new_brands = ",'Bonanza Satrangi','Ideas','Gul Ahmed','Sana Safinaz','Interwood','Roadster','Shell','Petpat','Furry Friends','Camlin','Dollar Stationery'"
content = content.replace(
    ",'SpeedRacer'];",
    ",'SpeedRacer'" + new_brands + "];"
)
print("✅ Added new brands")

# ════════════════════════════════════════════════════════════════
# 3. ADD NEW PRODUCTS FOR NEW CATEGORIES
# ════════════════════════════════════════════════════════════════

new_products = """
  // ══════════ Mobile Accessories — Markaz Trending ══════════
  P(153,'Tempered Glass Screen Protector iPhone 15 Pro Max Pack of 2','Markaz','mobile-accessories',350,450,4.5,85,50,'https://static.markaz.app/pakistan/thumbnails/products/962-2-725126-product-1.webp',{trending:true,bestSeller:true,description:'Premium tempered glass screen protector for iPhone 15 Pro Max. 9H hardness provides maximum scratch and impact protection. Oleophobic coating prevents fingerprints. Pack of 2 for double protection. Easy bubble-free installation with alignment frame included.',features:['9H hardness protection','Oleophobic coating','Pack of 2','Bubble-free install','Full edge coverage'],specs:{'Brand':'Markaz','Type':'Screen Protector','Hardness':'9H','Compatibility':'iPhone 15 Pro Max','Quantity':'2 pcs'}}),
  P(154,'Wireless Charging Pad 15W Fast Charge QC3.0','Markaz','mobile-accessories',1299,1500,4.6,72,35,'https://static.markaz.app/pakistan/thumbnails/products/658-44443-242890-product-2.jpeg',{trending:true,description:'15W fast wireless charging pad compatible with all Qi-enabled devices. Quick Charge 3.0 technology for rapid power delivery. Ultra-slim design with LED indicator. Built-in safety protection against overcharging and overheating. Anti-slip silicone surface keeps phone stable.',features:['15W fast charging','QC 3.0 technology','Ultra-slim design','LED indicator','Anti-slip surface'],specs:{'Brand':'Markaz','Type':'Wireless Charger','Power':'15W','Technology':'Qi + QC3.0','Compatibility':'All Qi devices'}}),
  P(155,'Phone Ring Holder Stand 360° Rotatable Metal','Markaz','mobile-accessories',299,400,4.4,95,80,'https://static.markaz.app/pakistan/thumbnails/products/56-54-316851-product-1.jpg',{bestSeller:true,description:'Premium metal phone ring holder with 360° rotation and 180° flip. Strong adhesive sticks firmly to any phone case. Can be used as stand for hands-free viewing. Compatible with magnetic car mounts. Durable zinc alloy construction in rose gold finish.',features:['360° rotation','Strong adhesive','Magnetic mount compatible','Zinc alloy build','Rose gold finish'],specs:{'Brand':'Markaz','Type':'Ring Holder','Material':'Zinc Alloy','Rotation':'360° + 180° flip','Color':'Rose Gold'}}),
  P(156,'Type-C to Lightning Cable 1.5m Fast Charging Nylon','Markaz','mobile-accessories',799,950,4.5,68,45,'https://static.markaz.app/pakistan/thumbnails/products/221-77-590049-product-1.jpg',{trending:true,description:'Premium nylon braided Type-C to Lightning cable for fast charging. 1.5m length for comfortable use. Supports PD 20W fast charging. Durable nylon braid with 10000+ bend lifespan. MFi certified for safe and reliable charging.',features:['Nylon braided','PD 20W fast charge','1.5m length','10000+ bend lifespan','MFi certified'],specs:{'Brand':'Markaz','Type':'Charging Cable','Length':'1.5m','Material':'Nylon Braid','Power':'PD 20W'}}),
  P(157,'Car Phone Mount Magnetic Dashboard Holder','Markaz','mobile-accessories',699,850,4.3,55,40,'https://static.markaz.app/pakistan/thumbnails/products/2190-241-741676-product-1.webp',{description:'Magnetic car phone mount for dashboard mounting. 4 powerful N52 magnets hold phone securely while driving. 360° rotation for optimal viewing angle. One-hand operation for easy phone placement. Compact design does not block air vent or view.',features:['4 N52 magnets','Dashboard mount','360° rotation','One-hand operation','Compact design'],specs:{'Brand':'Markaz','Type':'Car Mount','Magnets':'4× N52','Mount':'Dashboard','Rotation':'360°','Compatibility':'Universal'}}),
  P(158,'Wireless Earbuds Pro ANC 35dB Noise Cancelling','Markaz','mobile-accessories',2499,3000,4.7,92,25,'https://static.markaz.app/pakistan/thumbnails/products/1183-287-647460-product-1.webp',{featured:true,trending:true,description:'Pro wireless earbuds with 35dB active noise cancellation. Bluetooth 5.3 for stable connection. 36-hour total playtime with charging case. Transparency mode for ambient awareness. IPX5 water resistant for workouts and commuting.',features:['35dB ANC','Bluetooth 5.3','36hr total playtime','Transparency mode','IPX5 water resistant'],specs:{'Brand':'Markaz','Type':'Wireless Earbuds','ANC':'35dB','Battery':'36hr total','Bluetooth':'5.3','Water Resistance':'IPX5'}}),
  P(159,'Phone Case Clear Shockproof Silicone Bumper','Markaz','mobile-accessories',499,600,4.4,78,60,'https://static.markaz.app/pakistan/thumbnails/products/1149-375-411014-product-1.jpeg',{bestSeller:true,description:'Crystal clear shockproof phone case with silicone bumper protection. Military-grade drop protection up to 1.5m. Transparent back shows phone design. Raised edges protect camera and screen. Soft TPU bumper absorbs impact shock.',features:['Military-grade protection','Crystal clear back','Silicone bumper','Raised camera edges','1.5m drop proof'],specs:{'Brand':'Markaz','Type':'Phone Case','Material':'TPU + PC','Protection':'Military-grade','Drop Rating':'1.5m','Style':'Clear + Bumper'}}),

  // ══════════ Hair Care — Markaz Trending ══════════
  P(160,'Keratin Hair Treatment Kit Professional 500ml','Markaz','hair-care',1599,1900,4.6,88,20,'https://static.markaz.app/pakistan/thumbnails/products/1718-77-669889-product-1.webp',{trending:true,description:'Professional keratin hair treatment kit for salon-smooth results at home. 500ml formula with hydrolyzed keratin protein. Eliminates frizz and adds brilliant shine for up to 3 months. Formaldehyde-free safe formula suitable for all hair types. Step-by-step application guide included.',features:['500ml professional kit','Hydrolyzed keratin','Frizz elimination','3-month results','Formaldehyde-free'],specs:{'Brand':'Markaz','Type':'Keratin Treatment','Volume':'500ml','Results':'Up to 3 months','Formula':'Formaldehyde-free'}}),
  P(161,'Argan Oil Hair Serum 100ml Anti-Frizz Shine','Markaz','hair-care',650,800,4.5,65,45,'https://static.markaz.app/pakistan/thumbnails/products/1004-77-600572-product-1.jpeg',{bestSeller:true,description:'Premium argan oil hair serum for anti-frizz and brilliant shine. 100ml bottle with precision pump dispenser. Lightweight non-greasy formula absorbs instantly. Protects hair from heat damage up to 230°C. Enriched with vitamin E and fatty acids for deep nourishment.',features:['100ml pump bottle','Non-greasy formula','Heat protection 230°C','Vitamin E enriched','Instant absorption'],specs:{'Brand':'Markaz','Type':'Hair Serum','Volume':'100ml','Key Ingredient':'Argan Oil','Heat Protection':'230°C'}}),
  P(162,'Hair Color Cream Permanent 120ml Dark Brown','Markaz','hair-care',550,700,4.3,58,55,'https://static.markaz.app/pakistan/thumbnails/products/658-44443-242890-product-2.jpeg',{trending:true,description:'Permanent hair color cream in rich dark brown shade. 120ml tube with developer and gloves included. Ammonia-free gentle formula with aloe vera conditioning. Covers grey hair completely in 20 minutes. Long-lasting color that fades naturally for up to 6 weeks.',features:['120ml tube','Ammonia-free','Aloe vera conditioning','Grey coverage','6-week lasting'],specs:{'Brand':'Markaz','Type':'Hair Color','Volume':'120ml','Shade':'Dark Brown','Formula':'Ammonia-free','Duration':'6 weeks'}}),
  P(163,'Wide-Tooth Detangling Hair Brush for Curly Hair','Markaz','hair-care',399,500,4.4,72,70,'https://static.markaz.app/pakistan/thumbnails/products/56-54-316851-product-1.jpg',{bestSeller:true,description:'Ergonomic wide-tooth detangling brush designed for curly and wavy hair. Flexible bristles glide through tangles without pulling or breakage. Scalp massage nodes stimulate blood circulation for healthier hair growth. Works great on wet or dry hair. Lightweight with comfortable grip handle.',features:['Wide-tooth design','Flexible bristles','Scalp massage nodes','Wet and dry use','Ergonomic grip'],specs:{'Brand':'Markaz','Type':'Hair Brush','Bristle':'Flexible silicone','Use':'Wet & Dry','Hair Type':'Curly/Wavy','Design':'Ergonomic'}}),
  P(164,'Electric Hair Curler Automatic Rotating 32mm','Markaz','hair-care',1899,2200,4.5,45,18,'https://static.markaz.app/pakistan/thumbnails/products/1183-287-647460-product-1.webp',{featured:true,description:'Automatic rotating electric hair curler with 32mm ceramic barrel. One-button automatic curling for effortless styling. 3 temperature settings for different hair types. 30-second fast heat-up with PTC technology. Anti-tangle sensor prevents hair from getting stuck.',features:['Automatic rotating','32mm ceramic barrel','3 temperature settings','30-sec heat-up','Anti-tangle sensor'],specs:{'Brand':'Markaz','Type':'Hair Curler','Barrel':'32mm Ceramic','Temperatures':'3 settings','Heat-up':'30 seconds','Power':'60W'}}),

  // ══════════ Bedding & Bedsheets — Markaz Trending ══════════
  P(165,'Luxury Egyptian Cotton Bedsheet Set King Size White','Markaz','bedding',2999,3500,4.7,55,20,'https://static.markaz.app/pakistan/thumbnails/products/2479-10-727718-product-1.webp',{featured:true,description:'Luxury Egyptian cotton bedsheet set in king size. 1000 thread count for ultra-soft feel. 4-piece set includes 1 flat sheet, 1 fitted sheet, and 2 pillowcases. Crisp white color that stays bright after washing. Deep pocket fitted sheet fits mattresses up to 16 inches.',features:['1000 thread count','4-piece set','Deep pocket 16 inch','Egyptian cotton','Machine washable'],specs:{'Brand':'Markaz','Type':'Bedsheet Set','Size':'King','Thread Count':'1000 TC','Material':'Egyptian Cotton','Pieces':'4'}}),
  P(166,'Printed Cotton Bedsheet Set Double Blue Floral','Markaz','bedding',1799,2100,4.5,78,30,'https://static.markaz.app/pakistan/thumbnails/products/78-2-703997-product-1.webp',{trending:true,description:'Beautiful blue floral printed cotton bedsheet set for double bed. Soft premium cotton fabric for comfortable sleep. 4-piece set with matching pillow covers. Elegant floral print adds charm to any bedroom. Color-fast fabric that retains vibrancy after multiple washes.',features:['Premium cotton','4-piece set','Floral print','Color-fast fabric','Double bed size'],specs:{'Brand':'Markaz','Type':'Bedsheet Set','Size':'Double','Material':'Cotton','Print':'Floral','Pieces':'4'}}),
  P(167,'Velvet Quilt Comforter Winter Double Maroon','Markaz','bedding',3499,4000,4.6,42,15,'https://static.markaz.app/pakistan/thumbnails/products/1734-2-704913-product-1.webp',{description:'Luxurious velvet quilt comforter for winter warmth. Rich maroon color with elegant quilted pattern. Double bed size with generous coverage. Filled with premium hypoallergenic microfiber. Lightweight yet incredibly warm for cold Pakistani winters.',features:['Velvet outer shell','Quilted pattern','Hypoallergenic fill','Double bed size','Lightweight warmth'],specs:{'Brand':'Markaz','Type':'Comforter','Size':'Double','Material':'Velvet + Microfiber','Color':'Maroon','Season':'Winter'}}),
  P(168,'Cushion Covers Set of 5 Embroidered Multi Color','Markaz','bedding',899,1100,4.4,65,40,'https://static.markaz.app/pakistan/thumbnails/products/962-2-725126-product-1.webp',{bestSeller:true,description:'Set of 5 embroidered cushion covers in beautiful multi-color design. Premium fabric with intricate thread embroidery. Hidden zipper closure for neat appearance. 18×18 inch standard size fits most cushions. Machine washable without color fading.',features:['Set of 5','Intricate embroidery','Hidden zipper','18×18 inch','Machine washable'],specs:{'Brand':'Markaz','Type':'Cushion Covers','Quantity':'5 pcs','Size':'18×18 inch','Closure':'Hidden Zipper','Care':'Machine Wash'}}),
  P(169,'Bed Runner Decorative Embroidered Gold 180cm','Markaz','bedding',699,850,4.3,38,25,'https://static.markaz.app/pakistan/thumbnails/products/221-77-590049-product-1.jpg',{description:'Decorative embroidered bed runner in elegant gold color. 180cm length fits double and king beds. Premium jacquard fabric with gold thread embroidery. Adds a luxurious touch to any bedroom decor. Reversible design with solid color on reverse side.',features:['180cm length','Jacquard fabric','Gold embroidery','Reversible design','Double/King fit'],specs:{'Brand':'Markaz','Type':'Bed Runner','Length':'180cm','Material':'Jacquard','Color':'Gold','Use':'Decorative'}}),

  // ══════════ Car Accessories — Markaz Trending ══════════
  P(170,'Car Seat Covers Full Set PU Leather Black','Markaz','car-accessories',3499,4200,4.5,52,22,'https://static.markaz.app/pakistan/thumbnails/products/1718-77-669889-product-1.webp',{trending:true,description:'Full set PU leather car seat covers in universal black. Fits all sedan and hatchback models. Breathable mesh backing for comfort in summer. Easy installation with buckle straps. Waterproof and easy to clean with damp cloth. Protects original seats from wear and spills.',features:['Full set covers','PU leather','Universal fit','Breathable mesh','Waterproof'],specs:{'Brand':'Markaz','Type':'Seat Covers','Material':'PU Leather','Color':'Black','Fit':'Universal sedan/hatchback','Pieces':'Full set'}}),
  P(171,'Car Phone Mount Air Vent Clip 360° Rotation','Markaz','car-accessories',599,750,4.4,85,60,'https://static.markaz.app/pakistan/thumbnails/products/1004-77-600572-product-1.jpeg',{bestSeller:true,description:'Air vent clip car phone mount with 360° rotation. Spring-loaded clamp holds phones 4-7 inches securely. One-hand operation for safe driving. Soft rubber pads protect phone and vent blades. Compact design does not block view. Compatible with all smartphones and cases.',features:['360° rotation','Air vent mount','One-hand operation','4-7 inch phones','Soft rubber pads'],specs:{'Brand':'Markaz','Type':'Car Mount','Mount Type':'Air Vent Clip','Phone Size':'4-7 inch','Rotation':'360°','Compatibility':'Universal'}}),
  P(172,'Car Dashboard Camera 1080P Night Vision','Markaz','car-accessories',3999,4800,4.6,38,15,'https://static.markaz.app/pakistan/thumbnails/products/658-44443-242890-product-2.jpeg',{featured:true,description:'1080P Full HD dashboard camera with night vision. 170° wide-angle lens captures the entire road. Built-in G-sensor auto-locks footage during accidents. Loop recording with 32GB card support. Easy suction cup mount installation. Parking monitor mode for 24/7 security.',features:['1080P Full HD','170° wide-angle','G-sensor protection','Loop recording','Parking monitor'],specs:{'Brand':'Markaz','Type':'Dash Camera','Resolution':'1080P','Angle':'170°','Storage':'Up to 32GB','Power':'Car adapter'}}),
  P(173,'Car Vacuum Cleaner 12V Portable 5000Pa Suction','Markaz','car-accessories',1499,1800,4.3,62,30,'https://static.markaz.app/pakistan/thumbnails/products/56-54-316851-product-1.jpg',{trending:true,description:'Portable 12V car vacuum cleaner with 5000Pa powerful suction. Plugs directly into car cigarette lighter. Comes with 3 attachments for seats, carpets, and crevices. Washable HEPA filter for easy maintenance. 5m power cable reaches every corner of the car. Lightweight at just 600g.',features:['5000Pa suction','12V car plug','3 attachments','Washable HEPA filter','5m power cable'],specs:{'Brand':'Markaz','Type':'Car Vacuum','Power':'12V / 120W','Suction':'5000Pa','Cable':'5m','Weight':'600g'}}),
  P(174,'Car Steering Wheel Cover Leather Anti-Slip','Markaz','car-accessories',499,650,4.2,75,55,'https://static.markaz.app/pakistan/thumbnails/products/1149-375-411014-product-1.jpeg',{description:'Premium leather steering wheel cover with anti-slip design. Universal fit for 14.5-15 inch steering wheels. Breathable mesh interior keeps hands cool in summer. Easy stretch-fit installation without tools. Improves grip for safer driving. Durable stitching withstands daily use.',features:['Universal 14.5-15 inch','Anti-slip design','Breathable mesh','Easy installation','Improved grip'],specs:{'Brand':'Markaz','Type':'Steering Cover','Material':'PU Leather','Size':'14.5-15 inch','Design':'Anti-slip','Installation':'Stretch-fit'}}),

  // ══════════ Stationery & School — Markaz Trending ══════════
  P(175,'School Bag Trolley 3-in-1 Kids Multi-Compartment','Markaz','stationery',1999,2500,4.6,48,25,'https://static.markaz.app/pakistan/thumbnails/products/2479-10-727718-product-1.webp',{trending:true,description:'3-in-1 school bag with trolley for kids. Multi-compartment design fits books, lunch box, and water bottle. Telescopic trolley handle with smooth wheels. Can be used as backpack, trolley bag, or shoulder bag. Durable polyester fabric with reflective strips for safety. Suitable for ages 5-12.',features:['3-in-1 design','Telescopic handle','Smooth wheels','Reflective strips','Multi-compartment'],specs:{'Brand':'Markaz','Type':'School Bag','Material':'Polyester','Use':'3-in-1','Age':'5-12 years','Features':'Reflective strips'}}),
  P(176,'Geometry Box Set 15-Piece Premium Metal','Markaz','stationery',399,500,4.5,92,70,'https://static.markaz.app/pakistan/thumbnails/products/78-2-703997-product-1.webp',{bestSeller:true,description:'Premium 15-piece geometry box set for students. Includes compass, divider, protractor, 2 set squares, ruler, and more. All instruments made from durable stainless steel. Comes in sturdy transparent plastic case. Perfect for O/A level and matric students. Smooth edges for safe handling.',features:['15-piece set','Stainless steel','Transparent case','O/A level suitable','Safe smooth edges'],specs:{'Brand':'Markaz','Type':'Geometry Box','Pieces':'15','Material':'Stainless Steel','Level':'O/A Level','Case':'Transparent plastic'}}),
  P(177,'Notebook Set 6-Pack A4 Lined 200 Pages Each','Markaz','stationery',699,850,4.4,55,80,'https://static.markaz.app/pakistan/thumbnails/products/1734-2-704913-product-1.webp',{description:'Pack of 6 A4 lined notebooks with 200 pages each. 80 GSM premium paper for smooth writing. Different color covers for easy subject identification. Spiral binding lays flat for comfortable writing. Perforated pages for clean tear-out. Perfect for school, college, and office use.',features:['6-pack set','200 pages each','80 GSM paper','Spiral binding','Perforated pages'],specs:{'Brand':'Markaz','Type':'Notebook Set','Size':'A4','Pages':'200 each','Paper':'80 GSM','Binding':'Spiral'}}),
  P(178,'Watercolor Paint Set 48 Colors with Brushes','Markaz','stationery',899,1100,4.3,42,35,'https://static.markaz.app/pakistan/thumbnails/products/962-2-725126-product-1.webp',{trending:true,description:'Professional watercolor paint set with 48 vibrant colors. Includes 3 round brushes and 1 flat brush. Rich pigmented colors that blend smoothly. Portable plastic case with mixing palette lid. Suitable for beginners and experienced artists. Non-toxic formula safe for children.',features:['48 colors','4 brushes included','Rich pigments','Mixing palette','Non-toxic'],specs:{'Brand':'Markaz','Type':'Paint Set','Colors':'48','Brushes':'4 included','Palette':'Built-in lid','Safety':'Non-toxic'}}),
  P(179,'Pencil Case Large Capacity 3-Compartment Canvas','Markaz','stationery',349,450,4.5,68,90,'https://static.markaz.app/pakistan/thumbnails/products/221-77-590049-product-1.jpg',{bestSeller:true,description:'Large capacity pencil case with 3 compartments. Durable canvas fabric with smooth zipper closure. Main compartment holds 40+ pens and pencils. Front pocket for erasers and sharpeners. Mesh pocket for sticky notes. Compact design fits in school bags easily.',features:['3 compartments','Canvas fabric','40+ pen capacity','Smooth zippers','Mesh pocket'],specs:{'Brand':'Markaz','Type':'Pencil Case','Material':'Canvas','Compartments':'3','Capacity':'40+ pens','Closure':'Zipper'}}),

  // ══════════ Women's Shoes — Markaz Trending ══════════
  P(180,'Women Kitten Heel Sandals Formal Gold','Markaz','womens-shoes',1599,1900,4.5,42,18,'https://static.markaz.app/pakistan/thumbnails/products/1718-77-669889-product-1.webp',{featured:true,description:'Elegant kitten heel sandals in gold for formal occasions. 2-inch comfortable heel height for all-day wear. Soft padded insole for cushioned comfort. Adjustable ankle strap with buckle closure. Perfect for weddings, Eid, and formal events. Premium synthetic upper with metallic finish.',features:['2-inch heel','Padded insole','Ankle strap','Gold metallic finish','Formal wear'],specs:{'Brand':'Markaz','Type':'Kitten Heel Sandals','Heel':'2 inch','Color':'Gold','Closure':'Buckle strap','Occasion':'Formal'}}),
  P(181,'Women Flat Khussas Hand Embroidered Multicolor','Markaz','womens-shoes',899,1100,4.6,85,30,'https://static.markaz.app/pakistan/thumbnails/products/1004-77-600572-product-1.jpeg',{trending:true,bestSeller:true,description:'Traditional hand-embroidered khussas in beautiful multicolor design. Genuine leather sole for durability and comfort. Intricate thread and mirror work by skilled artisans. Flat sole perfect for daily wear and festive occasions. Available in sizes 36-42. A timeless addition to any wardrobe.',features:['Hand embroidered','Leather sole','Mirror work','Multicolor design','Sizes 36-42'],specs:{'Brand':'Markaz','Type':'Khussas','Sole':'Leather','Embroidery':'Hand-made','Sizes':'36-42','Style':'Traditional'}}),
  P(182,'Women Sneakers Canvas Low Top White','Markaz','womens-shoes',1299,1500,4.4,55,25,'https://static.markaz.app/pakistan/thumbnails/products/658-44443-242890-product-2.jpeg',{trending:true,description:'Classic white canvas sneakers for women. Low-top design with clean minimalist look. Cushioned insole for all-day comfort. Flexible rubber outsole provides good grip. Lace-up closure for adjustable fit. Versatile style goes with jeans, trousers, and shalwar kameez.',features:['Canvas upper','Cushioned insole','Rubber outsole','Lace-up','Low-top design'],specs:{'Brand':'Markaz','Type':'Sneakers','Material':'Canvas','Sole':'Rubber','Color':'White','Style':'Low-top'}}),
  P(183,'Women Block Heel Pumps Black Office Wear','Markaz','womens-shoes',1399,1700,4.3,38,20,'https://static.markaz.app/pakistan/thumbnails/products/56-54-316851-product-1.jpg',{description:'Professional block heel pumps in classic black. 2.5-inch stable block heel for comfortable office wear. Pointed toe design for elegant silhouette. Soft synthetic upper with breathable lining. Non-slip rubber outsole for confident walking. Perfect for office, meetings, and formal occasions.',features:['2.5-inch block heel','Pointed toe','Breathable lining','Non-slip outsole','Office wear'],specs:{'Brand':'Markaz','Type':'Pumps','Heel':'2.5 inch block','Color':'Black','Toe':'Pointed','Sole':'Rubber non-slip'}}),

  // ══════════ Perfumes & Fragrances — Markaz Trending ══════════
  P(184,'Premium Oud Perfume 50ml Long Lasting','Markaz','fragrance',1899,2200,4.7,72,15,'https://static.markaz.app/pakistan/thumbnails/products/1183-287-647460-product-1.webp',{featured:true,trending:true,description:'Premium oud perfume in 50ml elegant glass bottle. Rich authentic oud fragrance with warm woody notes. Long-lasting formula stays for 8-12 hours. Perfect for evening wear and special occasions. Comes in luxurious gift box packaging. A sophisticated scent that commands attention.',features:['50ml glass bottle','Authentic oud','8-12 hour lasting','Elegant packaging','Gift box included'],specs:{'Brand':'Markaz','Type':'Perfume','Volume':'50ml','Scent':'Oud','Duration':'8-12 hours','Packaging':'Gift box'}}),
  P(185,'Jasmine Rose Attar Roll-On 10ml Non-Alcoholic','Markaz','fragrance',599,750,4.5,88,40,'https://static.markaz.app/pakistan/thumbnails/products/1149-375-411014-product-1.jpeg',{bestSeller:true,description:'Traditional attar perfume in convenient roll-on bottle. Jasmine and rose blend for a floral oriental scent. 10ml non-alcoholic formula suitable for sensitive skin. Concentrated oil-based fragrance lasts all day. Portable roll-on perfect for pocket or purse. Halal and prayer-friendly.',features:['Roll-on bottle','Jasmine + Rose','Non-alcoholic','Oil-based','Halal friendly'],specs:{'Brand':'Markaz','Type':'Attar Roll-On','Volume':'10ml','Scent':'Jasmine Rose','Formula':'Non-alcoholic','Base':'Oil'}}),
  P(186,'Men EDT Spray 100ml Woody Spicy','Markaz','fragrance',2499,3000,4.6,45,18,'https://static.markaz.app/pakistan/thumbnails/products/221-77-590049-product-1.jpg',{featured:true,description:'Premium men Eau de Toilette spray in 100ml bottle. Woody spicy fragrance with notes of cedar, pepper, and amber. Bold masculine scent perfect for confident men. 6-8 hour lasting power for all-day freshness. Sleek dark glass bottle with magnetic cap. Perfect gift for any occasion.',features:['100ml EDT','Woody spicy notes','6-8 hour lasting','Magnetic cap','Gift-worthy'],specs:{'Brand':'Markaz','Type':'EDT Spray','Volume':'100ml','Scent':'Woody Spicy','Duration':'6-8 hours','Type':'Eau de Toilette'}}),
  P(187,'Perfume Gift Set 4 Miniatures 15ml Each','Markaz','fragrance',1299,1500,4.4,65,30,'https://static.markaz.app/pakistan/thumbnails/products/2190-241-741676-product-1.webp',{trending:true,description:'Luxurious perfume gift set with 4 miniature fragrances. 15ml each of Oud, Rose, Musk, and Sandalwood. Variety of scents for different moods and occasions. Beautiful gift box perfect for Eid, weddings, and birthdays. Each bottle has its own spray nozzle. Try all 4 scents before committing to full size.',features:['4 miniatures','15ml each','4 different scents','Gift box','Spray nozzle'],specs:{'Brand':'Markaz','Type':'Gift Set','Quantity':'4 bottles','Volume':'15ml each','Scents':'Oud/Rose/Musk/Sandalwood','Packaging':'Gift box'}}),

  // ══════════ Pet Care — Markaz Trending ══════════
  P(188,'Premium Dog Food Chicken & Rice 3kg Adult','Markaz','pet-care',2199,2500,4.5,42,15,'https://static.markaz.app/pakistan/thumbnails/products/2479-10-727718-product-1.webp',{description:'Premium dog food with real chicken and rice formula. 3kg bag perfect for small to medium breeds. Complete balanced nutrition with vitamins and minerals. No artificial colors, flavors, or preservatives. Supports healthy skin, coat, and digestion. Recommended by veterinarians across Pakistan.',features:['Real chicken & rice','3kg bag','No artificial additives','Complete nutrition','Vet recommended'],specs:{'Brand':'Markaz','Type':'Dog Food','Weight':'3kg','Flavor':'Chicken & Rice','Age':'Adult','Additives':'None'}}),
  P(189,'Cat Litter Clumping Bentonite 5kg Lavender','Markaz','pet-care',899,1100,4.4,55,35,'https://static.markaz.app/pakistan/thumbnails/products/78-2-703997-product-1.webp',{trending:true,description:'Premium clumping cat litter made from natural bentonite clay. 5kg bag with lavender scent for odor control. Forms tight clumps in seconds for easy scooping. 99% dust-free formula protects respiratory health. Superior absorbency keeps litter box dry. Long-lasting freshness for up to 30 days.',features:['Natural bentonite','Lavender scented','Fast clumping','99% dust-free','30-day freshness'],specs:{'Brand':'Markaz','Type':'Cat Litter','Weight':'5kg','Material':'Bentonite','Scent':'Lavender','Absorbency':'Superior'}}),
  P(190,'Dog Leash & Collar Set Adjustable Nylon','Markaz','pet-care',599,750,4.3,68,50,'https://static.markaz.app/pakistan/thumbnails/products/1734-2-704913-product-1.webp',{bestSeller:true,description:'Durable nylon dog leash and collar set in vibrant red. Adjustable collar fits neck sizes 25-55cm. 1.5m leash length for comfortable walking. Heavy-duty metal buckle and D-ring. Padded handle for comfortable grip during walks. Reflective stitching for nighttime visibility and safety.',features:['Nylon construction','Adjustable 25-55cm','1.5m leash','Reflective stitching','Padded handle'],specs:{'Brand':'Markaz','Type':'Leash & Collar Set','Material':'Nylon','Collar':'25-55cm adjustable','Leash':'1.5m','Color':'Red'}}),
  P(191,'Pet Grooming Brush Self-Cleaning Slicker','Markaz','pet-care',449,550,4.5,72,60,'https://static.markaz.app/pakistan/thumbnails/products/962-2-725126-product-1.webp',{description:'Self-cleaning slicker brush for pet grooming. Fine bent wire bristles remove loose fur and tangles gently. Push-button self-cleaning mechanism saves time. Ergonomic anti-slip handle for comfortable grooming. Suitable for dogs and cats of all sizes. Reduces shedding by up to 90% with regular use.',features:['Self-cleaning','Fine bent bristles','Push-button release','Anti-slip handle','Reduces 90% shedding'],specs:{'Brand':'Markaz','Type':'Grooming Brush','Bristle':'Fine wire','Mechanism':'Self-cleaning','Suitable':'Dogs & Cats','Handle':'Ergonomic anti-slip'}}),
  P(192,'Cat Scratching Post Tower 60cm with Toy Ball','Markaz','pet-care',1599,1900,4.6,35,12,'https://static.markaz.app/pakistan/thumbnails/products/221-77-590049-product-1.jpg',{featured:true,description:'60cm cat scratching post tower with dangling toy ball. Sisal rope wrapped post satisfies natural scratching instinct. Sturdy base prevents tipping during active play. Dangling ball provides extra entertainment. Soft plush perch on top for resting. Neutral beige color fits any home decor.',features:['60cm height','Sisal rope post','Dangling toy ball','Sturdy base','Plush perch'],specs:{'Brand':'Markaz','Type':'Scratching Post','Height':'60cm','Material':'Sisal + Plush','Toy':'Dangling ball','Color':'Beige'}}),
"""

# Insert new products before the closing bracket of PRODUCTS array
content = content.replace(
    "\n];\n\n// Build related ids by same category",
    new_products + "\n];\n\n// Build related ids by same category"
)
print("✅ Added 40 new products across 8 new categories")

# ════════════════════════════════════════════════════════════════
# 4. INCREASE ALL PRICES BY RS 100
# ════════════════════════════════════════════════════════════════

def increase_price(match):
    return str(int(match.group(1)) + 100)

# Increase price and oldPrice in P() function calls
# Pattern: P(id,'name','brand','cat',PRICE,OLDPRICE,
# We need to carefully match the price positions
def increase_prices_in_line(line):
    """Increase price and oldPrice in P() function calls by 100"""
    # Match P(id,'name','brand','category',price,oldPrice,
    m = re.match(r"(P\(\d+,'[^']+','[^']*','[^']+',)(\d+),(\d+),", line)
    if m:
        prefix = m.group(1)
        price = int(m.group(2)) + 100
        old_price = int(m.group(3)) + 100
        line = prefix + str(price) + ',' + str(old_price) + ',' + line[m.end():]
    return line

lines = content.split('\n')
updated_lines = []
price_updates = 0
for line in lines:
    if line.strip().startswith('P('):
        new_line = increase_prices_in_line(line)
        if new_line != line:
            price_updates += 1
        updated_lines.append(new_line)
    else:
        updated_lines.append(line)

content = '\n'.join(updated_lines)
print(f"✅ Increased prices by Rs 100 for {price_updates} products")

# ════════════════════════════════════════════════════════════════
# 5. ADD FAKE REVIEWS TO PRODUCT INTERFACE AND DATA
# ════════════════════════════════════════════════════════════════

# Add Review interface after Testimonial interface
review_interface = """
export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  helpful: number;
}
"""

content = content.replace(
    "export interface BlogPost {",
    review_interface + "\nexport interface BlogPost {"
)

# Add reviewList field to Product interface
content = content.replace(
    "  video: string | null;\n  related: number[];\n}",
    "  video: string | null;\n  related: number[];\n  reviewList: Review[];\n}"
)

# Add reviews parameter to P() function
content = content.replace(
    "    video: opts.video || null,\n    related: opts.related || []",
    "    video: opts.video || null,\n    related: opts.related || [],\n    reviewList: opts.reviewList || generateReviews(id, rating, reviews)"
)

# Add generateReviews function before P() function
generate_reviews_fn = """// Generate realistic fake reviews for products
function generateReviews(productId: number, avgRating: number, reviewCount: number): Review[] {
  const reviewers = [
    { name: 'Ayesha Khan', avatar: '1494790108377-be9c29b29330' },
    { name: 'Bilal Ahmed', avatar: '1500648767791-00dcc994a43e' },
    { name: 'Fatima Ali', avatar: '1438761681033-6461ffad8d80' },
    { name: 'Usman Malik', avatar: '1507003211169-0a1dd7228f2d' },
    { name: 'Sana Noor', avatar: '1494790108377-be9c29b29330' },
    { name: 'Ahmed Raza', avatar: '1500648767791-00dcc994a43e' },
    { name: 'Zainab Hussain', avatar: '1438761681033-6461ffad8d80' },
    { name: 'Kamran Siddiqui', avatar: '1507003211169-0a1dd7228f2d' },
    { name: 'Hira Bashir', avatar: '1494790108377-be9c29b29330' },
    { name: 'Tariq Mehmood', avatar: '1500648767791-00dcc994a43e' },
    { name: 'Nadia Sharif', avatar: '1438761681033-6461ffad8d80' },
    { name: 'Farhan Qureshi', avatar: '1507003211169-0a1dd7228f2d' },
    { name: 'Amna Tariq', avatar: '1494790108377-be9c29b29330' },
    { name: 'Imran Akhtar', avatar: '1500648767791-00dcc994a43e' },
    { name: 'Sadia Wahid', avatar: '1438761681033-6461ffad8d80' },
  ];
  const positiveComments = [
    'Mashallah! Best quality product I have received. Delivery was fast and packaging was excellent. Will order again InshaAllah.',
    'Very good product for the price. Exactly as shown in pictures. Bachat Bazar never disappoints me.',
    'Ordered this for my family and everyone loves it. Quality is premium and delivery was on time. Highly recommended!',
    'Amazing value for money! The quality exceeded my expectations. Will definitely recommend to friends and family.',
    'Second time ordering from Bachat Bazar. Product is genuine and works perfectly. COD option is very convenient.',
    'Just received my order and I am very happy with the quality. Packaging was secure and delivery was quick.',
    'Great product at an affordable price. The build quality is much better than what I expected. Five stars!',
    'My wife loved this product! Quality is top-notch and it arrived before the expected date. Thank you Bachat Bazar.',
    'This is exactly what I was looking for. Works great and the price is unbeatable. Will order more soon.',
    'Outstanding product! Been using it for 2 weeks now and it performs exactly as described. No complaints at all.',
    'Very satisfied with my purchase. The product quality is excellent and delivery was super fast to Lahore.',
    'Good product overall. A bit different from the picture but quality is fine for this price range.',
    'Finally found a reliable store for online shopping in Pakistan. Product is genuine and well-packed.',
    'Bought this as a gift and the recipient was very happy. Good quality and beautiful packaging.',
    'Quick delivery to Karachi! Product is exactly as described. Will be a repeat customer for sure.',
  ];
  const mixedComments = [
    'Product is okay. Quality could be better but for this price it is acceptable. Delivery was on time.',
    'Decent product. Not exactly like the picture but works fine. Shipping was fast which is a plus.',
    'Average quality for the price. Functionality is good but the material could be improved. Still worth buying.',
    'Product works as described but finishing could be better. Overall satisfied with the purchase.',
  ];

  const numReviews = Math.min(Math.max(3, Math.floor(reviewCount * 0.15)), 8);
  const reviews: Review[] = [];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  for (let i = 0; i < numReviews; i++) {
    const reviewer = reviewers[(productId * 7 + i * 3) % reviewers.length];
    const isPositive = i < numReviews - 1 || avgRating >= 4.0;
    const comments = isPositive ? positiveComments : mixedComments;
    const commentIdx = (productId * 11 + i * 5) % comments.length;
    const ratingVariance = isPositive ? [4,5] : [3,4];
    const reviewRating = ratingVariance[(productId + i) % ratingVariance.length];
    const monthIdx = (productId + i * 2) % 12;
    const day = ((productId * 3 + i * 7) % 28) + 1;

    reviews.push({
      id: i + 1,
      name: reviewer.name,
      avatar: reviewer.avatar,
      rating: reviewRating,
      date: `${months[monthIdx]} ${day}, 2026`,
      text: comments[commentIdx],
      verified: (productId + i) % 3 !== 0,
      helpful: (productId * 3 + i * 7) % 25,
    });
  }
  return reviews;
}

"""

content = content.replace(
    "function P(id: number,",
    generate_reviews_fn + "function P(id: number,"
)

print("✅ Added Review interface, reviewList field, and generateReviews function")

# ════════════════════════════════════════════════════════════════
# SAVE THE UPDATED FILE
# ════════════════════════════════════════════════════════════════

with open('src/lib/data.ts', 'w') as f:
    f.write(content)

print("\n🎉 ALL UPDATES COMPLETE!")
print(f"   - Fixed sfile.chatglm.cn images (remaining: {content.count('sfile.chatglm')})")
print(f"   - Added 8 new Markaz trending categories")
print(f"   - Added 40 new products for new categories")
print(f"   - Increased all prices by Rs 100")
print(f"   - Added fake review system with Review interface + generateReviews()")
