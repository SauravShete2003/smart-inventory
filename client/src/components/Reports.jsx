import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import api from "../utils/api";
import { getJwtToken } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Package,
} from "lucide-react";

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
        const inventoryResponse = await api.get("/api/inventories");
        setInventoryData(inventoryResponse.data);

        const salesResponse = await api.get("/api/sales");
        setSalesData(salesResponse.data.sales);

        const statsResponse = await api.get("/sales/stats");
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
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ],
    datasets: [
      {
        label: "Monthly Sales",
        data: Array(12)
          .fill(0)
          .map((_, index) =>
            salesData
              .filter((sale) => new Date(sale.date).getMonth() === index)
              .reduce((sum, sale) => sum + sale.total, 0)
          ),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  const topSellingItems = salesData
    .reduce((acc, sale) => {
      if (!sale?.item) return acc;
      const existing = acc.find((i) => i.name === sale.item.name);
      if (existing) {
        existing.quantity += sale.quantity || 0;
        existing.total += sale.total || 0;
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
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-solid"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-full py-8 px-6 lg:px-10">
          <Navbar />
          <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Reports</h1>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center space-x-4">
              <TrendingUp className="text-indigo-500 w-10 h-10" />
              <div>
                <h3 className="text-sm text-gray-500">Total Sales</h3>
                <p className="text-2xl font-bold text-indigo-600">
                  ₹{stats?.totalSales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center space-x-4">
              <Calendar className="text-green-500 w-10 h-10" />
              <div>
                <h3 className="text-sm text-gray-500">Monthly Sales</h3>
                <p className="text-2xl font-bold text-green-600">
                  ₹{stats?.monthlySales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center space-x-4">
              <BarChart3 className="text-blue-500 w-10 h-10" />
              <div>
                <h3 className="text-sm text-gray-500">Weekly Sales</h3>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{stats?.weeklySales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Sales Overview
              </h3>
              <div className="h-80">
                <Bar
                  data={monthlySalesData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Selling Items
              </h3>
              <div className="h-80">
                <Bar
                  data={topSellingItemsData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white shadow-md rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="text-gray-600" /> Inventory Status
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    {["Item", "Current Stock", "Threshold", "Status"].map(
                      (head) => (
                        <th
                          key={head}
                          className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider"
                        >
                          {head}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventoryData.map((item) => {
                    const isLow = item.quantity < item.threshold;
                    const isMedium =
                      item.quantity >= item.threshold &&
                      item.quantity < item.threshold * 2;

                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.threshold}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              isLow
                                ? "bg-red-100 text-red-700"
                                : isMedium
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isLow ? (
                              <AlertTriangle className="w-4 h-4 mr-1" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            {isLow
                              ? "Low Stock"
                              : isMedium
                              ? "Medium Stock"
                              : "Good Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Reports;
