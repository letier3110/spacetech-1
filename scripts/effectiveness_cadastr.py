# read data from '../data/rich/4.json' and write to '../data/rich/5.json'
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
def calculate_solar_effectiveness_v2(latitude, longitude, area_sqm, unit_area="га", area_slope=0, azimuth=180, month=1, panel_age=0, temperature=20, shading_factor=1.0):
    # Constants for the example
    BASE_IRRADIANCE = 100000  # in W/m^2, example constant value
    PANEL_EFFICIENCY = 0.18  # Example panel efficiency
    INVERTER_EFFICIENCY = 0.95  # Example inverter efficiency
    TEMPERATURE_COEFFICIENT = -0.004  # Efficiency loss per degree above 25°C
    DEGRADATION_RATE = 0.005  # Annual degradation rate

    # Simplified irradiance calculation based on latitude and month (seasonal variation)
    seasonal_factor = np.cos(np.radians(latitude)) * (1 + 0.1 * np.cos(2 * np.pi * (month - 1) / 12))
    irradiance = BASE_IRRADIANCE * seasonal_factor

    # Adjust for orientation and slope
    orientation_factor = np.cos(np.radians(area_slope)) * np.cos(np.radians(azimuth - 180))

    # Calculate temperature effect
    temp_factor = 1 + TEMPERATURE_COEFFICIENT * (temperature - 25)

    # Calculate degradation factor
    degradation_factor = (1 - DEGRADATION_RATE) ** panel_age

    # Calculate collected energy
    collected_energy = irradiance * area_sqm * orientation_factor * PANEL_EFFICIENCY * temp_factor * degradation_factor * shading_factor * INVERTER_EFFICIENCY

    # Normalize effectiveness to a value between 0 and 1 (for example purposes)
    effectiveness = collected_energy / (BASE_IRRADIANCE * area_sqm * PANEL_EFFICIENCY)
    
    return max(0, min(1, effectiveness))  # Ensure effectiveness is between 0 and 1

def main():
    # Read data from '../data/rich/4.json'
    with open('../data/rich/4.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data: {json_data}")

    # Process each object and calculate solar effectiveness
    for item in json_data:
        try:
            address = item['address']
            unit_area = item['unit_area']
            area = float(item['area'].replace(',', '.'))
            try:
                latitude = float(item['coordinates'][0][0][1])
                longitude = float(item['coordinates'][0][0][0])
            except ValueError:
                logging.error(f"Invalid latitude or longitude for address: {address}")
                continue
            
            logging.debug(f"Processing address: {address}, area: {area}, latitude: {latitude}, longitude: {longitude}")

            effectiveness = calculate_solar_effectiveness_v2(latitude, longitude, area, unit_area)
            item['effectiveness'] = effectiveness
            logging.debug(f"Calculated effectiveness: {effectiveness} for address: {address}")
        except Exception as e:
            logging.error(f"Error processing item: {item}, error: {e}")

    # Write the updated JSON data to '../data/rich/5.json'
    with open('../data/rich/5.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
        logging.debug(f"Written updated JSON data to '../data/rich/5.json'")

if __name__ == "__main__":
    main()