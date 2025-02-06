import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiHome, FiShoppingCart, FiPackage, FiBarChart2 } from "react-icons/fi";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`h-screen bg-gray-900 text-white transition-all duration-300 ${isOpen ? "w-54" : "w-16"} md:w-44`}>
      <div className="flex justify-between items-center p-4">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <FiMenu size={24} />
        </button>
        {isOpen && <h1 className="text-lg font-bold">SmartInventory</h1>}
      </div>

      <nav className="mt-10">
        <Link to="/" className="flex items-center p-4 hover:bg-gray-700 rounded">
          <FiHome className="mr-2" /> {isOpen && "Dashboard"}
        </Link>
        <Link to="/sales" className="flex items-center p-4 hover:bg-gray-700 rounded">
          <FiShoppingCart className="mr-2" /> {isOpen && "Sales"}
        </Link>
        <Link to="/inventory" className="flex items-center p-4 hover:bg-gray-700 rounded">
          <FiPackage className="mr-2" />{isOpen && "Inventory"}
        </Link>
        <Link to="/reports" className="flex items-center p-4 hover:bg-gray-700 rounded">
          <FiBarChart2 className="mr-2" /> {isOpen && "Reports"}
        </Link>
      </nav>

      {/* Additional styles for mobile devices */}
      <style>{`
        @media (max-width: 768px) {
          aside {
            width: ${isOpen ? "80%" : "30%"};
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
