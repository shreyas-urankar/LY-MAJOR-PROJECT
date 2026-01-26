import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const isAuthenticated = user && token;

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg transition-all duration-300 font-medium ${location.pathname === path
      ? 'bg-white text-blue-900 shadow-lg'
      : 'text-white hover:bg-white/20 hover:shadow-md'
    }`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="dark-gradient-bg text-white px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏙️</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            AI-Powered Urban Growth
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <span className="text-blue-100 text-sm">
              Welcome, {user}
            </span>
          )}
          <div className="flex space-x-2">
            {!isAuthenticated ? (
              // Show both Login and Register when user is NOT authenticated
              <>
                <Link to="/login" className={navLinkClass("/login")}>
                  Login
                </Link>
                <Link to="/register" className={navLinkClass("/register")}>
                  Register
                </Link>
              </>
            ) : (
              // Show Dashboard, Reports and Logout when user IS authenticated
              <>
                <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link to="/reports" className={navLinkClass("/reports")}>
                  Reports
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg transition-all duration-300 font-medium text-white hover:bg-red-500 hover:shadow-md"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


