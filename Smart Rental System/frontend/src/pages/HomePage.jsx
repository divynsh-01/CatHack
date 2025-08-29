import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section className="homepage">
      <h2>Your Complete Fleet Intelligence Platform</h2>
      <p>Leveraging machine learning to drive efficiency, profitability, and predictive insights for your rental fleet.</p>
      <div className="features-grid">
        
        <div className="feature-card">
          <div className="feature-card-icon">📊</div>
          <h3>Live Fleet Dashboard</h3>
          <p>Get a real-time overview of all assets, their current status, location, and customer assignments.</p>
          <Link to="/dashboard" className="feature-link">View Dashboard</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-icon">🔍</div>
          <h3>Asset History</h3>
          <p>Look up the complete lifetime summary and rental history for any specific piece of equipment by its ID.</p>
          <Link to="/asset-search" className="feature-link">Find Asset</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-icon">📅</div>
          <h3>Return Reminders</h3>
          <p>Proactively see which active rentals are scheduled for return within a specified timeframe.</p>
          <Link to="/returns-due" className="feature-link">Check Returns</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-icon">📉</div>
          <h3>Utilization Report</h3>
          <p>Identify under-performing assets by finding equipment with an average utilization rate below a set threshold.</p>
          <Link to="/underutilized-assets" className="feature-link">Analyze Utilization</Link>
        </div>
        
        <div className="feature-card">
          <div className="feature-card-icon">🔧</div>
          <h3>Predictive Maintenance</h3>
          <p>Assess the breakdown risk of equipment to schedule maintenance before costly failures occur.</p>
          <Link to="/predictor" className="feature-link">Run Prediction</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-icon">💲</div>
          <h3>Price Optimizer</h3>
          <p>Get a market-optimized price prediction for any rental scenario based on historical data.</p>
          <Link to="/price-optimizer" className="feature-link">Optimize Price</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-icon">📈</div>
          <h3>Demand Forecasting</h3>
          <p>Generate a data-driven forecast to predict the demand for different equipment types in the future.</p>
          <Link to="/demand-forecast" className="feature-link">View Forecast</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-icon">⚠️</div>
          <h3>Anomaly Detector</h3>
          <p>Enter operational stats for a rental to check for anomalous or inefficient usage patterns.</p>
          <Link to="/anomaly-detector" className="feature-link">Detect Anomaly</Link>
        </div>

      </div>
    </section>
  );
}

export default HomePage;