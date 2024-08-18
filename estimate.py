# read data from './rich/2.json'
# data is like this: 
# 1. inside json extract array of objects with address and area
# 2. sum all areas
# 3. multiple sum of all areas by 400, output as power=Watts
# 4. multiple sum of all areas by 1, output as cost=USD
# 5. output to console total power and const

import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    # Read data from './rich/2.json'
    with open('./rich/2.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data: {json_data}")

    # Extract array of objects with address and area(parse to float)
    # ERROR: could not convert string to float: '701,30'
    areas = [
        float(item['area'].replace(',', '.')) for item in json_data if 'area' in item
    ]
    logging.debug(f"Extracted areas: {areas}")

    # Sum all areas
    total_area = sum(areas)
    logging.debug(f"Total area: {total_area}")
    total_deployable_area = total_area * 0.8
    logging.debug(f"Total deployable area: {total_deployable_area}")

    # Calculate power and cost
    power = total_deployable_area * 200
    cost = total_deployable_area * 400
    logging.debug(f"Calculated power: {power} Watts")
    logging.debug(f"Calculated cost: {cost} USD")

    # Output to console
    print(f"Total power: {power} Watts")
    print(f"Total cost: {cost} USD")

if __name__ == "__main__":
    main()