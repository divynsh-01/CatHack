import pandas as pd
import os

print("--- Starting Time-Series Data Preparation ---")

# --- Step 1: Load the Clean Data ---
try:
    df = pd.read_csv('../data/processed/rental_data_clean.csv', parse_dates=['CheckOut_Date'])
    print("Successfully loaded rental_data_clean.csv")
except FileNotFoundError:
    print("Error: rental_data_clean.csv not found!")
    exit()

# --- Step 2: Aggregate Data by Day and Equipment Type ---
# We want to count how many rentals of each type started on each day.
# We set the 'CheckOut_Date' as the index for our time-series data.
df.set_index('CheckOut_Date', inplace=True)

# We group by the equipment 'Type' and then resample the data by day ('D'),
# counting the number of entries for each day.
daily_demand = df.groupby('Type').resample('D').size().reset_index(name='rentals')

# --- Step 3: Pivot the Data ---
# The data is currently in a 'long' format. Let's pivot it so each equipment
# type has its own column, which is a more standard format for forecasting.
demand_timeseries = daily_demand.pivot(index='CheckOut_Date', columns='Type', values='rentals').fillna(0)

# Ensure all equipment types are present, even if some have no data on certain days
all_types = df['Type'].unique()
for equip_type in all_types:
    if equip_type not in demand_timeseries.columns:
        demand_timeseries[equip_type] = 0

demand_timeseries = demand_timeseries.astype(int)

print("\n--- Sample of the new time-series data ---")
print(demand_timeseries.head())
print(f"\nTime series created from {demand_timeseries.index.min()} to {demand_timeseries.index.max()}")

# --- Step 4: Save the Time-Series Data ---
output_path = '../data/processed/demand_timeseries.csv'
demand_timeseries.to_csv(output_path)

print(f"\nTime-series data saved successfully to: {output_path}")
print("--- Script Finished ---")