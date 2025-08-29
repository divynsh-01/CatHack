import { useState } from 'react';

function AnomalyDetectorPage() {
  const [formData, setFormData] =useState({
    Type: 'Excavator',
    Operating_Hours: 80,
    Idle_Hours: 20,
    Fuel_Consumed_Liters: 900,
    Fuel_Efficiency_L_per_hr: 11.25,
    Load_Cycles: 250,
    Utilization_Rate: 0.80,
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
      const response = await fetch(`${API_BASE_URL}/detect_anomaly`, {
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
      setPredictionResult({ result_text: 'Error: Could not get prediction.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Operational Anomaly Detector</h2>
      <p>Enter the operational data for a rental to check for anomalous usage patterns.</p>
      <form onSubmit={handleSubmit} className="predictor-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="Type">Equipment Type</label>
            <select id="Type" name="Type" value={formData.Type} onChange={handleInputChange}>
              <option value="Bulldozer">Bulldozer</option>
              <option value="Crane">Crane</option>
              <option value="DumpTruck">DumpTruck</option>
              <option value="Excavator">Excavator</option>
              <option value="Loader">Loader</option>
            </select>
          </div>
          {Object.keys(formData).map(key => {
            if (key === 'Type') return null; // Don't create a text input for Type
            return (
                <div className="form-group" key={key}>
                <label htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                <input
                    type="number"
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                />
                </div>
            )
          })}
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Detect Anomaly'}
          </button>
        </div>
      </form>

      {predictionResult && (
        <div className="prediction-result">
          <h3>Detection Result</h3>
          <p className="price-display">
            <strong>{predictionResult.result_text}</strong>
          </p>
        </div>
      )}
    </section>
  );
}

export default AnomalyDetectorPage;