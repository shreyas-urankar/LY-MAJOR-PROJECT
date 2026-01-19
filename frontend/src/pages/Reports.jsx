import React from "react";

function Reports() {
  const reports = [
    {
      id: 1,
      title: "Population Density Analysis",
      description: "Comprehensive analysis of urban population distribution and density patterns across metropolitan areas",
      date: "2025-01-15",
      type: "PDF",
      icon: "📊"
    },
    {
      id: 2,
      title: "Infrastructure Development Report",
      description: "Current state and future projections of urban infrastructure development and capacity planning",
      date: "2025-01-10",
      type: "PDF",
      icon: "🏗️"
    },
    {
      id: 3,
      title: "Environmental Impact Assessment",
      description: "Detailed analysis of urban growth effects on local ecosystems and environmental sustainability",
      date: "2025-01-05",
      type: "PDF",
      icon: "🌿"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Urban Development Reports
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered analysis and insights for data-driven urban planning and sustainable development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{report.icon}</div>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {report.type}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-gray-500 text-sm">
                  {report.date}
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 text-sm font-semibold">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;


// .