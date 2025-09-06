import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; 
import { FaPlus, FaSearch, FaSort, FaEdit, FaTrash } from "react-icons/fa";

export default function Inventory() {
  // State
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    threshold: "",
  });

  // Dummy data (replace with API call later)
  useEffect(() => {
    setInventory([
      {
        _id: "1",
        name: "Acer Aspire 3 Intel Core Celeron",
        description: "15.6-inch laptop, 4GB RAM, 256GB SSD.",
        category: "Electronics",
        price: 10000,
        quantity: 10,
        threshold: 5,
      },
      {
        _id: "2",
        name: "Wireless Mouse",
        description: "Ergonomic, 2.4GHz, USB receiver.",
        category: "Electronics",
        price: 500,
        quantity: 50,
        threshold: 10,
      },
    ]);
  }, []);

  // Helpers
  const getStockStatus = (quantity, threshold) => {
    if (quantity <= 0) return "out-of-stock";
    if (quantity <= threshold) return "low-stock";
    return "in-stock";
  };

  const getSortedAndFilteredInventory = () => {
    return inventory
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((item) =>
        filterCategory ? item.category === filterCategory : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />

      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <h1 className="text-3xl font-bold text-gray-900">📦 Inventory</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          <FaPlus className="mr-2" /> Add Item
        </button>
      </header>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {Array.from(new Set(inventory.map((item) => item.category))).map(
            (category) => (
              <option key={category} value={category}>
                {category}
              </option>
            )
          )}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl shadow-md bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 shadow-sm">
            <tr>
              {[
                "Name",
                "Description",
                "Category",
                "Quantity",
                "Price",
                "Threshold",
                "Status",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {getSortedAndFilteredInventory().map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {item.description}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">{item.quantity}</td>
                <td className="px-6 py-4 text-right">₹{item.price}</td>
                <td className="px-6 py-4 text-right">{item.threshold}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      getStockStatus(item.quantity, item.threshold) ===
                      "out-of-stock"
                        ? "bg-red-100 text-red-700"
                        : getStockStatus(item.quantity, item.threshold) ===
                          "low-stock"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {getStockStatus(item.quantity, item.threshold).replace(
                      "-",
                      " "
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setNewItem(item);
                      setShowEditModal(true);
                    }}
                    className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
