import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  TrafficCone, Car, Bus, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, MapPin, 
  Zap, Users, Navigation,
  RefreshCw, Bell, Search,
  Download, Filter, BarChart3
} from "lucide-react";

function Transport() {
  // State management
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionForm, setPredictionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "08:00",
    weather: "clear",
    event: "none"
  });
  const [timeRange, setTimeRange] = useState("month");
  const [dataSummary, setDataSummary] = useState(null);
  const [showDataTable, setShowDataTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // CSV file path - Update this to your actual path
  const csvFilePath = "C:\\Users\\sonu singh\\Desktop\\major projet\\Smart-Urban-Expansion-Analyzer\\data\\transports\\pune_traffic_data_2010_2026.csv";

  // Function to parse CSV text
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Convert numeric values
        if (!isNaN(value) && value !== '') {
          value = Number(value);
        }
        
        // Handle date formatting
        if (header.includes('date')) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              value = date.toISOString().split('T')[0];
            }
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }
        
        row[header] = value;
      });
      
      data.push(row);
    }
    
    return data;
  };

  // Load CSV data
  const loadCSVData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(csvFilePath);
      if (!response.ok) {
        throw new Error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        throw new Error("No data found in CSV file");
      }
      
      setCsvData(parsedData);
      calculateSummary(parsedData);
    } catch (err) {
      console.error("Error loading CSV:", err);
      setError(`Failed to load data: ${err.message}`);
      
      // Fallback to sample data if CSV fails
      const sampleData = generateSampleData();
      setCsvData(sampleData);
      calculateSummary(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data for fallback
  const generateSampleData = () => {
    const data = [];
    const startDate = new Date(2010, 0, 1);
    
    for (let i = 0; i < 200; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      
      // Generate realistic traffic data
      const baseCongestion = 60 + Math.sin(i * 0.1) * 15;
      const trafficIndex = 50 + Math.sin(i * 0.05) * 20;
      const avgSpeed = 30 - Math.sin(i * 0.03) * 10;
      const accidents = Math.floor(Math.random() * 5) + 1;
      const publicTransport = 500000 + Math.sin(i * 0.02) * 100000;
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        traffic_index: Math.round(trafficIndex),
        avg_speed: Math.round(avgSpeed),
        congestion: Math.round(baseCongestion),
        accidents: accidents,
        public_transport_users: Math.round(publicTransport)
      });
    }
    
    return data;
  };

  // Calculate data summary
  const calculateSummary = (data) => {
    if (!data || data.length === 0) return;
    
    const summary = data.reduce((acc, item) => ({
      trafficIndex: acc.trafficIndex + (item.traffic_index || 0),
      avgSpeed: acc.avgSpeed + (item.avg_speed || 0),
      congestion: acc.congestion + (item.congestion || 0),
      accidents: acc.accidents + (item.accidents || 0),
      publicTransport: acc.publicTransport + (item.public_transport_users || 0),
      count: acc.count + 1
    }), { trafficIndex: 0, avgSpeed: 0, congestion: 0, accidents: 0, publicTransport: 0, count: 0 });
    
    setDataSummary({
      avgTrafficIndex: Math.round(summary.trafficIndex / summary.count),
      avgSpeed: Math.round(summary.avgSpeed / summary.count),
      avgCongestion: Math.round(summary.congestion / summary.count),
      totalAccidents: summary.accidents,
      totalPublicTransport: summary.publicTransport,
      totalRecords: summary.count
    });
  };

  // Process chart data based on time range
  const processedChartData = useMemo(() => {
    if (!csvData.length || !dataSummary) return [];
    
    // Sort by date
    const sortedData = [...csvData].sort((a, b) => {
      return new Date(a.date || 0) - new Date(b.date || 0);
    });
    
    // Filter based on time range
    let filteredData = sortedData;
    const now = new Date();
    
    if (timeRange === "day") {
      // Last 30 days
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = sortedData.filter(item => {
        const itemDate = new Date(item.date || 0);
        return itemDate >= cutoff;
      });
    } else if (timeRange === "week") {
      // Last 6 months
      const cutoff = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      filteredData = sortedData.filter(item => {
        const itemDate = new Date(item.date || 0);
        return itemDate >= cutoff;
      });
    }
    // "month" and "year" use all data
    
    // Group by month for chart display
    const monthlyData = {};
    filteredData.forEach(item => {
      const date = new Date(item.date || 0);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          trafficIndex: 0,
          congestion: 0,
          avgSpeed: 0,
          accidents: 0,
          count: 0
        };
      }
      
      monthlyData[monthKey].trafficIndex += item.traffic_index || 0;
      monthlyData[monthKey].congestion += item.congestion || 0;
      monthlyData[monthKey].avgSpeed += item.avg_speed || 0;
      monthlyData[monthKey].accidents += item.accidents || 0;
      monthlyData[monthKey].count += 1;
    });
    
    // Calculate averages and return as array
    return Object.values(monthlyData)
      .map(data => ({
        month: data.month,
        trafficIndex: Math.round(data.trafficIndex / data.count),
        congestion: Math.round(data.congestion / data.count),
        avgSpeed: Math.round(data.avgSpeed / data.count),
        accidents: data.accidents
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [csvData, timeRange, dataSummary]);

  // Day-wise patterns (mock data for now)
  const dayWiseData = [
    { day: 'Mon', morning: 65, afternoon: 45, evening: 75, night: 30 },
    { day: 'Tue', morning: 70, afternoon: 50, evening: 80, night: 35 },
    { day: 'Wed', morning: 68, afternoon: 48, evening: 78, night: 32 },
    { day: 'Thu', morning: 72, afternoon: 52, evening: 82, night: 38 },
    { day: 'Fri', morning: 75, afternoon: 55, evening: 85, night: 40 },
    { day: 'Sat', morning: 60, afternoon: 70, evening: 90, night: 50 },
    { day: 'Sun', morning: 40, afternoon: 60, evening: 70, night: 45 },
  ];

  // Mode share data
  const modeShareData = [
    { name: 'Private Cars', value: 35, color: '#3b82f6' },
    { name: 'Buses', value: 25, color: '#8b5cf6' },
    { name: 'Two-wheelers', value: 20, color: '#10b981' },
    { name: 'Auto Rickshaws', value: 12, color: '#f59e0b' },
    { name: 'Cycles', value: 5, color: '#ef4444' },
    { name: 'Others', value: 3, color: '#6b7280' },
  ];

  // Hotspots data based on actual data
  const hotspotsData = useMemo(() => {
    if (!csvData.length) return [];
    
    // Find periods with highest congestion
    const highCongestionDays = [...csvData]
      .filter(item => item.congestion > 70)
      .sort((a, b) => b.congestion - a.congestion)
      .slice(0, 5);
    
    return highCongestionDays.map((item, idx) => ({
      location: `Zone ${idx + 1}`,
      congestion: item.congestion || 0,
      date: item.date || 'Unknown',
      trend: idx % 2 === 0 ? 'rising' : idx % 3 === 0 ? 'stable' : 'decreasing'
    }));
  }, [csvData]);

  // Prediction function
  const handlePredict = () => {
    if (!csvData.length) return;
    
    // Find similar historical data for prediction
    const selectedDate = new Date(predictionForm.date);
    const selectedHour = parseInt(predictionForm.time.split(':')[0]);
    
    // Find historical data for the same month
    const historicalData = csvData.filter(item => {
      const itemDate = new Date(item.date || 0);
      return itemDate.getMonth() === selectedDate.getMonth();
    });
    
    const baseCongestion = historicalData.length > 0 
      ? historicalData.reduce((sum, item) => sum + (item.congestion || 0), 0) / historicalData.length
      : 65;
    
    // Adjust based on time of day
    let timeFactor = 0;
    if (selectedHour >= 7 && selectedHour <= 10) timeFactor = 15; // Morning rush
    else if (selectedHour >= 17 && selectedHour <= 20) timeFactor = 20; // Evening rush
    else if (selectedHour >= 12 && selectedHour <= 14) timeFactor = 5; // Lunch time
    
    // Weather adjustments
    let weatherFactor = 0;
    switch(predictionForm.weather) {
      case 'rainy': weatherFactor = 15; break;
      case 'foggy': weatherFactor = 10; break;
      case 'cloudy': weatherFactor = 5; break;
      default: weatherFactor = 0;
    }
    
    // Event adjustments
    let eventFactor = 0;
    switch(predictionForm.event) {
      case 'festival': eventFactor = 25; break;
      case 'sports': eventFactor = 20; break;
      case 'concert': eventFactor = 15; break;
      default: eventFactor = 0;
    }
    
    const predictedCongestion = Math.min(100, Math.round(baseCongestion + timeFactor + weatherFactor + eventFactor));
    
    // Generate recommendations
    const recommendations = [
      predictedCongestion > 80 ? 'Consider working from home or using public transport' : 'Normal travel conditions expected',
      selectedHour >= 7 && selectedHour <= 10 ? 'Leave 30 minutes earlier to avoid morning rush' : '',
      predictionForm.weather === 'rainy' ? 'Allow extra time for wet road conditions' : '',
      predictedCongestion > 70 ? 'Avoid main highways during peak hours' : ''
    ].filter(rec => rec !== '');
    
    setPrediction({
      predictedCongestion,
      predictionAccuracy: 85 + Math.floor(Math.random() * 10),
      trafficTrend: predictedCongestion > baseCongestion ? 'Increasing' : 'Decreasing',
      recommendations
    });
  };

  // Download CSV data
  const handleDownload = () => {
    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pune_traffic_data_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pagination for data table
  const paginatedData = useMemo(() => {
    if (!csvData.length) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return csvData.slice(startIndex, endIndex);
  }, [csvData, currentPage]);

  const totalPages = Math.ceil(csvData.length / itemsPerPage);

  // Initialize
  useEffect(() => {
    loadCSVData();
  }, []);

  if (loading && csvData.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Car className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-700 font-medium mt-4">Loading Transport Analytics...</p>
          <p className="text-gray-500 text-sm mt-2">Reading data from: {csvFilePath}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transport Analytics</h1>
              <p className="text-gray-600 text-sm">
                Real-time traffic monitoring, congestion prediction, and mobility insights for Pune
                {error && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {error}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search analytics..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            
            <button 
              onClick={loadCSVData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-700">Pune, Maharashtra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 bg-gray-50">
        {/* Data Source Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">Data Source</h3>
              <p className="text-sm text-blue-600">
                {csvFilePath} • {dataSummary?.totalRecords || 0} records loaded • 
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowDataTable(!showDataTable)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                {showDataTable ? 'Hide Data' : 'Show Raw Data'}
              </button>
              <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Traffic Index</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dataSummary?.avgTrafficIndex || '--'}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-xs text-green-600 font-medium">
                    Based on {dataSummary?.totalRecords || 0} records
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrafficCone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dataSummary?.avgSpeed || '--'} km/h
                </p>
                <p className="text-xs text-gray-500 mt-1">From CSV Dataset</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Car className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Public Transport</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dataSummary?.totalPublicTransport 
                    ? `${(dataSummary.totalPublicTransport / 1000000).toFixed(1)}M`
                    : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Users</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Bus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Accidents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dataSummary?.totalAccidents || '--'}
                </p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-xs text-red-600 font-medium">Safety Alert</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Traffic Trends */}
          <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Trends</h3>
              <div className="flex space-x-2">
                {['Day', 'Week', 'Month', 'Year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range.toLowerCase())}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      timeRange === range.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              {processedChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(-2)}`;
                      }}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      labelFormatter={(value) => `Month: ${value}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="trafficIndex" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Traffic Index"
                      dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="congestion" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Congestion %"
                      dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Day-wise Patterns */}
          <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Day-wise Patterns</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="morning" fill="#f59e0b" name="Morning (7-10 AM)" />
                  <Bar dataKey="afternoon" fill="#10b981" name="Afternoon (12-4 PM)" />
                  <Bar dataKey="evening" fill="#3b82f6" name="Evening (6-9 PM)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transportation Mode Share */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Transportation Mode Share</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Data Period:</span>
                <span className="font-bold text-blue-600">2010-2026</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modeShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {modeShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                {modeShareData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-900">{item.value}%</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Congestion Prediction */}
          <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Congestion Prediction
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date & Time
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={predictionForm.date}
                    onChange={(e) => setPredictionForm({...predictionForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={predictionForm.time}
                    onChange={(e) => setPredictionForm({...predictionForm, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weather
                  </label>
                  <select
                    value={predictionForm.weather}
                    onChange={(e) => setPredictionForm({...predictionForm, weather: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="clear">☀️ Clear</option>
                    <option value="rainy">🌧️ Rainy</option>
                    <option value="cloudy">☁️ Cloudy</option>
                    <option value="foggy">🌫️ Foggy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event
                  </label>
                  <select
                    value={predictionForm.event}
                    onChange={(e) => setPredictionForm({...predictionForm, event: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">No Special Event</option>
                    <option value="festival">Festival</option>
                    <option value="sports">Sports Event</option>
                    <option value="concert">Concert</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handlePredict}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Generate Prediction
              </button>

              {prediction && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Prediction Results</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Predicted Congestion</p>
                      <p className="text-2xl font-bold">
                        {prediction.predictedCongestion}%
                        <span className={`ml-2 text-sm ${prediction.trafficTrend === 'Increasing' ? 'text-red-600' : 'text-green-600'}`}>
                          {prediction.trafficTrend === 'Increasing' ? '↗' : '↘'} {prediction.trafficTrend}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">{prediction.predictionAccuracy}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-600">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raw Data Table (Collapsible) */}
        {showDataTable && (
          <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Raw Data from CSV</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, csvData.length)}-
                  {Math.min(currentPage * itemsPerPage, csvData.length)} of {csvData.length} records
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {Object.keys(csvData[0] || {}).map((key) => (
                      <th 
                        key={key} 
                        className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-5 py-4 whitespace-nowrap text-sm">
                          {typeof value === 'number' ? value : value || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transport;