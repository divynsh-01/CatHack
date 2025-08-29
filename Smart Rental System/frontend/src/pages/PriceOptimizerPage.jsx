import { useState } from 'react';

function PriceOptimizerPage() {
  const [formData, setFormData] = useState({
    Type: 'Excavator',
    Model: '320D2',
    Manufacture_Year: 2021,
    Operating_Hours: 80,
    Idle_Hours: 15,
    Fuel_Consumed_Liters: 950,
    Fuel_Efficiency_L_per_hr: 11.8,
    Distance_Traveled_km: 0,
    Load_Cycles: 0,
    GPS_Location: 'Site_C',
    Maintenance_Flag: 'No',
    Engine_Temp_Max: 92,
    Hydraulic_Pressure_Max: 340,
    Rental_Duration_Days: 10,
    Planned_Duration_Days: 10,
    Overdue_Days: 0,
    Equipment_Age_Years: 4,
    Utilization_Rate: 0.84
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setFormData(prevState => ({
      ...prevState,
      [name]: isNumber ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictionResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict_price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      console.error("Prediction failed:", error);
      setPredictionResult({ predicted_price_usd: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Rental Price Optimization</h2>
      <p>Enter the details for a rental to get a market-optimized price prediction.</p>
      <form onSubmit={handleSubmit} className="predictor-form">
        <div className="form-grid">
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
            {loading ? 'Calculating...' : 'Get Price Prediction'}
          </button>
        </div>
      </form>

      {predictionResult && (
        <div className="prediction-result">
          <h3>Price Prediction</h3>
          <p className="price-display">
            Predicted Price: <strong>${predictionResult.predicted_price_usd}</strong>
          </p>
        </div>
      )}
    </section>
  );
}

export default PriceOptimizerPage;