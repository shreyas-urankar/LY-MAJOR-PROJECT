import React, { useState, useEffect } from "react";
import axios from "axios";
import PredictionHeatmap from "../components/PredictionHeatmap";

// Demo data in case backend is not available
const DEMO_DATA = [
    { year: 2020, roadsKm: 450, hospitals: 45, schools: 320, smartCityScore: 78 },
    { year: 2021, roadsKm: 480, hospitals: 48, schools: 335, smartCityScore: 82 },
    { year: 2022, roadsKm: 510, hospitals: 52, schools: 350, smartCityScore: 85 },
    { year: 2023, roadsKm: 540, hospitals: 55, schools: 365, smartCityScore: 88 },
    { year: 2024, roadsKm: 570, hospitals: 58, schools: 380, smartCityScore: 90 }
];

const API_URL = "http://localhost:5000/api/infrastructure/city/Pune";

function Infrastructure() {
    const [infrastructureData, setInfrastructureData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [usingDemoData, setUsingDemoData] = useState(false);
    const [dataSource, setDataSource] = useState("");

    // Get token from localStorage
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("user") || "user";

    useEffect(() => {
        fetchInfrastructureData();
    }, []);

    const fetchInfrastructureData = async () => {
        try {
            setLoading(true);
            setError("");
            setUsingDemoData(false);

            console.log("📡 Fetching infrastructure data from:", API_URL);

            // Try with or without token
            const headers = token ? {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            } : {
                'Cache-Control': 'no-cache'
            };

            const response = await axios.get(API_URL, {
                timeout: 5000,
                headers
            });

            console.log("✅ Response received:", response.data);

            if (response.data?.success && Array.isArray(response.data.data)) {
                setInfrastructureData(response.data.data);
                setDataSource(response.data.source || "MongoDB Database");
                console.log("✅ Real infrastructure data loaded:", response.data.source);

                // Log access to analytics
                logInfrastructureAccess();
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.warn("⚠️ Using demo data - Backend not available:", err.message);
            setInfrastructureData(DEMO_DATA);
            setUsingDemoData(true);
            setDataSource("Demo Data");
            setError("Backend connection issue: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const logInfrastructureAccess = async () => {
        try {
            if (token && username) {
                await axios.post("http://localhost:5000/api/data", {
                    username,
                    analysisResult: "User accessed infrastructure analytics",
                    actionType: "infrastructure_view",
                    city: "Pune",
                    details: {
                        dataPoints: infrastructureData.length,
                        latestYear: infrastructureData[0]?.year || "N/A"
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("✅ Infrastructure access logged to database");
            }
        } catch (err) {
            console.warn("⚠️ Could not log infrastructure access:", err.message);
        }
    };

    const addNewInfrastructureData = async () => {
        try {
            if (!token) {
                alert("Please login to add data");
                return;
            }

            const newData = {
                city: "Pune",
                year: 2025,
                roadsKm: 600,
                hospitals: 62,
                schools: 400,
                housingIndex: 80,
                waterSupply: "Excellent",
                powerAvailability: "24hrs",
                smartCityScore: 92,
                populationServed: 4000000
            };

            const response = await axios.post(
                "http://localhost:5000/api/infrastructure",
                newData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert("✅ New infrastructure data added to MongoDB!");
                fetchInfrastructureData(); // Refresh data
            }
        } catch (err) {
            console.error("❌ Error adding data:", err);
            alert("Failed to add data: " + err.response?.data?.message || err.message);
        }
    };

    const handleExportReport = async () => {
        try {
            const url = `http://localhost:5000/api/reports/dashboard/infrastructure?city=Pune`;
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
            link.download = `urban_infrastructure_report_Pune_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export report.");
        }
    };

    // Safe sorted copy (NO state mutation)
    const sortedData = [...infrastructureData].sort((a, b) => b.year - a.year);
    const latestData = sortedData.length > 0 ? sortedData[0] : null;

    /* -------------------- LOADING -------------------- */
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                        Loading Infrastructure Analytics...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {dataSource ? `Fetching from ${dataSource}...` : "Connecting to database..."}
                    </p>
                </div>
            </div>
        );
    }

    /* -------------------- MAIN UI -------------------- */
    return (
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">
            {/* Status Banner */}
            <div className={`mb-6 rounded-lg p-4 ${usingDemoData ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className={`text-xl mr-2 ${usingDemoData ? 'text-yellow-600' : 'text-green-600'}`}>
                            {usingDemoData ? '⚠️' : '✅'}
                        </span>
                        <div>
                            <p className={`font-medium ${usingDemoData ? 'text-yellow-800' : 'text-green-800'}`}>
                                {usingDemoData ? 'Demo Mode' : 'Live Database Mode'}
                            </p>
                            <p className={`text-sm ${usingDemoData ? 'text-yellow-700' : 'text-green-700'}`}>
                                Data Source: {dataSource} • {sortedData.length} records
                                {latestData?.housingIndex && ` • Housing Index: ${latestData.housingIndex}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {!usingDemoData && token && (
                            <button
                                onClick={addNewInfrastructureData}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                                + Add 2025 Data
                            </button>
                        )}
                        <button
                            onClick={fetchInfrastructureData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                        >
                            <span className="mr-2">🔄</span>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        🏗️ Infrastructure Development Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Pune • Latest Year: {latestData?.year || "N/A"} • Data: {usingDemoData ? "Demo" : "Live MongoDB"}
                    </p>
                </div>
                <button onClick={handleExportReport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <span>📥</span>
                    <span>Export Infrastructure Report</span>
                </button>
            </div>

            <div className="mb-8">
                <PredictionHeatmap 
                    percentage={78} 
                    title="Infrastructure Growth Readiness" 
                    description="AI readiness score based on smart city metrics and resource allocation"
                />
            </div>

            {/* Quick Stats */}
            {latestData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Roads" value={`${latestData.roadsKm} km`} icon="🛣️" />
                    <StatCard title="Hospitals" value={latestData.hospitals} icon="🏥" />
                    <StatCard title="Schools" value={latestData.schools} icon="🏫" />
                    <StatCard
                        title="Smart City Score"
                        value={`${latestData.smartCityScore}/100`}
                        icon="🏙️"
                    />
                </div>
            )}

            {/* Additional Stats if available */}
            {latestData?.housingIndex && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Housing Index" value={`${latestData.housingIndex}/100`} icon="🏠" />
                    <StatCard title="Water Supply" value={latestData.waterSupply || "Medium"} icon="💧" />
                    <StatCard title="Power Availability" value={latestData.powerAvailability || "12-16hrs"} icon="⚡" />
                </div>
            )}

            {/* Database Info Card */}
            {!usingDemoData && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                        <span className="text-blue-600 text-xl mr-2">📊</span>
                        <div>
                            <p className="font-medium text-blue-800">MongoDB Collection: infrastructures</p>
                            <p className="text-sm text-blue-700">
                                Data is automatically stored in MongoDB.
                                When you first access this page, initial data is seeded to the database.
                                Check MongoDB Compass to see the data!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow border p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-semibold">Historical Data</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {usingDemoData ? "Demo data shown" : "Data loaded from MongoDB"}
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {sortedData.length} records • Latest: {sortedData[0]?.year}
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3 font-medium">Year</th>
                            <th className="p-3 font-medium">Roads (km)</th>
                            <th className="p-3 font-medium">Hospitals</th>
                            <th className="p-3 font-medium">Schools</th>
                            <th className="p-3 font-medium">Smart Score</th>
                            {sortedData[0]?.housingIndex && <th className="p-3 font-medium">Housing</th>}
                            <th className="p-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row) => (
                            <tr key={row.year} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{row.year}</td>
                                <td className="p-3">{row.roadsKm.toLocaleString()} km</td>
                                <td className="p-3">{row.hospitals}</td>
                                <td className="p-3">{row.schools}</td>
                                <td className="p-3">
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${row.smartCityScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-medium">{row.smartCityScore}</span>
                                    </div>
                                </td>
                                {row.housingIndex && (
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${row.housingIndex}%` }}
                                                ></div>
                                            </div>
                                            <span>{row.housingIndex}</span>
                                        </div>
                                    </td>
                                )}
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${usingDemoData ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {usingDemoData ? 'Demo' : 'In DB'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    {usingDemoData
                        ? "⚠️ Start backend server to store data in MongoDB automatically"
                        : "✅ Data is being stored and retrieved from MongoDB database"}
                </p>
                <p className="mt-1">
                    Collection: <code className="bg-gray-100 px-2 py-1 rounded">infrastructures</code>
                </p>
            </div>
        </div>
    );
}

/* ---------- Small reusable card ---------- */
function StatCard({ title, value, icon }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow border flex justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
            <div className="text-3xl">{icon}</div>
        </div>
    );
}

export default Infrastructure;