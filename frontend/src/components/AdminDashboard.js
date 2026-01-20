import { useState, useEffect } from 'react';
import { getAdminDashboard, getPendingProducts, approveProduct, rejectProduct, deleteAdminProduct, getAllAdminProducts, getAllAdminUsers, deleteAdminUser } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function AdminDashboard({ onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
    loadPendingProducts();
    loadAllProducts();
    loadAllUsers();
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

  async function loadAllProducts() {
    try {
      const data = await getAllAdminProducts();
      setAllProducts(data);
    } catch (err) {
      console.error('Error loading all products:', err);
    }
  }

  async function loadAllUsers() {
    try {
      const data = await getAllAdminUsers();
      setAllUsers(data);
    } catch (err) {
      console.error('Error loading all users:', err);
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

  async function handleDelete(productId) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteAdminProduct(productId);
      await loadPendingProducts();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteAdminUser(userId);
      await loadAllUsers();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
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
            <div>
              {pendingProducts.map((product) => (
                <div key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="product-details">
                    <div className="product-title">{product.name}</div>
                    <div className="product-description">{product.description || 'No description'}</div>
                    <div className="product-meta">
                      <div><strong>Price:</strong> ${product.price}</div>
                      <div><strong>Quantity:</strong> {product.quantity}</div>
                      <div><strong>Eco Rating:</strong> {product.ecoRating}/10</div>
                      {product.carbonFootprint && <div><strong>CO2:</strong> {product.carbonFootprint} kg</div>}
                      <div><strong>Seller ID:</strong> {product.sellerId}</div>
                      <div><strong>Status:</strong> {product.status}</div>
                    </div>
                    <div className="product-actions">
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="btn-action btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(product.id)}
                        className="btn-action btn-reject"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn-action btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>All Products</h2>
          {allProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div>
              {allProducts.map((product) => (
                <div key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="product-details">
                    <div className="product-title">{product.name}</div>
                    <div className="product-description">{product.description || 'No description'}</div>
                    <div className="product-meta">
                      <div><strong>Price:</strong> ${product.price}</div>
                      <div><strong>Quantity:</strong> {product.quantity}</div>
                      <div><strong>Eco Rating:</strong> {product.ecoRating}/10</div>
                      {product.carbonFootprint && <div><strong>CO2:</strong> {product.carbonFootprint} kg</div>}
                      <div><strong>Seller ID:</strong> {product.sellerId}</div>
                      <div><strong>Status:</strong> {product.status}</div>
                    </div>
                    <div className="product-actions">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn-action btn-delete"
                      >
                        Delete
                      </button>
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

        <div className="dashboard-card">
          <h2>All Users</h2>
          {allUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div>
              {allUsers.map((user) => (
                <div key={user.id} className="product-card" style={{flexDirection: 'column', gap: '0.5rem'}}>
                  <div className="product-title">{user.username}</div>
                  <div className="product-meta">
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Role:</strong> {user.role}</div>
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn-action btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
