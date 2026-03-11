import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Lock, User, BookOpen, ArrowRight, Loader2 } from "lucide-react";

const API_FIELDS = `${import.meta.env.VITE_API_URL}/api/fields`;
const DEFAULT_FIELDS = ["Coding", "Data Science", "MPPSC", "Maths"];

const Auth = ({ onLoginSuccess, theme = "light" }) => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    field: "Coding", // Default field
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // LOGIN LOGIC
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          {
            email: formData.email,
            password: formData.password,
            selectedField: formData.field,
          },
        );

        // Token aur User Info local storage mein save karo
        const loginUser = {
          ...(res.data.user || {}),
          field: formData.field || res.data?.user?.field,
        };
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(loginUser));
        if (loginUser.field) localStorage.setItem("userField", loginUser.field);

        onLoginSuccess(); // Main App ko batao ki login ho gaya
      } else {
        // REGISTER LOGIC
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/register`,
          formData,
        );
        alert(res.data.message); // "Account mast ban gaya!"
        setIsLogin(true); // Account banne ke baad wapas login page pe bhej do
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Kuch toh gadbad hai server mein!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center font-sans p-4 transition-colors ${
        isDark
          ? "bg-gradient-to-br from-slate-900 to-indigo-900"
          : "bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50"
      }`}
    >
      <div
        className={`p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden transition-colors ${
          isDark
            ? "bg-white/10 backdrop-blur-lg border border-white/20"
            : "bg-white border border-slate-200"
        }`}
      >
        {/* Header Element */}
        <div className="text-center mb-8">
          <h1
            className={`text-3xl font-black italic mb-2 tracking-wider ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            UNIVERSE HUB
          </h1>
          <p
            className={`text-sm ${isDark ? "text-indigo-200" : "text-slate-500"}`}
          >
            {isLogin
              ? "Welcome back! Login to continue."
              : "Join the ultimate study network."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Naya Account banane ke liye Extra Fields */}
          {!isLogin && (
            <>
              <div className="relative">
                <User
                  className={`absolute left-3 top-3.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Aapka Poora Naam"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-xl py-3 pl-10 pr-4 outline-none transition-all placeholder:text-slate-400 ${
                    isDark
                      ? "bg-white/10 border border-white/10 text-white focus:border-indigo-400 focus:bg-white/20"
                      : "bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-400 focus:bg-white"
                  }`}
                />
              </div>
            </>
          )}

          <div className="relative">
            <BookOpen
              className={`absolute left-3 top-3.5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              size={20}
            />
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 pl-10 pr-4 outline-none appearance-none transition-all ${
                isDark
                  ? "bg-slate-800 border border-white/10 text-white focus:border-indigo-400"
                  : "bg-slate-50 border border-slate-200 text-slate-700 focus:border-indigo-400"
              }`}
            >
              {fields.map((field) => (
                <option key={field} value={field}>
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
              className={`w-full rounded-xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 ${
                isDark
                  ? "bg-white/10 border border-white/10 text-white focus:border-indigo-400 focus:bg-white/20"
                  : "bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-400 focus:bg-white"
              }`}
            />
          )}

          {/* Email & Password (Dono mein common) */}
          <div className="relative">
            <Mail
              className={`absolute left-3 top-3.5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              size={20}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 pl-10 pr-4 outline-none transition-all placeholder:text-slate-400 ${
                isDark
                  ? "bg-white/10 border border-white/10 text-white focus:border-indigo-400 focus:bg-white/20"
                  : "bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-400 focus:bg-white"
              }`}
            />
          </div>

          <div className="relative">
            <Lock
              className={`absolute left-3 top-3.5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              size={20}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-xl py-3 pl-10 pr-4 outline-none transition-all placeholder:text-slate-400 ${
                isDark
                  ? "bg-white/10 border border-white/10 text-white focus:border-indigo-400 focus:bg-white/20"
                  : "bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-400 focus:bg-white"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        {/* Toggle Button */}
        <div
          className={`mt-8 text-center text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}
        >
          {isLogin ? "Account nahi hai? " : "Pehle se account hai? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); // Toggle karte waqt error hata do
            }}
            className={`font-bold underline underline-offset-4 ${
              isDark
                ? "text-indigo-400 hover:text-indigo-300"
                : "text-indigo-600 hover:text-indigo-500"
            }`}
          >
            {isLogin ? "Naya Account Banao" : "Login Karo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
