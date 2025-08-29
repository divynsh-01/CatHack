import pandas as pd
from prophet import Prophet
import joblib
import os

print("--- Starting Demand Forecasting Model Training ---")

# --- Step 1: Load the Time-Series Data ---
try:
    df = pd.read_csv('../data/processed/demand_timeseries.csv', index_col='CheckOut_Date', parse_dates=True)
    print("Successfully loaded demand_timeseries.csv")
except FileNotFoundError:
    print("Error: demand_timeseries.csv not found! Please run preprocess_timeseries.py first.")
    exit()

# Get the list of equipment types from the columns
equipment_types = df.columns
models_saved = []

# --- Step 2: Train a Separate Model for Each Equipment Type ---
for equipment in equipment_types:
    print(f"\n--- Training model for: {equipment} ---")
    
    # Prepare the data for Prophet
    # Prophet requires the columns to be named 'ds' (datestamp) and 'y' (value)
    equipment_df = df[[equipment]].reset_index()
    equipment_df.rename(columns={'CheckOut_Date': 'ds', equipment: 'y'}, inplace=True)

    # Initialize and train the Prophet model
    model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=False)
    model.fit(equipment_df)
    
    # --- Step 3: Make a Future Prediction (e.g., 30 days) ---
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    
    print(f"Forecast for the next 5 days for {equipment}:")
    # We show the forecast ('yhat'), and the uncertainty interval ('yhat_lower', 'yhat_upper')
    print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(5))

    # --- Step 4: Save the Trained Model ---
    model_path = f'../models/demand_forecaster_{equipment}.pkl'
    joblib.dump(model, model_path)
    models_saved.append(model_path)

print("\n--- All Demand Forecasting Models Trained Successfully ---")
print("Models saved to:")
for path in models_saved:
    print(f"- {path}")
print("--- Script Finished ---")