import pandas as pd
import numpy as np

# Example function to calculate solar effectiveness with more factors
def calculate_solar_effectiveness_v2(latitude, longitude, area_sqm, area_slope, azimuth, month, panel_age, temperature, shading_factor=1.0):
    # Constants for the example
    BASE_IRRADIANCE = 1000  # in W/m^2, example constant value
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

# Load the dataset
df = pd.read_csv('solar_panels_data_extended.csv')

# Assume additional columns: 'month', 'panel_age', 'temperature', 'shading_factor'
# Calculate effectiveness for each row
df['effectiveness'] = df.apply(lambda row: calculate_solar_effectiveness_v2(
    row['latitude'], row['longitude'], row['area_sqm'], row['area_slope'], row['azimuth'],
    row['month'], row['panel_age'], row['temperature'], row['shading_factor']
), axis=1)

# Save the updated dataset
df.to_csv('solar_panels_data_with_effectiveness_v2.csv', index=False)