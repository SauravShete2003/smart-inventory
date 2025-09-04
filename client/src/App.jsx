import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"; 
import Login from "./views/Login.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Inventory from "./views/Inventory.jsx";
import Sales from "./views/Sales.jsx";
import Reports from "./components/Reports.jsx";
import Signup from "./views/Signup.jsx";
import AdminPanel from "./views/AdminPanel.jsx";
import Settings from "./views/Settings.jsx";
import Analytics from "./views/Analytics.jsx";

const App = () => {
  return (
    <>
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
              
                  <Dashboard />
               
              }
            />
            <Route
              path="/inventory/*"
              element={
               
                  <Inventory />
              
              }
            />
            <Route
              path="/sales/*"
              element={
            
                  <Sales  />
              
              }
            />
            <Route
              path="/reports/*"
              element={
               
                  <Reports />
                
              }
            />
            <Route 
              path="/admin/*"
              element={
              
                  <AdminPanel />
                
              }
            />
            <Route 
              path="/settings/*"
              element={
              
                  <Settings />
                
              }
            />
            <Route 
              path="/analytics/*"
              element={
              
                  <Analytics />
                
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </>
  );
};

export default App; 