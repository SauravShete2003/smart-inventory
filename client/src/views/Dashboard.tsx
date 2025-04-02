import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { getJwtToken } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { FaBoxOpen, FaChartLine, FaUsers, FaMoneyBillWave, FaRegCalendarCheck } from "react-icons/fa";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

interface SummaryMetric {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
}

const Dashboard: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<string>("week");
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetric[]>([
    { title: "Total Revenue", value: "$0", change: 0, icon: <FaMoneyBillWave /> },
    { title: "Total Inventory", value: 0, change: 0, icon: <FaBoxOpen /> },
    { title: "Active Users", value: 0, change: 0, icon: <FaUsers /> },
    { title: "Sales Growth", value: "0%", change: 0, icon: <FaChartLine /> },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        setLoading(false);
        return;
      }

      try {
        const inventoryResponse = await api.get("/inventories", {
          headers: { Authorization: token },
        });
        setInventoryData(inventoryResponse.data);

        const salesResponse = await api.get(`/sales?period=${dateRange}`, {
          headers: { Authorization: token },
        });
        
        // Process sales data to ensure customer field is a string
        const processedSales = (salesResponse.data.sales || []).map((sale: any) => {
          // Check if customer is an object (with name, email, phone) and convert to string
          if (sale.customer && typeof sale.customer === 'object') {
            return {
              ...sale,
              customer: sale.customer.name || 'Anonymous'
            };
          }
          return sale;
        });
        
        setSalesData(processedSales);

        // Update summary metrics
        const totalRevenue = salesResponse.data.totalRevenue || 0;
        const inventoryCount = inventoryResponse.data.length || 0;
        const activeUsers = salesResponse.data.activeUsers || 0;
        const salesGrowth = salesResponse.data.salesGrowth || 0;

        setSummaryMetrics([
          { 
            title: "Total Revenue", 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: salesResponse.data.revenueChange || 5.2, 
            icon: <FaMoneyBillWave /> 
          },
          { 
            title: "Total Inventory", 
            value: inventoryCount, 
            change: inventoryResponse.data.inventoryChange || 3.1, 
            icon: <FaBoxOpen /> 
          },
          { 
            title: "Active Users", 
            value: activeUsers, 
            change: salesResponse.data.userChange || 7.5, 
            icon: <FaUsers /> 
          },
          { 
            title: "Sales Growth", 
            value: `${salesGrowth}%`, 
            change: salesGrowth, 
            icon: <FaChartLine /> 
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 60000); // Refresh data every minute
    return () => clearInterval(interval);
  }, [dateRange]);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const inventoryChartData = {
    labels: inventoryData.slice(0, 10).map((item) => item.name),
    datasets: [
      {
        label: "Quantity",
        data: inventoryData.slice(0, 10).map((item) => item.quantity),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const inventoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Inventory Levels',
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      }
    }
  };

  const salesChartData = Array.isArray(salesData)
    ? {
        labels: salesData
          .filter((sale) => sale.saleDate)
          .map((sale) => new Date(sale.saleDate).toLocaleDateString()),
        datasets: [
          {
            label: "Total Sales",
            data: salesData
              .filter((sale) => sale.saleDate)
              .map((sale) => sale.total || 0),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
            tension: 0.3,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Sales Trends',
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales Amount ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  // Category distribution data
  const categoryData = {
    labels: ['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'],
    datasets: [
      {
        label: 'Categories',
        data: [25, 20, 15, 30, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleDateRangeChange('week')}
                className={`px-3 py-1 rounded-md ${dateRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Week
              </button>
              <button 
                onClick={() => handleDateRangeChange('month')}
                className={`px-3 py-1 rounded-md ${dateRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Month
              </button>
              <button 
                onClick={() => handleDateRangeChange('year')}
                className={`px-3 py-1 rounded-md ${dateRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Year
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {summaryMetrics.map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:scale-105">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">{metric.title}</p>
                        <p className="text-2xl font-bold mt-1">{metric.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${metric.change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {metric.icon}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-sm font-semibold ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last period</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md h-80">
                  <Line 
                    data={salesChartData} 
                    options={salesChartOptions}
                  />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md h-80">
                  <Bar 
                    data={inventoryChartData} 
                    options={inventoryChartOptions}
                  />
                </div>
              </div>

              {/* Additional Data */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md col-span-2">
                  <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(salesData) && salesData.slice(0, 5).map((sale, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sale.id || index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {typeof sale.customer === 'object' ? 
                                (sale.customer?.name || 'Anonymous') : 
                                (sale.customer || 'Anonymous')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.total || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {sale.status || 'Completed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
                  <div className="h-64">
                    <Doughnut 
                      data={categoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
                <div className="space-y-3">
                  {[
                    { id: 1, task: 'Inventory restocking', due: '2023-10-25', priority: 'High' },
                    { id: 2, task: 'Monthly financial report', due: '2023-10-30', priority: 'Medium' },
                    { id: 3, task: 'Staff meeting', due: '2023-10-26', priority: 'Low' },
                  ].map((task) => (
                    <div key={task.id} className="flex items-center p-3 border border-gray-200 rounded-md">
                      <div className="mr-3">
                        <FaRegCalendarCheck className="text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.task}</p>
                        <p className="text-sm text-gray-500">Due: {task.due}</p>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <Toaster />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
