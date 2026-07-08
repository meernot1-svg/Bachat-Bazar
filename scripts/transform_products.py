#!/usr/bin/env python3
"""Transform data.ts: Remove original products (1-77), renumber imported (78-168) to (1-91), bump store version."""
import re

with open('/home/z/my-project/src/lib/data.ts', 'r') as f:
    content = f.read()

# 1. Remove products with IDs 1-77 (original Naheed-based products)
# Find the PRODUCTS array and remove lines with P(1) through P(77)
lines = content.split('\n')
new_lines = []
skip_section_comments = set()
in_products = False
product_id_pattern = re.compile(r"P\((\d+),")

for i, line in enumerate(lines):
    # Track if we're inside the PRODUCTS array
    if 'export const PRODUCTS: Product[] = [' in line:
        in_products = True
        new_lines.append(line)
        continue
    if in_products and line.strip() == '];':
        in_products = False
        new_lines.append(line)
        continue
    
    if in_products:
        m = product_id_pattern.search(line)
        if m:
            pid = int(m.group(1))
            if pid <= 77:
                # Skip this product line
                continue
            else:
                # Renumber: 78->1, 79->2, ..., 168->91
                new_id = pid - 77
                new_line = product_id_pattern.sub(f"P({new_id},", line)
                new_lines.append(new_line)
                continue
        # Keep comment lines and other lines within PRODUCTS array
        new_lines.append(line)
    else:
        new_lines.append(line)

content = '\n'.join(new_lines)

# 2. Update BRANDS array - remove brands not used by imported products
# Imported brands: YourMart, Markaz, Sapphire, Rukh, Zarar, Janan, Zafarani, MILANO, M25, Remington, CX16, J Premium, Memo, Herbiotics, SQ11
old_brands = """export const BRANDS = ['Maybelline','Garnier','L\\'Oreal','Johnson\\'s','Nivea','Neutrogena','Medicube','Aveeno','Clean & Clear','Listerine','Wella','Schwarzkopf','Fresh Street','Bisconni','Knorr','Daffodils','Aero','Haut Notch','Mr. Muscle','Remia','Santan','Glam Gas','West Point','Anex','Redmi','Xiaomi','Samsung','TP-LINK','Joyroom','HOCO','Basix','Indus','Pace Setters','Echou','Warq Notes','Walkeaze','SJ','Avent','YourMart','J Premium','Remington','CX16','Memo','Herbiotics','SQ11','Markaz','Sapphire','Rukh','Zarar','Janan','Zafarani','MILANO','M25'];"""
new_brands = """export const BRANDS = ['YourMart','J Premium','Remington','CX16','Memo','Herbiotics','SQ11','Markaz','Sapphire','Rukh','Zarar','Janan','Zafarani','MILANO','M25'];"""
content = content.replace(old_brands, new_brands)

# 3. Bump Zustand persist version from bachatbazar_v6 to bachatbazar_v7
content = content.replace("name: 'bachatbazar_v6'", "name: 'bachatbazar_v7'")

# Wait, the persist version is in store.ts, not data.ts. Let me handle that separately.

with open('/home/z/my-project/src/lib/data.ts', 'w') as f:
    f.write(content)

print("✅ data.ts updated: removed products 1-77, renumbered 78-168 to 1-91, updated BRANDS")
