# read data from '../data/raw/2.ini' and write to '../data/rich/4.json'
# data is like this: 
# 1. get each line from file and store it as `id`
# 2. fetch https://kadastr.live/api/parcels/{id}/history/
# 3. receive response as JSON, get fields `.geometry.coordinates`, `.cadnum` and `.area`, `.unit_area`, `.address`
# 4. write to json file

from typing import List
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def fetch_parcel_history(parcel_id):
    url = f'https://kadastr.live/api/parcels/{parcel_id}/history/'
    logging.debug(f"Fetching data for parcel ID: {parcel_id}")
    response = requests.get(url)
    response.raise_for_status()  # Raise an error for bad status codes
    data = response.json()
    logging.debug(f"Received data for parcel ID {parcel_id}")
    return data

def main():
    # Read data from '../data/raw/2.ini'
    with open('../data/raw/2.ini', 'r', encoding='utf-8') as f:
        parcel_ids = [line.strip() for line in f if line.strip()]
        logging.debug(f"Loaded parcel IDs: {parcel_ids}")

    # provide type for results
    results = [] # type: List[dict]

    # Process each parcel ID
    for parcel_id in parcel_ids:
        try:
            data = fetch_parcel_history(parcel_id) # type: List[dict]
            logging.debug(f"Processing record for parcel ID {parcel_id}")
            result = {} # type: dict
            result['coordinates'] = data['geometry']['coordinates'] # [[[[lon, lat]]]]
            # unwrap one level of array
            result['coordinates'] = result['coordinates'][0]

            result['type'] = data['geometry']['type']
            result['cadnum'] = data['cadnum']
            result['area'] = data['area']
            result['unit_area'] = data['unit_area']
            result['address'] = data['address']
            results.append(result)
            logging.debug(f"Processed record for parcel ID {parcel_id}: {result}")
        except Exception as e:
            logging.error(f"Error processing parcel ID {parcel_id}: {e}")

    # Write the results to '../data/rich/4.json'
    with open('../data/rich/4.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
        logging.debug(f"Written updated JSON data to '../data/rich/4.json'")

if __name__ == "__main__":
    main()