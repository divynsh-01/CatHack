import { useState } from 'react';

function DemandForecastPage() {
  const [equipmentType, setEquipmentType] = useState('Excavator');
  const [periods, setPeriods] = useState(30);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const handleForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTableData([]);

    try {
      const response = await fetch(`${API_BASE_URL}/forecast_demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment_type: equipmentType, periods: periods }),
      });
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      const result = await response.json();
      
      setTableData(result.forecast); // Save data for the table
    } catch (err) {
      setError('Failed to fetch forecast. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Demand Forecasting</h2>
      <form onSubmit={handleForecast} className="predictor-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="equipmentType">Equipment Type</label>
            <select id="equipmentType" value={equipmentType} onChange={e => setEquipmentType(e.target.value)}>
              <option value="Bulldozer">Bulldozer</option>
              <option value="Crane">Crane</option>
              <option value="DumpTruck">DumpTruck</option>
              <option value="Excavator">Excavator</option>
              <option value="Loader">Loader</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="periods">Days to Forecast</label>
            <input
              type="number"
              id="periods"
              value={periods}
              onChange={e => setPeriods(Number(e.target.value))}
              min="7"
              max="365"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Forecasting...' : 'Get Forecast'}
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      
      {tableData.length > 0 && (
        <div className="prediction-result">
          <h3>Forecast Data for {equipmentType}</h3>
          <div className="asset-table-container">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Predicted Rentals (Avg)</th>
                  <th>Predicted Lower Bound</th>
                  <th>Predicted Upper Bound</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.ds}>
                    <td>{row.ds}</td>
                    <td>{row.yhat.toFixed(2)}</td>
                    <td>{row.yhat_lower.toFixed(2)}</td>
                    <td>{row.yhat_upper.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default DemandForecastPage;