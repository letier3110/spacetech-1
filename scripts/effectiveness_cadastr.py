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

    # Read json from `../data/configuration/installement_cost.json`
    # get "effectiveness_weight, "name", "total_power", "number_of_panels", "min_roof_area", "warranty_period", "price", "income_per_year", "payback_period"
    # if area_sqm >= min_roof_area, add cost to formula and adjust effectiveness
    # if warranty_period < 10, add cost to formula and adjust effectiveness
    # if price > 10000, add cost to formula and adjust effectiveness
    # if income_per_year < 1000, add cost to formula and adjust effectiveness
    # if payback_period > 10, add cost to formula and adjust
    # if number_of_panels > 10, add cost to formula and adjust

    adjusted_cost = 0
    solar_kit = None
    incremental_step = 0.0004

    with open('../data/configuration/installement_cost.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data")
        # check if area_sqm >= min_roof_area in json_data array, then multiply by item index
        for i, item in enumerate(json_data):
            # area_sqm slice ',' and convert to float
            area = area_sqm * 10000 if unit_area == 'га' else area_sqm
            roof_area = float(item['min_roof_area'].replace(' м2', ''))
            # logging.debug(f"area_sqm: {area}, roof_area: {roof_area}, number_of_panels: {item['number_of_panels']}")
            if (area ) >= roof_area and ((solar_kit is None) or solar_kit['number_of_panels'] < item['number_of_panels']):
                solar_kit = item
                solar_kit['count'] = int(area // roof_area)
                solar_kit['cost'] = float(item['price'].replace('$', '')) * solar_kit['count']
                adjusted_cost = item['number_of_panels'] * incremental_step

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
    effectiveness = effectiveness + (effectiveness * adjusted_cost)
    
    return [max(0, min(1, effectiveness)), solar_kit]  # Ensure effectiveness is between 0 and 1

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

            [effectiveness, solar_kit] = calculate_solar_effectiveness_v2(latitude, longitude, area, unit_area)
            item['effectiveness'] = effectiveness
            item['solar_kit'] = solar_kit
            logging.debug(f"Calculated effectiveness: {effectiveness} for address: {address}")
        except Exception as e:
            logging.error(f"Error processing item: {item}, error: {e}")

    # Write the updated JSON data to '../data/rich/5.json'
    with open('../data/rich/5.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
        logging.debug(f"Written updated JSON data to '../data/rich/5.json'")

if __name__ == "__main__":
    main()