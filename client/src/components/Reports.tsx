import React from "react";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import api from "../utils/api";
import { getJwtToken } from "../utils/common";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);

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

  const monthlySalesData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Sales",
        data: Array(12)
          .fill(0)
          .map((_, index) => {
            return salesData
              .filter((sale) => new Date(sale.date).getMonth() === index)
              .reduce((sum, sale) => sum + sale.total, 0);
          }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const topSellingItems = salesData
    .reduce((acc, sale) => {
      const existingItem = acc.find(
        (item: { name: any }) => item.name === sale.item.name
      );
      if (existingItem) {
        existingItem.quantity += sale.quantity;
        existingItem.total += sale.total;
      } else {
        acc.push({
          name: sale.item.name,
          quantity: sale.quantity,
          total: sale.total,
        });
      }
      return acc;
    }, [])
    .sort(
      (a: { quantity: number }, b: { quantity: number }) =>
        b.quantity - a.quantity
    )
    .slice(0, 5);

  const topSellingItemsData = {
    labels: topSellingItems.map((item: { name: any }) => item.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: topSellingItems.map((item: { quantity: any }) => item.quantity),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="flex">
      <div className="w-full py-6 sm:px-6 lg:px-8">
        <Navbar />
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Monthly Sales
              </h3>
              <div className="mt-5">
                <Bar
                  data={monthlySalesData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Selling Items
              </h3>
              <div className="mt-5">
                <Bar
                  data={topSellingItemsData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Inventory Status
            </h3>
            <div className="mt-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Threshold
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.quantity < item.threshold
                              ? "bg-red-100 text-red-800"
                              : item.quantity < item.threshold * 2
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.quantity < item.threshold
                            ? "Low Stock"
                            : item.quantity < item.threshold * 2
                            ? "Medium Stock"
                            : "Good Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Reports;
