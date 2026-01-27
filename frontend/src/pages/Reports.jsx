// frontend/src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  FileText,
  BarChart3,
  Users,
  Building,
  TreePine,
  Car,
  Calendar,
  TrendingUp,
  Clock,
  FilePieChart
} from "lucide-react";

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportSummary, setReportSummary] = useState(null);
  const [generatingReport, setGeneratingReport] = useState("");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user");

  const reportTypes = [
    {
      id: "comprehensive",
      title: "Comprehensive Urban Analysis",
      description: "Complete analysis of population, infrastructure, environment, and transport data",
      icon: <FileText className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      modules: ["population", "infrastructure", "environment", "transport"],
      endpoint: "/comprehensive"
    },
    {
      id: "population",
      title: "Population Demographics",
      description: "Detailed population growth, density, and demographic patterns",
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      modules: ["population"],
      endpoint: "/dashboard/population"
    },
    {
      id: "infrastructure",
      title: "Infrastructure Development",
      description: "Roads, hospitals, schools, and smart city infrastructure analysis",
      icon: <Building className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      modules: ["infrastructure"],
      endpoint: "/dashboard/infrastructure"
    },
    {
      id: "environment",
      title: "Environmental Impact",
      description: "Air quality, pollution levels, and environmental sustainability",
      icon: <TreePine className="w-6 h-6" />,
      color: "from-emerald-500 to-emerald-600",
      modules: ["environment"],
      endpoint: "/dashboard/environment"
    },
    {
      id: "transport",
      title: "Transport & Mobility",
      description: "Traffic patterns, congestion analysis, and transport infrastructure",
      icon: <Car className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      modules: ["transport"],
      endpoint: "/dashboard/transport"
    }
  ];

  const fetchReportSummary = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/reports/summary", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReportSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching report summary:", error);
    }
  };

  const generateReport = async (reportType, city = "Pune") => {
    try {
      setGeneratingReport(reportType);
      setLoading(true);

      // Find the report configuration
      const reportConfig = reportTypes.find(r => r.id === reportType);
      if (!reportConfig) {
        throw new Error(`Report type ${reportType} not found`);
      }

      let url;
      if (reportType === "comprehensive") {
        url = `http://localhost:5000/api/reports${reportConfig.endpoint}?city=${city}&year=${new Date().getFullYear()}`;
      } else {
        url = `http://localhost:5000/api/reports${reportConfig.endpoint}?city=${city}`;
      }

      console.log(`Generating report from: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        responseType: 'blob'
      });

      // Check if response is valid
      if (!response.data || response.data.size === 0) {
        throw new Error("Empty PDF response from server");
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `urban_${reportType}_report_${city}_${timestamp}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      // Show success message
      setTimeout(() => {
        alert(`✅ ${reportConfig.title} report generated and downloaded successfully!`);
      }, 500);

    } catch (error) {
      console.error("Error generating report:", error);

      let errorMessage = "Failed to generate report";
      if (error.response) {
        // Server responded with error
        if (error.response.status === 404) {
          errorMessage = "Report endpoint not found. Please check backend server.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error while generating report. Check server logs.";
        } else if (error.response.data) {
          // Try to get error message from response
          try {
            const errorData = JSON.parse(await error.response.data.text());
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${error.response.status}`;
          }
        }
      } else if (error.request) {
        // No response received
        errorMessage = "No response from server. Is backend running on port 5000?";
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }

      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
      setGeneratingReport("");
    }
  };

  const quickGenerate = (reportType) => {
    if (window.confirm(`Generate ${reportType} dashboard report for Pune?`)) {
      generateReport(reportType, "Pune");
    }
  };

  useEffect(() => {
    fetchReportSummary();
  }, []);

  // Function to test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/reports", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("Backend connection test:", response.data);
      alert("✅ Backend connection successful!");
    } catch (error) {
      console.error("Backend connection test failed:", error);
      alert("❌ Backend connection failed. Check if server is running on port 5000.");
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Urban Growth Dashboard Reports</h1>
              <p className="text-gray-600 mt-2">
                Generate comprehensive PDF reports with dashboard analytics for data-driven urban planning
              </p>
              {reportSummary && (
                <div className="flex items-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      Last report: {reportSummary.lastGenerated
                        ? new Date(reportSummary.lastGenerated.createdAt).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      Total data points: {(
                        (reportSummary.population || 0) +
                        (reportSummary.infrastructure || 0) +
                        (reportSummary.environment || 0) +
                        (reportSummary.transport || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Generated by</p>
                <p className="font-semibold text-blue-700">{username}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                <FilePieChart className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Connection Test Button */}
          <div className="mt-4">
            <button
              onClick={testBackendConnection}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              🔍 Test Backend Connection
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {reportSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Population Data</p>
                  <p className="text-2xl font-bold mt-1">{reportSummary.population || 0}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Infrastructure</p>
                  <p className="text-2xl font-bold mt-1">{reportSummary.infrastructure || 0}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Environment</p>
                  <p className="text-2xl font-bold mt-1">{reportSummary.environment || 0}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transport</p>
                  <p className="text-2xl font-bold mt-1">{reportSummary.transport || 0}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${report.color} flex items-center justify-center text-white`}>
                  {report.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.id === 'comprehensive'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {report.modules.length} {report.modules.length === 1 ? 'Module' : 'Modules'}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Estimated time:</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {report.id === 'comprehensive' ? '30-60 seconds' : '10-20 seconds'}
                  </span>
                </div>

                {report.id === 'comprehensive' && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                      <span>Population</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                      <span>Infrastructure</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span>Environment</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => quickGenerate(report.id)}
                disabled={loading && generatingReport === report.id}
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${loading && generatingReport === report.id
                  ? 'bg-gray-300 cursor-not-allowed'
                  : `bg-gradient-to-r ${report.color} hover:opacity-90 text-white`
                  }`}
              >
                {loading && generatingReport === report.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Generate Dashboard Report</span>
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Includes: {report.modules.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  📊 Dashboard analytics included
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Report Actions</h3>
              <p className="text-gray-600 text-sm">
                Generate dashboard reports for specific cities or time periods
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => quickGenerate('population')}
                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Population Dashboard
              </button>
              <button
                onClick={() => quickGenerate('comprehensive')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Full Dashboard Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Report Features */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Report Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Dashboard Analytics</h4>
                  <p className="text-sm text-gray-600">Includes all dashboard metrics, charts, and KPIs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Professional Format</h4>
                  <p className="text-sm text-gray-600">Clean, professional PDF with executive summary</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Trend Analysis</h4>
                  <p className="text-sm text-gray-600">Historical trends and future projections</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Instant Download</h4>
                  <p className="text-sm text-gray-600">Reports are generated and downloaded instantly</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">What's included in Dashboard Reports?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dashboard KPIs and summary statistics</li>
              <li>• Trend analysis and growth patterns</li>
              <li>• Status indicators (Good/Moderate/Poor)</li>
              <li>• Database data with historical records</li>
              <li>• AI-powered recommendations for urban planning</li>
              <li>• Professional executive summary</li>
            </ul>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Dashboard Report</h3>
                <p className="text-gray-600">
                  {generatingReport === 'comprehensive'
                    ? 'Compiling comprehensive dashboard analysis...'
                    : `Preparing ${generatingReport} dashboard report...`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few seconds. Please don't close this window.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;