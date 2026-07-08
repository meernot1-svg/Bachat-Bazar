#!/usr/bin/env python3
"""
Fix product images in data.ts - replace old markaz.app image URLs with new ones.
Uses line-by-line approach for reliability.
"""

IMAGES = {
    92: 'https://sfile.chatglm.cn/images-ppt/507cea9006a8.jpg',
    93: 'https://sfile.chatglm.cn/images-ppt/cc481c2372a7.jpg',
    94: 'https://sfile.chatglm.cn/images-ppt/137b1f1cebd6.jpg',
    95: 'https://sfile.chatglm.cn.cn/images-ppt/d7c32a4e025f.png',
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

# Fix typo in P95 URL (double .cn)
IMAGES[95] = 'https://sfile.chatglm.cn/images-ppt/d7c32a4e025f.png'

DATA_FILE = '/home/z/my-project/src/lib/data.ts'

with open(DATA_FILE, 'r') as f:
    lines = f.readlines()

import re

fixed_count = 0
for i, line in enumerate(lines):
    for pid, new_url in IMAGES.items():
        # Match P(pid, ... pattern
        if f"P({pid}," in line:
            # Find the image URL (9th argument) - it's between the 8th and 9th commas
            # Pattern: P(id,'name','brand','cat',price,old,rating,reviews,stock,'OLD_URL',{
            # We need to replace OLD_URL with new_url
            
            # Find the image URL by looking for the pattern after stock number
            # The stock is followed by a comma, then the URL in single quotes
            match = re.search(rf"P\({pid},[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,'([^']*)'", line)
            if match:
                old_url = match.group(1)
                if old_url != new_url:
                    line = line.replace(f"'{old_url}'", f"'{new_url}'", 1)
                    lines[i] = line
                    fixed_count += 1
                    print(f"  P({pid}): replaced image", flush=True)
            break

with open(DATA_FILE, 'w') as f:
    f.writelines(lines)

print(f"\n=== FIXED {fixed_count} IMAGE URLs ===")
