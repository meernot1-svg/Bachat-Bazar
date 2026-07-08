#!/usr/bin/env python3
"""Search product images in small batches with rate limit handling."""
import subprocess, json, time, os, re

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

OUTFILE = "/home/z/my-project/scripts/image-urls.json"
BATCH_SIZE = 5
DELAY_BETWEEN = 10  # seconds between individual searches
DELAY_AFTER_RATE_LIMIT = 65  # seconds to wait after rate limit

# Load existing results
results = {}
if os.path.exists(OUTFILE):
    with open(OUTFILE) as f:
        results = json.load(f)

def search_image(query):
    """Search for a single image, return URL or None."""
    try:
        proc = subprocess.run(
            ["z-ai", "image-search", "-q", query, "-c", "1", "--gl", "us", "--no-rank"],
            capture_output=True, text=True, timeout=90
        )
        output = proc.stdout + proc.stderr
        
        # Check for rate limit
        if "429" in output or "Too many requests" in output:
            return "RATE_LIMITED"
        
        # Find JSON in output
        idx = output.find('{')
        if idx >= 0:
            json_str = output[idx:]
            # Find matching closing brace
            depth = 0
            end = 0
            for i, c in enumerate(json_str):
                if c == '{': depth += 1
                elif c == '}': depth -= 1
                if depth == 0:
                    end = i + 1
                    break
            if end > 0:
                data = json.loads(json_str[:end])
                if data.get('success') and data.get('results'):
                    return data['results'][0]['original_url']
        return None
    except Exception as e:
        print(f"    Exception: {e}", flush=True)
        return None

remaining = [(pid, q) for pid, q in PRODUCTS if str(pid) not in results or results[str(pid)] is None]
print(f"Need to search {len(remaining)} images", flush=True)

for i, (pid, query) in enumerate(remaining):
    print(f"[{i+1}/{len(remaining)}] ID {pid}: {query[:40]}...", flush=True)
    
    url = search_image(query)
    
    if url == "RATE_LIMITED":
        print(f"  Rate limited! Waiting {DELAY_AFTER_RATE_LIMIT}s...", flush=True)
        time.sleep(DELAY_AFTER_RATE_LIMIT)
        # Retry
        url = search_image(query)
        if url == "RATE_LIMITED":
            print(f"  Still rate limited. Saving as MISSING.", flush=True)
            url = None
    
    if url and url != "RATE_LIMITED":
        results[str(pid)] = url
        print(f"  OK: {url[:60]}...", flush=True)
    else:
        results[str(pid)] = None
        print(f"  FAILED", flush=True)
    
    # Save after each result
    with open(OUTFILE, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Delay between searches
    if i < len(remaining) - 1:
        time.sleep(DELAY_BETWEEN)

found = sum(1 for v in results.values() if v)
print(f"\n=== DONE ===")
print(f"Found {found} / {len(PRODUCTS)} images")
