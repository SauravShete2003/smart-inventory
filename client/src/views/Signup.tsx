import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";

interface SignupData {
  username: string;
  email: string;
  password: string;
  rePassword: string;
}

const Signup: React.FC = () => {
  const [signupData, setSignupData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = (): boolean => {
    if (signupData.password !== signupData.rePassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const processSignup = async () => {
    if (!validateInputs()) return;

    toast.loading("Please wait...");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/signup`,
        signupData
      );
      toast.dismiss();
      toast.success(response.data.message);

      setSignupData({
        username: "",
        email: "",
        password: "",
        rePassword: "",
      });
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Try again.";
      setError(errorMessage);
      toast.dismiss();
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign up for an account
          </h2>
        </div>
        <form
          className="space-y-6 p-6 rounded-lg"
          onSubmit={(e) => {
            e.preventDefault();
            processSignup();
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={signupData.username}
                onChange={handleInputChange}
                className="input-box"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={signupData.email}
                onChange={handleInputChange}
                className="input-box"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={signupData.password}
                onChange={handleInputChange}
                className="input-box"
              />
            </div>
            <div>
              <label
                htmlFor="rePassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="rePassword"
                name="rePassword"
                type="password"
                required
                value={signupData.rePassword}
                onChange={handleInputChange}
                className="input-box"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign up
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Login
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  );
};

export default Signup;
