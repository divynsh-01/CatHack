import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🚜 CAT Smart Rental</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/asset-search">History</Link></li>
        <li><Link to="/returns-due">Returns</Link></li>
        <li><Link to="/underutilized-assets">Utilization</Link></li>
        <li><Link to="/predictor">Maintenance</Link></li>
        <li><Link to="/price-optimizer">Pricing</Link></li>
        <li><Link to="/demand-forecast">Forecast</Link></li>
        <li><Link to="/anomaly-detector">Anomalies</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;