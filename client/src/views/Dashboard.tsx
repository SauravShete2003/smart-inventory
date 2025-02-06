import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getJwtToken } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getJwtToken();
      if (!token) {
        toast.error("Authentication token not found!");
        return;
      }

      try {
        const inventoryResponse = await api.get("/inventories", {
          headers: { Authorization: token },
        });
        setInventoryData(inventoryResponse.data);

        const salesResponse = await api.get("/sales", {
          headers: { Authorization: token },
        });
        setSalesData(salesResponse.data.sales);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, []);

  const inventoryChartData = {
    labels: inventoryData.map((item) => item.name),
    datasets: [
      {
        label: "Quantity",
        data: inventoryData.map((item) => item.quantity),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const salesChartData = Array.isArray(salesData)
    ? {
        labels: salesData
          .filter((sale) => sale.saleDate)
          .map((sale) => new Date(sale.saleDate).toLocaleDateString()),
        datasets: [
          {
            label: "Total Sales",
            data: salesData
              .filter((sale) => sale.saleDate)
              .map((sale) => sale.total || 0),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
          },
        ],
      }
    : { labels: [], datasets: [] };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center">Dashboard</h1>

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 ">
              <div className="bg-white shadow rounded-lg">
                <div className="p-5">
                  <Bar
                    data={inventoryChartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="p-5">
                  <Bar
                    data={salesChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: "top" },
                        tooltip: { enabled: true },
                      },
                      scales: {
                        x: { title: { display: true, text: "Date" } },
                        y: { title: { display: true, text: "Total Sales" } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <Toaster />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
