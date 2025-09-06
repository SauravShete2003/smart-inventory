import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    threshold: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("smart-inventory-user-token");
      if (!token) {
        setError("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/inventories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else if (response.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          `Failed to fetch inventory: ${
            errorData.message || "Please try again."
          }`
        );
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Error fetching inventory. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getStockStatus = (quantity, threshold) => {
    if (quantity <= 0) return "out-of-stock";
    if (quantity <= threshold) return "low-stock";
    return "in-stock";
  };

  const getSortedAndFilteredInventory = () => {
    return inventory
      .filter(
        (item) =>
          item.name &&
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((item) =>
        filterCategory ? item.category === filterCategory : true
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  };

  // Handle Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("smart-inventory-user-token");

      if (!token) {
        alert("You are not logged in. Please log in first.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/inventories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const addedItem = await response.json();
        setInventory((prevInventory) => [...prevInventory, addedItem]);
        setNewItem({
          name: "",
          description: "",
          category: "",
          price: "",
          quantity: "",
          threshold: "",
        });
        setShowAddModal(false);
        alert("Item added successfully!");
      } else if (response.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          `Failed to add item: ${errorData.message || "Please try again."}`
        );
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item. Please check your connection.");
    }
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={fetchInventory}
              className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl shadow-md bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Qty
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Threshold
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getSortedAndFilteredInventory().length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No items found
                  </td>
                </tr>
              ) : (
                getSortedAndFilteredInventory().map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.description || "No description"}
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      ₹{item.price}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {item.threshold}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Beauty">Beauty</option>
                <option value="Automotive">Automotive</option>
                <option value="Toys">Toys</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Threshold"
                value={newItem.threshold}
                onChange={(e) =>
                  setNewItem({ ...newItem, threshold: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
