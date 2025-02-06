import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"; // Check if this file exists
import PrivateRoute from "./components/PrivateRoute"
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Inventory from "./views/Inventory";
import Sales from "./views/Sales";
import Reports from "./components/Reports";
import Signup from "./views/Signup";

const App: React.FC = () => {
  return (
    <>
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <PrivateRoute>
                  <Sales  />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
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
