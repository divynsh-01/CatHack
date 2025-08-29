import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loader"></div>
      <p>Loading Fleet Data...</p>
    </div>
  );
}

function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueLocations, setUniqueLocations] = useState([]);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchAssetStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all assets at once
        const response = await fetch(`${API_BASE_URL}/asset_status`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setAssets(data.assets);
        const locations = [...new Set(data.assets.map(asset => asset.Last_Known_Location))];
        setUniqueLocations(locations.sort());
      } catch (e) {
        setError('Failed to load data. Is the backend server running?');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssetStatus();
  }, []);

  useEffect(() => {
    let result = assets;
    if (statusFilter !== 'All') result = result.filter(asset => asset.Status === statusFilter);
    if (locationFilter !== 'All') result = result.filter(asset => asset.Last_Known_Location === locationFilter);
    if (searchTerm) {
      result = result.filter(asset =>
        asset.Equipment_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.Type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAssets(result);
  }, [assets, statusFilter, locationFilter, searchTerm]);

  return (
    <section id="asset-status-section">
      {/* Show the overlay only when loading */}
      {loading && <LoadingOverlay />}
      
      <h2>Live Fleet Status</h2>
      <div id="status-controls">
        <input
          type="text"
          placeholder="Search by ID or Type..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Idle">Idle</option>
        </select>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="All">All Locations</option>
          {uniqueLocations.map(location => <option key={location} value={location}>{location}</option>)}
        </select>
      </div>
      <div className="asset-table-container">
        <table className="asset-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Type</th>
              <th>Model</th>
              <th>Location</th>
              <th>Customer</th>
              <th>Return Date</th>
            </tr>
          </thead>
          <tbody>
            {error && <tr><td colSpan="7" className="error">{error}</td></tr>}
            {!loading && !error && filteredAssets.map(asset => (
              <tr key={asset.Equipment_ID}>
                <td>
                  <Link to={`/asset_history/${asset.Equipment_ID}`} className="id-link">
                    {asset.Equipment_ID}
                  </Link>
                </td>
                <td className={asset.Status === 'Active' ? 'status-active' : 'status-idle'}>{asset.Status}</td>
                <td>{asset.Type}</td>
                <td>{asset.Model}</td>
                <td>{asset.Last_Known_Location}</td>
                <td>{asset.Current_Customer_ID}</td>
                <td>{asset.Planned_Return_Date}</td>
              </tr>
            ))}
             {!loading && !error && filteredAssets.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No assets match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DashboardPage;