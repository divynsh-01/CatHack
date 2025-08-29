import pandas as pd
import joblib
import os

print("--- Starting Anomaly Detection Pre-computation (v3: Z-score) ---")

# --- Step 1: Load the Clean Data ---
try:
    df = pd.read_csv('../data/processed/rental_data_clean.csv')
    print("Successfully loaded rental_data_clean.csv")
except FileNotFoundError:
    print("Error: rental_data_clean.csv not found!")
    exit()

# List of features for anomaly detection
FEATURES = [
    'Operating_Hours', 'Idle_Hours', 'Fuel_Consumed_Liters',
    'Fuel_Efficiency_L_per_hr', 'Load_Cycles', 'Utilization_Rate'
]

equipment_types = df['Type'].unique()
stats_saved = []

# --- Step 2: Calculate and Save Statistics for Each Equipment Type ---
for equipment in equipment_types:
    print(f"\n--- Calculating stats for: {equipment} ---")
    
    equipment_df = df[df['Type'] == equipment]
    X = equipment_df[FEATURES]
    
    if len(X) < 2:
        print(f"Not enough data for {equipment}, skipping.")
        continue

    # Calculate mean and standard deviation for each feature
    mean = X.mean().to_dict()
    std = X.std().to_dict()
    
    # Save the stats in a dictionary
    stats = {'mean': mean, 'std': std}
    
    model_path = f'../models/anomaly_detector_{equipment}.pkl'
    joblib.dump(stats, model_path)
    stats_saved.append(model_path)
    print(f"Statistics for {equipment} calculated and saved.")

print("\n--- All Anomaly Detection Statistics Saved Successfully ---")
print("Statistics saved to:")
for path in stats_saved:
    print(f"- {path}")
print("--- Script Finished ---")