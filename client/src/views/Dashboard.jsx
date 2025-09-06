import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getJwtToken } from '../utils/common';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../components/Navbar';
import { FaBox, FaRupeeSign, FaChartLine } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const token = getJwtToken();
    if (!token) {
      toast.error('Authentication token not found!');
      setLoading(false);
      return;
    }

    try {
      const inventoryResponse = await api.get('/api/inventories', {
        headers: { Authorization: token },
      });
      setInventoryData(inventoryResponse.data);

      const salesResponse = await api.get('/api/sales', {
        headers: { Authorization: token },
      });
      setSalesData(salesResponse.data.sales);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const monthlySalesData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    datasets: [
      {
        label: 'Monthly Sales',
        data: Array(12).fill(0).map((_, index) =>
          salesData
            .filter(sale => new Date(sale.saleDate).getMonth() === index)
            .reduce((sum, sale) => sum + sale.total, 0)
        ),
        backgroundColor: 'rgba(99, 102, 241, 0.7)', // Indigo
        borderRadius: 8,
      },
    ],
  };

  const totalInventoryItems = inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalSalesAmount = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-full py-6 sm:px-6 lg:px-8">
        <Navbar />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow hover:shadow-lg transition rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Inventory</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{totalInventoryItems}</p>
            </div>
            <FaBox className="text-indigo-500 text-4xl" />
          </div>

          <div className="bg-white shadow hover:shadow-lg transition rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">₹{totalSalesAmount.toLocaleString()}</p>
            </div>
            <FaRupeeSign className="text-green-500 text-4xl" />
          </div>

          <div className="bg-white shadow hover:shadow-lg transition rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Monthly Growth</h3>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {salesData.length > 0 ? '+15%' : '0%'}
              </p>
            </div>
            <FaChartLine className="text-purple-500 text-4xl" />
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h3>
          {salesData.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales data available</p>
          ) : (
            <div className="h-80">
              <Bar
                key="monthly-sales-chart"
                data={monthlySalesData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
