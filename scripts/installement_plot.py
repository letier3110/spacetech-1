import pandas as pd
import matplotlib.pyplot as plt
import json

# JSON data
data = '''
[
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 5 КВТ", "total_power": "5280 Вт", "number_of_panels": 16, "min_roof_area": "27 м2", "warranty_period": "20 років", "price": "$5000", "income_per_year": "~$520", "payback_period": "~9 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 10 КВТ", "total_power": "10230 Вт", "number_of_panels": 31, "min_roof_area": "52 м2", "warranty_period": "20 років", "price": "$9000", "income_per_year": "~$1200", "payback_period": "~7 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 15 КВТ", "total_power": "15180 Вт", "number_of_panels": 46, "min_roof_area": "78 м2", "warranty_period": "20 років", "price": "$14000", "income_per_year": "~$2050", "payback_period": "~6 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 20 КВТ", "total_power": "20130 Вт", "number_of_panels": 61, "min_roof_area": "104 м2", "warranty_period": "20 років", "price": "$18000", "income_per_year": "~$2850", "payback_period": "~6 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 25 КВТ", "total_power": "25080 Вт", "number_of_panels": 76, "min_roof_area": "130 м2", "warranty_period": "20 років", "price": "$23000", "income_per_year": "~$3700", "payback_period": "~6 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 30 КВТ", "total_power": "30030 Вт", "number_of_panels": 91, "min_roof_area": "130 м2", "warranty_period": "20 років", "price": "$25000", "income_per_year": "~$4550", "payback_period": "~5 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 50 КВТ", "total_power": "50160 Вт", "number_of_panels": 152, "min_roof_area": "260 м2", "warranty_period": "20 років", "price": "$40000", "income_per_year": "~$8000", "payback_period": "~5 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 100 КВТ", "total_power": "100320 Вт", "number_of_panels": 304, "min_roof_area": "520 м2", "warranty_period": "20 років", "price": "$60000", "income_per_year": "~$16000", "payback_period": "~3 років"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 3 КВТ", "total_power": "3300 Вт", "number_of_panels": 10, "min_roof_area": "17 м2", "warranty_period": "20 років", "price": "$3500", "income_per_year": "немає (тільки безкоштовна електроенергія)"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 1,5 КВТ", "total_power": "1650 Вт", "number_of_panels": 5, "min_roof_area": "9 м2", "warranty_period": "20 років", "price": "$2500", "income_per_year": "немає (тільки безкоштовна електроенергія)"},
    {"name": "КОМПЛЕКТ СОНЯЧНОЇ ЕЛЕКТРОСТАНЦІЇ 1 КВТ", "total_power": "990 Вт", "number_of_panels": 3, "min_roof_area": "6 м2", "warranty_period": "20 років", "price": "$2000", "income_per_year": "немає (тільки безкоштовна електроенергія)"}
]
'''

# Load data into a pandas DataFrame
df = pd.read_json(data)

# Convert 'total_power' and 'price' to numerical values
df['total_power'] = df['total_power'].str.replace(' Вт', '').astype(int)
df['price'] = df['price'].str.replace('$', '').astype(int)

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(df['total_power'], df['price'], marker='o')
plt.title('Total Power vs. Price')
plt.xlabel('Total Power (Вт)')
plt.ylabel('Price ($)')
plt.grid(True)
plt.show()