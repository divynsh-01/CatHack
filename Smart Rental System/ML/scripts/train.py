import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
from imblearn.over_sampling import SMOTE

print("--- Starting Model Training Script (Correct Version) ---")

# --- Step 1: Load the Clean Data (with 5 new rows) ---
df = pd.read_csv('../data/processed/rental_data_clean.csv')

# --- Step 2: Define Features (X) and Target (y) ---
df['Breakdown_Occurred'] = (df['Breakdowns'] > 0).astype(int)
y = df['Breakdown_Occurred']
features = df.drop(columns=[
    'Equipment_ID', 'Customer_ID', 'CheckOut_Date', 'Planned_Return_Date',
    'CheckIn_Date', 'Rental_Status', 'Breakdowns', 'Breakdown_Occurred',
    'Overdue_Fine_USD', 'Total_Bill_USD'
])
X = features

# --- Step 3: Prepare Data for Modeling (Encoding) ---
X = pd.get_dummies(X, drop_first=True)

# --- Step 4: Split Data into Training and Testing Sets ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# --- Step 5: Apply SMOTE to the Training Data ---
# This simple SMOTE will now work perfectly with the new data
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
print(f"Training data balanced with SMOTE: {y_train_resampled.value_counts().to_dict()}")

# --- Step 6: Train a RandomForest Model ---
print("Training the RandomForestClassifier model...")
# Use the original 'balanced' setting. It is the best choice now.
model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
model.fit(X_train_resampled, y_train_resampled)
print("Model training complete.")

# --- Step 7: Evaluate the Model ---
print("\n--- Model Evaluation ---")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy on Test Set: {accuracy:.4f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# --- Step 8: Save the Final Trained Model ---
model_path = '../models/rental_predictor.pkl'
joblib.dump(model, model_path)
print(f"\nModel saved successfully to: {model_path}")
print("--- Script Finished ---")