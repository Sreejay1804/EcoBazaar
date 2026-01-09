import { useState, useEffect } from 'react';
import { getSellerDashboard } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function SellerDashboard({ onLogout }) {
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
      const data = await getSellerDashboard();
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
          <h1>Seller Dashboard</h1>
          <p className="dashboard-subtitle">Manage your products, {username}!</p>
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
          <h2>Sales Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalProducts || 0}</div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalSales || 0}</div>
              <div className="stat-label">Total Sales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${dashboardData?.revenue || '0.00'}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.avgCarbonRating || 'N/A'}</div>
              <div className="stat-label">Avg Carbon Rating</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Product Management</h2>
          <div className="list-placeholder">
            {dashboardData?.products?.length > 0 ? (
              <ul>
                {dashboardData.products.map((product, idx) => (
                  <li key={idx}>{product}</li>
                ))}
              </ul>
            ) : (
              <p>No products listed yet</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Orders</h2>
          <div className="list-placeholder">
            {dashboardData?.recentOrders?.length > 0 ? (
              <ul>
                {dashboardData.recentOrders.map((order, idx) => (
                  <li key={idx}>{order}</li>
                ))}
              </ul>
            ) : (
              <p>No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;

