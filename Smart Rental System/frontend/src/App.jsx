import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PredictorPage from './pages/PredictorPage';
import DemandForecastPage from './pages/DemandForecastPage';
import PriceOptimizerPage from './pages/PriceOptimizerPage';
import UnderutilizedPage from './pages/UnderutilizedPage';
import AssetHistoryPage from './pages/AssetHistoryPage';
import AssetSearchPage from './pages/AssetSearchPage';
import ReturnsDuePage from './pages/ReturnsDuePage';
import AnomalyDetectorPage from './pages/AnomalyDetectorPage'; // <-- Import new page
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/asset-search" element={<AssetSearchPage />} />
            <Route path="/asset_history/:equipmentId" element={<AssetHistoryPage />} />
            <Route path="/returns-due" element={<ReturnsDuePage />} />
            <Route path="/predictor" element={<PredictorPage />} />
            <Route path="/price-optimizer" element={<PriceOptimizerPage />} />
            <Route path="/demand-forecast" element={<DemandForecastPage />} />
            <Route path="/underutilized-assets" element={<UnderutilizedPage />} />
            <Route path="/anomaly-detector" element={<AnomalyDetectorPage />} /> {/* <-- Add new route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;