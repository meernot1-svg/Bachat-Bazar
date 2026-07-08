#!/usr/bin/env python3
"""Search product images in batches of 3 with 20s delays between each batch."""
import subprocess, json, time, os

PRODUCTS = [
    (92, "vegetable chopper dicer kitchen tool product"),
    (93, "digital kitchen scale food scale product"),
    (94, "electric milk frother handheld product"),
    (95, "silicone food storage bags reusable product"),
    (96, "electric egg boiler kitchen appliance product"),
    (97, "stainless steel spice rack rotating product"),
    (98, "portable mini blender USB rechargeable product"),
    (99, "air fryer digital kitchen appliance product"),
    (100, "collapsible dish drainer rack kitchen product"),
    (101, "resistance bands set fitness exercise product"),
    (102, "adjustable dumbbell set fitness product"),
    (103, "yoga mat non slip fitness product"),
    (104, "wireless skipping rope digital counter product"),
    (105, "ab roller wheel fitness exercise product"),
    (106, "push up board foldable fitness product"),
    (107, "digital Quran pen reader Islamic product"),
    (108, "digital tasbeeh counter bracelet Islamic"),
    (109, "Islamic calligraphy wall art canvas decor"),
    (110, "prayer rug janamaz Islamic product"),
    (111, "halal nail polish breathable beauty product"),
    (112, "non stick cookware set kitchen product"),
    (113, "electric kettle stainless steel product"),
    (114, "vegetable peeler stainless steel product"),
    (115, "rice dispenser wall mounted kitchen product"),
    (116, "sandwich maker non stick kitchen product"),
    (117, "TWS wireless earbuds noise cancelling product"),
    (118, "smart watch AMOLED fitness tracker product"),
    (119, "20000mAh power bank fast charging product"),
    (120, "portable bluetooth speaker waterproof product"),
    (121, "vitamin C serum hyaluronic acid skincare"),
    (122, "niacinamide zinc serum skincare product"),
    (123, "men charcoal face wash deep cleansing product"),
    (124, "hair growth oil rosemary castor product"),
    (125, "LED facial mask photon therapy beauty product"),
    (126, "Pakistani lawn suit unstitched women fashion"),
    (127, "chiffon embroidered dupatta women fashion"),
    (128, "women crossbody bag faux leather product"),
    (129, "shalwar kameez unstitched men fashion"),
    (130, "men leather sandal comfort sole product"),
    (131, "magnetic building blocks kids toy product"),
    (132, "educational learning tablet kids bilingual toy"),
    (133, "remote control car 4WD off road toy product"),
    (134, "rechargeable LED emergency bulb product"),
    (135, "under bed storage organizer with wheels"),
    (136, "rotating makeup organizer large capacity"),
    (137, "portable neck fan bladeless USB product"),
    (138, "smart WiFi plug socket remote control product"),
    (139, "smart watch heart rate blood oxygen tracker"),
    (140, "artificial jewellery set necklace earrings"),
    (141, "travel trolley bag hard shell cabin size"),
    (142, "premium mixed dry fruits gift pack product"),
    (143, "pure natural honey 500ml product"),
    (144, "portable sewing machine electric product"),
    (145, "steam iron 1600W non stick soleplate"),
    (146, "rechargeable LED desk lamp product"),
    (147, "clothes steamer handheld portable product"),
    (148, "mini desktop fan rechargeable 3 speed"),
    (149, "foam roller muscle recovery fitness product"),
    (150, "hand grip strengthener adjustable product"),
    (151, "Islamic alarm clock Azan prayer product"),
    (152, "perfume attar collection non alcoholic Islamic"),
]

OUTFILE = "/home/z/my-project/scripts/final-image-urls.json"
results = {}
if os.path.exists(OUTFILE):
    with open(OUTFILE) as f:
        results = json.load(f)

def search_one(query):
    try:
        proc = subprocess.run(
            ["z-ai", "image-search", "-q", query, "-c", "1", "--gl", "us", "--no-rank"],
            capture_output=True, text=True, timeout=90
        )
        output = proc.stdout + proc.stderr
        if "429" in output: return "RATE_LIMITED"
        idx = output.find('{')
        if idx < 0: return None
        depth = 0
        end = 0
        for i, c in enumerate(output[idx:]):
            if c == '{': depth += 1
            elif c == '}': depth -= 1
            if depth == 0:
                end = idx + i + 1
                break
        data = json.loads(output[idx:end])
        if data.get('success') and data.get('results'):
            return data['results'][0]['original_url']
        return None
    except:
        return None

remaining = [(pid, q) for pid, q in PRODUCTS if str(pid) not in results or results.get(str(pid)) is None]
print(f"Need {len(remaining)} images, starting batch search...", flush=True)

BATCH = 3
INTER_BATCH = 30  # seconds between batches
INTER_SEARCH = 8  # seconds within batch

for batch_start in range(0, len(remaining), BATCH):
    batch = remaining[batch_start:batch_start + BATCH]
    print(f"\n--- Batch {batch_start//BATCH + 1} ---", flush=True)
    
    for pid, query in batch:
        print(f"  ID {pid}: {query[:40]}...", end=" ", flush=True)
        url = search_one(query)
        if url == "RATE_LIMITED":
            print("RATE LIMITED - waiting 65s", flush=True)
            time.sleep(65)
            url = search_one(query)
        if url and url != "RATE_LIMITED":
            results[str(pid)] = url
            print(f"OK", flush=True)
        else:
            results[str(pid)] = None
            print("MISSING", flush=True)
        
        with open(OUTFILE, 'w') as f:
            json.dump(results, f, indent=2)
        time.sleep(INTER_SEARCH)
    
    if batch_start + BATCH < len(remaining):
        print(f"  Waiting {INTER_BATCH}s between batches...", flush=True)
        time.sleep(INTER_BATCH)

found = sum(1 for v in results.values() if v)
print(f"\n=== DONE: {found}/{len(PRODUCTS)} images found ===")
