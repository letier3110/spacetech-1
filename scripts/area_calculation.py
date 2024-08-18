import json
import pandas as pd

# Load the JSON data
with open('../data/rich/2.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# Convert JSON data to DataFrame
df = pd.DataFrame(json_data)

# Convert 'area' and 'polygons_area' columns to numeric, forcing errors to NaN
df['area'] = df['area'].str.replace(',', '.')
df['area'] = pd.to_numeric(df['area'], errors='coerce')
df['polygons_area'] = pd.to_numeric(df['polygons_area'], errors='coerce')

# Drop rows where either 'area' or 'polygons_area' is NaN
df = df.dropna(subset=['area', 'polygons_area'])

# Calculate the percentage difference
df['area_diff'] = (df['polygons_area'] - df['area']) / df['polygons_area'] * 100

# Remove outliers using the IQR method
Q1 = df['area_diff'].quantile(0.25)
Q3 = df['area_diff'].quantile(0.75)
IQR = Q3 - Q1

# Define the lower and upper bounds for outliers
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Filter out the outliers
df = df[(df['area_diff'] >= lower_bound) & (df['area_diff'] <= upper_bound)]

# Calculate the average percentage difference
average_diff = df['area_diff'].mean()

print(f"Average percentage difference between 'area' and 'polygons_area' (excluding outliers): {average_diff:.2f}%")
