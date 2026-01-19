import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import PopulationDashboard from "./components/PopulationDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Environment from "./pages/Environment"; // Import the Environment component

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

          {/* Protected routes - no navbar (they have sidebar) */}
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

          {/* Population route - now shows the real dashboard */}
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

          <Route
            path="/infrastructure"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 p-8 bg-gray-50">
                    <h1 className="text-3xl font-bold text-gray-900">Infrastructure Analytics</h1>
                    <p className="text-gray-600">Urban infrastructure insights coming soon...</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Environment route - SHOWS THE ACTUAL COMPONENT */}
          <Route
            path="/environment"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <Environment /> {/* This is the actual Environment component */}
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 p-8 bg-gray-50">
                    <h1 className="text-3xl font-bold text-gray-900">Transport Analytics</h1>
                    <p className="text-gray-600">Transportation and mobility data coming soon...</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

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



// .
