# read data from '../data/rich/1.json' and write to '../data/rich/2.json'
# data is like this: 
# 1. inside json extract array of objects with address and area
# 2. query openstreetmap for latitude and longitude of each address
# 3. write to json file extended data with latitude and longitude

import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_lat_long(address):
    logging.debug(f"Querying latitude and longitude for address: {address}")
    url = 'https://nominatim.openstreetmap.org/search'
    # remove start of the string 'м.Славутич, ', change to 'Славутич, '
    address = address.replace('м.', '')
    params = {
        'q': address,
        'format': 'json'
    }
    headers = {
        'User-Agent': 'Spacetech/1.0'
    }
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()  # Raise an error for bad status codes
    data = response.json()

    if data:
        logging.debug(f"Received data: {data[0]}")
        return data[0]['lat'], data[0]['lon']
    else:
        logging.debug("No data found for the address")
        return None, None

def main():
    # Read data from '../data/rich/1.json'
    with open('../data/rich/1.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data: {json_data}")

    # Add latitude and longitude to each address
    for item in json_data:
        address = item['address']
        lat, lon = get_lat_long(address)
        # try to get latitude and longitude
        # try :
        #     lat, lon = get_lat_long(address)
        # except requests.exceptions.RequestException as e:
        #     logging.error(f"Failed to get latitude and longitude for address: {address}")
        #     logging.error(f"Error: {e}")
        #     lat = None
        #     lon = None
        if lat and lon:
            item['latitude'] = lat
            item['longitude'] = lon
        else:
            item['latitude'] = 'Not found'
            item['longitude'] = 'Not found'
        logging.debug(f"Updated item: {item}")

    # Write the updated JSON data to '../data/rich/2.json'
    with open('../data/rich/2.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
        logging.debug(f"Written updated JSON data to '../data/rich/2.json'")

if __name__ == "__main__":
    main()