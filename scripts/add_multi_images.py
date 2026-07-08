#!/usr/bin/env python3
"""
Add 2-3 images per product by converting single image strings to arrays
"""

import re, random

with open('src/lib/data.ts', 'r') as f:
    content = f.read()

# Category → extra Unsplash photo IDs for additional product images
category_extra_images = {
    'appliances': ['1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1558618666-fcd25c85f82e'],
    'beauty': ['1596462502278-27bfdc403348', '1570172619644-dfd03ed5d881', '1556228578-0d85b1a4d571', '1571781926291-c477ebfd024b'],
    'electronics': ['1505740420928-5e560c06d30e', '1511707171634-5f897ff02aa9', '1585386959984-a4155224a1ad'],
    'home-lifestyle': ['1555041469-a586c61ea9bc', '1556228453-efd6c1ff04f6', '1586023492125-27b2c045efd7'],
    'kids-babies': ['1515488042361-ee00e0ddd4e4', '1596462502278-27bfdc403348'],
    'womens-fashion': ['1595771055363-048d76554a2f', '1556228578-0d85b1a4d571', '1596462502278-27bfdc403348'],
    'mens-fashion': ['1483985988355-763728e1935b', '1523275335684-37898b6baf30'],
    'watches-bags': ['1523275335684-37898b6baf30', '1553062407-98eeb64c6a62', '1585386959984-a4155224a1ad'],
    'kitchen': ['1556909114-f6e7ad7d3136', '1555041469-a586c61ea9bc', '1560343091-f128eb5a51d7'],
    'sports-fitness': ['1517836357463-d25dfeac3438', '1571019613454-1cb2f99b2d8b'],
    'islamic': ['1542816417-0983c9c9ad53', '1541643600914-78b084683601'],
    'grocery': ['1542838132-92f5d5c0b1bc', '1556909114-f6e7ad7d3136'],
    'mobile-accessories': ['1511707171634-5f897ff02aa9', '1505740420928-5e560c06d30e'],
    'hair-care': ['1522338242992-e1a54571a9f7', '1596462502278-27bfdc403348', '1556228578-0d85b1a4d571'],
    'bedding': ['1555041469-a586c61ea9bc', '1556228453-efd6c1ff04f6', '1586023492125-27b2c045efd7'],
    'car-accessories': ['1503376780353-7e6692767b70', '1558618666-fcd25c85f82e'],
    'stationery': ['1507925921958-8a62f3d1a50d', '1515488042361-ee00e0ddd4e4'],
    'womens-shoes': ['1543163521-1bf539c55dd2', '1595771055363-048d76554a2f'],
    'fragrance': ['1541643600914-78b084683601', '1571781926291-c477ebfd024b'],
    'pet-care': ['1587300003388-59208cc962cb', '1515488042361-ee00e0ddd4e4'],
}

lines = content.split('\n')
new_lines = []
updated = 0

for line in lines:
    if not line.strip().startswith('P('):
        new_lines.append(line)
        continue
    
    # Skip if already has image array
    if '[' in line.split(',{')[0].split("'")[-1]:
        # Already has array — check more carefully
        # Find the image section between stock number and {opts}
        pass
    
    # Find: ,stock,'singleImage',{  → replace with ,stock,['img1','img2','img3'],{
    # Pattern: number then comma then single-quoted string then comma then {
    m = re.search(r",(\d+),'([^']+)',(\{)", line)
    if not m:
        new_lines.append(line)
        continue
    
    stock = m.group(1)
    single_img = m.group(2)
    brace = m.group(3)
    
    # Skip if already an array
    if single_img.startswith('['):
        new_lines.append(line)
        continue
    
    # Get category from the line
    cat_match = re.search(r"'([^']+)'," + single_img.replace('[', '\\[').replace(']', '\\]'), line)
    if not cat_match:
        # Extract category differently - it's the 4th parameter
        # P(id,'name','brand','category',...
        cat_match2 = re.search(r"P\(\d+,'[^']+','[^']*','([^']+)',", line)
        cat = cat_match2.group(1) if cat_match2 else 'home-lifestyle'
    else:
        cat = cat_match.group(1)
    
    # Get extras for this category
    extras = category_extra_images.get(cat, category_extra_images.get('home-lifestyle', []))
    
    # Pick 2 extras (avoid duplicates with main image)
    extra_imgs = [e for e in extras if e != single_img]
    product_id_match = re.search(r"P\((\d+),", line)
    pid = int(product_id_match.group(1)) if product_id_match else 0
    
    # Use product ID for deterministic but varied selection
    random.seed(pid * 31)
    if len(extra_imgs) >= 2:
        selected = random.sample(extra_imgs, 2)
    elif len(extra_imgs) == 1:
        selected = extra_imgs + [extras[0] if extras[0] != single_img else extras[1] if len(extras) > 1 else '1555041469-a586c61ea9bc']
    else:
        selected = ['1555041469-a586c61ea9bc', '1586023492125-27b2c045efd7']
    
    # Build array
    img_array = f"['{single_img}','{selected[0]}','{selected[1]}']"
    
    # Replace in line
    old_part = f",{stock},'{single_img}',{brace}"
    new_part = f",{stock},{img_array},{brace}"
    line = line.replace(old_part, new_part, 1)
    
    new_lines.append(line)
    updated += 1

content = '\n'.join(new_lines)

with open('src/lib/data.ts', 'w') as f:
    f.write(content)

print(f"✅ Added 2-3 images to {updated} products")

# Verify
with open('src/lib/data.ts') as f:
    verify = f.read()

img_arrays_3 = verify.count("','")
img_array_count = len(re.findall(r"\['[^']+', '[^']+', '[^']+'\]", verify))
img_pair_count = len(re.findall(r"\['[^']+', '[^']+'\]", verify))
single_count = len(re.findall(r"P\(\d+,'[^']+','[^']*','[^']+',\d+,\d+,[\d.]+,\d+,\d+,'[^']+'", verify))
print(f"   Products with 3 images: {img_array_count}")
print(f"   Products with 2 images: {img_pair_count}")
print(f"   Products with single image: {single_count}")
