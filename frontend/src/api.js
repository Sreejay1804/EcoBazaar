const API_BASE_URL = 'http://localhost:8080';

export async function signup({ username, email, password, role = 'BUYER' }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password, role }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || 'Signup failed';
    throw new Error(message);
  }
  return data;
}

export async function login({ username, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || 'Login failed';
    throw new Error(message);
  }
  return data;
}


