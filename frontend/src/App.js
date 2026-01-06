import { useState } from 'react';
import './App.css';
import { login, signup } from './api';

function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) return 'Enter a valid email address';
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
}

function validateUsername(username) {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  return '';
}

function AuthLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-badge">Eco</span>
          <span className="brand-text">Bazaar</span>
        </div>
        <p className="subtitle">
          Track your carbon footprint while you shop smarter.
        </p>
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'login' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'signup' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign up
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleValidate() {
    const newErrors = {};
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    if (!handleValidate()) return;

    try {
      setLoading(true);
      const data = await login({ username, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
      }
      if (onSuccess) onSuccess(data);
    } catch (error) {
      setServerError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert error">{serverError}</div>}
      <div className="field">
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={handleValidate}
          placeholder="Enter your username"
        />
        {errors.username && <p className="error-text">{errors.username}</p>}
      </div>
      <div className="field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handleValidate}
          placeholder="Enter your password"
        />
        {errors.password && <p className="error-text">{errors.password}</p>}
      </div>
      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

function SignupForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleValidate() {
    const newErrors = {};
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    if (!handleValidate()) return;

    try {
      setLoading(true);
      const data = await signup({ username, email, password, role });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
      }
      if (onSuccess) onSuccess(data);
    } catch (error) {
      setServerError(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert error">{serverError}</div>}
      <div className="field">
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={handleValidate}
          placeholder="Choose a username"
        />
        {errors.username && <p className="error-text">{errors.username}</p>}
      </div>
      <div className="field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleValidate}
          placeholder="you@example.com"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
      </div>
      <div className="field">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handleValidate}
          placeholder="Create a strong password"
        />
        {errors.password && <p className="error-text">{errors.password}</p>}
      </div>
      <div className="field">
        <label htmlFor="signup-role">Role</label>
        <select
          id="signup-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="field-select"
        >
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  function handleAuthSuccess(data) {
    setWelcomeMessage(data.message || 'Authenticated successfully');
  }

  return (
    <AuthLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {welcomeMessage && <div className="alert success">{welcomeMessage}</div>}
      {activeTab === 'login' ? (
        <LoginForm onSuccess={handleAuthSuccess} />
      ) : (
        <SignupForm onSuccess={handleAuthSuccess} />
      )}
    </AuthLayout>
  );
}

export default App;


