#!/usr/bin/env python3
"""Batch search for product images using z-ai image-search CLI."""
import subprocess, json, time, sys

PRODUCTS = [
    (92, "vegetable chopper dicer 12 in 1 kitchen tool product photo"),
    (93, "digital kitchen scale 5kg precision food scale product photo"),
    (94, "electric milk frother handheld USB rechargeable product photo"),
    (95, "silicone food storage bags reusable eco friendly product"),
    (96, "electric egg boiler 7 egg kitchen appliance product photo"),
    (97, "stainless steel spice rack rotating 16 jars product photo"),
    (98, "portable mini blender USB rechargeable 380ml product photo"),
    (99, "air fryer 4.5L digital touch screen kitchen product photo"),
    (100, "collapsible dish drainer rack foldable kitchen product"),
    (101, "resistance bands set 5 levels fitness exercise product photo"),
    (102, "adjustable dumbbell set 20kg fitness product photo"),
    (103, "yoga mat premium 6mm non slip TPE fitness product photo"),
    (104, "wireless skipping rope digital counter fitness product photo"),
    (105, "ab roller wheel with knee pad fitness product photo"),
    (106, "push up board 9 in 1 foldable fitness product photo"),
    (107, "digital Quran pen reader Islamic product photo"),
    (108, "digital tasbeeh counter bracelet Islamic product photo"),
    (109, "Islamic calligraphy wall art canvas set product photo"),
    (110, "prayer rug janamaz with compass Islamic product photo"),
    (111, "halal nail polish breathable 6 color set product photo"),
    (112, "non stick cookware set 7 pieces glass lids product photo"),
    (113, "electric kettle 1.8L stainless steel fast boil product"),
    (114, "vegetable peeler set 3 in 1 stainless steel product photo"),
    (115, "rice dispenser 10kg wall mounted kitchen product photo"),
    (116, "sandwich maker double plate non stick product photo"),
    (117, "TWS wireless earbuds ANC noise cancelling product photo"),
    (118, "smart watch ultra 2 AMOLED fitness tracker product photo"),
    (119, "20000mAh power bank fast charging product photo"),
    (120, "portable bluetooth speaker IPX7 waterproof product photo"),
    (121, "vitamin C serum hyaluronic acid 30ml skincare product"),
    (122, "niacinamide zinc oil control serum skincare product photo"),
    (123, "men charcoal face wash deep cleansing product photo"),
    (124, "hair growth oil rosemary castor blend product photo"),
    (125, "LED facial mask 7 colors photon therapy product photo"),
    (126, "Pakistani lawn suit unstitched printed women fashion"),
    (127, "chiffon embroidered dupatta women fashion product photo"),
    (128, "women crossbody bag faux leather classic product photo"),
    (129, "shalwar kameez wash wear unstitched men fashion Pakistan"),
    (130, "men leather sandal comfort sole product photo"),
    (131, "magnetic building blocks set 64 pieces kids toy product"),
    (132, "educational learning tablet kids bilingual toy product"),
    (133, "remote control car 4WD off road 1 16 scale toy product"),
    (134, "rechargeable LED emergency bulb 12W product photo"),
    (135, "under bed storage organizer with wheels product photo"),
    (136, "rotating 360 makeup organizer large capacity product"),
    (137, "portable neck fan bladeless USB rechargeable product"),
    (138, "smart WiFi plug socket remote control product photo"),
    (139, "smart watch series 8 heart rate blood oxygen product"),
    (140, "artificial jewellery set necklace earrings tikka product"),
    (141, "travel trolley bag hard shell 20 inch cabin product"),
    (142, "premium mixed dry fruits 500g gift pack product photo"),
    (143, "pure natural honey sidr 500ml product photo"),
    (144, "portable sewing machine 12 stitch electric product"),
    (145, "steam iron 1600W non stick soleplate product photo"),
    (146, "rechargeable LED desk lamp 3 color modes product"),
    (147, "clothes steamer handheld portable 700W product photo"),
    (148, "mini desktop fan rechargeable 3 speed product photo"),
    (149, "foam roller muscle recovery 45cm EVA fitness product"),
    (150, "hand grip strengthener adjustable 10 60kg product"),
    (151, "Islamic alarm clock Azan 500 cities product photo"),
    (152, "perfume attar collection 6 pack non alcoholic product"),
]

results = {}
for pid, query in PRODUCTS:
    print(f"Searching ID {pid}: {query[:50]}...", flush=True)
    try:
        proc = subprocess.run(
            ["z-ai", "image-search", "-q", query, "-c", "1", "--gl", "us", "--no-rank"],
            capture_output=True, text=True, timeout=90
        )
        output = proc.stdout + proc.stderr
        # Find the JSON part
        idx = output.find('{')
        if idx >= 0:
            data = json.loads(output[idx:])
            if data.get('success') and data.get('results'):
                url = data['results'][0]['original_url']
                results[pid] = url
                print(f"  OK: {url}", flush=True)
            else:
                results[pid] = None
                print(f"  FAIL: no results", flush=True)
        else:
            results[pid] = None
            print(f"  FAIL: no JSON found", flush=True)
    except Exception as e:
        results[pid] = None
        print(f"  ERROR: {e}", flush=True)
    
    time.sleep(0.5)  # Small delay between searches

# Write results
outfile = "/home/z/my-project/scripts/image-results-final.txt"
with open(outfile, 'w') as f:
    for pid, url in results.items():
        f.write(f"{pid}|{url or 'MISSING'}\n")

print(f"\n=== DONE ===")
print(f"Found {sum(1 for v in results.values() if v)} / {len(PRODUCTS)} images")
print(f"Results saved to {outfile}")
