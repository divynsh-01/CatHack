import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import lightgbm as lgb # We will use the LightGBM Regressor
import joblib
import os
import numpy as np

print("--- Starting Price Optimization Model Training Script ---")

# --- Step 1: Load the Clean Data ---
try:
    df = pd.read_csv('../data/processed/rental_data_clean.csv')
    print("Successfully loaded rental_data_clean.csv")
except FileNotFoundError:
    print("Error: rental_data_clean.csv not found!")
    exit()

# --- Step 2: Define Features (X) and Target (y) ---
# The 'target' is what we want to predict.
y = df['Rental_Cost_USD']

# The 'features' are the data we use to make the prediction.
# We will select columns that would logically influence price.
# We exclude identifiers, dates, and post-rental outcomes.
features = df.drop(columns=[
    'Equipment_ID', 'Customer_ID', 'CheckOut_Date', 'Planned_Return_Date',
    'CheckIn_Date', 'Rental_Status', 'Breakdowns', 'Rental_Cost_USD',
    'Overdue_Fine_USD', 'Total_Bill_USD'
])
X = features
print(f"Features selected for training: {list(X.columns)}")

# --- Step 3: Prepare Data for Modeling (Encoding) ---
# Convert categorical columns into numbers using one-hot encoding.
X = pd.get_dummies(X, drop_first=True)

# --- Step 4: Split Data into Training and Testing Sets ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Data split into training ({len(X_train)} rows) and testing ({len(X_test)} rows) sets.")

# --- Step 5: Train a LightGBM Regression Model ---
print("Training the LightGBM Regressor model...")
# We use LGBMRegressor for predicting a continuous value
model = lgb.LGBMRegressor(random_state=42)
model.fit(X_train, y_train)
print("Model training complete.")

# --- Step 6: Evaluate the Model ---
print("\n--- Model Evaluation ---")
y_pred = model.predict(X_test)

# We use different metrics for regression models
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"Root Mean Squared Error (RMSE): ${rmse:.2f}")
print(f"R-squared (R²): {r2:.2f}")
print("\nInterpretation:")
print(f"The RMSE means our model's price predictions are, on average, off by about ${rmse:.2f}.")
print(f"An R² of {r2:.2f} means our model explains about {r2:.0%} of the variance in the rental prices, which is a good score.")

# --- Step 7: Save the Trained Model ---
# We will save this new model with a different name.
model_path = '../models/price_predictor.pkl'
joblib.dump(model, model_path)
print(f"\nPrice prediction model saved successfully to: {model_path}")
print("--- Script Finished ---")