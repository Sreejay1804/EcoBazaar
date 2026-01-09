import { useState, useEffect } from 'react';
import { getBuyerDashboard } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function BuyerDashboard({ onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await getBuyerDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const username = getUsername();
  const role = getRole();

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </div>
    );
  }

  if (showProfile) {
    return <Profile onBack={() => setShowProfile(false)} onLogout={onLogout} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Buyer Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {username}!</p>
        </div>
        <div className="dashboard-header-actions">
          <button onClick={() => setShowProfile(true)} className="btn-profile">
            Profile
          </button>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Your Shopping Activity</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalPurchases || 0}</div>
              <div className="stat-label">Total Purchases</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.carbonFootprint || '0.0'} kg</div>
              <div className="stat-label">Carbon Footprint</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.ecoScore || 'N/A'}</div>
              <div className="stat-label">Eco Score</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Purchases</h2>
          <div className="list-placeholder">
            {dashboardData?.recentPurchases?.length > 0 ? (
              <ul>
                {dashboardData.recentPurchases.map((purchase, idx) => (
                  <li key={idx}>{purchase}</li>
                ))}
              </ul>
            ) : (
              <p>No recent purchases</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Eco-Friendly Recommendations</h2>
          <div className="list-placeholder">
            {dashboardData?.recommendations?.length > 0 ? (
              <ul>
                {dashboardData.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p>No recommendations available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;

