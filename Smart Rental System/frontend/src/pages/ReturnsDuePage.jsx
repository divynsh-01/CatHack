import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- THE FIX is here

function ReturnsDuePage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysOut, setDaysOut] = useState(7);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const fetchReturnsDue = async (currentDays) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/returns_due_soon?days_out=${currentDays}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAssets(data.assets_due_for_return);
    } catch (e) {
      setError('Failed to load data. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnsDue(daysOut);
  }, []);

  const handleApplyFilter = () => {
    fetchReturnsDue(daysOut);
  };

  return (
    <section>
      <h2>Return Reminders</h2>
      <p>Find active rentals that are scheduled for return within the specified timeframe.</p>
      <div id="status-controls">
        <label htmlFor="days-out-input">Days Out:</label>
        <input
          type="number"
          id="days-out-input"
          min="1"
          max="90"
          value={daysOut}
          onChange={(e) => setDaysOut(Number(e.target.value))}
          className="search-input"
        />
        <button onClick={handleApplyFilter} disabled={loading}>
          {loading ? 'Loading...' : 'Get Report'}
        </button>
      </div>
      <div className="asset-table-container">
        <table className="asset-table">
          <thead>
            <tr>
              <th>Equipment ID</th>
              <th>Type</th>
              <th>Model</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Planned Return Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>}
            {error && <tr><td colSpan="6" className="error">{error}</td></tr>}
            {!loading && !error && assets.map(asset => (
              <tr key={asset.Equipment_ID}>
                <td>
                  <Link to={`/asset_history/${asset.Equipment_ID}`} className="id-link">
                    {asset.Equipment_ID}
                  </Link>
                </td>
                <td>{asset.Type}</td>
                <td>{asset.Model}</td>
                <td>{asset.Customer_ID}</td>
                <td>{asset.GPS_Location}</td>
                <td><strong>{asset.Planned_Return_Date}</strong></td>
              </tr>
            ))}
            {!loading && !error && assets.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No returns due in this timeframe.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ReturnsDuePage;