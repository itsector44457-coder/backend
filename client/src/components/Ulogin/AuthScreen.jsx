import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Target,
  Zap,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const API_URL = "${import.meta.env.VITE_API_URL}/api/auth";
const ADMIN_API_URL = "${import.meta.env.VITE_API_URL}/api/admin";

const AuthScreen = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dynamicFields, setDynamicFields] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    field: "",
  });

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(`${ADMIN_API_URL}/fields`);
        setDynamicFields(res.data);
      } catch (err) {
        console.error("Fields fetch error", err);
      }
    };
    fetchFields();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("userField", res.data.user.field);

        if (onLoginSuccess) onLoginSuccess();

        const userData = res.data.user;
        const isFirstTimeUser =
          userData.battlePoints === 100 && userData.streakCount === 0;

        if (isFirstTimeUser) navigate("/roadmap");
        else navigate("/dashboard");
      } else {
        const res = await axios.post(`${API_URL}/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          field: formData.field,
        });

        setSuccess(res.data.message || "Account created! Syncing...");
        setTimeout(() => {
          setIsLogin(true);
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "System Offline. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center p-3 sm:p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Main Container - max-h-[90vh] ensures it's scrollable when keyboard is open */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden relative z-10 max-h-[95vh] sm:max-h-none overflow-y-auto no-scrollbar">
        {/* Left Side: Desktop Branding (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border-r border-white/10">
          <div>
            <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-8">
              <Zap size={32} className="text-white fill-white" />
            </div>
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
              Universe <br />
              <span className="text-indigo-400">Hub</span>
            </h1>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs leading-relaxed max-w-sm">
              Advanced Neural Network for Data Science, Robotics, and Tech
              Mastery. Sync your brain now.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
            <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck size={14} /> System Status
            </p>
            <p className="text-white font-medium text-sm">
              End-to-End Encrypted. JWT Authentication Active. Ready for
              Commander Login.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Header (Visible on Mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Universe <span className="text-indigo-400">Hub</span>
            </h2>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
              {isLogin ? "System Access" : "Initialize Profile"}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mt-1.5">
              {isLogin
                ? "Enter credentials to sync"
                : "Register your neural profile"}
            </p>
          </div>

          {/* Error/Success Toasts */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-center mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className="text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  />
                </div>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-xs sm:text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                  placeholder="Commander Name"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail
                  size={18}
                  className="text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                />
              </div>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-xs sm:text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  size={18}
                  className="text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                />
              </div>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-xs sm:text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                placeholder="Security Protocol (Password)"
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Target
                    size={18}
                    className="text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  />
                </div>
                <select
                  required
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className={`w-full bg-slate-900/50 border border-white/10 ${formData.field === "" ? "text-slate-500" : "text-white"} rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-xs sm:text-sm font-bold outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer`}
                >
                  <option value="" disabled>
                    Select Domain Matrix
                  </option>
                  {dynamicFields.map((f) => (
                    <option key={f._id} value={f.field} className="text-black">
                      {f.field}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 font-black uppercase italic tracking-widest text-[11px] sm:text-xs hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Establish Connection" : "Authorize Node"}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pb-4 sm:pb-0">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {isLogin ? "New to the Universe?" : "Already a Commander?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
                setFormData({ ...formData, field: "" });
              }}
              className="mt-2 text-indigo-400 hover:text-indigo-300 text-[10px] sm:text-xs font-black uppercase italic tracking-[0.2em] transition-colors active:scale-95"
            >
              {isLogin ? "Initialize New Profile" : "Switch to Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
