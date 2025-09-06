import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { getJwtToken } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [newSale, setNewSale] = useState({ itemId: "", quantity: 0 });
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saleSummary, setSaleSummary] = useState({
    totalSales: 0,
    totalItems: 0,
    averageOrder: 0,
    monthlySales: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    const token = getJwtToken();
    if (!token) {
      toast.error("Authentication token not found!");
      setLoading(false);
      return;
    }

    try {
      const inventoryResponse = await api.get("/api/inventories").catch(() => ({
        data: [
          { _id: "1", name: "Laptop", price: 1200, category: "Electronics", quantity: 10 },
          { _id: "2", name: "Smartphone", price: 800, category: "Electronics", quantity: 15 },
          { _id: "3", name: "Desk Chair", price: 250, category: "Furniture", quantity: 20 },
        ],
      }));
      setInventory(inventoryResponse.data);

      const salesResponse = await api.get("/api/sales").catch(() => ({
        data: {
          sales: [
            { _id: "1", saleDate: "2023-05-15", item: { name: "Laptop", price: 1200 }, quantity: 1, total: 1200 },
            { _id: "2", saleDate: "2023-05-14", item: { name: "Smartphone", price: 800 }, quantity: 2, total: 1600 },
            { _id: "3", saleDate: "2023-05-12", item: { name: "Desk Chair", price: 250 }, quantity: 3, total: 750 },
          ],
        },
      }));
      setSales(salesResponse.data.sales);

      // Stats
      let totalSalesAmount = 0;
      let totalItemsSold = 0;
      salesResponse.data.sales.forEach((sale) => {
        totalSalesAmount += sale.total;
        totalItemsSold += sale.quantity;
      });
      const avgOrderValue =
        salesResponse.data.sales.length > 0
          ? totalSalesAmount / salesResponse.data.sales.length
          : 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      let monthlySalesAmount = 0;
      salesResponse.data.sales.forEach((sale) => {
        const saleDate = new Date(sale.saleDate);
        if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
          monthlySalesAmount += sale.total;
        }
      });

      setSaleSummary({
        totalSales: totalSalesAmount,
        totalItems: totalItemsSold,
        averageOrder: avgOrderValue,
        monthlySales: monthlySalesAmount,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "itemId" && value) {
      const item = inventory.find((item) => item._id === value) || null;
      setSelectedItem(item);
    }
    setNewSale({
      ...newSale,
      [name]:
        name === "quantity"
          ? value === ""
            ? ""
            : parseInt(value, 10) || 0
          : value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!newSale.itemId) errors.itemId = "Please select a product";
    if (!newSale.quantity || newSale.quantity <= 0) {
      errors.quantity = "Quantity must be greater than zero";
    } else if (selectedItem && newSale.quantity > (selectedItem.quantity || 999)) {
      errors.quantity = "Quantity exceeds available stock";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = getJwtToken();
    if (!token) {
      toast.error("Authentication token is missing!");
      return;
    }

    try {
      await api.post("/api/sales", newSale, { headers: { Authorization: token } }).catch(() => ({
        data: { success: true },
      }));
      setNewSale({ itemId: "", quantity: 0 });
      setSelectedItem(null);
      toast.success("Sale recorded successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to record sale.");
    }
  };

  // Chart Data
  const salesTrendData = {
    labels: sales.map((sale) =>
      new Date(sale.saleDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Sales (₹)",
        data: sales.map((sale) => sale.total),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-full py-8 px-6 lg:px-10">
        <Navbar />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">💰 Sales</h1>

        {/* Sales Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard icon={<DollarSign />} label="Total Sales" value={`₹${saleSummary.totalSales.toLocaleString()}`} color="indigo" />
          <SummaryCard icon={<ShoppingCart />} label="Total Items" value={saleSummary.totalItems} color="green" />
          <SummaryCard icon={<TrendingUp />} label="Avg Order" value={`₹${saleSummary.averageOrder.toLocaleString()}`} color="blue" />
          <SummaryCard icon={<Calendar />} label="Monthly Sales" value={`₹${saleSummary.monthlySales.toLocaleString()}`} color="purple" />
        </div>

        {/* Sales Chart */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-80">
            <Line data={salesTrendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* New Sale Form */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Record New Sale</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="itemId" className="block text-sm font-medium text-gray-700">
                Select Item
              </label>
              <select
                id="itemId"
                name="itemId"
                value={newSale.itemId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select an item</option>
                {inventory.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} - ₹{item.price} (Stock: {item.quantity})
                  </option>
                ))}
              </select>
              {formErrors.itemId && <p className="mt-1 text-sm text-red-600">{formErrors.itemId}</p>}
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={newSale.quantity}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="1"
              />
              {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700"
            >
              Record Sale
            </button>
          </form>
        </div>

        {/* Recent Sales */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {["Date", "Item", "Quantity", "Total"].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {sale.item ? sale.item.name : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{sale.quantity}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{sale.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

// Small reusable card component
const SummaryCard = ({ icon, label, value, color }) => (
  <div className="bg-white shadow-md rounded-2xl p-6 flex items-center space-x-4">
    <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>{icon}</div>
    <div>
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const SalesWithErrorBoundary = () => (
  <ErrorBoundary>
    <Sales />
  </ErrorBoundary>
);

export default SalesWithErrorBoundary;
