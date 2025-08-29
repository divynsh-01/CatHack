import { useState } from 'react';

// This is a React component for our prediction form.
function PredictorPage() {
  // --- State Management ---
  // Store the data from the form inputs with initial default values
  const [formData, setFormData] = useState({
    Type: 'Excavator',
    Model: '320D2',
    Manufacture_Year: 2020,
    Operating_Hours: 100,
    Idle_Hours: 20,
    Fuel_Consumed_Liters: 1100,
    Fuel_Efficiency_L_per_hr: 11,
    Distance_Traveled_km: 50,
    Load_Cycles: 300,
    GPS_Location: 'Site_A',
    Maintenance_Flag: 'No',
    Engine_Temp_Max: 95,
    Hydraulic_Pressure_Max: 340,
    Rental_Cost_USD: 5000,
    Rental_Duration_Days: 10,
    Planned_Duration_Days: 10,
    Overdue_Days: 0,
    Equipment_Age_Years: 5,
    Utilization_Rate: 0.83,
  });

  // Store the prediction result from the API
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // --- Event Handlers ---
  // This function updates our formData state whenever an input changes.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert input to a number if it's a numeric field, otherwise keep as text
    const isNumber = e.target.type === 'number';
    setFormData(prevState => ({
      ...prevState,
      [name]: isNumber ? Number(value) : value
    }));
  };

  // This function is called when the form is submitted.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser from reloading the page
    setLoading(true);
    setPredictionResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict_breakdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      const result = await response.json();
      setPredictionResult(result); // Save the prediction result
    } catch (error) {
      console.error("Prediction failed:", error);
      setPredictionResult({ prediction_text: 'Error', breakdown_probability: 'Could not get prediction.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic (JSX) ---
  return (
    <section>
      <h2>Predictive Maintenance</h2>
      <form onSubmit={handleSubmit} className="predictor-form">
        <div className="form-grid">
          {/* We'll use Object.keys to dynamically create an input for each piece of data */}
          {Object.keys(formData).map(key => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{key.replace(/_/g, ' ')}</label>
              <input
                type={typeof formData[key] === 'number' ? 'number' : 'text'}
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
                required
              />
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Predicting...' : 'Get Prediction'}
          </button>
        </div>
      </form>

      {predictionResult && (
        <div className="prediction-result">
          <h3>Prediction Result</h3>
          <p>
            <strong>Status:</strong>
            <span className={predictionResult.prediction === 1 ? 'status-active' : 'status-idle'}>
              {` ${predictionResult.prediction_text}`}
            </span>
          </p>
          <p><strong>Breakdown Probability:</strong> {predictionResult.breakdown_probability}</p>
        </div>
      )}
    </section>
  );
}

export default PredictorPage;