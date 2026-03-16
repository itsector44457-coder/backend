import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Mail,
  Lock,
  User,
  BookOpen,
  ArrowRight,
  Loader2,
  Zap,
} from "lucide-react";

const API_FIELDS = `https://backend-6hhv.onrender.com/api/fields`;
const DEFAULT_FIELDS = ["Coding", "Data Science", "MPPSC", "Maths"];

const Auth = ({ onLoginSuccess, theme = "light" }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    field: "Coding",
    adminCode: "",
  });

  const isDark = ["dark", "midnight", "ocean", "forest"].includes(theme);

  useEffect(() => {
    let mounted = true;
    const loadFields = async () => {
      try {
        const res = await axios.get(API_FIELDS);
        const nextFields = (res.data || [])
          .map((item) => (typeof item === "string" ? item : item?.field))
          .filter(Boolean);
        if (mounted && nextFields.length > 0) setFields(nextFields);
      } catch (err) {
        if (mounted) setFields(DEFAULT_FIELDS);
      }
    };

    loadFields();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!fields.length) return;
    const selectedExists = fields.some(
      (item) =>
        item.toLowerCase() === String(formData.field || "").toLowerCase(),
    );
    if (!selectedExists) {
      setFormData((prev) => ({ ...prev, field: fields[0] }));
    }
  }, [fields, formData.field]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await axios.post(
          `https://backend-6hhv.onrender.com/api/auth/login`,
          {
            email: formData.email,
            password: formData.password,
            selectedField: formData.field,
          },
        );

        const loginUser = {
          ...(res.data.user || {}),
          field: formData.field || res.data?.user?.field,
        };
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(loginUser));
        if (loginUser.field) localStorage.setItem("userField", loginUser.field);

        onLoginSuccess();
      } else {
        const res = await axios.post(
          `https://backend-6hhv.onrender.com/api/auth/register`,
          formData,
        );
        alert(res.data.message || "Account created successfully!");
        setIsLogin(true);
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
    <div
      className={`min-h-[100dvh] flex items-center justify-center font-sans p-4 transition-colors duration-300 ${
        isDark ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div
        className={`p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md relative overflow-hidden transition-colors duration-300 border ${
          isDark
            ? "bg-slate-900 border-slate-800 shadow-black/50"
            : "bg-white border-slate-100 shadow-slate-200/50"
        }`}
      >
        {/* 🟢 Minimal Header Element */}
        <div className="text-center mb-8">
          <div
            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 border border-indigo-100 text-indigo-600"}`}
          >
            <Zap size={24} />
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            Universe Hub
          </h1>
          <p
            className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {isLogin
              ? "Welcome back! Please enter your details."
              : "Create an account to join the network."}
          </p>
        </div>

        {/* 🍞 Error Toast */}
        {error && (
          <div
            className={`p-3 rounded-xl mb-6 text-sm font-medium text-center border flex items-center justify-center gap-2 ${
              isDark
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-rose-50 border-rose-200 text-rose-600"
            }`}
          >
            {error}
          </div>
        )}

        {/* 📝 Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark
                    ? "text-slate-500 group-focus-within:text-indigo-400"
                    : "text-slate-400 group-focus-within:text-indigo-500"
                }`}
                size={18}
              />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all ${
                  isDark
                    ? "bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800"
                    : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                }`}
              />
            </div>
          )}

          <div className="relative group">
            <BookOpen
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isDark
                  ? "text-slate-500 group-focus-within:text-indigo-400"
                  : "text-slate-400 group-focus-within:text-indigo-500"
              }`}
              size={18}
            />
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none appearance-none cursor-pointer transition-all ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-800"
                  : "bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              }`}
            >
              {fields.map((field) => (
                <option
                  key={field}
                  value={field}
                  className={isDark ? "text-slate-900" : ""}
                >
                  {field}
                </option>
              ))}
            </select>
          </div>

          {!isLogin && (
            <input
              type="password"
              name="adminCode"
              placeholder="Field Admin Code (optional)"
              value={formData.adminCode}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800"
                  : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              }`}
            />
          )}

          {/* Email */}
          <div className="relative group">
            <Mail
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isDark
                  ? "text-slate-500 group-focus-within:text-indigo-400"
                  : "text-slate-400 group-focus-within:text-indigo-500"
              }`}
              size={18}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800"
                  : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              }`}
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isDark
                  ? "text-slate-500 group-focus-within:text-indigo-400"
                  : "text-slate-400 group-focus-within:text-indigo-500"
              }`}
              size={18}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800"
                  : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isLogin ? (
              "Log In"
            ) : (
              "Create Account"
            )}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* 🔄 Toggle Button */}
        <div
          className={`mt-8 text-center text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className={`font-semibold hover:underline transition-colors focus:outline-none ${
              isDark
                ? "text-indigo-400 hover:text-indigo-300"
                : "text-indigo-600 hover:text-indigo-700"
            }`}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
