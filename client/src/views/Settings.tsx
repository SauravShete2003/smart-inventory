import React, { useState, useEffect } from 'react';
import { FaCog, FaUser, FaBell, FaShieldAlt, FaSave, FaTrash } from 'react-icons/fa';
import { getCurrentuser, getJwtToken } from '../utils/common';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface ThresholdSettings {
  lowStockThreshold: number;
  criticalStockThreshold: number;
}

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderUpdates: true,
    systemAnnouncements: true
  });
  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    lowStockThreshold: 10,
    criticalStockThreshold: 5
  });

  useEffect(() => {
    const currentUser = getCurrentuser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        ...formData,
        username: currentUser.username || '',
        email: currentUser.email || ''
      });
    }

    // Fetch user settings
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      // Fetch notification settings
      const response = await api.get('/settings', {
        headers: { Authorization: token }
      }).catch(error => {
        if (error.response && error.response.status === 404) {
          // If API endpoint doesn't exist, use mock data
          return { 
            data: {
              notifications: {
                emailNotifications: true,
                lowStockAlerts: true,
                orderUpdates: true,
                systemAnnouncements: true
              },
              thresholds: {
                lowStockThreshold: 10,
                criticalStockThreshold: 5
              }
            }
          };
        }
        throw error;
      });

      if (response.data) {
        // Set notification settings if available
        if (response.data.notifications) {
          setNotificationSettings(response.data.notifications);
        }

        // Set threshold settings if available
        if (response.data.thresholds) {
          setThresholds(response.data.thresholds);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
      
      // Use default settings if API fails
      setNotificationSettings({
        emailNotifications: true,
        lowStockAlerts: true,
        orderUpdates: true,
        systemAnnouncements: true
      });
      
      setThresholds({
        lowStockThreshold: 10,
        criticalStockThreshold: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setThresholds({
      ...thresholds,
      [name]: parseInt(value) || 0
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      setLoading(true);
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      const response = await api.put('/users/profile', {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: token }
      });

      toast.success("Profile updated successfully");
      
      // Update local user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      await api.put('/settings/notifications', notificationSettings, {
        headers: { Authorization: token }
      });

      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      await api.put('/settings/thresholds', thresholds, {
        headers: { Authorization: token }
      });

      toast.success("Inventory thresholds updated");
    } catch (error) {
      console.error("Error updating thresholds:", error);
      toast.error("Failed to update inventory thresholds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-header">Settings</h1>
      
      <div className="settings-layout">
        {/* Tabs navigation */}
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile Settings
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notification Preferences
          </button>
          <button 
            className={`tab-button ${activeTab === 'thresholds' ? 'active' : ''}`}
            onClick={() => setActiveTab('thresholds')}
          >
            <FaCog /> Inventory Thresholds
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaShieldAlt /> Security
          </button>
        </div>

        {/* Content area */}
        <div className="settings-content">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-panel">
              <h2>Profile Settings</h2>
              <p className="settings-description">
                Update your personal information and account details
              </p>
              
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-divider"></div>
                
                <h3>Change Password</h3>
                
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={loading}>
                    <FaSave /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2>Notification Preferences</h2>
              <p className="settings-description">
                Manage how you receive notifications and alerts
              </p>
              
              <form onSubmit={handleNotificationsSubmit} className="settings-form">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="emailNotifications">
                    Email Notifications
                    <span className="option-description">Receive important alerts via email</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="lowStockAlerts"
                    name="lowStockAlerts"
                    checked={notificationSettings.lowStockAlerts}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="lowStockAlerts">
                    Low Stock Alerts
                    <span className="option-description">Get notified when inventory items are running low</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="orderUpdates"
                    name="orderUpdates"
                    checked={notificationSettings.orderUpdates}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="orderUpdates">
                    Order Updates
                    <span className="option-description">Receive updates about order status changes</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="systemAnnouncements"
                    name="systemAnnouncements"
                    checked={notificationSettings.systemAnnouncements}
                    onChange={handleNotificationChange}
                  />
                  <label htmlFor="systemAnnouncements">
                    System Announcements
                    <span className="option-description">Get important system updates and announcements</span>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={loading}>
                    <FaSave /> Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Inventory Thresholds */}
          {activeTab === 'thresholds' && (
            <div className="settings-panel">
              <h2>Inventory Thresholds</h2>
              <p className="settings-description">
                Configure inventory level thresholds for alerts and warnings
              </p>
              
              <form onSubmit={handleThresholdsSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
                  <input
                    type="number"
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={thresholds.lowStockThreshold}
                    onChange={handleThresholdChange}
                    min="1"
                    className="form-input"
                  />
                  <span className="input-help">Items with quantity below this level will be marked as low stock</span>
                </div>

                <div className="form-group">
                  <label htmlFor="criticalStockThreshold">Critical Stock Threshold</label>
                  <input
                    type="number"
                    id="criticalStockThreshold"
                    name="criticalStockThreshold"
                    value={thresholds.criticalStockThreshold}
                    onChange={handleThresholdChange}
                    min="1"
                    className="form-input"
                  />
                  <span className="input-help">Items with quantity below this level will be marked as critical stock</span>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={loading}>
                    <FaSave /> Save Thresholds
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-panel">
              <h2>Security Settings</h2>
              <p className="settings-description">
                Manage your account security settings and preferences
              </p>
              
              <div className="security-section">
                <h3>Two-Factor Authentication</h3>
                <p>Enhance your account security by enabling two-factor authentication</p>
                <button className="action-button">
                  Setup Two-Factor Authentication
                </button>
              </div>

              <div className="security-section">
                <h3>Login History</h3>
                <p>Review your recent login activity</p>
                <div className="login-history">
                  <div className="login-item">
                    <div className="login-details">
                      <span className="login-date">Today, 10:45 AM</span>
                      <span className="login-location">Windows, Chrome Browser</span>
                      <span className="login-ip">192.168.1.1</span>
                    </div>
                    <span className="login-status current">Current Session</span>
                  </div>
                  <div className="login-item">
                    <div className="login-details">
                      <span className="login-date">Yesterday, 3:20 PM</span>
                      <span className="login-location">Windows, Firefox Browser</span>
                      <span className="login-ip">192.168.1.1</span>
                    </div>
                    <span className="login-status">Successful</span>
                  </div>
                </div>
              </div>

              <div className="security-section danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-action">
                  <div className="danger-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data</p>
                  </div>
                  <button className="delete-button">
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .settings-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .settings-header {
          margin-bottom: 30px;
          color: #2c3e50;
          font-size: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }

        .settings-layout {
          display: flex;
          gap: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .settings-tabs {
          width: 250px;
          background: #f8f9fa;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
        }

        .tab-button {
          text-align: left;
          padding: 15px 20px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #555;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button:hover {
          background: #eaecef;
        }

        .tab-button.active {
          background: #e9ecef;
          color: #3498db;
          border-left: 3px solid #3498db;
        }

        .settings-content {
          flex: 1;
          padding: 30px;
        }

        .settings-panel h2 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .settings-description {
          color: #7f8c8d;
          margin-bottom: 25px;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-input:focus {
          border-color: #3498db;
          outline: none;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .form-divider {
          height: 1px;
          background: #eaecef;
          margin: 10px 0;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .save-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s;
        }

        .save-button:hover {
          background: #2980b9;
        }

        .save-button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .checkbox-group {
          display: flex;
          align-items: start;
          gap: 10px;
          margin-bottom: 15px;
        }

        .checkbox-group input[type="checkbox"] {
          margin-top: 5px;
        }

        .checkbox-group label {
          display: flex;
          flex-direction: column;
        }

        .option-description {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .input-help {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .security-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .security-section h3 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .action-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.3s;
        }

        .action-button:hover {
          background: #2980b9;
        }

        .login-history {
          margin-top: 15px;
        }

        .login-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .login-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .login-date {
          font-weight: bold;
          color: #2c3e50;
        }

        .login-location, .login-ip {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .login-status {
          padding: 5px 10px;
          border-radius: 20px;
          background: #ecf0f1;
          font-size: 0.8rem;
        }

        .login-status.current {
          background: #27ae60;
          color: white;
        }

        .danger-zone {
          background: #fff8f8;
          border: 1px solid #ffd7d7;
          border-radius: 4px;
          padding: 20px;
        }

        .danger-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .danger-info h4 {
          color: #c0392b;
          margin: 0 0 5px 0;
        }

        .danger-info p {
          color: #7f8c8d;
          margin: 0;
        }

        .delete-button {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s;
        }

        .delete-button:hover {
          background: #c0392b;
        }

        @media (max-width: 768px) {
          .settings-layout {
            flex-direction: column;
          }

          .settings-tabs {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings; 