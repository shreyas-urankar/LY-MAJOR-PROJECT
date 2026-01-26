import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

function PopulationDashboard() {
  const [city, setCity] = useState("Pune");
  const [populationData, setPopulationData] = useState([]);
  const [stats, setStats] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [targetYear, setTargetYear] = useState(2030);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const ageGroupColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  // Fetch population data
  const fetchPopulationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/population/${city}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setPopulationData(response.data.data);
      fetchStats();
    } catch (error) {
      console.error("Error fetching population data:", error);
      // Show error instead of mock data
      setPopulationData([]);
      setStats(null);
      setError("Failed to fetch population data. Make sure the backend is running and has data imported.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/population/${city}/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Predict population
  const predictPopulation = async () => {
    if (!targetYear || targetYear <= 2020) {
      alert("Please enter a valid year after 2020");
      return;
    }

    if (populationData.length === 0) {
      alert("No historical data available. Please import data first.");
      return;
    }

    setPredictionLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/population/${city}/predict?targetYear=${targetYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setPrediction(response.data.data);
    } catch (error) {
      console.error("Error predicting population:", error);
      alert("Prediction failed. Make sure you have enough historical data.");
    } finally {
      setPredictionLoading(false);
    }
  };

  // Format data for charts
  const getLineChartData = () => {
    return populationData.map(item => ({
      year: item.year,
      population: item.totalPopulation / 1000000, // Convert to millions
      growthRate: item.growthRate,
      density: item.density / 1000 // Convert to thousands
    }));
  };

  const getAgeGroupData = (yearData) => {
    if (!yearData || !yearData.ageGroups) return [];
    return Object.entries(yearData.ageGroups).map(([ageGroup, percentage], index) => ({
      name: ageGroup,
      value: percentage,
      color: ageGroupColors[index]
    }));
  };

  const getLatestAgeData = () => {
    if (populationData.length === 0) return [];
    const latestData = populationData[populationData.length - 1];
    return getAgeGroupData(latestData);
  };

  // Initialize
  useEffect(() => {
    fetchPopulationData();
  }, [city]);

  // Loading state
  if (loading && populationData.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Population Analytics...</p>
            <p className="text-gray-500 text-sm mt-2">Fetching demographic data for {city}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Population Data Found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="text-yellow-800 font-medium mb-2">To fix this:</p>
              <ol className="list-decimal pl-5 text-yellow-700 text-sm space-y-1">
                <li>Make sure your backend server is running</li>
                <li>Import your real data using: <code className="bg-gray-100 px-2 py-1 rounded">node backend/scripts/importPopulationExcel.js</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Population Analytics</h1>
              <p className="text-gray-600 mt-1">
                Demographic insights and growth predictions for <span className="text-blue-600 font-semibold">{city}</span>
                {stats && <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Real Data</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">City:</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>
              <button
                onClick={() => fetchPopulationData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {["overview", "trends", "age", "prediction", "comparison"].map((tab) => (
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

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Population</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.populationRange?.max ? (stats.populationRange.max / 1000000).toFixed(1) + 'M' : 'N/A'}
                </h3>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">↑ {stats?.averageGrowthRate?.toFixed(1) || 0}%</span>
              <span className="text-gray-500 ml-2">avg. growth</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Population Density</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.averageDensity ? stats.averageDensity.toLocaleString() : 'N/A'}
                </h3>
              </div>
              <div className="text-3xl">🏙️</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">people per km²</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Growth Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.averageGrowthRate ? stats.averageGrowthRate.toFixed(1) + '%' : 'N/A'}
                </h3>
              </div>
              <div className="text-3xl">📈</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min(stats?.averageGrowthRate * 10 || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Data Coverage</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.yearRange?.start || 2000}-{stats?.yearRange?.end || 2020}
                </h3>
              </div>
              <div className="text-3xl">📅</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{stats?.totalRecords || 0} data points</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Population Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Population Growth Trend</h3>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                  <span className="text-gray-600">Population (M)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <span className="text-gray-600">Growth Rate (%)</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getLineChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    label={{ value: 'Population (M)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    label={{ value: 'Growth Rate (%)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "population") return [`${value.toFixed(2)}M`, "Population"];
                      if (name === "growthRate") return [`${value}%`, "Growth Rate"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="population"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="Population (Millions)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Growth Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Distribution Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Age Distribution (Latest Year)</h3>
              <div className="text-sm text-gray-600">
                Year: {populationData.length > 0 ? populationData[populationData.length - 1].year : 'N/A'}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getLatestAgeData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {getLatestAgeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(1)}%`, "Percentage"]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {getLatestAgeData().map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-gray-500">{item.name}</div>
                  <div className="text-lg font-bold mt-1" style={{ color: item.color }}>
                    {item.value.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Population Prediction</h3>
              <p className="text-gray-600">AI-powered forecasting for urban planning</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Predict for year:</span>
                <input
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  min="2021"
                  max="2050"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2030"
                />
              </div>
              <button
                onClick={predictPopulation}
                disabled={predictionLoading || populationData.length === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {predictionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <span>🔮</span>
                    <span>Generate Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {prediction ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Predicted Population</h4>
                      <p className="text-sm text-gray-600">Year {prediction.year}</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-blue-700 mb-2">
                    {(prediction.totalPopulation / 1000000).toFixed(2)}M
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-600 font-medium">+{prediction.growthRate}%</span>
                    <span className="ml-2">annual growth</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">🏙️</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Predicted Density</h4>
                      <p className="text-sm text-gray-600">People per km²</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-green-700 mb-2">
                    {prediction.density.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((prediction.density - (stats?.averageDensity || 0)) / (stats?.averageDensity || 1) * 100).toFixed(1)}% increase
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Prediction Model</h4>
                      <p className="text-sm text-gray-600">AI Confidence Score</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-purple-700 mb-2">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on {prediction.historicalDataPoints} data points
                  </div>
                </div>
              </div>

              {/* Predicted Age Distribution */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Predicted Age Distribution for {prediction.year}</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(prediction.ageGroups).map(([age, value]) => ({ age, value }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="age"
                        stroke="#666"
                        tick={{ fill: '#666' }}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fill: '#666' }}
                        label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                      >
                        {Object.entries(prediction.ageGroups).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ageGroupColors[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
              <div className="text-5xl mb-4">🔮</div>
              <h4 className="text-xl font-medium text-gray-900 mb-2">Generate Population Prediction</h4>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Enter a target year between 2021-2050 and click "Generate Prediction" to see AI-powered population forecasts for {city}.
              </p>
              {populationData.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 max-w-md mx-auto">
                  <p className="text-yellow-800 text-sm">⚠️ No historical data available. Import data first.</p>
                </div>
              )}
              <div className="inline-flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
                <span className="text-gray-600">Example:</span>
                <button
                  onClick={() => setTargetYear(2030)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  2030
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setTargetYear(2040)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  2040
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setTargetYear(2050)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  2050
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Historical Population Data</h3>
            <p className="text-sm text-gray-600">Detailed records for {city} (Real Data from Excel)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Density</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Groups</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {populationData.slice().reverse().map((item) => (
                  <tr key={item.year} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-blue-700">
                        {(item.totalPopulation / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.totalPopulation.toLocaleString()} people
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.growthRate >= 2.5
                          ? 'bg-green-100 text-green-800'
                          : item.growthRate >= 2.0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {item.growthRate >= 2.5 ? '↑↑' : item.growthRate >= 2.0 ? '↑' : '→'} {item.growthRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {item.density.toLocaleString()}/km²
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        {Object.entries(item.ageGroups).map(([age, percent], idx) => (
                          <div
                            key={age}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: `${ageGroupColors[idx]}20`,
                              color: ageGroupColors[idx],
                              border: `1px solid ${ageGroupColors[idx]}40`
                            }}
                            title={`${age}: ${percent}%`}
                          >
                            {age}: {percent}%
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${item.source === 'Census'
                          ? 'bg-blue-100 text-blue-800'
                          : item.source === 'Predicted'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {item.source}
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
  );
}

export default PopulationDashboard;


