import React, { useState, useEffect, useCallback } from 'react';
import { FaChartBar, FaChartLine, FaFilter, FaDownload, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import { getJwtToken } from '../utils/common';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [salesData, setSalesData] = useState(null);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      // This would normally be a real API call to get analytics data
      // For demo purposes, we'll simulate the data
      const response = await api.get(`/analytics?timeRange=${timeRange}`, {
        headers: { Authorization: token }
      }).catch(() => {
        // If API doesn't exist yet, use mock data
        return { data: generateMockData() };
      });

      if (response.data) {
        setSalesData(response.data.salesData);
        setInventoryStatus(response.data.inventoryStatus);
        setTopSellingItems(response.data.topSellingItems);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");

      // Fallback to mock data if API fails
      const mockData = generateMockData();
      setSalesData(mockData.salesData);
      setInventoryStatus(mockData.inventoryStatus);
      setTopSellingItems(mockData.topSellingItems);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const generateMockData = () => {
    // Generate mock data for demonstration
    const mockSalesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sales',
          data: [12500, 19200, 15700, 18900, 22100, 24500],
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 1)'
        },
        {
          label: 'Profit',
          data: [5200, 7800, 6300, 7600, 9100, 10300],
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          borderColor: 'rgba(46, 204, 113, 1)'
        }
      ]
    };

    const mockInventoryStatus = [
      { name: 'Laptop Dell XPS 15', quantity: 12, price: 1299, category: 'Electronics', status: 'normal' },
      { name: 'Wireless Mouse', quantity: 8, price: 29.99, category: 'Accessories', status: 'low' },
      { name: 'USB-C Hub', quantity: 15, price: 49.99, category: 'Accessories', status: 'normal' },
      { name: 'iPad Pro 11"', quantity: 3, price: 799, category: 'Electronics', status: 'critical' },
      { name: 'AirPods Pro', quantity: 5, price: 249, category: 'Audio', status: 'low' },
      { name: 'Mechanical Keyboard', quantity: 7, price: 89.99, category: 'Accessories', status: 'low' },
      { name: 'External SSD 1TB', quantity: 11, price: 159.99, category: 'Storage', status: 'normal' },
      { name: 'Wireless Charger', quantity: 2, price: 35.99, category: 'Accessories', status: 'critical' }
    ];

    const mockTopSellingItems = [
      { name: 'Laptop Dell XPS 15', quantity: 32, revenue: 41568, percentage: 28 },
      { name: 'AirPods Pro', quantity: 45, revenue: 11205, percentage: 19 },
      { name: 'iPad Pro 11"', quantity: 29, revenue: 23171, percentage: 17 },
      { name: 'USB-C Hub', quantity: 78, revenue: 3899.22, percentage: 12 },
      { name: 'External SSD 1TB', quantity: 41, revenue: 6559.59, percentage: 10 }
    ];

    return {
      salesData: mockSalesData,
      inventoryStatus: mockInventoryStatus,
      topSellingItems: mockTopSellingItems
    };
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Calculate totals for summary cards
  const totalSales = salesData?.datasets[0]?.data.reduce((sum, current) => sum + current, 0) || 0;
  const totalProfit = salesData?.datasets[1]?.data.reduce((sum, current) => sum + current, 0) || 0;
  const totalInventoryItems = inventoryStatus.reduce((sum, current) => sum + current.quantity, 0);
  const totalInventoryValue = inventoryStatus.reduce((sum, current) => sum + (current.quantity * current.price), 0);
  const lowStockItems = inventoryStatus.filter(item => item.status === 'low' || item.status === 'critical').length;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-filter">
          <FaFilter className="filter-icon" />
          <div className="filter-buttons">
            <button 
              className={`filter-button ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </button>
            <button 
              className={`filter-button ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </button>
            <button 
              className={`filter-button ${timeRange === 'quarter' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('quarter')}
            >
              Quarter
            </button>
            <button 
              className={`filter-button ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon sales">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Total Sales</h3>
            <p className="card-value">${totalSales.toLocaleString()}</p>
            <p className="card-trend positive">↑ 12.5% vs previous {timeRange}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon profit">
            <FaChartBar />
          </div>
          <div className="card-content">
            <h3>Total Profit</h3>
            <p className="card-value">${totalProfit.toLocaleString()}</p>
            <p className="card-trend positive">↑ 8.7% vs previous {timeRange}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon inventory">
            <FaBoxOpen />
          </div>
          <div className="card-content">
            <h3>Inventory Items</h3>
            <p className="card-value">{totalInventoryItems} items</p>
            <p className="card-value-secondary">${totalInventoryValue.toLocaleString()} value</p>
          </div>
        </div>
        
        <div className="summary-card warning">
          <div className="card-icon low-stock">
            <FaExclamationTriangle />
          </div>
          <div className="card-content">
            <h3>Low Stock Items</h3>
            <p className="card-value">{lowStockItems} items</p>
            <p className="card-trend negative">Requires attention</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="analytics-grid">
        {/* Sales Chart */}
        <div className="analytics-panel chart-panel">
          <div className="panel-header">
            <h2>Sales & Profit Trends</h2>
            <button className="download-button">
              <FaDownload /> Export
            </button>
          </div>

          <div className="chart-container">
            {loading ? (
              <div className="loading-placeholder">Loading chart data...</div>
            ) : (
              <div className="chart-placeholder">
                {/* This would be replaced with a real chart component */}
                <div className="mock-chart">
                  <div className="chart-bars">
                    {salesData?.labels.map((label, index) => (
                      <div key={index} className="chart-bar-group">
                        <div 
                          className="chart-bar sales-bar" 
                          style={{ 
                            height: `${(salesData?.datasets[0].data[index] / 25000) * 100}%` 
                          }}
                        >
                          <span className="bar-tooltip">${salesData?.datasets[0].data[index].toLocaleString()}</span>
                        </div>
                        <div 
                          className="chart-bar profit-bar" 
                          style={{ 
                            height: `${(salesData?.datasets[1].data[index] / 25000) * 100}%` 
                          }}
                        >
                          <span className="bar-tooltip">${salesData?.datasets[1].data[index].toLocaleString()}</span>
                        </div>
                        <div className="chart-label">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color sales-color"></div>
                      <span>Sales</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color profit-color"></div>
                      <span>Profit</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="analytics-panel">
          <div className="panel-header">
            <h2>Top Selling Products</h2>
            <button className="download-button">
              <FaDownload /> Export
            </button>
          </div>

          <div className="top-selling-container">
            {loading ? (
              <div className="loading-placeholder">Loading top selling products...</div>
            ) : (
              <div className="top-selling-list">
                {topSellingItems.map((item, index) => (
                  <div key={index} className="top-selling-item">
                    <div className="item-rank">{index + 1}</div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <div className="item-stats">
                        <span>{item.quantity} units sold</span>
                        <span>${item.revenue.toLocaleString()} revenue</span>
                      </div>
                    </div>
                    <div className="item-percentage">
                      <div className="percentage-bar">
                        <div className="percentage-fill" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                      <span>{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="analytics-panel full-width">
          <div className="panel-header">
            <h2>Inventory Status</h2>
            <button className="download-button">
              <FaDownload /> Export
            </button>
          </div>

          <div className="inventory-status-container">
            {loading ? (
              <div className="loading-placeholder">Loading inventory status...</div>
            ) : (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryStatus.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.quantity * item.price).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'normal' ? 'Normal' : 
                           item.status === 'low' ? 'Low Stock' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .analytics-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .analytics-header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 2rem;
        }

        .time-filter {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 8px;
          padding: 8px 16px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .filter-icon {
          margin-right: 10px;
          color: #7f8c8d;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-button {
          background: none;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          color: #7f8c8d;
          transition: all 0.2s;
        }

        .filter-button.active {
          background: #3498db;
          color: white;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          padding: 20px;
          display: flex;
          align-items: center;
          transition: transform 0.3s;
        }

        .summary-card:hover {
          transform: translateY(-5px);
        }

        .summary-card.warning {
          border-left: 4px solid #e74c3c;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1.5rem;
          color: white;
        }

        .card-icon.sales {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }

        .card-icon.profit {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
        }

        .card-icon.inventory {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
        }

        .card-icon.low-stock {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }

        .card-content {
          flex: 1;
        }

        .card-content h3 {
          margin: 0 0 5px 0;
          color: #7f8c8d;
          font-size: 0.9rem;
          font-weight: normal;
        }

        .card-value {
          color: #2c3e50;
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        .card-value-secondary {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin: 5px 0 0 0;
        }

        .card-trend {
          font-size: 0.8rem;
          margin: 5px 0 0 0;
        }

        .card-trend.positive {
          color: #27ae60;
        }

        .card-trend.negative {
          color: #e74c3c;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .analytics-panel {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .analytics-panel.full-width {
          grid-column: 1 / -1;
        }

        .analytics-panel.chart-panel {
          grid-row: span 2;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .panel-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .download-button {
          background: none;
          border: 1px solid #ddd;
          padding: 6px 12px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7f8c8d;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-button:hover {
          border-color: #3498db;
          color: #3498db;
        }

        .chart-container, 
        .top-selling-container, 
        .inventory-status-container {
          padding: 20px;
        }

        .loading-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #95a5a6;
        }

        /* Mock chart styles */
        .mock-chart {
          height: 300px;
          display: flex;
          flex-direction: column;
        }

        .chart-bars {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 250px;
          padding-bottom: 20px;
        }

        .chart-bar-group {
          display: flex;
          align-items: flex-end;
          margin: 0 10px;
          position: relative;
        }

        .chart-bar {
          width: 20px;
          border-radius: 4px 4px 0 0;
          position: relative;
        }

        .chart-bar.sales-bar {
          background: rgba(52, 152, 219, 0.7);
          margin-right: 5px;
        }

        .chart-bar.profit-bar {
          background: rgba(46, 204, 113, 0.7);
        }

        .bar-tooltip {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: #2c3e50;
          color: white;
          padding: 3px 6px;
          border-radius: 3px;
          font-size: 0.7rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .chart-bar:hover .bar-tooltip {
          opacity: 1;
        }

        .chart-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .legend-color {
          width: 14px;
          height: 14px;
          border-radius: 2px;
        }

        .legend-color.sales-color {
          background: rgba(52, 152, 219, 0.7);
        }

        .legend-color.profit-color {
          background: rgba(46, 204, 113, 0.7);
        }

        /* Top selling products */
        .top-selling-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .top-selling-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .item-rank {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3498db;
          color: white;
          border-radius: 50%;
          margin-right: 15px;
          font-weight: bold;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .item-stats {
          display: flex;
          gap: 15px;
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .item-percentage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          width: 100px;
        }

        .percentage-bar {
          width: 100%;
          height: 6px;
          background: #ecf0f1;
          border-radius: 3px;
          overflow: hidden;
        }

        .percentage-fill {
          height: 100%;
          background: #3498db;
        }

        /* Inventory table */
        .inventory-table {
          width: 100%;
          border-collapse: collapse;
        }

        .inventory-table th {
          text-align: left;
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
          color: #7f8c8d;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .inventory-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #ecf0f1;
          color: #2c3e50;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .status-badge.normal {
          background: #e8f8f5;
          color: #27ae60;
        }

        .status-badge.low {
          background: #fef9e7;
          color: #f39c12;
        }

        .status-badge.critical {
          background: #fdedeb;
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .summary-cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 576px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics; 