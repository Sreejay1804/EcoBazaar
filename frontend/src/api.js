import { getToken, removeToken } from './utils/tokenUtils';

const API_BASE_URL = 'http://localhost:8080';

// Helper function to get headers with JWT token
function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// Handle API response and check for token expiration
async function handleResponse(response) {
  // Check if response is ok before trying to parse JSON
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    // If unauthorized, token might be expired
    if (response.status === 401 || response.status === 403) {
      removeToken();
      throw new Error('Session expired. Please login again.');
    }
    
    throw new Error(errorMessage);
  }
  
  // Parse JSON only if response is ok
  const data = await response.json().catch(() => ({}));
  return data;
}

export async function signup({ username, email, password, role = 'BUYER' }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: getHeaders(false), // No auth needed for signup
    body: JSON.stringify({ username, email, password, role }),
  });

  return handleResponse(response);
}

export async function login({ username, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(false), // No auth needed for login
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(response);
}

// Protected API calls - require JWT token
export async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'GET',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

export async function getBuyerDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/dashboard`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function getSellerDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller/dashboard`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function getAdminDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

// Profile API calls
export async function getProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function updateProfile(profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(profileData),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function deleteProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

// Product API calls
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function getSellerProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller/products`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function getApprovedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/products`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function getProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/products/${productId}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

// Admin API calls
export async function getPendingProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products/pending`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function approveProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/approve`, {
      method: 'POST',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function rejectProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/reject`, {
      method: 'POST',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

// Cart API calls
export async function addToCart(productId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/cart/add`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ productId, quantity }),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function getCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/cart`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function updateCartItem(cartItemId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/cart/${cartItemId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ quantity }),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function removeFromCart(cartItemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}

export async function checkout() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/cart/checkout`, {
      method: 'POST',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw error;
  }
}


