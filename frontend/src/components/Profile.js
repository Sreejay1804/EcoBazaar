import { useState, useEffect } from 'react';
import { getProfile, updateProfile, deleteProfile } from '../api';
import { getUsername, getRole } from '../utils/tokenUtils';
import './Profile.css';

function Profile({ onBack, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    bio: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');
      const data = await getProfile();
      setProfile(data);
      setFormData({
        email: data.email || '',
        password: '',
        confirmPassword: '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        bio: data.bio || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    try {
      await deleteProfile();
      setSuccess('Account deleted successfully');
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
  }

  const username = getUsername();
  const role = getRole();

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p>Failed to load profile</p>
          <button onClick={onBack} className="btn-secondary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h1>Profile Settings</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Profile
              </button>
              <button onClick={onBack} className="btn-secondary">
                Back to Dashboard
              </button>
            </>
          ) : (
            <button onClick={() => { setIsEditing(false); loadProfile(); }} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {!isEditing ? (
        <div className="profile-content">
          <div className="profile-card">
            <h2>Account Information</h2>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Username:</span>
                <span className="info-value">{profile.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role:</span>
                <span className="info-value">{profile.role}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {profile.firstName && (
                <div className="info-row">
                  <span className="info-label">First Name:</span>
                  <span className="info-value">{profile.firstName}</span>
                </div>
              )}
              {profile.lastName && (
                <div className="info-row">
                  <span className="info-label">Last Name:</span>
                  <span className="info-value">{profile.lastName}</span>
                </div>
              )}
              {profile.phoneNumber && (
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{profile.phoneNumber}</span>
                </div>
              )}
              {profile.address && (
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{profile.address}</span>
                </div>
              )}
              {profile.city && (
                <div className="info-row">
                  <span className="info-label">City:</span>
                  <span className="info-value">{profile.city}</span>
                </div>
              )}
              {profile.country && (
                <div className="info-row">
                  <span className="info-label">Country:</span>
                  <span className="info-value">{profile.country}</span>
                </div>
              )}
              {profile.bio && (
                <div className="info-row">
                  <span className="info-label">Bio:</span>
                  <span className="info-value">{profile.bio}</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-card danger-zone">
            <h2>Danger Zone</h2>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger"
              >
                Delete Account
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="delete-actions">
                  <button onClick={handleDelete} className="btn-danger">
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-card">
            <h2>Edit Profile</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {formErrors.password && <span className="error-text">{formErrors.password}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {formErrors.confirmPassword && (
                  <span className="error-text">{formErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => { setIsEditing(false); loadProfile(); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;

