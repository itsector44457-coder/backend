import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  AlertCircle,
  Loader2,
  Clock,
  History,
  CalendarDays,
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
          `https://backend-6hhv.onrender.com/api/tasks/history/${myId}/${selectedDate}`,
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
        `https://backend-6hhv.onrender.com/api/tasks/add`,
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
        `https://backend-6hhv.onrender.com/api/tasks/${id}`,
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
      await axios.delete(`https://backend-6hhv.onrender.com/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Task delete error:", err);
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-4 p-2 sm:p-4 font-sans">
      {/* 🟢 HEADER: Date Selector & Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {isHistoryView ? (
              <History className="text-indigo-500" size={20} />
            ) : (
              <CheckCircle2 className="text-indigo-500" size={20} />
            )}
            {isHistoryView ? "Mission History" : "Today's Mission"}
          </h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            {formatDateLabel(selectedDate)}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shrink-0 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
          <CalendarDays size={16} className="text-indigo-500" />
          <input
            type="date"
            className="bg-transparent border-none outline-none font-semibold text-sm text-slate-700 cursor-pointer w-full"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* 🟢 SUMMARY CARD: Progress */}
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
          isHistoryView
            ? "bg-slate-50 border-slate-200 text-slate-700"
            : "bg-indigo-50 border-indigo-100 text-indigo-900"
        }`}
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            Progress
          </span>
          <h3 className="text-lg font-bold tracking-tight mt-0.5">
            {tasks.length > 0
              ? Math.round((completedCount / tasks.length) * 100)
              : 0}
            % Complete
          </h3>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono tracking-tighter leading-none">
            {completedCount}
            <span className="text-xl opacity-50">/{tasks.length}</span>
          </p>
        </div>
      </div>

      {/* 🟢 TASKS LIST */}
      <div className="max-h-[45vh] md:max-h-[50vh] overflow-y-auto no-scrollbar space-y-3 pb-24 sm:pb-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500 mb-3" size={28} />
            <p className="text-sm font-medium text-slate-500">
              Loading tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <CheckCircle2 size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">
              {isHistoryView
                ? "No records found for this date."
                : "No tasks added yet. Start planning!"}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white p-4 rounded-xl border transition-all duration-200 flex items-start sm:items-center justify-between group gap-4 ${
                task.isCompleted
                  ? "border-emerald-100 bg-emerald-50/30"
                  : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(task._id, task.isCompleted)}
                  disabled={isHistoryView}
                  className="mt-0.5 sm:mt-0 shrink-0 transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {task.isCompleted ? (
                    <CheckCircle2
                      className="text-emerald-500 fill-emerald-50"
                      size={22}
                    />
                  ) : (
                    <Circle
                      className="text-slate-300 hover:text-indigo-500 transition-colors"
                      size={22}
                    />
                  )}
                </button>

                {/* Task Details */}
                <div className="min-w-0">
                  <h4
                    className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                      task.isCompleted
                        ? "line-through text-slate-400"
                        : "text-slate-800"
                    }`}
                  >
                    {task.title}
                  </h4>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                      <Tag size={10} /> {task.category}
                    </span>

                    {task.priority === "High" && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <AlertCircle size={10} /> High
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 shrink-0">
                      <Clock size={10} />
                      {new Date(task.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action/Status */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <div
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    task.isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {task.isCompleted ? "Done" : "Pending"}
                </div>

                {!isHistoryView && (
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🟢 ADD TASK BAR (Sticky Bottom) */}
      {!isHistoryView && (
        <div className="fixed sm:sticky bottom-16 sm:bottom-0 left-0 w-full sm:w-auto z-20 bg-white/80 backdrop-blur-md border-t sm:border border-slate-200 p-3 sm:p-4 sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:shadow-lg sm:mt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
              placeholder="Add a new task... (e.g. Complete React Module)"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />

            <div className="flex items-center gap-2">
              <select
                className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-indigo-300 transition-colors"
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
                className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-rose-300 transition-colors"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, priority: e.target.value }))
                }
              >
                <option value="High" className="text-rose-600">
                  High
                </option>
                <option value="Medium">Medium</option>
                <option value="Low" className="text-emerald-600">
                  Low
                </option>
              </select>

              <button
                onClick={addTask}
                disabled={!newTask.title.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center shrink-0"
                title="Add Task"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
