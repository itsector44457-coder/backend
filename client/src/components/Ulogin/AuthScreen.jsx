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

const API_URL = `https://backend-6hhv.onrender.com/api/auth`;
const ADMIN_API_URL = `https://backend-6hhv.onrender.com/api/admin`;

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

        setSuccess(res.data.message || "Account created successfully!");
        setTimeout(() => {
          setIsLogin(true);
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* 📦 Main Container - Classic SaaS Split Screen */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden relative max-h-[95vh] sm:max-h-none overflow-y-auto no-scrollbar border border-slate-100">
        {/* 🎨 Left Side: Brand Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 text-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/50 to-purple-600/50 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-sm">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
              Welcome to <br /> Universe Hub
            </h1>
            <p className="text-indigo-100 font-medium leading-relaxed max-w-sm text-sm">
              Your centralized platform for tech mastery, peer challenges, and
              career acceleration. Join the community today.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 border border-white/20 p-5 rounded-2xl backdrop-blur-md">
            <p className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-300" /> Secure
              Access
            </p>
            <p className="text-indigo-100 font-medium text-xs leading-relaxed">
              End-to-end encrypted authentication. Your data and progress are
              safely synced to the matrix.
            </p>
          </div>
        </div>

        {/* 📝 Right Side: Auth Form */}
        <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center bg-white">
          {/* Mobile Header (Visible only on Mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={24} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Universe Hub
            </h2>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2">
              {isLogin
                ? "Enter your credentials to access your dashboard."
                : "Fill in the details below to initialize your profile."}
            </p>
          </div>

          {/* Error/Success Alerts */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  />
                </div>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail
                  size={18}
                  className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                />
              </div>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  size={18}
                  className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                />
              </div>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="Password"
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Target
                    size={18}
                    className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  />
                </div>
                <select
                  required
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer ${
                    formData.field === "" ? "text-slate-400" : "text-slate-900"
                  }`}
                >
                  <option value="" disabled>
                    Select your domain
                  </option>
                  {dynamicFields.map((f) => (
                    <option
                      key={f._id}
                      value={f.field}
                      className="text-slate-900"
                    >
                      {f.field}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Log In" : "Create Account"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                  setFormData({ ...formData, field: "" });
                }}
                className="ml-1.5 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors focus:outline-none"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
