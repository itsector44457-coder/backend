import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2, LayoutGrid, Loader2 } from "lucide-react";

const AdminFields = () => {
  const { adminId } = useOutletContext();
  const [fields, setFields] = useState([]);
  const [fieldName, setFieldName] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Saari Fields Mangwao
  const fetchFields = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/fields`,
      );
      setFields(res.data);
    } catch (err) {
      console.error("Failed to fetch fields", err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 2. Nayi Field Add Karo
  const handleAddField = async (e) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/fields`,
        { field: fieldName }, // Backend 'field' expect kar raha hai tumhare schema ke hisaab se
        { headers: { adminid: adminId } },
      );
      setFieldName(""); // Input clear karo
      fetchFields(); // List ko update karo
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add domain.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Field Delete Karo
  const handleDelete = async (id, name) => {
    if (
      window.confirm(`Kya tum sach mein '${name}' ko delete karna chahte ho?`)
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/admin/fields/${id}`,
          {
            headers: { adminid: adminId },
          },
        );
        fetchFields();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white">
        Domain Architect
      </h2>

      {/* 🟢 CREATE FIELD FORM */}
      <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-[2rem] shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LayoutGrid size={80} />
        </div>

        <form
          onSubmit={handleAddField}
          className="relative z-10 flex flex-col md:flex-row gap-4"
        >
          <input
            type="text"
            required
            placeholder="Enter New Domain Name (e.g. Cyber Security, Robotics)"
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-transform text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Build Domain
          </button>
        </form>
      </div>

      {/* 🟢 FIELDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((f) => (
          <div
            key={f._id}
            className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group relative flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <LayoutGrid size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-wider">
                    {f.field}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                    Key: {f.fieldKey}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => handleDelete(f._id, f.field)}
                className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Delete Domain"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[2rem]">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              No Domains Engineered Yet. Please add one above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFields;
