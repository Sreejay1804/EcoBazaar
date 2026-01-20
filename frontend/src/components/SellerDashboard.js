import { useState, useEffect } from 'react';
import { getSellerDashboard, createProduct, getSellerProducts, deleteSellerProduct } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function SellerDashboard({ onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    quantity: '',
    ecoRating: '',
    carbonFootprint: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadDashboard();
    loadProducts();
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

  async function loadProducts() {
    try {
      const data = await getSellerProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  async function handleSubmitProduct(e) {
    e.preventDefault();
    setFormError('');

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl || null,
        quantity: parseInt(formData.quantity),
        ecoRating: parseFloat(formData.ecoRating),
        carbonFootprint: formData.carbonFootprint ? parseFloat(formData.carbonFootprint) : null
      };

      await createProduct(productData);
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        quantity: '',
        ecoRating: '',
        carbonFootprint: ''
      });
      setShowAddProduct(false);
      await loadProducts();
      await loadDashboard();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(productId) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteSellerProduct(productId);
      await loadProducts();
      await loadDashboard();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
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
          <button onClick={() => setShowAddProduct(!showAddProduct)} className="btn-profile">
            {showAddProduct ? 'Cancel' : 'Add Product'}
          </button>
          <button onClick={() => setShowProfile(true)} className="btn-profile">
            Profile
          </button>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {showAddProduct && (
        <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
          <h2>Add New Product</h2>
          {formError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{formError}</div>}
          <form onSubmit={handleSubmitProduct}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Eco Rating (0-10) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={formData.ecoRating}
                  onChange={(e) => setFormData({ ...formData, ecoRating: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Carbon Footprint (kg CO2e)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.carbonFootprint}
                  onChange={(e) => setFormData({ ...formData, carbonFootprint: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
              </div>
            </div>
            <button type="submit" className="btn-profile" style={{ marginTop: '1rem' }}>
              Submit for Approval
            </button>
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Sales Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.totalProducts || 0}</div>
              <div className="stat-label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.approvedProducts || 0}</div>
              <div className="stat-label">Approved Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData?.pendingProducts || 0}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>My Products</h2>
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div>
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="product-image" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  <div className="product-details">
                    <div className="product-title">{product.name}</div>
                    <div className="product-description">{product.description || 'No description'}</div>
                    <div className="product-meta">
                      <div><strong>Price:</strong> ${product.price}</div>
                      <div><strong>Quantity:</strong> {product.quantity}</div>
                      <div><strong>Eco Rating:</strong> {product.ecoRating}/10</div>
                      {product.carbonFootprint && <div><strong>CO2:</strong> {product.carbonFootprint} kg</div>}
                      <div><strong>Status:</strong> {product.status}</div>
                    </div>
                    <div className="product-actions">
                      <button onClick={() => handleDelete(product.id)} className="btn-action btn-delete">Delete</button>
                    </div>
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

export default SellerDashboard;

