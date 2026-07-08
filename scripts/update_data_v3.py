#!/usr/bin/env python3
"""
Update 3:
1. Add 2-3 images per product (multiple thumbnails per product)
2. Improve image quality (higher resolution, better params)
3. Fix product prices to be realistic
"""

import re, random

with open('src/lib/data.ts', 'r') as f:
    content = f.read()

# ════════════════════════════════════════════════════════════════
# 1. IMPROVE IMAGE QUALITY - Upgrade U() function
# ════════════════════════════════════════════════════════════════
# Change w=700 to w=1200, add higher quality params

old_u_func = """export const U = (id: string, w = 700) => {
  if (typeof id !== 'string' || !id) return `https://picsum.photos/seed/placeholder/${w}/${w}`;
  if (/^data:/i.test(id)) return id;          // Base64 data URL — use as-is
  if (/^https?:\/\//.test(id)) return id;   // Full URL — use as-is
  if (/^\//.test(id)) return id;            // Local path like /uploads/... — use as-is
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
};"""

new_u_func = """export const U = (id: string, w = 1200) => {
  if (typeof id !== 'string' || !id) return `https://picsum.photos/seed/placeholder/${w}/${w}`;
  if (/^data:/i.test(id)) return id;
  if (/^https?:\/\//.test(id)) return id;
  if (/^\//.test(id)) return id;
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=90&auto=format&fit=crop&dpr=1`;
};"""

content = content.replace(old_u_func, new_u_func)
print("✅ Upgraded U() function: w=1200, q=90, dpr=1")

# Also fix resolveImg
old_resolve = "export const resolveImg = (src: string, w = 400) => {"
new_resolve = "export const resolveImg = (src: string, w = 800) => {"
content = content.replace(old_resolve, new_resolve)
print("✅ Upgraded resolveImg default width: 400 → 800")

# Update P() function to use w=1200
old_p_images = "images: imgArr.map((i: string) => U(i, 700)),"
new_p_images = "images: imgArr.map((i: string) => U(i, 1200)),"
content = content.replace(old_p_images, new_p_images)
print("✅ Updated P() image width: 700 → 1200")

# ════════════════════════════════════════════════════════════════
# 2. ADD MULTIPLE IMAGES PER PRODUCT
# ════════════════════════════════════════════════════════════════
# For each product, convert single image to array of 2-3 images
# We need category-appropriate additional images

# Map of category → additional Unsplash photo IDs for extra images
category_extra_images = {
    'appliances': ['1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1558618666-fcd25c85f82e'],
    'beauty': ['1596462502278-27bfdc403348', '1570172619644-dfd03ed5d881', '1556228578-0d85b1a4d571', '1571781926291-c477ebfd024b', '1595771055363-048d76554a2f'],
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

# For products with full URLs (Markaz), we'll also add extra Unsplash images
# For products with Unsplash IDs, we'll add 2 more from same category

lines = content.split('\n')
new_lines = []
updated_count = 0

for line in lines:
    if not line.strip().startswith('P('):
        new_lines.append(line)
        continue
    
    # Extract the product data
    # Match: P(id,'name','brand','category',price,oldPrice,rating,reviews,stock,'img',...
    m = re.match(r"(P\(\d+,'[^']+','[^']*','([^']+)',\d+,\d+,[\d.]+,\d+,\d+,)'([^']+)'(.*)", line)
    if not m:
        new_lines.append(line)
        continue
    
    prefix = m.group(1)  # P(id,'name','brand','category',price,oldPrice,rating,reviews,stock,
    cat = m.group(2)     # category
    img = m.group(3)     # current single image
    suffix = m.group(4)  # rest of the line
    
    # Skip if already has array of images
    if img.startswith('['):
        new_lines.append(line)
        continue
    
    # Get extra images for this category
    extras = category_extra_images.get(cat, category_extra_images.get('home-lifestyle', []))
    
    # Pick 2 extra images (different from the main one)
    extra_imgs = [e for e in extras if e != img]
    random.seed(hash(prefix))  # Deterministic based on product
    random.shuffle(extra_imgs)
    selected_extras = extra_imgs[:2]
    
    # Build the image array
    all_imgs = [img] + selected_extras
    img_array = '[' + ','.join(f"'{i}'" for i in all_imgs) + ']'
    
    # Replace single image with array
    new_line = prefix + img_array + suffix
    new_lines.append(new_line)
    updated_count += 1

content = '\n'.join(new_lines)
print(f"✅ Added 2-3 images per product: {updated_count} products updated")

# ════════════════════════════════════════════════════════════════
# 3. FIX PRICES — Set realistic Pakistani market prices
# ════════════════════════════════════════════════════════════════
# The user says prices are not listed correctly.
# We need to set proper prices with realistic discounts (15-35% off)

# First, let's see current price issues
products = re.findall(
    r"P\((\d+),'([^']+)',\s*'([^']*)',\s*'([^']+)',\s*(\d+),\s*(\d+),",
    content
)

issues = []
for pid, name, brand, cat, price, old in products:
    p = int(price)
    o = int(old)
    discount = round((1 - p/o)*100) if o > 0 else 0
    if o <= p:
        issues.append(f"P{pid}: oldPrice({o}) <= price({p})")
    if discount < 5 or discount > 60:
        issues.append(f"P{pid}: unusual discount {discount}% (Rs.{p} vs Rs.{o})")

print(f"\n⚠️ Pricing issues found: {len(issues)}")
for issue in issues[:15]:
    print(f"   {issue}")

# Fix prices: set discount between 12-30% for all products
def fix_pricing(match):
    prefix = match.group(1)
    price = int(match.group(2))
    old_price = int(match.group(3))
    
    # If old price is 0 or less than price, fix it
    if old_price <= price or old_price == 0:
        # Set oldPrice to be 18-28% higher than price
        random.seed(price)
        pct = random.randint(18, 28)
        old_price = round(price / (1 - pct/100))
    
    # Check discount is reasonable (12-35%)
    discount = round((1 - price/old_price)*100) if old_price > 0 else 0
    if discount < 8 or discount > 50:
        # Reset oldPrice for reasonable discount
        random.seed(price + 7)
        pct = random.randint(15, 28)
        old_price = round(price / (1 - pct/100))
    
    return f"{prefix}{price},{old_price},"

pattern = r"(P\(\d+,'[^']+','[^']*','[^']+',)(\d+),(\d+),"
content = re.sub(pattern, fix_pricing, content)

# Verify fixes
products_after = re.findall(
    r"P\(\d+,'[^']+','[^']*','[^']+?',\s*(\d+),\s*(\d+),",
    content
)
fixed_issues = 0
for price, old in products_after:
    p = int(price)
    o = int(old)
    if o <= p:
        fixed_issues += 1

print(f"\n✅ Fixed pricing — remaining issues: {fixed_issues}")

# ════════════════════════════════════════════════════════════════
# SAVE
# ════════════════════════════════════════════════════════════════

with open('src/lib/data.ts', 'w') as f:
    f.write(content)

# Final verification
with open('src/lib/data.ts') as f:
    verify = f.read()

pcount = len(re.findall(r"P\(\d+,", verify))
print(f"\n🎉 FINAL: {pcount} products")
print(f"   sfile.chatglm: {verify.count('sfile.chatglm')}")

# Count products with image arrays
img_arrays = len(re.findall(r"\['[^']+', '[^']+', '[^']+'\]", verify))
img_pairs = len(re.findall(r"\['[^']+', '[^']+'\]", verify))
print(f"   Products with 3 images: {img_arrays}")
print(f"   Products with 2 images: {img_pairs}")
print(f"   Total with multiple: {img_arrays + img_pairs}")
