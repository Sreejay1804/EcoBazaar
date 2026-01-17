import { useState, useEffect } from 'react';
import { getBuyerDashboard, getApprovedProducts, getProduct, addToCart, getCart, updateCartItem, removeFromCart, checkout } from '../api';
import { getUsername, getRole, setUsername } from '../utils/tokenUtils';
import Profile from './Profile';
import './Dashboard.css';

function BuyerDashboard({ onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState('shop'); // 'shop', 'cart', 'product'
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ecoOnly, setEcoOnly] = useState(false);
  const [sortBy, setSortBy] = useState('price-high');

  useEffect(() => {
    loadDashboard();
    loadProducts();
    loadCart();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await getBuyerDashboard();
      setDashboardData(data);
      // Update username in session storage from dashboard data
      if (data?.username) {
        setUsername(data.username);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const data = await getApprovedProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  async function loadCart() {
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  }

  async function handleAddToCart(productId, quantity = 1) {
    try {
      await addToCart(productId, quantity);
      await loadCart();
      alert('Product added to cart!');
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    }
  }

  async function handleViewProduct(productId) {
    try {
      const product = await getProduct(productId);
      setSelectedProduct(product);
      setView('product');
    } catch (err) {
      alert('Error loading product: ' + err.message);
    }
  }

  async function handleUpdateQuantity(cartItemId, quantity) {
    try {
      await updateCartItem(cartItemId, quantity);
      await loadCart();
    } catch (err) {
      alert('Error updating cart: ' + err.message);
    }
  }

  async function handleRemoveFromCart(cartItemId) {
    try {
      await removeFromCart(cartItemId);
      await loadCart();
    } catch (err) {
      alert('Error removing from cart: ' + err.message);
    }
  }

  async function handleCheckout() {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    if (!window.confirm('Proceed to checkout?')) {
      return;
    }

    try {
      const result = await checkout();
      alert(`Order placed successfully! Order ID: ${result.orderId}\nTotal: $${result.totalAmount}\nCarbon Footprint: ${result.totalCarbonFootprint} kg CO2e`);
      await loadCart();
      await loadDashboard();
      setView('shop');
    } catch (err) {
      alert('Error during checkout: ' + err.message);
    }
  }

  function getFilteredAndSortedProducts() {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesEco = !ecoOnly || (product.ecoRating >= 7);
      return matchesSearch && matchesEco;
    });

    // Sort products
    filtered.sort((a, b) => {
      if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'eco-rating') {
        return b.ecoRating - a.ecoRating;
      }
      return 0;
    });

    return filtered;
  }

  function getCartTotal() {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
  }

  function getCartCarbonFootprint() {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.carbonFootprint || 0), 0);
  }

  const username = getUsername() || dashboardData?.username || 'Guest';
  const role = getRole();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading && view === 'shop') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error && view === 'shop') {
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

  if (view === 'product' && selectedProduct) {
    return (
      <div className="dashboard-container">
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => { setView('shop'); setSelectedProduct(null); }} className="btn-secondary">
            ← Back to Shop
          </button>
        </div>
        <div className="dashboard-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              {selectedProduct.imageUrl ? (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{ width: '100%', height: '400px', background: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Image
                </div>
              )}
            </div>
            <div>
              {selectedProduct.ecoRating >= 7 && (
                <div style={{ 
                  display: 'inline-block', 
                  padding: '0.5rem 1rem', 
                  background: '#dcfce7', 
                  color: '#166534',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontWeight: 600
                }}>
                  ✔ Eco-Certified (Grade {selectedProduct.ecoRating >= 9 ? 'A' : selectedProduct.ecoRating >= 7 ? 'B' : 'C'})
                </div>
              )}
              <h1 style={{ margin: '0 0 1rem', fontSize: '2rem' }}>{selectedProduct.name}</h1>
              <div style={{ fontSize: '1.5rem', color: '#16a34a', fontWeight: 700, marginBottom: '1rem' }}>
                ${selectedProduct.price}
              </div>
              <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                {selectedProduct.description || 'No description available.'}
              </p>
              <div style={{ 
                background: '#e0f2fe', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🌱</span> Environmental Impact
                </h3>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>Carbon Footprint:</strong> {selectedProduct.carbonFootprint || 'N/A'} kg CO2e
                </p>
                {selectedProduct.carbonFootprint && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                    * Buying this instead of a plastic alternative saves approx. {(selectedProduct.carbonFootprint * 2).toFixed(1)} kg of emissions.
                  </p>
                )}
              </div>
              <button 
                onClick={() => handleAddToCart(selectedProduct.id, 1)}
                className="btn-profile"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'cart') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>🛒 Shopping Cart</h1>
            <p className="dashboard-subtitle">{cartItemCount} item(s) in cart</p>
          </div>
          <div className="dashboard-header-actions">
            <button onClick={() => setView('shop')} className="btn-secondary">
              Continue Shopping
            </button>
            <button onClick={() => setShowProfile(true)} className="btn-profile">
              Profile
            </button>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {cartItems.length === 0 ? (
            <div className="dashboard-card">
              <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#64748b' }}>
                Your cart is empty. Start shopping!
              </p>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={() => setView('shop')} className="btn-profile">
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="dashboard-card">
                <h2>Cart Items</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      borderRadius: '0.5rem' 
                    }}>
                      {item.productImageUrl && (
                        <img 
                          src={item.productImageUrl} 
                          alt={item.productName}
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem' }}>{item.productName}</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                          <span>Price: ${item.productPrice}</span>
                          <span>Eco Rating: {item.productEcoRating}/10</span>
                          {item.productCarbonFootprint && <span>CO2: {item.productCarbonFootprint} kg</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <label>Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                            style={{ width: '80px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                          />
                          <div style={{ marginLeft: 'auto', fontWeight: 600 }}>
                            Subtotal: ${item.subtotal?.toFixed(2)}
                          </div>
                          <button 
                            onClick={() => handleRemoveFromCart(item.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-card">
                <h2>Order Summary</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <strong>${getCartTotal().toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Total Carbon Footprint:</span>
                  <strong>{getCartCarbonFootprint().toFixed(2)} kg CO2e</strong>
                </div>
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  <strong>Total:</strong>
                  <strong style={{ color: '#16a34a' }}>${getCartTotal().toFixed(2)}</strong>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="btn-profile"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Shop view
  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="shop-title">
            <span className="shop-icon">🛍️</span> EcoBazaar Shop
          </h1>
          <p className="dashboard-subtitle">Welcome back, {username}!</p>
        </div>
        <div className="dashboard-header-actions">
          <button onClick={() => setView('cart')} className="btn-profile" style={{ position: 'relative' }}>
            🛒 View Cart {cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={() => setShowProfile(true)} className="btn-profile">
            My Profile
          </button>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card search-filter-card">
          <div className="search-filter-row">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <label className="eco-checkbox-label">
              <input
                type="checkbox"
                checked={ecoOnly}
                onChange={(e) => setEcoOnly(e.target.checked)}
                className="eco-checkbox"
              />
              Eco Only
            </label>
          </div>
          <div className="sort-row">
            <label className="sort-label">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="eco-rating">Eco Rating: High to Low</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="dashboard-card">
            <p style={{ textAlign: 'center', color: '#64748b' }}>No products found.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card" onClick={() => handleViewProduct(product.id)}>
                {product.imageUrl && (
                  <div className="product-image-container">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {product.ecoRating >= 7 && (
                      <span className={`eco-badge ${product.ecoRating >= 9 ? 'excellent' : 'good'}`}>
                        {product.ecoRating >= 9 ? 'Excellent' : 'Good'}
                      </span>
                    )}
                  </div>
                )}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">${product.price}</div>
                  <div className="product-eco-info">
                    <span>CO2: {product.carbonFootprint || 'N/A'} kg</span>
                    <span>Grade: {product.ecoRating >= 9 ? 'A' : product.ecoRating >= 7 ? 'B' : product.ecoRating >= 5 ? 'C' : 'D'}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id, 1);
                    }}
                    className="btn-add-to-cart"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboard;
