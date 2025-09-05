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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const totalInventoryItems = inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalSalesAmount = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-full py-6 sm:px-6 lg:px-8">
        <Navbar />
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Inventory Items</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">{totalInventoryItems}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Sales Amount</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">${totalSalesAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Sales</h3>
            <div className="mt-5">
              <Bar key="monthly-sales-chart" data={monthlySalesData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
