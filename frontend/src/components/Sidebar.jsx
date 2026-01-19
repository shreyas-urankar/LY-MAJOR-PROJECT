import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Overview", description: "Main dashboard" },
    { path: "/population", icon: "👥", label: "Population", description: "Demographic data" },
    { path: "/infrastructure", icon: "🏗️", label: "Infrastructure", description: "Urban development" },
    { path: "/environment", icon: "🌿", label: "Environment", description: "Green spaces & sustainability" },
    { path: "/transport", icon: "🚗", label: "Transport", description: "Mobility & traffic" },
    { path: "/reports", icon: "📄", label: "Reports", description: "Analytics & insights" },
    { path: "/settings", icon: "⚙️", label: "Settings", description: "System configuration" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏙️</div>
          <div>
            <h2 className="font-semibold text-gray-900">Urban Analytics</h2>
            <p className="text-sm text-gray-500">Navigation</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${isActive(item.path)
                ? "bg-blue-50 border border-blue-200 text-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <div className="text-xl">{item.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
            {isActive(item.path) && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 mt-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Cities Monitored</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Data Points</span>
              <span className="font-semibold">1.2M</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">AI Predictions</span>
              <span className="font-semibold">89%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

// .