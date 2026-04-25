import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function RecoverAccount() {
  const [activeTab, setActiveTab] = useState("password"); // 'password' or 'username'
  
  // States for Password Reset
  const [username, setUsername] = useState("");
  const [securityAnswerPwd, setSecurityAnswerPwd] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // States for Username Recovery
  const [securityAnswerUser, setSecurityAnswerUser] = useState("");
  const [recoveredUsername, setRecoveredUsername] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    if (!username.trim() || !newPassword.trim()) {
      setMessage({ text: "Username and new password are required.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/reset-password", {
        username,
        securityAnswer: securityAnswerPwd,
        newPassword
      });
      setMessage({ text: response.data.message, type: "success" });
      setUsername("");
      setSecurityAnswerPwd("");
      setNewPassword("");
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Failed to reset password. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameRecovery = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setRecoveredUsername("");
    setLoading(true);

    if (!securityAnswerUser.trim()) {
      setMessage({ text: "Security answer is required.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/recover-username", {
        securityAnswer: securityAnswerUser
      });
      setRecoveredUsername(response.data.username);
      setMessage({ text: "Username recovered successfully!", type: "success" });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Failed to recover username.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 gradient-bg">
      <div className="glass-effect rounded-2xl p-8 md:p-12 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Account Recovery
          </h2>
          <p className="text-blue-100">
            Recover your username or reset your password
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex mb-8 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => { setActiveTab("password"); setMessage({text:"", type:""}); }}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${activeTab === "password" ? "bg-white text-blue-900 shadow" : "text-white hover:bg-white/5"}`}
          >
            Reset Password
          </button>
          <button
            onClick={() => { setActiveTab("username"); setMessage({text:"", type:""}); }}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${activeTab === "username" ? "bg-white text-blue-900 shadow" : "text-white hover:bg-white/5"}`}
          >
            Forgot Username
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-red-500/20 border-red-500/50 text-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Password Reset Form */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label className="block text-white font-medium mb-1 text-sm text-left">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-1 text-sm text-left">Security Answer (Optional for old accounts)</label>
              <input
                type="text"
                placeholder="Answer to your security question"
                value={securityAnswerPwd}
                onChange={(e) => setSecurityAnswerPwd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-1 text-sm text-left">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white text-blue-900 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Username Recovery Form */}
        {activeTab === "username" && (
          <form onSubmit={handleUsernameRecovery} className="space-y-5">
            <div>
              <label className="block text-white font-medium mb-1 text-sm text-left">Security Answer</label>
              <input
                type="text"
                placeholder="Enter exact answer you provided at registration"
                value={securityAnswerUser}
                onChange={(e) => setSecurityAnswerUser(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-900 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Searching..." : "Recover Username"}
            </button>

            {recoveredUsername && (
              <div className="mt-6 p-6 border-2 border-white/30 bg-white/10 rounded-xl text-center">
                <p className="text-blue-100 mb-2">Your Username is:</p>
                <p className="text-2xl font-bold text-white tracking-wide">{recoveredUsername}</p>
              </div>
            )}
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <Link to="/login" className="text-white hover:underline font-medium text-sm flex items-center justify-center gap-2">
            <span>←</span> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecoverAccount;
