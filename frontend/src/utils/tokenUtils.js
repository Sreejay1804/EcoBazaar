// JWT Token utility functions

export function getToken() {
  return sessionStorage.getItem('token');
}

export function setToken(token) {
  sessionStorage.setItem('token', token);
}

export function removeToken() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('role');
}

export function getUsername() {
  return sessionStorage.getItem('username');
}

export function setUsername(username) {
  sessionStorage.setItem('username', username);
}

export function getRole() {
  return sessionStorage.getItem('role');
}

export function setRole(role) {
  sessionStorage.setItem('role', role);
}

// Decode JWT token (without verification - for client-side use only)
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token) {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
}

// Check if token is valid (exists and not expired)
export function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

// Get token expiration time in milliseconds
export function getTokenExpirationTime(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return decoded.exp * 1000;
}

// Get role from token
export function getRoleFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.role) return null;
  return decoded.role;
}

// Initialize role from token if not already set
export function initializeRoleFromToken() {
  const token = getToken();
  if (token) {
    const roleFromToken = getRoleFromToken(token);
    if (roleFromToken && !getRole()) {
      setRole(roleFromToken);
    }
  }
}

