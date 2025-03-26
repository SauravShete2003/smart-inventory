import React from "react";
import { useState, useEffect } from "react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { getJwtToken } from "../utils/common";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle, FaBoxOpen, FaFilter, FaTimes, FaSave } from "react-icons/fa";

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  threshold: number;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    threshold: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    // Filter inventory based on search term and category filter
    let filtered = [...inventory];
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    setFilteredInventory(filtered);
  }, [inventory, searchTerm, categoryFilter]);

  const fetchInventory = async () => {
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
      
      // Ensure we have valid data before setting state
      const items = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : [];
      setInventory(items);
      setFilteredInventory(items);
      
      // Extract unique categories with safeguards against undefined
      const uniqueCategories = Array.from(
        new Set(items.map((item: any) => (item && item.category) || "Uncategorized"))
      ) as string[];
      
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch inventory data. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({ 
      ...newItem, 
      [name]: name === 'quantity' || name === 'price' || name === 'threshold' 
        ? parseFloat(value) || 0 
        : value 
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [name]: name === 'quantity' || name === 'price' || name === 'threshold'
          ? parseFloat(value) || 0
          : value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getJwtToken();

      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      if (!newItem.name || !newItem.category) {
        toast.error("Name and category are required!");
        return;
      }

      const validatedNewItem = {
        ...newItem,
        quantity: newItem.quantity || 0,
        price: newItem.price !== undefined ? newItem.price : 0,
        threshold: newItem.threshold || 0,
      };

      setLoading(true);
      const response = await api.post("/inventories", validatedNewItem, {
        headers: { Authorization: token },
      });

      // Handle the response data based on your API structure
      const newItemData = response.data.item || response.data;
      
      if (newItemData && newItemData._id) {
        toast.success("Item added successfully!");
        setInventory([...inventory, newItemData]);

        setNewItem({
          name: "",
          category: "",
          quantity: 0,
          price: 0,
          threshold: 0,
        });
      } else {
        toast.error("Invalid response from server");
        console.error("Invalid response:", response);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error adding new item:", error);
      toast.error("Failed to add new inventory item.");
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      if (!editingItem.name || !editingItem.category) {
        toast.error("Name and category are required!");
        return;
      }

      setLoading(true);
      
      // Format auth header properly
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await api.put(`/inventories/${editingItem._id}`, editingItem, {
        headers: { 
          Authorization: authHeader,
          'Content-Type': 'application/json'
        }
      });

      // Check response based on your API structure
      const updatedItem = response.data.item || response.data;
      
      if (updatedItem && updatedItem._id) {
        toast.success("Item updated successfully!");
        
        // Update the inventory list
        setInventory(inventory.map(item => 
          item._id === editingItem._id ? updatedItem : item
        ));
        
        // Close the edit form
        setEditingItem(null);
      } else {
        toast.error("Invalid response from server");
        console.error("Invalid response:", response);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error updating item:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update inventory item";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    // Make a copy to avoid reference issues
    setEditingItem({...item});
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      setLoading(true);
      
      // Format auth header properly
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      await api.delete(`/inventories/${id}`, {
        headers: { 
          Authorization: authHeader,
          'Content-Type': 'application/json'
        }
      });
      
      // Directly update state without waiting for success check
      toast.success("Item deleted successfully");
      setInventory(inventory.filter(item => item._id !== id));
      setLoading(false);
    } catch (error: any) {
      console.error("Error deleting item:", error);
      // More detailed error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete item";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}
      <div className="flex-1 overflow-auto">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Inventory Management
          </h1>
          
          {/* Edit Item Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    <FaEdit className="inline mr-2" /> Edit Item
                  </h3>
                  <button 
                    onClick={cancelEdit}
                    className="text-white hover:text-gray-200 transition duration-150"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                        Item Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="edit-name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={editingItem.name || ''}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        id="edit-category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={editingItem.category || ''}
                        onChange={handleEditInputChange}
                        required
                        list="edit-categories"
                      />
                      <datalist id="edit-categories">
                        {categories.map((category, index) => (
                          <option key={index} value={category} />
                        ))}
                      </datalist>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          id="edit-quantity"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={editingItem.quantity || 0}
                          onChange={handleEditInputChange}
                          required
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price"
                          id="edit-price"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={editingItem.price || 0}
                          onChange={handleEditInputChange}
                          required
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="edit-threshold" className="block text-sm font-medium text-gray-700">
                          Low Stock Threshold
                        </label>
                        <input
                          type="number"
                          name="threshold"
                          id="edit-threshold"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={editingItem.threshold || 0}
                          onChange={handleEditInputChange}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* Add New Item Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-medium">
                <FaPlus className="inline mr-2" /> Add New Item
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Category"
                    value={newItem.category}
                    onChange={handleInputChange}
                    required
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((category, index) => (
                      <option key={index} value={category} />
                    ))}
                  </datalist>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="threshold"
                    id="threshold"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Threshold"
                    value={newItem.threshold}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Inventory Table */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Table Header */}
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  {/* Table Body */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-100 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <FaBoxOpen className="mr-2 text-indigo-500" />
                              {item.name || 'Unnamed Item'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                              {item.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center">
                              {item.quantity < item.threshold && (
                                <FaExclamationTriangle className="mr-2 text-amber-500" title="Low stock" />
                              )}
                              {item.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                            ₹{(item.price || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.quantity <= 0 
                                ? 'bg-red-100 text-red-800' 
                                : item.quantity < item.threshold 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.quantity <= 0 
                                ? 'Out of Stock' 
                                : item.quantity < item.threshold 
                                ? 'Low Stock' 
                                : 'In Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                                onClick={() => handleEdit(item)}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                                onClick={() => handleDelete(item._id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          {searchTerm || categoryFilter 
                            ? "No items match your search criteria." 
                            : "No inventory data available."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <Toaster />
        </div>
      </div>
    </div>
  );
};

export default Inventory;
