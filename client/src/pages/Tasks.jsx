import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Tag,
  AlertCircle,
  Loader2,
  Clock,
  History,
} from "lucide-react";

const getLocalDateString = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().split("T")[0];
};

const formatDateLabel = (dateString) => {
  const parts = (dateString || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n)))
    return dateString;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day).toDateString();
};

const Tasks = ({ onStreakUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Coding",
    priority: "Medium",
    description: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id;

  const today = useMemo(() => getLocalDateString(), []);
  const isHistoryView = selectedDate !== today;

  useEffect(() => {
    const fetchTasksByDate = async () => {
      if (!myId) {
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tasks/history/${myId}/${selectedDate}`,
          {
            params: { tzOffset: new Date().getTimezoneOffset() },
          },
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Date task fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksByDate();
  }, [myId, selectedDate]);

  const addTask = async () => {
    if (!newTask.title.trim() || !myId || isHistoryView) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/add`,
        {
          ...newTask,
          userId: myId,
        },
      );
      setTasks((prev) => [...prev, res.data]);
      setNewTask({
        title: "",
        category: "Coding",
        priority: "Medium",
        description: "",
      });
    } catch (err) {
      console.error("Task add error:", err);
    }
  };

  const toggleComplete = async (id, status) => {
    if (isHistoryView) return;
    try {
      const nextCompleted = !status;
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${id}`,
        {
          isCompleted: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
          completedDate: nextCompleted ? getLocalDateString() : "",
        },
      );
      const { _streak, ...taskData } = res.data || {};
      setTasks((prev) => prev.map((t) => (t._id === id ? taskData : t)));

      if (_streak && onStreakUpdate) {
        onStreakUpdate(_streak);
      }
    } catch (err) {
      console.error("Task toggle error:", err);
    }
  };

  const deleteTask = async (id) => {
    if (isHistoryView) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Task delete error:", err);
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-2.5 p-1">
      <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-lg font-black text-indigo-950 italic flex items-center gap-1.5">
            <History className="text-indigo-600" size={16} /> MISSION HISTORY
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            {isHistoryView ? "Viewing Past Records" : "Today's Active Mission"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-lg border">
          <input
            type="date"
            className="bg-transparent border-none outline-none font-bold text-xs text-indigo-600 cursor-pointer"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div
        className={`p-3.5 rounded-xl text-white shadow-lg transition-all duration-700 ${
          isHistoryView
            ? "bg-slate-800"
            : "bg-gradient-to-r from-indigo-600 to-violet-600"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">
              Log for
            </span>
            <h3 className="text-xl font-black">
              {formatDateLabel(selectedDate)}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">
              {completedCount}/{tasks.length}
            </p>
            <p className="text-[10px] font-bold uppercase opacity-70">
              Tasks Completed
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[34vh] md:max-h-[40vh] overflow-y-auto no-scrollbar space-y-2.5 pr-1">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold italic">
              No records found for this date.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all"
            >
              <div className="flex items-center gap-3">
                {isHistoryView ? (
                  task.isCompleted ? (
                    <CheckCircle
                      className="text-green-500 shrink-0"
                      size={22}
                    />
                  ) : (
                    <Circle className="text-slate-200 shrink-0" size={22} />
                  )
                ) : (
                  <button
                    onClick={() => toggleComplete(task._id, task.isCompleted)}
                    className="hover:scale-110 transition"
                  >
                    {task.isCompleted ? (
                      <CheckCircle
                        className="text-green-500 shrink-0"
                        size={22}
                      />
                    ) : (
                      <Circle
                        className="text-slate-200 shrink-0 hover:text-indigo-400"
                        size={22}
                      />
                    )}
                  </button>
                )}

                <div>
                  <h4
                    className={`text-sm md:text-base font-bold ${
                      task.isCompleted
                        ? "line-through text-slate-300"
                        : "text-slate-800"
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag size={10} /> {task.category}
                    </span>
                    {task.priority === "High" && (
                      <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle size={10} /> High
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Clock size={12} />{" "}
                      {new Date(task.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isHistoryView && (
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    task.isCompleted
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {task.isCompleted ? "Mission Done" : "Incomplete"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isHistoryView && (
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border border-slate-200 p-2 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-2.5">
            <input
              className="flex-1 min-w-[170px] bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Naya task dalo (e.g. MPPSC Notes Review)..."
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />

            <select
              className="bg-slate-50 rounded-lg px-2 py-2 text-[11px] font-bold text-indigo-600 outline-none cursor-pointer"
              value={newTask.category}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <option value="Coding">Coding</option>
              <option value="MPPSC">MPPSC</option>
              <option value="Aarambh Institute">Institute</option>
              <option value="Personal">Personal</option>
            </select>

            <select
              className="bg-slate-50 rounded-lg px-2 py-2 text-[11px] font-bold text-rose-500 outline-none cursor-pointer"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={addTask}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-2 rounded-lg shadow-lg transition-all active:scale-95"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
