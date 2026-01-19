import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const username = localStorage.getItem("user") || "user";
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/data", {
        username,
        analysisResult: "User logged out via dashboard",
        actionType: "logout",
        city: "System"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Logout save failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchData = useCallback(async () => {
    // Silently fetch data for internal tracking only
    try {
      await axios.get("http://localhost:5000/api/data", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const saveUserLogin = async () => {
      if (username && username !== "user" && token) {
        try {
          await axios.post("http://localhost:5000/api/data", {
            username,
            analysisResult: "User accessed dashboard",
            actionType: "login",
            city: "System"
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log("✅ Dashboard access event saved to database");
        } catch (err) {
          console.error("Failed to auto-save dashboard access:", err);
        }
      }
    };
    saveUserLogin();
  }, [username, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Urban Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Urban Growth Analytics</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="text-blue-600 font-semibold">{username}</span> • Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <span>📅</span>
                <span>This Month</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <span>📥</span>
                <span>Export Report</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {["overview", "population", "infrastructure", "environment", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          {/* Streamlit Dashboard with username parameter */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Urban Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600">Real-time data visualization and predictive analytics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
            </div>
            <iframe
              src={`http://localhost:8501?username=${encodeURIComponent(username)}`}
              width="100%"
              height="800px"
              className="border-0"
              title="Streamlit Dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


