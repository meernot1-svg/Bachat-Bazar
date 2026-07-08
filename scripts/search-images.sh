#!/bin/bash
# Batch search for product images using z-ai image-search
# Each line: PRODUCT_ID|QUERY
# Output: PRODUCT_ID|IMAGE_URL

QUERIES=(
  "92|vegetable chopper dicer 12 in 1 kitchen tool product photo"
  "93|digital kitchen scale 5kg precision food scale product"
  "94|electric milk frother handheld USB rechargeable product"
  "95|silicone food storage bags reusable eco friendly product"
  "96|electric egg boiler 7 egg capacity kitchen appliance product"
  "97|stainless steel spice rack rotating 16 jars product photo"
  "98|portable mini blender USB rechargeable 380ml product"
  "99|air fryer 4.5L digital touch screen kitchen appliance product"
  "100|collapsible dish drainer rack foldable kitchen product"
  "101|resistance bands set 5 levels fitness exercise product"
  "102|adjustable dumbbell set 20kg with case fitness product"
  "103|yoga mat premium 6mm non slip TPE fitness product"
  "104|wireless skipping rope digital counter fitness product"
  "105|ab roller wheel with knee pad fitness product photo"
  "106|push up board 9 in 1 foldable fitness product"
  "107|digital Quran pen reader Islamic product photo"
  "108|digital tasbeeh counter bracelet wristband Islamic product"
  "109|Islamic calligraphy wall art canvas set of 3 product"
  "110|prayer rug janamaz with compass Islamic product"
  "111|halal nail polish breathable 6 color set product"
  "112|non stick cookware set 7 pieces glass lids product"
  "113|electric kettle 1.8L stainless steel fast boil product"
  "114|vegetable peeler set 3 in 1 Y shaped stainless steel product"
  "115|rice dispenser 10kg wall mounted measuring cup product"
  "116|sandwich maker double plate non stick kitchen product"
  "117|TWS wireless earbuds ANC noise cancelling product photo"
  "118|smart watch ultra 2 AMOLED fitness tracker product"
  "119|20000mAh power bank fast charging 22.5W product"
  "120|portable bluetooth speaker IPX7 waterproof product"
  "121|vitamin C serum with hyaluronic acid 30ml skincare product"
  "122|niacinamide 10 zinc 1 percent oil control serum product"
  "123|men charcoal face wash deep cleansing 150ml product"
  "124|hair growth oil rosemary castor blend 120ml product"
  "125|LED facial mask 7 colors photon therapy beauty product"
  "126|lawn 3 piece unstitched suit printed Pakistani women fashion"
  "127|chiffon embroidered dupatta 2.5m women fashion product"
  "128|women crossbody bag faux leather classic product photo"
  "129|shalwar kameez wash and wear unstitched men fashion Pakistan"
  "130|men leather sandal comfort sole product photo"
  "131|magnetic building blocks set 64 pieces kids toy product"
  "132|educational learning tablet for kids bilingual toy product"
  "133|remote control car 4WD off road 1 16 scale toy product"
  "134|rechargeable LED emergency bulb 12W 4 pack product"
  "135|under bed storage organizer with wheels set of 2 product"
  "136|rotating 360 degree makeup organizer large capacity product"
  "137|portable neck fan bladeless USB rechargeable product"
  "138|smart WiFi plug socket remote control product"
  "139|smart watch series 8 heart rate blood oxygen product"
  "140|artificial jewellery set necklace earrings tikka product"
  "141|travel trolley bag hard shell 20 inch cabin size product"
  "142|premium mixed dry fruits 500g gift pack product"
  "143|honey 100 percent pure natural sidr 500ml product"
  "144|portable sewing machine 12 stitch electric product"
  "145|steam iron 1600W non stick soleplate product"
  "146|rechargeable LED desk lamp 3 color modes product"
  "147|clothes steamer handheld portable 700W product"
  "148|mini desktop fan rechargeable 3 speed product"
  "149|foam roller muscle recovery 45cm EVA fitness product"
  "150|hand grip strengthener adjustable 10 60kg product"
  "151|Islamic alarm clock with Azan 500 cities product"
  "152|perfume attar collection 6 pack non alcoholic Islamic product"
)

OUTFILE="/home/z/my-project/scripts/image-results.txt"
> "$OUTFILE"

for entry in "${QUERIES[@]}"; do
  ID="${entry%%|*}"
  QUERY="${entry#*|}"
  echo "Searching ID $ID: $QUERY"
  
  RESULT=$(z-ai image-search -q "$QUERY" --count 1 --gl us --no-rank 2>/dev/null)
  
  # Extract the first original_url from JSON result
  URL=$(echo "$RESULT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success') and data.get('results'):
        print(data['results'][0]['original_url'])
    else:
        print('FAILED')
except:
    print('FAILED')
" 2>/dev/null)
  
  echo "$ID|$URL" >> "$OUTFILE"
  echo "  -> $URL"
  
  # Small delay to avoid rate limiting
  sleep 1
done

echo "=== DONE ==="
echo "Results saved to $OUTFILE"
cat "$OUTFILE"
