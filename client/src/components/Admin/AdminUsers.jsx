import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom"; // 🔥 FIX: useNavigate add kiya
import axios from "axios";
import { Loader2, Trash2, Trophy, Eye } from "lucide-react";

const AdminUsers = () => {
  const { adminId } = useOutletContext();
  const navigate = useNavigate(); // 🔥 FIX: Navigation hook initialize kiya
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          headers: { adminid: adminId },
        },
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [adminId]);

  const handleBanUser = async (targetId, name) => {
    if (
      window.confirm(
        `Are you sure you want to completely ban ${name} from the platform?`,
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/admin/users/${targetId}`,
          {
            headers: { adminid: adminId },
          },
        );
        setUsers(users.filter((u) => u._id !== targetId));
      } catch (err) {
        alert("Failed to ban user.");
      }
    }
  };

  // 🔥 FIX: Modal kholne ki jagah Naye Page par bhej raha hai
  const handleViewAnalytics = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white">
        Commander Leaderboard
      </h2>

      <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 border-b border-white/5">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Rank
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Commander Info
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Domain
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Battle Points (XP)
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u, index) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-5">
                    {index === 0 ? (
                      <Trophy size={20} className="text-amber-400" />
                    ) : index === 1 ? (
                      <Trophy size={20} className="text-slate-300" />
                    ) : index === 2 ? (
                      <Trophy size={20} className="text-amber-700" />
                    ) : (
                      <span className="font-bold text-slate-500">
                        #{index + 1}
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-white capitalize">{u.name}</p>
                    <p className="text-[10px] text-slate-500">{u.email}</p>
                  </td>
                  <td className="p-5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {u.field || "Unassigned"}
                  </td>
                  <td className="p-5 font-black text-emerald-400">
                    {u.battlePoints || 0} XP
                  </td>
                  <td className="p-5 text-right flex items-center justify-end gap-2">
                    {/* 🔥 THE EYE BUTTON: Ab ye direct handleViewAnalytics ko id bhejta hai */}
                    <button
                      onClick={() => handleViewAnalytics(u._id)}
                      className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-colors"
                      title="View Analytics"
                    >
                      <Eye size={16} />
                    </button>

                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleBanUser(u._id, u.name)}
                        className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                        title="Ban User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
