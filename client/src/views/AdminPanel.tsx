import { Users, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaUsers, FaBox, FaChartBar, FaCog, FaBell, FaSignOutAlt, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Inventory from './Inventory';
import api from '../utils/api';
import { getJwtToken } from '../utils/common';
import toast from 'react-hot-toast';
// import Analytics from './Analytics';

interface DashboardStats {
    totalUsers: number;
    totalInventory: number;
    pendingOrders: number;
    lowStockItems: number;
}

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalInventory: 0,
        pendingOrders: 0,
        lowStockItems: 0
    });
    const [notifications, setNotifications] = useState<number>(0);
    
    // Sample recent activity data
    const recentActivities = [
        { id: 1, action: 'Updated user permissions', time: '10 min ago' },
        { id: 2, action: 'Added new inventory item', time: '2 hours ago' },
        { id: 3, action: 'Generated monthly report', time: '5 hours ago' },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = getJwtToken();
            if (!token) {
                toast.error("Authentication token not found!");
                return;
            }

            try {
                const response = await api.get("/dashboard", {
                    headers: { Authorization: token }
                }).catch(error => {
                    if (error.response && error.response.status === 404) {
                        // If API endpoint doesn't exist, use mock data
                        return { 
                            data: {
                                totalUsers: 24,
                                totalInventory: 156,
                                pendingOrders: 8,
                                lowStockItems: 13
                            }
                        };
                    }
                    throw error;
                });
                
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to fetch dashboard data");
                
                // Fallback to mock data if API fails
                setStats({
                    totalUsers: 24,
                    totalInventory: 156,
                    pendingOrders: 8,
                    lowStockItems: 12
                });
            }
        };

        fetchDashboardData();
        // Set up polling for real-time updates
        const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-panel-container">
            {/* Sidebar */}
            <nav className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Dashboard</h2>
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <Link to="/users" className="menu-link">
                            <FaUsers className="menu-icon" />
                            Users
                        </Link>
                    </li>
                    <li>
                        <Link to="/inventory" className="menu-link">
                            <FaBox className="menu-icon" />
                            Inventory
                        </Link>
                    </li>
                    <li>
                        <Link to="/analytics" className="menu-link">
                            <FaChartBar className="menu-icon" />
                            Analytics
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="menu-link">
                            <FaCog className="menu-icon" />
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <main className="admin-main-content">
                {/* Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Welcome back, Admin</h1>
                        <p>Last login: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="header-right">
                        <div className="notification-badge">
                            <FaBell className="notification-icon" />
                            {notifications > 0 && (
                                <span className="notification-count">{notifications}</span>
                            )}
                        </div>
                        <button className="logout-button" onClick={handleLogout}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaUsers />
                        </div>
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <div className="stat-content">
                                <span className="stat-number">{stats.totalUsers}</span>
                                <span className="stat-change positive">↑ 12%</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaBox />
                        </div>
                        <div className="stat-info">
                            <h3>Inventory Items</h3>
                            <div className="stat-content">
                                <span className="stat-number">{stats.totalInventory}</span>
                                <span className="stat-change negative">↓ 3%</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaShoppingCart />
                        </div>
                        <div className="stat-info">
                            <h3>Pending Orders</h3>
                            <div className="stat-content">
                                <span className="stat-number">{stats.pendingOrders}</span>
                                <span className="stat-change positive">↑ 5%</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-icon">
                            <FaExclamationTriangle />
                        </div>
                        <div className="stat-info">
                            <h3>Low Stock Items</h3>
                            <div className="stat-content">
                                <span className="stat-number">{stats.lowStockItems}</span>
                                <span className="stat-change negative">↓ 8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity and Quick Actions */}
                <div className="dashboard-grid">
                    <div className="recent-activity">
                        <h2>Recent Activity</h2>
                        <div className="activity-list">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-dot"></div>
                                    <div className="activity-content">
                                        <p>{activity.action}</p>
                                        <small>{activity.time}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <Link to={"/inventory"} className="action-button">
                                <FaBox /> Add Inventory
                            </Link>
                            <button className="action-button">
                                <FaUsers /> Add User
                            </button>
                            <button className="action-button">
                                <FaChartBar /> Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Routes */}
                <Routes>
                    <Route path="/users" element={<Users />} />
                    <Route path="/inventory" element={<Inventory />} />
                    {/* <Route path="/analytics" element={<Analytics />} /> */}
                    <Route path="/settings" element={<Settings />} />
                    <Route
                        path="/"
                        element={
                            <div className="dashboard-overview">
                                <h2>Dashboard Overview</h2>
                                {/* Add more dashboard content here */}
                            </div>
                        }
                    />
                </Routes>
            </main>

            <style>{`
                .admin-panel-container {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f5f6fa;
                    font-family: 'Segoe UI', sans-serif;
                }

                .admin-sidebar {
                    width: 250px;
                    background: #2c3e50;
                    color: white;
                    padding: 20px;
                    position: fixed;
                    height: 100%;
                    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                }

                .sidebar-header h2 {
                    color: #ecf0f1;
                    margin-bottom: 30px;
                    font-size: 1.5rem;
                }

                .sidebar-menu {
                    list-style: none;
                    padding: 0;
                }

                .menu-link {
                    text-decoration: none;
                    color: inherit;
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    margin: 5px 0;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .menu-link:hover {
                    background: #34495e;
                    transform: translateX(5px);
                }

                .menu-icon {
                    margin-right: 10px;
                    font-size: 1.2rem;
                }

                .admin-main-content {
                    flex: 1;
                    margin-left: 250px;
                    padding: 30px;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }

                .header-left h1 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 1.8rem;
                }

                .header-left p {
                    color: #7f8c8d;
                    margin: 5px 0 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .notification-badge {
                    position: relative;
                    cursor: pointer;
                }

                .notification-count {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 0.8rem;
                }

                .notification-icon {
                    font-size: 1.2rem;
                    color: #7f8c8d;
                }

                .logout-button {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.3s;
                }

                .logout-button:hover {
                    background: #c0392b;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    transition: transform 0.3s;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                }

                .stat-card.warning {
                    border-left: 4px solid #f1c40f;
                }

                .stat-icon {
                    font-size: 2rem;
                    margin-right: 15px;
                    color: #3498db;
                }

                .stat-info {
                    flex: 1;
                }

                .stat-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                }

                .stat-number {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: #2c3e50;
                }

                .stat-change {
                    font-size: 0.9rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                }

                .positive {
                    background: #27ae60;
                    color: white;
                }

                .negative {
                    background: #c0392b;
                    color: white;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .recent-activity, .quick-actions {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }

                .activity-list {
                    margin-top: 20px;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                }

                .activity-dot {
                    width: 10px;
                    height: 10px;
                    background: #3498db;
                    border-radius: 50%;
                    margin-right: 15px;
                }

                .activity-content p {
                    margin: 0;
                    color: #2c3e50;
                }

                .activity-content small {
                    color: #7f8c8d;
                }

                .action-buttons {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                    margin-top: 20px;
                }

                .action-button {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: background 0.3s;
                }

                .action-button:hover {
                    background: #2980b9;
                }

                @media (max-width: 768px) {
                    .admin-sidebar {
                        width: 100%;
                        position: relative;
                        height: auto;
                    }

                    .admin-main-content {
                        margin-left: 0;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;