# read data from '../data/rich/2.json' and write to '../data/rich/3.json'
# data is like this: [{ "address": string, "area": "701,30","latitude": string,"longitude": string,}]
# 1. read each object properties from file
# 2. calculate solar effectiveness with area, latitude, longitude
# 3. write to json file

import pandas as pd
import numpy as np
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Example function to calculate solar effectiveness with more factors
def calculate_solar_effectiveness_v2(latitude, longitude, area_sqm, area_slope=0, azimuth=180, month=1, panel_age=0, temperature=20, shading_factor=1.0):
    # Constants for the example
    BASE_IRRADIANCE = 100000  # in W/m^2, example constant value
    PANEL_EFFICIENCY = 0.18  # Example panel efficiency
    INVERTER_EFFICIENCY = 0.95  # Example inverter efficiency
    TEMPERATURE_COEFFICIENT = -0.004  # Efficiency loss per degree above 25°C
    DEGRADATION_RATE = 0.005  # Annual degradation rate

    # Simplified irradiance calculation based on latitude and month (seasonal variation)
    seasonal_factor = np.cos(np.radians(latitude)) * (1 + 0.1 * np.cos(2 * np.pi * (month - 1) / 12))
    irradiance = BASE_IRRADIANCE * seasonal_factor

    # Read json from `../data/configuration/installement_cost.json`
    # get "effectiveness_weight, "name", "total_power", "number_of_panels", "min_roof_area", "warranty_period", "price", "income_per_year", "payback_period"
    # if area_sqm >= min_roof_area, add cost to formula and adjust effectiveness
    # if warranty_period < 10, add cost to formula and adjust effectiveness
    # if price > 10000, add cost to formula and adjust effectiveness
    # if income_per_year < 1000, add cost to formula and adjust effectiveness
    # if payback_period > 10, add cost to formula and adjust
    # if number_of_panels > 10, add cost to formula and adjust

    adjusted_cost = 0
    incremental_step = 0.06

    with open('../data/configuration/installement_cost.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data: {json_data}")
        # check if area_sqm >= min_roof_area in json_data array, then multiply by item index
        for i, item in enumerate(json_data):
            # area_sqm slice ',' and convert to float
            # area = float(area_sqm.replace(',', '.'))
            roof_area = float(item['min_roof_area'].replace(' м2', ''))
            if (area_sqm) >= roof_area:
                adjusted_cost = i * incremental_step

    # Adjust for orientation and slope
    orientation_factor = np.cos(np.radians(area_slope)) * np.cos(np.radians(azimuth - 180))

    # Calculate temperature effect
    temp_factor = 1 + TEMPERATURE_COEFFICIENT * (temperature - 25)

    # Calculate degradation factor
    degradation_factor = (1 - DEGRADATION_RATE) ** panel_age

    # Calculate collected energy
    collected_energy = irradiance * area_sqm * orientation_factor * PANEL_EFFICIENCY * temp_factor * degradation_factor * shading_factor * INVERTER_EFFICIENCY

    # Normalize effectiveness to a value between 0 and 1 (for example purposes)
    effectiveness = (collected_energy / (BASE_IRRADIANCE * area_sqm * PANEL_EFFICIENCY))
    effectiveness = effectiveness - effectiveness * (incremental_step * len(json_data)) + (effectiveness * adjusted_cost)

    # effectiveness -= adjusted_cost
    
    return max(0, min(1, effectiveness))  # Ensure effectiveness is between 0 and 1

def main():
    # Read data from '../data/rich/2.json'
    with open('../data/rich/2.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data: {json_data}")

    # Process each object and calculate solar effectiveness
    for item in json_data:
        try:
            address = item['address']
            area = float(item['area'].replace(',', '.'))
            try:
                latitude = float(item['latitude'])
                longitude = float(item['longitude'])
            except ValueError:
                logging.error(f"Invalid latitude or longitude for address: {address}")
                continue
            
            logging.debug(f"Processing address: {address}, area: {area}, latitude: {latitude}, longitude: {longitude}")

            effectiveness = calculate_solar_effectiveness_v2(latitude, longitude, area)
            item['effectiveness'] = effectiveness
            logging.debug(f"Calculated effectiveness: {effectiveness} for address: {address}")
        except Exception as e:
            logging.error(f"Error processing item: {item}, error: {e}")

    # Write the updated JSON data to '../data/rich/3.json'
    with open('../data/rich/3.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
        logging.debug(f"Written updated JSON data to '../data/rich/3.json'")

if __name__ == "__main__":
    main()