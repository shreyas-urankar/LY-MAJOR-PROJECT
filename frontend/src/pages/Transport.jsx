import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer
} from "recharts";
import {
    TrafficCone, Car, Bus, AlertTriangle,
    TrendingUp, TrendingDown, Clock, MapPin,
    Navigation, RefreshCw, Search, Bell, Download
} from "lucide-react";

function Transport() {
    const [transportData, setTransportData] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predictionForm, setPredictionForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: "08:00"
    });
    const [selectedCity, setSelectedCity] = useState("Pune");
    const [timeRange, setTimeRange] = useState("week");

    const token = localStorage.getItem("token");

    const fetchTransportData = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:5000/api/transport", {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    city: selectedCity,
                    limit: 100
                }
            });
            setTransportData(response.data.data || []);
        } catch (error) {
            console.error("Error fetching transport data:", error);
            // Use mock data if API fails
            setTransportData(generateMockData());
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/transport/analytics", {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { city: selectedCity }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setAnalytics(generateMockAnalytics());
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/transport/alerts", {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { city: selectedCity }
            });
            setAlerts(response.data.alerts || []);
        } catch (error) {
            console.error("Error fetching alerts:", error);
            setAlerts(generateMockAlerts());
        }
    };

    const handlePredict = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/transport/predict",
                { city: selectedCity, ...predictionForm },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setPrediction(response.data.prediction);
        } catch (error) {
            console.error("Error predicting congestion:", error);
            setPrediction(generateMockPrediction());
        }
    };

    const handleRefresh = () => {
        fetchAllData();
    };

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchTransportData(),
            fetchAnalytics(),
            fetchAlerts()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        if (token) {
            fetchAllData();
        }
    }, [selectedCity, token]);

    // Mock data generators for demonstration
    const generateMockData = () => {
        const data = [];
        for (let i = 0; i < 30; i++) {
            data.push({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                trafficIndex: 120 + Math.random() * 60,
                avgSpeed: 20 + Math.random() * 15,
                congestionLevel: 40 + Math.random() * 40,
                accidents: Math.floor(Math.random() * 5),
                publicTransportUsage: 800000 + Math.random() * 200000
            });
        }
        return data;
    };

    const generateMockAnalytics = () => ({
        summary: {
            avgTrafficIndex: 145,
            avgSpeed: 28,
            avgCongestion: 58,
            totalAccidents: 24,
            totalPublicTransport: 12000000,
            count: 30
        },
        monthlyTrends: [
            { month: 1, avgTrafficIndex: 140 },
            { month: 2, avgTrafficIndex: 145 },
            { month: 3, avgTrafficIndex: 150 }
        ],
        dayWisePatterns: [
            { day: 1, avgCongestion: 65 },
            { day: 2, avgCongestion: 70 },
            { day: 3, avgCongestion: 68 }
        ]
    });

    const generateMockAlerts = () => [
        { type: "High Congestion", location: "Main Road", severity: "High", timestamp: new Date() },
        { type: "Accident", location: "Highway", severity: "Medium", timestamp: new Date() }
    ];

    const generateMockPrediction = () => ({
        predictedCongestion: 72,
        predictionAccuracy: 85,
        trafficTrend: "Increasing",
        recommendations: [
            "Use public transport",
            "Avoid peak hours if possible",
            "Consider alternative routes"
        ]
    });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Transport Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Transport Analytics</h1>
                <p className="text-gray-600">Real-time traffic monitoring and congestion prediction for Pune</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Traffic Index</p>
                            <p className="text-2xl font-bold text-gray-900">145</p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-xs text-green-600">+2.3%</span>
                            </div>
                        </div>
                        <TrafficCone className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Avg Speed</p>
                            <p className="text-2xl font-bold text-gray-900">28 km/h</p>
                        </div>
                        <Car className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Public Transport</p>
                            <p className="text-2xl font-bold text-gray-900">1.2M</p>
                            <p className="text-xs text-gray-500">Monthly Users</p>
                        </div>
                        <Bus className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Accidents</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                            <div className="flex items-center mt-1">
                                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                                <span className="text-xs text-red-600">Safety Alert</span>
                            </div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Traffic Trends */}
                <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">Traffic Trends</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={transportData.slice(0, 7)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="trafficIndex" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="congestionLevel" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Congestion Prediction */}
                <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">Congestion Prediction</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={predictionForm.date}
                                onChange={(e) => setPredictionForm({ ...predictionForm, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="time"
                                value={predictionForm.time}
                                onChange={(e) => setPredictionForm({ ...predictionForm, time: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
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
                                <h4 className="font-semibold text-lg mb-3">Prediction Results</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Predicted Congestion</p>
                                        <p className="text-2xl font-bold">{prediction.predictedCongestion}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Accuracy</p>
                                        <p className="text-2xl font-bold text-green-600">{prediction.predictionAccuracy}%</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                                    <ul className="space-y-1">
                                        {prediction.recommendations?.map((rec, idx) => (
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
        </div>
    );
}

export default Transport;