import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UnderutilizedPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.5);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const fetchUnderutilizedAssets = async (currentThreshold) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/underutilized_assets?threshold=${currentThreshold}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAssets(data.underutilized_assets);
    } catch (e) {
      setError('Failed to load data. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnderutilizedAssets(threshold);
  }, []);

  const handleApplyFilter = () => {
    fetchUnderutilizedAssets(threshold);
  };

  return (
    <section>
      <h2>Under-utilized Assets Report</h2>
      <p>Find equipment with an average utilization rate below a specific threshold.</p>
      <div id="status-controls">
        <label htmlFor="threshold-slider">Utilization Threshold: <strong>{Math.round(threshold * 100)}%</strong></label>
        <input
          type="range"
          id="threshold-slider"
          min="0.1"
          max="1"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="slider"
        />
        <button onClick={handleApplyFilter} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filter'}
        </button>
      </div>
      <div className="asset-table-container">
        <table className="asset-table">
          <thead>
            <tr>
              <th>Equipment ID</th>
              <th>Type</th>
              <th>Model</th>
              <th>Last Known Location</th>
              <th>Average Utilization Rate</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>}
            {error && <tr><td colSpan="5" className="error">{error}</td></tr>}
            {!loading && !error && assets.map(asset => (
              <tr key={asset.Equipment_ID}>
                <td>
                  <Link to={`/asset_history/${asset.Equipment_ID}`} className="id-link">
                    {asset.Equipment_ID}
                  </Link>
                </td>
                <td>{asset.Type}</td>
                <td>{asset.Model}</td>
                <td>{asset.GPS_Location}</td>
                <td><strong>{asset.Average_Utilization_Rate}</strong></td>
              </tr>
            ))}
            {!loading && !error && assets.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No assets found below this threshold.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UnderutilizedPage;