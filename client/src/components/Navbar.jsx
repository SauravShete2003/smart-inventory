import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentuser, logOut } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import {
  Menu,
  X,
  Home,
  Box,
  ShoppingCart,
  BarChart,
  Settings,
  ClipboardList,
  User,
} from "lucide-react";
import React from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get the current user (e.g., from localStorage or context)
    const currentUser = getCurrentuser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      toast.error("Please login to access this page");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-lg font-semibold text-indigo-600">
                  Smart Inventory
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              <Link
                to="/"
                className="flex items-center text-gray-900 px-3 py-2 text-sm font-medium hover:text-indigo-600"
              >
                <Home className="w-5 h-5 mr-1" /> Dashboard
              </Link>
              {user &&
                (user.role === "admin" ||
                  user.role === "employee") && (
                  <Link
                    to="/inventory"
                    className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                  >
                    <Box className="w-5 h-5 mr-1" /> Inventory
                  </Link>
                )}
              <Link
                to="/sales"
                className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
              >
                <ShoppingCart className="w-5 h-5 mr-1" /> Sales
              </Link>
              {user && user.role === "admin" && (
                <>
                  <Link
                    to="/reports"
                    className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                  >
                    <BarChart className="w-5 h-5 mr-1" /> Reports
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                  >
                    <Settings className="w-5 h-5 mr-1" /> Admin Panel
                  </Link>
                </>
              )}
              {user && user.role === "employee" && (
                <Link
                  to="/tasks"
                  className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                >
                  <ClipboardList className="w-5 h-5 mr-1" /> Tasks
                </Link>
              )}
              {user && user.role === "user" && (
                <Link
                  to="/profile"
                  className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                >
                  <User className="w-5 h-5 mr-1" /> Profile
                </Link>
              )}
            </div>

            {/* User Info and Logout */}
            <div className="hidden sm:flex sm:items-center">
              <span className="block text-lg font-bold text-gray-800 px-3 mr-4">
                Welcome, {user?.username || "Guest"}
                {user?.role && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 font-normal">
                    {user.role}
                  </span>
                )}
              </span>
              <button
                onClick={logOut}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-gray-50 border-t border-gray-200">
            <div className="px-2 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center text-gray-900 px-3 py-2 text-sm font-medium hover:text-indigo-600"
              >
                <Home className="w-5 h-5 mr-1" /> Dashboard
              </Link>
              {user &&
                (user.role === "admin" ||
                  user.role === "employee") && (
                  <Link
                    to="/inventory"
                    className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                  >
                    <Box className="w-5 h-5 mr-1" /> Inventory
                  </Link>
                )}
              <Link
                to="/sales"
                className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
              >
                <ShoppingCart className="w-5 h-5 mr-1" /> Sales
              </Link>
              {user && user.role === "admin" && (
                <>
                  <Link
                    to="/reports"
                    className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                  >
                    <BarChart className="w-5 h-5 mr-1" /> Reports
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                  >
                    <Settings className="w-5 h-5 mr-1" /> Admin Panel
                  </Link>
                </>
              )}
              {user && user.role === "employee" && (
                <Link
                  to="/tasks"
                  className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                >
                  <ClipboardList className="w-5 h-5 mr-1" /> Tasks
                </Link>
              )}
              {user && user.role === "user" && (
                <Link
                  to="/profile"
                  className="flex items-center text-gray-500 px-3 py-2 text-sm font-medium hover:text-indigo-600"
                >
                  <User className="w-5 h-5 mr-1" /> Profile
                </Link>
              )}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <span className="block text-sm text-gray-500 px-3">
                  Welcome {user?.username || "Guest"}
                  {user?.role && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                      {user.role}
                    </span>
                  )}
                </span>
                <button
                  onClick={logOut}
                  className="block w-full bg-indigo-600 text-white px-4 py-2 mt-2 rounded-md text-sm font-medium text-center hover:bg-indigo-700 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <Toaster />
    </div>
  );
}

export default Navbar;
