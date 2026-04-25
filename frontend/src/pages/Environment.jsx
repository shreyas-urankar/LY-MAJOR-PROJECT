import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import PredictionHeatmap from "../components/PredictionHeatmap";

function Environment() {
  const [environmentData, setEnvironmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [timeRange, setTimeRange] = useState("week");
  const [aqiData, setAqiData] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user");

  const cities = ["Pune", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata"];

  const fetchEnvironmentData = async () => {
    try {
      setLoading(true);
      console.log(`📡 Fetching environment data for ${selectedCity}, range: ${timeRange}`);

      const response = await axios.get(`http://localhost:5000/api/environment?city=${selectedCity}&range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📥 API Response:", response.data);

      if (response.data && response.data.data) {
        setEnvironmentData(response.data.data);

        if (response.data.data.length > 0) {
          const latest = response.data.data[response.data.data.length - 1];
          setAqiData(latest);
          console.log("📊 Latest data:", latest);
        }
      }

      setLoading(false);
    } catch (apiError) {
      console.error("❌ Error fetching environment data:", apiError);
      generateMockData();
      setLoading(false);
    }
  };

  const saveEnvironmentDataToBackend = async () => {
    try {
      setSaving(true);

      const currentData = aqiData || {
        aqi: 85,
        pm25: 42,
        pm10: 78,
        co2: 455,
        greenCover: 24.5,
        waterQuality: 72,
        temperature: 28,
        humidity: 65,
        windSpeed: 12
      };

      const dataToSave = {
        city: selectedCity,
        aqi: currentData.aqi,
        pm25: currentData.pm25,
        pm10: currentData.pm10,
        co2: currentData.co2,
        greenCover: currentData.greenCover,
        waterQuality: currentData.waterQuality || 72,
        temperature: currentData.temperature || 28,
        humidity: currentData.humidity || 65,
        windSpeed: currentData.windSpeed || 12,
        pollutionLevel: getPollutionLevel(currentData.pm25)
      };

      console.log("📤 Sending environment data to backend:", dataToSave);

      const response = await axios.post(
        "http://localhost:5000/api/environment",
        dataToSave,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Backend response:", response.data);

      await fetchEnvironmentData();

      alert("✅ Environment data saved to database!");
      return response.data;
    } catch (error) {
      console.error("❌ Error saving environment data:", error.response?.data || error.message);
      alert(`❌ Failed to save data: ${error.response?.data?.message || error.message}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const url = `http://localhost:5000/api/reports/dashboard/environment?city=${selectedCity}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `urban_environment_report_${selectedCity}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report.");
    }
  };

  const generateMockData = () => {
    const mockData = [];
    const dates = [];

    const now = new Date();
    let days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    dates.forEach((date, index) => {
      const baseAQI = 80 + Math.sin(index * 0.3) * 20 + Math.random() * 10;
      const pm25 = 30 + Math.sin(index * 0.4) * 15 + Math.random() * 8;
      const pm10 = 50 + Math.sin(index * 0.35) * 20 + Math.random() * 12;
      const co2 = 400 + Math.sin(index * 0.25) * 50 + Math.random() * 30;
      const greenCover = 25 + Math.sin(index * 0.1) * 5 + Math.random() * 3;

      mockData.push({
        date,
        city: selectedCity,
        aqi: Math.round(baseAQI),
        pm25: Math.round(pm25),
        pm10: Math.round(pm10),
        co2: Math.round(co2),
        greenCover: Math.round(greenCover * 10) / 10,
        waterQuality: Math.round(65 + Math.sin(index * 0.2) * 15),
        temperature: Math.round(28 + Math.sin(index * 0.15) * 5),
        humidity: Math.round(60 + Math.sin(index * 0.25) * 15),
        windSpeed: Math.round(8 + Math.sin(index * 0.3) * 4),
      });
    });

    setEnvironmentData(mockData);

    if (mockData.length > 0) {
      const latest = mockData[mockData.length - 1];
      setAqiData(latest);
    }
  };

  useEffect(() => {
    fetchEnvironmentData();
  }, [selectedCity, timeRange]);

  const getAqiStatus = (aqi) => {
    if (aqi <= 50) return { status: "Good", color: "#10B981", level: "Low" };
    if (aqi <= 100) return { status: "Moderate", color: "#FBBF24", level: "Medium" };
    if (aqi <= 150) return { status: "Unhealthy for Sensitive", color: "#F97316", level: "High" };
    if (aqi <= 200) return { status: "Unhealthy", color: "#EF4444", level: "Very High" };
    return { status: "Hazardous", color: "#7C3AED", level: "Severe" };
  };

  const getPollutionLevel = (pm25) => {
    if (pm25 <= 12) return "Good";
    if (pm25 <= 35) return "Moderate";
    if (pm25 <= 55) return "Unhealthy";
    return "Hazardous";
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Environment Analytics...</p>
        </div>
      </div>
    );
  }

  const aqiStatus = aqiData ? getAqiStatus(aqiData.aqi) : { status: "Unknown", color: "#6B7280", level: "Unknown" };
  const pollutionLevel = aqiData ? getPollutionLevel(aqiData.pm25) : "Unknown";

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌿 Environment Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor air quality, pollution levels, and environmental metrics</p>
        </div>
        <button onClick={handleExportReport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <span>📥</span>
          <span>Export Environment Report</span>
        </button>
      </div>

      <div className="mb-8">
        <PredictionHeatmap 
          percentage={85} 
          title="Environmental Sustainability Prediction" 
          description={`AI-based forecast for future environmental quality in ${selectedCity}`}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchEnvironmentData}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh Data</span>
            </button>
            <button
              onClick={saveEnvironmentDataToBackend}
              disabled={saving}
              className={`px-6 py-2 ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors flex items-center space-x-2`}
            >
              <span>{saving ? '⏳' : '💾'}</span>
              <span>{saving ? 'Saving...' : 'Save to Database'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌡️ Air Quality Index (AQI)</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold" style={{ color: aqiStatus.color }}>
                    {aqiData ? aqiData.aqi : "0"}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Current AQI</div>
                </div>
              </div>
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={aqiStatus.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(aqiData ? aqiData.aqi : 0) * 0.628} 251.2`}
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <div className={`px-4 py-2 rounded-full text-white font-semibold`} style={{ backgroundColor: aqiStatus.color }}>
                {aqiStatus.status}
              </div>
              <p className="text-gray-600 mt-2">Pollution Level: {aqiStatus.level}</p>
              <p className="text-xs text-gray-500 mt-1">City: {selectedCity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏭 Pollution Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">PM2.5</span>
                <span className="font-semibold">{aqiData ? aqiData.pm25 : "0"} µg/m³</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${Math.min((aqiData ? aqiData.pm25 : 0) / 100 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">PM10</span>
                <span className="font-semibold">{aqiData ? aqiData.pm10 : "0"} µg/m³</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${Math.min((aqiData ? aqiData.pm10 : 0) / 150 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">CO₂</span>
                <span className="font-semibold">{aqiData ? aqiData.co2 : "0"} ppm</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${Math.min((aqiData ? aqiData.co2 : 0) / 600 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Overall Pollution</span>
                <span className={`px-3 py-1 rounded-full font-semibold ${pollutionLevel === "Good" ? "bg-green-100 text-green-800" :
                    pollutionLevel === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                      pollutionLevel === "Unhealthy" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                  }`}>
                  {pollutionLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Environmental Indicators</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🌳</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Green Cover</p>
                  <p className="text-2xl font-bold">{aqiData ? aqiData.greenCover : "0"}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${(aqiData ? aqiData.greenCover : 0) > 30 ? "text-green-600" :
                    (aqiData ? aqiData.greenCover : 0) > 20 ? "text-yellow-600" : "text-red-600"
                  }`}>
                  {(aqiData ? aqiData.greenCover : 0) > 30 ? "Healthy" :
                    (aqiData ? aqiData.greenCover : 0) > 20 ? "Moderate" : "Poor"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600 text-xl">💧</span>
                  <span className="text-sm font-medium">Water Quality</span>
                </div>
                <p className="text-2xl font-bold">{aqiData ? aqiData.waterQuality || "65" : "65"}%</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-amber-600 text-xl">🌡️</span>
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <p className="text-2xl font-bold">{aqiData ? aqiData.temperature || "28" : "28"}°C</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 AQI Trend (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aqi" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pm25" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Pollution Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={environmentData.slice(-5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="pm25" fill="#F59E0B" name="PM2.5 (µg/m³)" />
                <Bar dataKey="pm10" fill="#F97316" name="PM10 (µg/m³)" />
                <Bar dataKey="co2" fill="#EF4444" name="CO₂ (ppm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Environment;