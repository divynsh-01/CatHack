import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // This hook allows us to change pages

function AssetSearchPage() {
  const [equipmentId, setEquipmentId] = useState('');
  const navigate = useNavigate(); // Get the navigate function

  const handleSearch = (e) => {
    e.preventDefault();
    if (equipmentId.trim()) {
      // Navigate to the history page for the entered ID
      navigate(`/asset_history/${equipmentId.trim()}`);
    }
  };

  return (
    <section>
      <h2>Find Asset History</h2>
      <p>Enter an Equipment ID to look up its complete rental and usage history.</p>
      <form onSubmit={handleSearch} className="predictor-form">
        <div className="form-group">
          <label htmlFor="equipmentId">Equipment ID</label>
          <input
            type="text"
            id="equipmentId"
            placeholder="e.g., EQ0001"
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="search-input"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit">Search</button>
        </div>
      </form>
    </section>
  );
}

export default AssetSearchPage;