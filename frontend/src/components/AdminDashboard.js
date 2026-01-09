import { useState, useEffect } from 'react';
import { getAdminDashboard } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function AdminDashboard({ onLogout }) {
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
      const data = await getAdminDashboard();
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
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">System Administration, {username}</p>
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
          <h2>System Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalBuyers || 0}</div>
              <div className="stat-label">Buyers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalSellers || 0}</div>
              <div className="stat-label">Sellers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalProducts || 0}</div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.systemHealth || 'Healthy'}</div>
              <div className="stat-label">System Health</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>User Management</h2>
          <div className="list-placeholder">
            {dashboardData?.recentUsers?.length > 0 ? (
              <ul>
                {dashboardData.recentUsers.map((user, idx) => (
                  <li key={idx}>{user}</li>
                ))}
              </ul>
            ) : (
              <p>No recent user activity</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>System Analytics</h2>
          <div className="list-placeholder">
            {dashboardData?.analytics?.length > 0 ? (
              <ul>
                {dashboardData.analytics.map((metric, idx) => (
                  <li key={idx}>{metric}</li>
                ))}
              </ul>
            ) : (
              <p>No analytics data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

