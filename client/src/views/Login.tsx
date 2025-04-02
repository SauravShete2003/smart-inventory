import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // Try to connect to the actual backend
      const response = await api.post("/login", { email, password }, {
        headers: {
          "Content-Type": "application/json"
        }
      }).catch(err => {
        // If the server returns 400 (Bad Request) or 404 (Not Found), use mock login for development
        if (err.response && (err.response.status === 400 || err.response.status === 404)) {
          // For development - mock login with hardcoded credentials
          if (email === "admin@example.com" && password === "password") {
            return {
              data: {
                token: "mock-jwt-token-for-development",
                data: {
                  id: "admin-123",
                  email: "admin@example.com",
                  role: "admin",
                  username: "Admin User"
                },
                user: {
                  id: "admin-123",
                  email: "admin@example.com",
                  role: "admin",
                  username: "Admin User"
                },
                role: "admin"
              }
            };
          } else if (email === "user@example.com" && password === "password") {
            return {
              data: {
                token: "mock-jwt-token-for-development",
                data: {
                  id: "user-123",
                  email: "user@example.com",
                  role: "user",
                  username: "Regular User"
                },
                user: {
                  id: "user-123",
                  email: "user@example.com",
                  role: "user",
                  username: "Regular User"
                },
                role: "user"
              }
            };
          } else if (email === "employee@example.com" && password === "password") {
            return {
              data: {
                token: "mock-jwt-token-for-development",
                data: {
                  id: "employee-123",
                  email: "employee@example.com",
                  role: "employee",
                  username: "Employee User"
                },
                user: {
                  id: "employee-123",
                  email: "employee@example.com",
                  role: "employee",
                  username: "Employee User"
                },
                role: "employee"
              }
            };
          }
          // If credentials don't match the mock users
          throw new Error("Invalid credentials");
        }
        throw err;
      });

      if (response.data.token) {
        localStorage.setItem("smart-inventory-user-token", response.data.token);
        localStorage.setItem(
          "smart-inventory-user-details",
          JSON.stringify(response.data.data)
        );

        login(response.data.token, response.data.user, response.data.role);
        navigate("/");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">SI</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
