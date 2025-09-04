import React from "react";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import api from "../utils/api";
import { getJwtToken } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        setLoading(false);
        return;
      }

      try {
        // Fetch inventory data
        const inventoryResponse = await api.get("/inventories", {
          headers: { Authorization: token },
        });
        setInventoryData(inventoryResponse.data);

        // Fetch sales data
        const salesResponse = await api.get("/sales", {
          headers: { Authorization: token },
        });
        setSalesData(salesResponse.data.sales);

        // Fetch sales statistics
        const statsResponse = await api.get("/sales/stats", {
          headers: { Authorization: token },
        });
        setStats(statsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const monthlySalesData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Sales",
        data: Array(12)
          .fill(0)
          .map((_, index) => {
            return salesData
              .filter((sale) => new Date(sale.date).getMonth() === index)
              .reduce((sum, sale) => sum + sale.total, 0);
          }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const topSellingItems = salesData
    .reduce((acc, sale) => {
      if (!sale || !sale.item) return acc;
      
      const existingItem = acc.find(
        (item) => item.name === sale.item.name
      );
      
      if (existingItem) {
        existingItem.quantity += sale.quantity || 0;
        existingItem.total += sale.total || 0;
      } else {
        acc.push({
          name: sale.item.name,
          quantity: sale.quantity || 0,
          total: sale.total || 0,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const topSellingItemsData = {
    labels: topSellingItems.map((item) => item.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: topSellingItems.map((item) => item.quantity),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              ${stats?.totalSales?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Monthly Sales</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              ${stats?.monthlySales?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Weekly Sales</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              ${stats?.weeklySales?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Monthly Sales
              </h3>
              <div className="mt-5">
                <Bar
                  data={monthlySalesData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Selling Items
              </h3>
              <div className="mt-5">
                <Bar
                  data={topSellingItemsData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Inventory Status
            </h3>
            <div className="mt-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Threshold
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.quantity < item.threshold
                              ? "bg-red-100 text-red-800"
                              : item.quantity < item.threshold * 2
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.quantity < item.threshold
                            ? "Low Stock"
                            : item.quantity < item.threshold * 2
                            ? "Medium Stock"
                            : "Good Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 