import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
import { getCurrentuser, logOut } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import {
  Menu,
  X,
  Home,
  Box,
  ShoppingCart,
  BarChart,
  ClipboardList,
  User,
} from "lucide-react";

// ✅ Small NavLink component for cleaner code
const NavLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 text-sm font-medium transition ${
      active
        ? "text-indigo-600 border-b-2 border-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`}
  >
    <span className="w-5 h-5 mr-1">{icon}</span>
    {label}
  </Link>
);

function Navbar() {
  const [user, setUser] = useState(null);
  // const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
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

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <div>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-xl font-extrabold tracking-tight flex items-center"
              >
                <span className="text-indigo-600">Smart</span>
                <span className="text-gray-900">Inventory</span>
              </Link>
            </div>

            {/* Center - Nav Links */}
            <div className="hidden sm:flex items-center space-x-6">
              <NavLink
                to="/"
                icon={<Home />}
                label="Dashboard"
                active={location.pathname === "/"}
              />
              {(user?.role === "admin" || user?.role === "employee") && (
                <NavLink
                  to="/inventory"
                  icon={<Box />}
                  label="Inventory"
                  active={location.pathname === "/inventory"}
                />
              )}
              <NavLink
                to="/sales"
                icon={<ShoppingCart />}
                label="Sales"
                active={location.pathname === "/sales"}
              />
              {user?.role === "admin" && (
                <>
                  <NavLink
                    to="/reports"
                    icon={<BarChart />}
                    label="Reports"
                    active={location.pathname === "/reports"}
                  />
                </>
              )}
              {user?.role === "employee" && (
                <NavLink
                  to="/tasks"
                  icon={<ClipboardList />}
                  label="Tasks"
                  active={location.pathname === "/tasks"}
                />
              )}
              {user?.role === "user" && (
                <NavLink
                  to="/profile"
                  icon={<User />}
                  label="Profile"
                  active={location.pathname === "/profile"}
                />
              )}
            </div>

            {/* Right - User Info */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Avatar + Info */}
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "G"}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm">
                    {user?.username || "Guest"}
                  </span>
                  {user?.role && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 w-fit">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={logOut}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-indigo-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-gray-50 border-t border-gray-200">
            <div className="px-2 py-3 space-y-1">
              <NavLink
                to="/"
                icon={<Home />}
                label="Dashboard"
                active={location.pathname === "/"}
              />
              {(user?.role === "admin" || user?.role === "employee") && (
                <NavLink
                  to="/inventory"
                  icon={<Box />}
                  label="Inventory"
                  active={location.pathname === "/inventory"}
                />
              )}
              <NavLink
                to="/sales"
                icon={<ShoppingCart />}
                label="Sales"
                active={location.pathname === "/sales"}
              />
              {user?.role === "admin" && (
                <>
                  <NavLink
                    to="/reports"
                    icon={<BarChart />}
                    label="Reports"
                    active={location.pathname === "/reports"}
                  />
                </>
              )}
              {user?.role === "employee" && (
                <NavLink
                  to="/tasks"
                  icon={<ClipboardList />}
                  label="Tasks"
                  active={location.pathname === "/tasks"}
                />
              )}
              {user?.role === "user" && (
                <NavLink
                  to="/profile"
                  icon={<User />}
                  label="Profile"
                  active={location.pathname === "/profile"}
                />
              )}
              <div className="border-t border-gray-200 mt-3 pt-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">
                    {user?.username || "Guest"}
                  </span>
                  {user?.role && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                      {user.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={logOut}
                  className="block w-full bg-indigo-600 text-white px-4 py-2 mt-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
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
