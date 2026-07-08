#!/usr/bin/env python3
"""
Fix all products 92-152 in data.ts:
1. Replace all markaz.app image URLs with proper high-quality images
2. Fix wrong brand names (Fitbit -> generic, LEGO -> generic, Nerf -> generic)
3. Fix wrong category assignments (Makeup Organizer -> beauty, etc.)
4. Fix typos (Fitfit -> generic)
"""

import re

# Image URL mapping (product ID -> new image URL)
IMAGES = {
    92: 'https://sfile.chatglm.cn/images-ppt/507cea9006a8.jpg',
    93: 'https://sfile.chatglm.cn/images-ppt/cc481c2372a7.jpg',
    94: 'https://sfile.chatglm.cn/images-ppt/137b1f1cebd6.jpg',
    95: 'https://sfile.chatglm.cn/images-ppt/d7c32a4e025f.png',
    96: 'https://sfile.chatglm.cn/images-ppt/025261c5549a.png',
    97: 'https://sfile.chatglm.cn/images-ppt/4a15a2639add.jpg',
    98: 'https://sfile.chatglm.cn/images-ppt/8e011fa49187.webp',
    99: 'https://sfile.chatglm.cn/images-ppt/4a796ec50ffd.png',
    100: 'https://sfile.chatglm.cn/images-ppt/06282a35fa89.jpg',
    101: 'https://sfile.chatglm.cn/images-ppt/d19bd4b76ea0.jpg',
    102: 'https://sfile.chatglm.cn/images-ppt/8b1c7302c3bb.jpg',
    103: 'https://sfile.chatglm.cn/images-ppt/233d7445661c.jpg',
    104: 'https://sfile.chatglm.cn/images-ppt/301dd3715380.jpg',
    105: 'https://sfile.chatglm.cn/images-ppt/66692095feec.jpg',
    106: 'https://sfile.chatglm.cn/images-ppt/cabbc495e996.jpg',
    107: 'https://sfile.chatglm.cn/images-ppt/6468f25fa1fa.jpg',
    108: 'https://sfile.chatglm.cn/images-ppt/01f5a2107a40.jpg',
    109: 'https://sfile.chatglm.cn/images-ppt/853ba89c8d22.jpg',
    110: 'https://sfile.chatglm.cn/images-ppt/2d506f809801.jpg',
    111: 'https://sfile.chatglm.cn/images-ppt/9b8a627fd07e.jpg',
    112: 'https://sfile.chatglm.cn/images-ppt/7a244b319b45.jpg',
    113: 'https://sfile.chatglm.cn/images-ppt/b5dda3a10e93.jpeg',
    114: 'https://sfile.chatglm.cn/images-ppt/de2c82532593.jpeg',
    115: 'https://sfile.chatglm.cn/images-ppt/854416306146.jpeg',
    116: 'https://sfile.chatglm.cn/images-ppt/1ae29a68e03f.jpg',
    117: 'https://sfile.chatglm.cn/images-ppt/2ac57e8ac807.png',
    118: 'https://sfile.chatglm.cn/images-ppt/de18814f44cd.jpg',
    119: 'https://sfile.chatglm.cn/images-ppt/f6cacbffb3f2.jpg',
    120: 'https://sfile.chatglm.cn/images-ppt/c9ab947c4d5f.jpg',
    121: 'https://sfile.chatglm.cn/images-ppt/dea24b939eee.jpg',
    122: 'https://sfile.chatglm.cn/images-ppt/3f8d5c251a2f.jpg',
    123: 'https://sfile.chatglm.cn/images-ppt/ca38044d0731.jpg',
    124: 'https://sfile.chatglm.cn/images-ppt/6e0dd1fd6e9a.jpg',
    125: 'https://sfile.chatglm.cn/images-ppt/7f3a10e3cbae.jpg',
    126: 'https://sfile.chatglm.cn/images-ppt/e2d9114a1a59.webp',
    127: 'https://sfile.chatglm.cn/images-ppt/b738de4c784d.jpeg',
    128: 'https://sfile.chatglm.cn/images-ppt/757fc6f8c918.jpg',
    129: 'https://sfile.chatglm.cn/images-ppt/1dd06a97bf78.jpg',
    130: 'https://sfile.chatglm.cn/images-ppt/d8ddf70294e6.jpg',
    131: 'https://sfile.chatglm.cn/images-ppt/6055306d77be.jpg',
    132: 'https://sfile.chatglm.cn/images-ppt/7bfc32e262e9.jpg',
    133: 'https://sfile.chatglm.cn/images-ppt/2032b322a58f.jpg',
    134: 'https://sfile.chatglm.cn/images-ppt/3a4b94fdd7c8.jpg',
    135: 'https://sfile.chatglm.cn/images-ppt/a9f7297cca92.jpg',
    136: 'https://sfile.chatglm.cn/images-ppt/16e8807a6fea.jpg',
    137: 'https://sfile.chatglm.cn/images-ppt/4e5546585270.jpg',
    138: 'https://sfile.chatglm.cn/images-ppt/845f597175d6.jpg',
    139: 'https://sfile.chatglm.cn/images-ppt/d6848806af6e.jpg',
    140: 'https://sfile.chatglm.cn/images-ppt/f0baec3755a6.jpg',
    141: 'https://sfile.chatglm.cn/images-ppt/6d9a183a6be0.webp',
    142: 'https://sfile.chatglm.cn/images-ppt/b95b6a3a3e41.jpg',
    143: 'https://sfile.chatglm.cn/images-ppt/73de3bcc21be.jpg',
    144: 'https://sfile.chatglm.cn/images-ppt/2d57277f3b08.jpg',
    145: 'https://sfile.chatglm.cn/images-ppt/fafa3ff562ff.jpg',
    146: 'https://sfile.chatglm.cn/images-ppt/8e51dd0d2544.jpg',
    147: 'https://sfile.chatglm.cn/images-ppt/3980b98376a3.jpg',
    148: 'https://sfile.chatglm.cn/images-ppt/e14e67780e48.png',
    149: 'https://sfile.chatglm.cn/images-ppt/d4bb1716223a.jpg',
    150: 'https://sfile.chatglm.cn/images-ppt/b55f7b198102.png',
    151: 'https://sfile.chatglm.cn/images-ppt/b7a279a39bb1.webp',
    152: 'https://sfile.chatglm.cn/images-ppt/b662e759d6e6.jpg',
}

# Brand fixes: wrong brand -> correct brand
BRAND_FIXES = {
    'Fitbit': 'ProFit',       # Generic fitness brand (not the trademarked Fitbit)
    'Fitfit': 'ProFit',       # Typo fix
    'LEGO': 'MegaBuild',      # Generic building blocks (not trademarked LEGO)
    'Nerf': 'SpeedRacer',     # Generic RC car brand (not trademarked Nerf)
}

# Category fixes: product ID -> correct category
CATEGORY_FIXES = {
    136: 'beauty',  # Rotating Makeup Organizer should be in beauty, not home-lifestyle
}

DATA_FILE = '/home/z/my-project/src/lib/data.ts'

with open(DATA_FILE, 'r') as f:
    content = f.read()

# Fix images: Replace markaz.app URLs with proper images
for pid, new_url in IMAGES.items():
    # Pattern: P(pid, ... ,'old_url', {...})
    # We need to find the image URL in the P() call for this product ID
    # The image URL is the 9th argument after the opening P(
    pattern = rf"P\({pid},'[^']*','[^']*','[^']*',[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,'[^']*'"
    
    def replacer(match):
        old = match.group(0)
        # Replace the last single-quoted string (the image URL) with the new URL
        # Pattern: ...,'old_url'
        return re.sub(r",'[^']*$", f",'{new_url}'", old)
    
    content = re.sub(pattern, replacer, content)

# Fix brands
for old_brand, new_brand in BRAND_FIXES.items():
    # Only fix in the new products section (IDs 92-152)
    # We need to be careful not to change brand names in descriptions/specs
    # The brand is the 3rd argument in P() - after the product name
    # Pattern: P(id,'Product Name','OldBrand','category',...
    for pid in range(92, 153):
        pattern = rf"P\({pid},'([^']*)','{old_brand}','([^']*)'"
        replacement = rf"P({pid},'\1','{new_brand}','\2'"
        content = re.sub(pattern, replacement, content)
    # Also fix in specs
    content = content.replace(f"'Brand':'{old_brand}'", f"'Brand':'{new_brand}'")

# Fix categories
for pid, new_cat in CATEGORY_FIXES.items():
    # Find the product and change its category
    for old_cat in ['home-lifestyle', 'electronics', 'beauty', 'kitchen', 'sports-fitness', 'islamic', 'womens-fashion', 'mens-fashion', 'watches-bags', 'kids-babies', 'grocery', 'appliances']:
        pattern = rf"P\({pid},'([^']*)','([^']*)','{old_cat}'"
        replacement = rf"P({pid},'\1','\2','{new_cat}'"
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            content = new_content
            # Also fix category in specs
            content = content.replace(f"'Category':'{old_cat}'", f"'Category':'{new_cat}'")
            break

# Update BRANDS array to replace old brand names
for old_brand, new_brand in BRAND_FIXES.items():
    content = content.replace(f"'{old_brand}'", f"'{new_brand}'")

# Bump store version to force cache refresh
content = content.replace("bachatbazar_v8", "bachatbazar_v9")

with open(DATA_FILE, 'w') as f:
    f.write(content)

print("=== ALL FIXES APPLIED ===")
print(f"- Replaced {len(IMAGES)} product images")
print(f"- Fixed {len(BRAND_FIXES)} brand names")
print(f"- Fixed {len(CATEGORY_FIXES)} category assignments")
print("- Bumped store version to bachatbazar_v9")
