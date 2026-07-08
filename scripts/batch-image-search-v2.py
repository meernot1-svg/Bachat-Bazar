#!/usr/bin/env python3
"""Batch search for product images with retries and delays."""
import subprocess, json, time, os

PRODUCTS = [
    (92, "vegetable chopper dicer kitchen tool product"),
    (93, "digital kitchen scale precision food scale product"),
    (94, "electric milk frother handheld USB rechargeable"),
    (95, "silicone food storage bags reusable eco friendly"),
    (96, "electric egg boiler kitchen appliance product"),
    (97, "stainless steel spice rack rotating jars product"),
    (98, "portable mini blender USB rechargeable product"),
    (99, "air fryer digital touch screen kitchen product"),
    (100, "collapsible dish drainer rack foldable product"),
    (101, "resistance bands set fitness exercise product"),
    (102, "adjustable dumbbell set fitness product photo"),
    (103, "yoga mat non slip fitness product photo"),
    (104, "wireless skipping rope digital counter product"),
    (105, "ab roller wheel fitness product photo"),
    (106, "push up board foldable fitness product photo"),
    (107, "digital Quran pen reader Islamic product"),
    (108, "digital tasbeeh counter bracelet Islamic"),
    (109, "Islamic calligraphy wall art canvas product"),
    (110, "prayer rug janamaz Islamic product photo"),
    (111, "halal nail polish breathable color set"),
    (112, "non stick cookware set glass lids product"),
    (113, "electric kettle stainless steel fast boil"),
    (114, "vegetable peeler stainless steel product"),
    (115, "rice dispenser wall mounted kitchen product"),
    (116, "sandwich maker double plate non stick"),
    (117, "TWS wireless earbuds noise cancelling product"),
    (118, "smart watch AMOLED fitness tracker product"),
    (119, "20000mAh power bank fast charging product"),
    (120, "portable bluetooth speaker waterproof product"),
    (121, "vitamin C serum hyaluronic acid skincare"),
    (122, "niacinamide zinc oil control serum skincare"),
    (123, "men charcoal face wash deep cleansing"),
    (124, "hair growth oil rosemary castor blend"),
    (125, "LED facial mask photon therapy beauty product"),
    (126, "Pakistani lawn suit unstitched women fashion"),
    (127, "chiffon embroidered dupatta women fashion"),
    (128, "women crossbody bag faux leather classic"),
    (129, "shalwar kameez unstitched men fashion"),
    (130, "men leather sandal comfort sole product"),
    (131, "magnetic building blocks kids toy product"),
    (132, "educational learning tablet kids bilingual toy"),
    (133, "remote control car 4WD off road toy product"),
    (134, "rechargeable LED emergency bulb product"),
    (135, "under bed storage organizer with wheels"),
    (136, "rotating makeup organizer large capacity"),
    (137, "portable neck fan bladeless USB rechargeable"),
    (138, "smart WiFi plug socket remote control"),
    (139, "smart watch heart rate blood oxygen tracker"),
    (140, "artificial jewellery set necklace earrings"),
    (141, "travel trolley bag hard shell cabin size"),
    (142, "premium mixed dry fruits gift pack product"),
    (143, "pure natural honey sidr 500ml product"),
    (144, "portable sewing machine electric product"),
    (145, "steam iron 1600W non stick soleplate"),
    (146, "rechargeable LED desk lamp color modes"),
    (147, "clothes steamer handheld portable product"),
    (148, "mini desktop fan rechargeable 3 speed"),
    (149, "foam roller muscle recovery EVA fitness"),
    (150, "hand grip strengthener adjustable product"),
    (151, "Islamic alarm clock Azan prayer product"),
    (152, "perfume attar collection non alcoholic"),
]

results = {}
OUTFILE = "/home/z/my-project/scripts/image-urls.json"

# Load existing results if any
if os.path.exists(OUTFILE):
    with open(OUTFILE) as f:
        results = json.load(f)
    print(f"Loaded {len(results)} existing results")

for pid, query in PRODUCTS:
    if str(pid) in results:
        print(f"Skipping ID {pid} (already found)", flush=True)
        continue
    
    print(f"Searching ID {pid}: {query[:50]}...", flush=True)
    
    for attempt in range(3):
        try:
            proc = subprocess.run(
                ["z-ai", "image-search", "-q", query, "-c", "1", "--gl", "us", "--no-rank"],
                capture_output=True, text=True, timeout=90
            )
            output = proc.stdout + proc.stderr
            idx = output.find('{')
            if idx >= 0:
                json_str = output[idx:]
                # Find end of JSON
                depth = 0
                end = idx
                for i, c in enumerate(json_str):
                    if c == '{': depth += 1
                    elif c == '}': depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
                data = json.loads(json_str[:end])
                if data.get('success') and data.get('results'):
                    url = data['results'][0]['original_url']
                    results[str(pid)] = url
                    print(f"  OK: {url}", flush=True)
                    # Save after each success
                    with open(OUTFILE, 'w') as f:
                        json.dump(results, f, indent=2)
                    break
                else:
                    print(f"  Attempt {attempt+1}: no results", flush=True)
            else:
                print(f"  Attempt {attempt+1}: no JSON in output", flush=True)
        except Exception as e:
            print(f"  Attempt {attempt+1}: ERROR: {e}", flush=True)
        
        time.sleep(5)  # Wait longer before retry
    
    if str(pid) not in results:
        results[str(pid)] = None
        print(f"  FAILED after 3 attempts", flush=True)
        with open(OUTFILE, 'w') as f:
            json.dump(results, f, indent=2)
    
    time.sleep(3)  # Delay between products

# Write final results
with open(OUTFILE, 'w') as f:
    json.dump(results, f, indent=2)

found = sum(1 for v in results.values() if v)
print(f"\n=== DONE ===")
print(f"Found {found} / {len(PRODUCTS)} images")
