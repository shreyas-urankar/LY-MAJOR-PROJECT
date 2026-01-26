import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import PopulationDashboard from "./components/PopulationDashboard";
import Infrastructure from "./pages/infrastructure"
import Environment from "./pages/Environment";
import Transport from "./pages/Transport";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col gradient-bg">
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login page - show navbar */}
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />

          {/* Register page - show navbar */}
          <Route
            path="/register"
            element={
              <>
                <Navbar />
                <Register />
              </>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <Reports />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Population */}
          <Route
            path="/population"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <PopulationDashboard />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Infrastructure */}
          <Route
            path="/infrastructure"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <Infrastructure />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Environment */}
          <Route
            path="/environment"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <Environment />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Transport */}
          <Route
            path="/transport"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <Transport />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 p-8 bg-gray-50">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">System configuration coming soon...</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;