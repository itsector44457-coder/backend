import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Zap,
  X,
  ChevronRight,
} from "lucide-react";

const AdminCategories = () => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState("");
  const [loading, setLoading] = useState(false);

  // Sub-logic for adding subjects
  const [activeField, setActiveField] = useState(null);
  const [subjectData, setSubjectData] = useState({ name: "", topics: "" });

  // Get Admin ID from LocalStorage (Assuming user is logged in)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminId = user.id || user._id;

  const fetchFields = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fields`);
      setFields(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 1. Initialize Field Template
  const handleCreateField = async () => {
    if (!newField.trim()) return alert("Bhai, Field ka naam toh dalo!");
    setLoading(true);
    try {
      // Body matches your POST /admin/template route
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/fields/admin/template`,
        {
          adminId,
          field: newField,
          subjects: [{ name: "General", topics: ["Introduction"] }], // Default subject
        },
      );
      setNewField("");
      fetchFields();
      alert("✅ Domain Initialized with Default Syllabus!");
    } catch (err) {
      alert(err.response?.data?.message || "Admin Access Check Karo!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Subject & Topics to a Field
  const handleAddSubject = async (fieldName) => {
    if (!subjectData.name || !subjectData.topics)
      return alert("Details bharo bhai!");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/fields/admin/subject`,
        {
          adminId,
          field: fieldName,
          subjectName: subjectData.name,
          topics: subjectData.topics, // Your backend handles comma-separated strings
        },
      );
      setSubjectData({ name: "", topics: "" });
      setActiveField(null);
      fetchFields();
      alert("✅ Subject Added to Syllabus!");
    } catch (err) {
      alert("Error adding subject!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c16] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-indigo-400">
            Universe Architect
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            Syllabus & Field Manager [Admin Mode]
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: FIELD GENERATOR */}
          <div className="bg-slate-900/50 border border-white/10 p-6 rounded-[2.5rem] h-fit sticky top-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 italic">
              <Zap size={20} className="text-amber-400" /> New Domain
            </h3>
            <div className="space-y-4">
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all"
                placeholder="Domain Name (e.g. UPSC Statistics)"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
              />
              <button
                onClick={handleCreateField}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
              >
                {loading ? "Constructing..." : "Initialise Domain"}
              </button>
            </div>
          </div>

          {/* RIGHT: FIELD LIST & SYLLABUS EDITOR */}
          <div className="lg:col-span-2 space-y-6">
            {fields.map((f, idx) => (
              <div
                key={idx}
                className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-2xl font-black italic uppercase text-white">
                      {f.field}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${f.hasAdminTemplate ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}
                    >
                      {f.hasAdminTemplate
                        ? "Admin Managed"
                        : "Default Template"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      Syllabus Strength
                    </p>
                    <p className="text-xl font-bold text-indigo-400">
                      {f.subjectCount} Subjects
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveField(f.field)}
                    className="bg-white/5 hover:bg-indigo-600 px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    + Add Subject
                  </button>
                </div>

                {/* INLINE SUBJECT FORM */}
                {activeField === f.field && (
                  <div className="mt-6 p-6 bg-black/40 rounded-3xl border border-indigo-500/20 animate-in slide-in-from-top-4">
                    <div className="flex justify-between mb-4">
                      <p className="text-xs font-black uppercase text-indigo-400 tracking-widest">
                        Construct Subject
                      </p>
                      <button onClick={() => setActiveField(null)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm"
                        placeholder="Subject Name (e.g. Probability Theory)"
                        value={subjectData.name}
                        onChange={(e) =>
                          setSubjectData({
                            ...subjectData,
                            name: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm h-20"
                        placeholder="Topics (Comma separated: Mean, Median, Mode...)"
                        value={subjectData.topics}
                        onChange={(e) =>
                          setSubjectData({
                            ...subjectData,
                            topics: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() => handleAddSubject(f.field)}
                        className="w-full bg-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em]"
                      >
                        Push to Syllabus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
