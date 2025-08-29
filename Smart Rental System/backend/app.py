from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
from datetime import timedelta
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# --- 1. Load All Models & Data ---
print("--- Loading all models and data ---")
breakdown_model, price_model, df, LATEST_DATE = None, None, None, None
demand_forecasters, anomaly_detectors = {}, {}

# ... (all model and data loading code remains the same)
try:
    BREAKDOWN_MODEL_PATH = os.path.join('..', 'ml', 'models', 'rental_predictor.pkl')
    breakdown_model = joblib.load(BREAKDOWN_MODEL_PATH)
    print("Breakdown model loaded.")
except Exception as e: print(f"Error loading breakdown model: {e}")
try:
    PRICE_MODEL_PATH = os.path.join('..', 'ml', 'models', 'price_predictor.pkl')
    price_model = joblib.load(PRICE_MODEL_PATH)
    print("Price model loaded.")
except Exception as e: print(f"Error loading price model: {e}")

EQUIPMENT_TYPES = ['Bulldozer', 'Crane', 'DumpTruck', 'Excavator', 'Loader']
for equipment in EQUIPMENT_TYPES:
    path = f'../ml/models/demand_forecaster_{equipment}.pkl'
    try:
        demand_forecasters[equipment] = joblib.load(path)
        print(f"Demand forecaster for {equipment} loaded.")
    except Exception as e: print(f"Could not load demand forecaster for {equipment}: {e}")
for equipment in EQUIPMENT_TYPES:
    path = f'../ml/models/anomaly_detector_{equipment}.pkl'
    try:
        anomaly_detectors[equipment] = joblib.load(path)
        print(f"Anomaly detector for {equipment} loaded.")
    except Exception as e: print(f"Could not load anomaly detector for {equipment}: {e}")

# ... (after loading other models)
breakdown_stats = None
try:
    STATS_PATH = os.path.join('..', 'ml', 'models', 'breakdown_stats.pkl')
    breakdown_stats = joblib.load(STATS_PATH)
    print("Breakdown stats loaded.")
except Exception as e: print(f"Could not load breakdown stats: {e}")

try:
    DATA_PATH = os.path.join('..', 'ml', 'data', 'processed', 'rental_data_clean.csv')
    df = pd.read_csv(DATA_PATH, parse_dates=['CheckOut_Date', 'CheckIn_Date', 'Planned_Return_Date'])
    LATEST_DATE = df['CheckOut_Date'].max()
    print(f"Logic will be based on the latest data point: {LATEST_DATE.strftime('%Y-%m-%d')}")
except Exception as e: print(f"Could not load data for asset status: {e}")
print("--- Loading complete ---")


# --- 2. Define Model Columns ---
# ... (model column lists are unchanged)
BREAKDOWN_MODEL_COLUMNS = ['Manufacture_Year', 'Operating_Hours', 'Idle_Hours', 'Fuel_Consumed_Liters', 'Fuel_Efficiency_L_per_hr', 'Distance_Traveled_km', 'Load_Cycles', 'Engine_Temp_Max', 'Hydraulic_Pressure_Max', 'Rental_Cost_USD', 'Rental_Duration_Days', 'Planned_Duration_Days', 'Overdue_Days', 'Equipment_Age_Years', 'Utilization_Rate', 'Type_Crane', 'Type_DumpTruck', 'Type_Excavator', 'Type_Loader', 'Model_320D2', 'Model_323D3', 'Model_330C', 'Model_336D2', 'Model_350C', 'Model_773G', 'Model_775G', 'Model_777G', 'Model_950GC', 'Model_966GC', 'Model_980M', 'Model_D6R2', 'Model_D7R2', 'Model_D8T', 'GPS_Location_Site_B', 'GPS_Location_Site_C', 'GPS_Location_Site_D', 'GPS_Location_Site_E', 'GPS_Location_Site_F', 'Maintenance_Flag_Yes']
PRICE_MODEL_COLUMNS = ['Manufacture_Year', 'Operating_Hours', 'Idle_Hours', 'Fuel_Consumed_Liters', 'Fuel_Efficiency_L_per_hr', 'Distance_Traveled_km', 'Load_Cycles', 'Engine_Temp_Max', 'Hydraulic_Pressure_Max', 'Rental_Duration_Days', 'Planned_Duration_Days', 'Overdue_Days', 'Equipment_Age_Years', 'Utilization_Rate', 'Type_Crane', 'Type_DumpTruck', 'Type_Excavator', 'Type_Loader', 'Model_320D2', 'Model_323D3', 'Model_330C', 'Model_336D2', 'Model_350C', 'Model_773G', 'Model_775G', 'Model_777G', 'Model_950GC', 'Model_966GC', 'Model_980M', 'Model_D6R2', 'Model_D7R2', 'Model_D8T', 'GPS_Location_Site_B', 'GPS_Location_Site_C', 'GPS_Location_Site_D', 'GPS_Location_Site_E', 'GPS_Location_Site_F', 'Maintenance_Flag_Yes']
ANOMALY_FEATURES = ['Operating_Hours','Idle_Hours','Fuel_Consumed_Liters','Fuel_Efficiency_L_per_hr','Load_Cycles','Utilization_Rate']


# --- 3. API Endpoints ---
@app.route('/')
def home():
    return "Smart Rental API is running. All features are implemented."

# ... (all previous endpoints are unchanged)
@app.route('/asset_status', methods=['GET'])
def asset_status():
    if df is None: return jsonify({'error': 'Data not available.'}), 500
    last_rentals = df.sort_values('CheckOut_Date').groupby('Equipment_ID').last()
    statuses = []
    for index, row in last_rentals.iterrows():
        status = 'Idle'; customer_id = 'N/A'; planned_return = 'N/A'; last_returned_on = row['CheckIn_Date'].strftime('%Y-%m-%d')
        if LATEST_DATE < row['CheckIn_Date']:
            status = 'Active'; customer_id = row['Customer_ID']; planned_return = row['Planned_Return_Date'].strftime('%Y-%m-%d'); last_returned_on = 'N/A'
        statuses.append({'Equipment_ID': row.name,'Status': status,'Type': row['Type'],'Model': row['Model'],'Equipment_Age_Years': row['Equipment_Age_Years'],'Last_Known_Location': row['GPS_Location'],'Current_Customer_ID': customer_id,'Planned_Return_Date': planned_return,'Last_Returned_On': last_returned_on,'Last_Operating_Hours': row['Operating_Hours'],'Last_Utilization_Rate': f"{row['Utilization_Rate']:.2%}",'Breakdowns_on_Last_Rental': row['Breakdowns']})
    return jsonify({'status_date': LATEST_DATE.strftime('%Y-%m-%d'),'asset_count': len(statuses),'assets': statuses})

@app.route('/asset_history/<equipment_id>', methods=['GET'])
def asset_history(equipment_id):
    if df is None: return jsonify({'error': 'Data not available.'}), 500
    asset_df = df[df['Equipment_ID'] == equipment_id]
    if asset_df.empty: return jsonify({'error': f'No history for ID: {equipment_id}'}), 404
    summary = {'total_rentals': len(asset_df), 'total_rental_days': int(asset_df['Rental_Duration_Days'].sum()), 'total_operating_hours': int(asset_df['Operating_Hours'].sum()), 'total_idle_hours': int(asset_df['Idle_Hours'].sum()), 'total_fuel_consumed_liters': round(float(asset_df['Fuel_Consumed_Liters'].sum()), 2), 'lifetime_breakdowns': int(asset_df['Breakdowns'].sum()), 'rentals_per_site': asset_df.groupby('GPS_Location').size().to_dict()}
    rental_history = asset_df.sort_values('CheckOut_Date', ascending=False).to_dict(orient='records')
    for record in rental_history:
        for key, value in record.items():
            if isinstance(value, pd.Timestamp): record[key] = value.strftime('%Y-%m-%d')
    return jsonify({'equipment_id': equipment_id, 'summary': summary, 'rental_history': rental_history})

@app.route('/underutilized_assets', methods=['GET'])
def underutilized_assets():
    if df is None: return jsonify({'error': 'Data not available.'}), 500
    try:
        threshold = float(request.args.get('threshold', 0.5))
    except ValueError: return jsonify({'error': 'Invalid threshold value.'}), 400
    avg_utilization = df.groupby('Equipment_ID')['Utilization_Rate'].mean().reset_index()
    underutilized = avg_utilization[avg_utilization['Utilization_Rate'] < threshold]
    last_known_details = df.sort_values('CheckOut_Date').groupby('Equipment_ID').last().reset_index()
    result_df = pd.merge(underutilized, last_known_details[['Equipment_ID', 'Type', 'Model', 'GPS_Location']], on='Equipment_ID')
    result_df.rename(columns={'Utilization_Rate': 'Average_Utilization_Rate'}, inplace=True)
    result_df['Average_Utilization_Rate'] = result_df['Average_Utilization_Rate'].apply(lambda x: f"{x:.2%}")
    return jsonify({'threshold': f"<{threshold:.0%}",'count': len(result_df),'underutilized_assets': result_df.to_dict(orient='records')})

# --- NEW Endpoint for Return Reminders ---
@app.route('/returns_due_soon', methods=['GET'])
def returns_due_soon():
    if df is None:
        return jsonify({'error': 'Data for calculation not available.'}), 500

    try:
        # Get the reminder window in days from the query parameters, default to 7
        days_out = int(request.args.get('days_out', 7))
    except ValueError:
        return jsonify({'error': 'Invalid days_out value. Must be an integer.'}), 400

    # Define the time window for reminders
    start_date = LATEST_DATE
    end_date = LATEST_DATE + timedelta(days=days_out)

    # Find all "Active" rentals first
    active_rentals = df[df['CheckIn_Date'] > LATEST_DATE]
    
    # Now, filter those for the ones due back in our time window
    due_soon = active_rentals[
        (active_rentals['Planned_Return_Date'] >= start_date) &
        (active_rentals['Planned_Return_Date'] <= end_date)
    ]
    
    # Select and format the relevant columns for the response
    result = due_soon[[
        'Equipment_ID', 'Type', 'Model', 'Customer_ID', 'GPS_Location', 'Planned_Return_Date'
    ]].copy()
    
    result['Planned_Return_Date'] = result['Planned_Return_Date'].dt.strftime('%Y-%m-%d')
    
    return jsonify({
        'reminder_window_days': days_out,
        'from_date': start_date.strftime('%Y-%m-%d'),
        'to_date': end_date.strftime('%Y-%m-%d'),
        'count': len(result),
        'assets_due_for_return': result.to_dict(orient='records')
    })


@app.route('/predict_breakdown', methods=['POST'])
def predict_breakdown():
    if breakdown_model is None: return jsonify({'error': 'Breakdown model not loaded.'}), 500
    if breakdown_stats is None: return jsonify({'error': 'Breakdown stats not loaded.'}), 500

    json_data = request.get_json()
    
    # --- NEW Blended Approach ---
    # 1. Calculate the statistical risk score
    means = breakdown_stats['mean']
    stds = breakdown_stats['std']
    max_z_score = 0.0

    for feature, value in json_data.items():
        if feature in means and feature in stds and stds[feature] > 0:
            z_score = abs((value - means[feature]) / stds[feature])
            if z_score > max_z_score:
                max_z_score = z_score

    # Convert the max_z_score to a probability (0% at z=2.5, 95% at z=5.0)
    stat_prob = 0.0
    if max_z_score > 2.5:
        # Scale the probability between a Z-score of 2.5 and 5.0
        stat_prob = (max_z_score - 2.5) / (5.0 - 2.5)
        stat_prob = min(stat_prob, 1.0) # Ensure it doesn't exceed 1.0
        stat_prob = stat_prob * 0.95 # Cap the influence at 95%

    # 2. Calculate the ML model's risk score
    data = pd.DataFrame(json_data, index=[0])
    data_encoded = pd.get_dummies(data)
    data_processed = data_encoded.reindex(columns=BREAKDOWN_MODEL_COLUMNS, fill_value=0)
    ml_prob = breakdown_model.predict_proba(data_processed)[0][1]
    
    # 3. The final probability is the HIGHER of the two scores
    final_prob = max(ml_prob, stat_prob)

    # 4. Return the blended result
    prediction = 1 if final_prob > 0.5 else 0
    prediction_text = 'Likely Breakdown' if prediction == 1 else 'No Breakdown Likely'
    
    return jsonify({
        'prediction': prediction,
        'prediction_text': prediction_text,
        'breakdown_probability': f'{final_prob:.2%}'
    })

@app.route('/predict_price', methods=['POST'])
# ...
def predict_price():
    if price_model is None: return jsonify({'error': 'Price model not loaded.'}), 500
    try:
        json_data = request.get_json()
        data = pd.DataFrame(json_data, index=[0])
        data_encoded = pd.get_dummies(data)
        data_processed = data_encoded.reindex(columns=PRICE_MODEL_COLUMNS, fill_value=0)
        prediction = price_model.predict(data_processed)
        return jsonify({'predicted_price_usd': round(prediction[0], 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/forecast_demand', methods=['POST'])
# ...
def forecast_demand():
    try:
        json_data = request.get_json()
        equipment_type = json_data.get('equipment_type')
        periods = int(json_data.get('periods', 30))
        if not equipment_type or equipment_type not in demand_forecasters:
            return jsonify({'error': 'Invalid or missing equipment_type.'}), 400
        model = demand_forecasters[equipment_type]
        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
        forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')
        forecast_data = forecast_data.to_dict(orient='records')
        return jsonify({'equipment_type': equipment_type,'forecast': forecast_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/detect_anomaly', methods=['POST'])
def detect_anomaly():
    try:
        json_data = request.get_json()
        equipment_type = json_data.get('Type')
        
        if not equipment_type or equipment_type not in anomaly_detectors:
            return jsonify({'error': 'Invalid or missing equipment_Type.'}), 400

        # Load the pre-calculated statistics (mean and std dev)
        stats = anomaly_detectors[equipment_type]
        means = stats['mean']
        stds = stats['std']
        
        # Define the threshold for anomaly (3 standard deviations from the mean)
        Z_SCORE_THRESHOLD = 3.0

        for feature in ANOMALY_FEATURES:
            value = json_data.get(feature, means[feature]) # Default to mean if missing
            
            # Avoid division by zero if a feature has no variance
            if stds[feature] == 0:
                continue

            # Calculate the Z-score
            z_score = (value - means[feature]) / stds[feature]
            
            # If ANY feature is an outlier, it's an anomaly
            if abs(z_score) > Z_SCORE_THRESHOLD:
                return jsonify({
                    'equipment_type': equipment_type,
                    'is_anomaly': True,
                    'result_text': f'Anomalous Usage Detected: {feature} is abnormal'
                })

        # If all features are within the normal range
        return jsonify({
            'equipment_type': equipment_type,
            'is_anomaly': False,
            'result_text': 'Normal Usage'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)