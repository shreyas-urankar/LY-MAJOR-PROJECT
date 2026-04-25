import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download, FileText, Users, Building, TreePine, Car,
  Calendar, TrendingUp, Clock, FilePieChart, AlertCircle,
  RefreshCw, CheckCircle, XCircle
} from "lucide-react";

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportSummary, setReportSummary] = useState(null);
  const [generatingReport, setGeneratingReport] = useState("");
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [success, setSuccess] = useState(null);

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

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/", {
        timeout: 3000
      });

      if (response.status === 200) {
        setBackendStatus({ status: 'online', message: 'Backend server is running' });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Backend check failed:", error);
      const errorMsg = error.code === 'ECONNABORTED'
        ? 'Backend server timeout'
        : error.code === 'ERR_NETWORK' || error.message.includes('Network Error')
          ? 'Cannot connect to backend server on port 5000'
          : 'Backend server error';
      setBackendStatus({ status: 'offline', message: errorMsg });
      return false;
    }
  };

  const fetchReportSummary = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/reports/summary", {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      setReportSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching report summary:", error);
    }
  };

  const generateReport = async (reportType, city = "Pune") => {
    setError(null);
    setSuccess(null);

    // Check if backend is running
    console.log("🔍 Checking backend status...");
    const isBackendOnline = await checkBackendStatus();
    if (!isBackendOnline) {
      setError("⚠️ Backend server is not running. Please start the server:\n\ncd backend\nnpm run dev");
      return;
    }

    try {
      setGeneratingReport(reportType);
      setLoading(true);

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

      console.log(`📊 Generating report: ${reportConfig.title}`);
      console.log(`📡 Calling: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        responseType: 'blob',
        timeout: 120000, // 2 minute timeout
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`⬇️ Download progress: ${percentCompleted}%`);
          }
        }
      });

      console.log(`✅ Response received: ${response.data.size} bytes`);

      // Verify response
      if (!response.data || response.data.size === 0) {
        throw new Error("Empty PDF response from server");
      }

      // Check if response is actually PDF
      const contentType = response.headers['content-type'];
      console.log(`📄 Content-Type: ${contentType}`);

      if (contentType && !contentType.includes('application/pdf')) {
        const text = await response.data.text();
        console.error("❌ Non-PDF response:", text);
        throw new Error(`Server returned non-PDF response: ${text.substring(0, 200)}`);
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `urban_${reportType}_report_${city}_${timestamp}.pdf`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      console.log(`✅ Report downloaded: ${filename}`);

      // Show success
      setError(null);
      setSuccess(`✅ ${reportConfig.title} report generated and downloaded successfully!`);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);

    } catch (error) {
      console.error("❌ Error generating report:", error);

      let errorMessage = "Failed to generate report";

      if (error.code === 'ECONNABORTED') {
        errorMessage = "⏱️ Request timeout. The report is taking too long to generate. This might mean:\n\n• Large dataset being processed\n• Server is overloaded\n• Network connection issues\n\nPlease try again.";
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = "🔌 Network error. Please check:\n\n• Backend server is running (port 5000)\n• MongoDB is connected\n• No firewall blocking the connection";
      } else if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "❌ Report endpoint not found.\n\nPlease check:\n• Backend routes are configured correctly\n• reportRoutes.js is imported in server.js";
        } else if (error.response.status === 500) {
          errorMessage = "⚠️ Server error while generating report.\n\nCheck backend console for detailed error logs.";
        } else if (error.response.status === 401) {
          errorMessage = "🔐 Authentication error. Please login again.";
        } else if (error.response.data) {
          try {
            if (error.response.data instanceof Blob) {
              const text = await error.response.data.text();
              try {
                const jsonError = JSON.parse(text);
                errorMessage = `❌ ${jsonError.message || jsonError.error || text}`;
              } catch {
                errorMessage = `❌ ${text}`;
              }
            } else if (error.response.data.message) {
              errorMessage = `❌ ${error.response.data.message}`;
            }
          } catch (e) {
            errorMessage = `❌ Server error: ${error.response.status}`;
          }
        }
      } else if (error.request) {
        errorMessage = "📡 No response from server.\n\nPlease verify:\n• Backend is running: npm run dev\n• Server started on port 5000\n• MongoDB is connected";
      } else {
        errorMessage = `❌ ${error.message}`;
      }

      setError(errorMessage);

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
    checkBackendStatus();
    fetchReportSummary();
  }, []);

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

              {/* Backend Status */}
              <div className="flex items-center space-x-4 mt-4">
                {backendStatus && (
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${backendStatus.status === 'online'
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-100 border border-red-300'
                    }`}>
                    {backendStatus.status === 'online' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${backendStatus.status === 'online' ? 'text-green-800' : 'text-red-800'
                        }`}>
                        Backend: {backendStatus.status === 'online' ? 'Online ✅' : 'Offline ❌'}
                      </p>
                      <p className={`text-xs ${backendStatus.status === 'online' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {backendStatus.message}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={checkBackendStatus}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Status</span>
                </button>
              </div>

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
                      Data: {(
                        (reportSummary.population || 0) +
                        (reportSummary.infrastructure || 0) +
                        (reportSummary.environment || 0) +
                        (reportSummary.transport || 0)
                      ).toLocaleString()} records
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
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Success!</h3>
              <p className="text-green-700 text-sm mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Error Generating Report</h3>
              <pre className="text-red-700 text-sm mt-1 whitespace-pre-wrap font-sans">{error}</pre>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={checkBackendStatus}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Check Backend
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${report.color} flex items-center justify-center text-white`}>
                  {report.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.id === 'comprehensive' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {report.modules.length} {report.modules.length === 1 ? 'Module' : 'Modules'}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
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
                    <span className="text-sm text-gray-500">Est. time:</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {report.id === 'comprehensive' ? '30-60 sec' : '10-20 sec'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => quickGenerate(report.id)}
                disabled={loading && generatingReport === report.id}
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${loading && generatingReport === report.id
                    ? 'bg-gray-300 cursor-not-allowed'
                    : `bg-gradient-to-r ${report.color} hover:opacity-90 text-white shadow-md hover:shadow-lg`
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
                    <span>Generate Report</span>
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Includes: {report.modules.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Report</h3>
                <p className="text-gray-600">
                  {generatingReport === 'comprehensive'
                    ? 'Compiling comprehensive analysis...'
                    : `Preparing ${generatingReport} report...`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a moment. Please don't close this window.
                </p>
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    💡 Large reports may take 30-60 seconds to generate
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;