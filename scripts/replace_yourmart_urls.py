import re

# Map of product ID to new image URL
REPLACEMENTS = {
    1:  'https://sfile.chatglm.cn/images-ppt/7cfe17507607.jpg',     # Cordless Drill
    2:  'https://sfile.chatglm.cn/images-ppt/a128628ce8a2.jpg',     # Oscillating Fan
    3:  'https://sfile.chatglm.cn/images-ppt/dab5d91e2c22.jpeg',    # Massage Gun Long Handle
    4:  'https://sfile.chatglm.cn/images-ppt/b6a24c846212.jpg',     # Five Head Massage Gun
    5:  'https://sfile.chatglm.cn/images-ppt/7b39573141a0.png',     # Hair Straightener FR-2105
    6:  'https://sfile.chatglm.cn/images-ppt/635f0cda40cc.jpg',     # Phone Cooler CX16
    7:  'https://sfile.chatglm.cn/images-ppt/7ef29e22d77c.webp',    # Perfume Set
    8:  'https://sfile.chatglm.cn/images-ppt/3340af505fd7.jpeg',    # Home Tool Kit
    9:  'https://sfile.chatglm.cn/images-ppt/ad6b020cb510.jpg',     # Socket Wrench Set
    10: 'https://sfile.chatglm.cn/images-ppt/000eb0b987da.jpg',     # Ocean Wave Projector
    11: 'https://sfile.chatglm.cn/images-ppt/92f13a0aa5aa.jpg',     # Mini Camera
    12: 'https://sfile.chatglm.cn/images-ppt/d6e9f84800cb.jpg',     # Charging Disconnector (phone cooler image)
    13: 'https://sfile.chatglm.cn/images-ppt/b3442dbce950.jpg',     # Northern Lights Lamp
    14: 'https://sfile.chatglm.cn/images-ppt/601ae4ce4c53.jpeg',    # Crystal Cube Light
    15: 'https://sfile.chatglm.cn/images-ppt/e3bfbf34f4bb.jpg',     # Sand Art LED Lamp
    16: 'https://sfile.chatglm.cn/images-ppt/720e6deb28e5.jpg',     # Jellyfish Lamp
    17: 'https://sfile.chatglm.cn/images-ppt/36c603394ccf.jpg',     # Massage Gun Deep Tissue
    18: 'https://sfile.chatglm.cn/images-ppt/21defdb3bbf4.jpg',     # Hair Straightener FR-2028
    19: 'https://sfile.chatglm.cn/images-ppt/2deb3ce59573.jpeg',    # LED Night Light
    20: 'https://sfile.chatglm.cn/images-ppt/d53eeeeedcef.jpg',     # LED Writing Board
    21: 'https://sfile.chatglm.cn/images-ppt/d6e9f84800cb.jpg',     # Phone Cooler CX07 (reuse)
    22: 'https://picsum.photos/seed/foot-cream-75g/400/400',         # Foot Cream (picsum fallback)
    23: 'https://picsum.photos/seed/nail-fungus-serum/400/400',      # Nail Treatment (picsum fallback)
    24: 'https://sfile.chatglm.cn/images-ppt/75ba85ac22bb.jpg',     # Catapult Toy
    25: 'https://sfile.chatglm.cn/images-ppt/dd47c072a239.jpg',     # Phone Stand
    26: 'https://sfile.chatglm.cn/images-ppt/a72c18fd46fe.png',     # LED Tap Lights (night light image)
    27: 'https://sfile.chatglm.cn/images-ppt/b93034b6391c.jpg',     # Sand Art Picture
    28: 'https://sfile.chatglm.cn/images-ppt/99758f2417d0.jpg',     # Sauce Bottle
}

filepath = '/home/z/my-project/src/lib/data.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Replace each yourmart.pk URL by matching product ID pattern
replaced = 0
for pid, new_url in REPLACEMENTS.items():
    # Pattern: P(pid, ... , 'https://admin.yourmart.pk/...'
    pattern = rf"(P\({pid},.*?,)'https://admin\.yourmart\.pk[^']*'"
    match = re.search(pattern, content)
    if match:
        old = match.group(0)
        new = match.group(1) + f"'{new_url}'"
        content = content.replace(old, new, 1)
        replaced += 1
        print(f"  P({pid}): replaced ✓")
    else:
        print(f"  P({pid}): NOT FOUND ✗")

with open(filepath, 'w') as f:
    f.write(content)

print(f"\nTotal replaced: {replaced}/28")
