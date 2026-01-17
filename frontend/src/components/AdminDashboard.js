import { useState, useEffect } from 'react';
import { getAdminDashboard, getPendingProducts, approveProduct, rejectProduct } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function AdminDashboard({ onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
    loadPendingProducts();
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

  async function loadPendingProducts() {
    try {
      const data = await getPendingProducts();
      setPendingProducts(data);
    } catch (err) {
      console.error('Error loading pending products:', err);
    }
  }

  async function handleApprove(productId) {
    try {
      await approveProduct(productId);
      await loadPendingProducts();
    } catch (err) {
      alert('Error approving product: ' + err.message);
    }
  }

  async function handleReject(productId) {
    try {
      await rejectProduct(productId);
      await loadPendingProducts();
    } catch (err) {
      alert('Error rejecting product: ' + err.message);
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
              <div className="stat-value">{pendingProducts.length}</div>
              <div className="stat-label">Pending Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.systemHealth || 'Healthy'}</div>
              <div className="stat-label">System Health</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Product Approval</h2>
          {pendingProducts.length === 0 ? (
            <p>No pending products for approval.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingProducts.map((product) => (
                <div key={product.id} style={{ 
                  padding: '1.5rem', 
                  background: '#f8fafc', 
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem' }}>{product.name}</h3>
                      <p style={{ margin: '0 0 1rem', color: '#64748b' }}>{product.description || 'No description'}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <div><strong>Price:</strong> ${product.price}</div>
                        <div><strong>Quantity:</strong> {product.quantity}</div>
                        <div><strong>Eco Rating:</strong> {product.ecoRating}/10</div>
                        {product.carbonFootprint && <div><strong>CO2:</strong> {product.carbonFootprint} kg</div>}
                        <div><strong>Seller ID:</strong> {product.sellerId}</div>
                        <div><strong>Status:</strong> {product.status}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          onClick={() => handleApprove(product.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(product.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Recent Users</h2>
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
      </div>
    </div>
  );
}

export default AdminDashboard;

