import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // This hook gets the ID from the URL

function AssetHistoryPage() {
  const { equipmentId } = useParams(); // Get the equipmentId from the URL parameter
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/asset_history/${equipmentId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setHistory(data);
      } catch (e) {
        setError(`Failed to load history for ${equipmentId}. Is the backend running?`);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [equipmentId]); // Re-run this effect if the equipmentId in the URL changes

  if (loading) return <p>Loading history for {equipmentId}...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!history) return <p>No history found for {equipmentId}.</p>;

  return (
    <section>
      <h2>Usage History for {history.equipment_id}</h2>
      
      {/* Summary Section */}
      <div className="summary-grid">
        <div className="summary-card"><h4>Total Rentals</h4><p>{history.summary.total_rentals}</p></div>
        <div className="summary-card"><h4>Total Rental Days</h4><p>{history.summary.total_rental_days}</p></div>
        <div className="summary-card"><h4>Total Operating Hours</h4><p>{history.summary.total_operating_hours}</p></div>
        <div className="summary-card"><h4>Lifetime Breakdowns</h4><p>{history.summary.lifetime_breakdowns}</p></div>
      </div>

      {/* Full Rental History Table */}
      <div className="prediction-result">
          <h3>Complete Rental Log</h3>
          <div className="asset-table-container">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>CheckOut Date</th>
                  <th>CheckIn Date</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Operating Hours</th>
                  <th>Breakdowns</th>
                </tr>
              </thead>
              <tbody>
                {history.rental_history.map((rental, index) => (
                  <tr key={index}>
                    <td>{rental.CheckOut_Date}</td>
                    <td>{rental.CheckIn_Date}</td>
                    <td>{rental.Customer_ID}</td>
                    <td>{rental.GPS_Location}</td>
                    <td>{rental.Operating_Hours}</td>
                    <td>{rental.Breakdowns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </section>
  );
}

export default AssetHistoryPage;