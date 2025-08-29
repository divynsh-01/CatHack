# File: ml/scripts/precompute_breakdown_stats.py

import pandas as pd
import joblib
import os

print("--- Starting Breakdown Model Stats Pre-computation ---")

# --- Step 1: Load the Clean Data ---
try:
    df = pd.read_csv('../data/processed/rental_data_clean.csv')
    print("Successfully loaded rental_data_clean.csv")
except FileNotFoundError:
    print("Error: rental_data_clean.csv not found!")
    exit()

# List of key numerical features to check for extreme outliers
FEATURES_TO_CHECK = [
    'Manufacture_Year', 'Operating_Hours', 'Idle_Hours', 'Fuel_Consumed_Liters',
    'Fuel_Efficiency_L_per_hr', 'Distance_Traveled_km', 'Load_Cycles',
    'Engine_Temp_Max', 'Hydraulic_Pressure_Max', 'Rental_Cost_USD',
    'Rental_Duration_Days', 'Planned_Duration_Days', 'Overdue_Days',
    'Equipment_Age_Years', 'Utilization_Rate'
]

X = df[FEATURES_TO_CHECK]

# Calculate mean and standard deviation
mean = X.mean().to_dict()
std = X.std().to_dict()

# Save the stats in a dictionary
stats = {'mean': mean, 'std': std}

# Save the stats to a new file
stats_path = '../models/breakdown_stats.pkl'
joblib.dump(stats, stats_path)

print(f"\nBreakdown model statistics saved successfully to: {stats_path}")
print("--- Script Finished ---")