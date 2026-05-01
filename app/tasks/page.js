"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import API from "@/services/api";

const STATUSES = ["Todo", "In Progress", "Done"];

const statusStyles = {
  "Todo": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900",
  "Done": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900",
};

const columnAccent = {
  "Todo": "border-t-zinc-400",
  "In Progress": "border-t-blue-500",
  "Done": "border-t-emerald-500",
};

const inputCls = "rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50 w-full";

function EditTaskModal({ task, members, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    status: task.status,
    assignedTo: task.assignedTo?._id || "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    setError("");
    try {
      const { data } = await API.put(`/tasks/${task._id}`, form);
      onUpdated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Edit Task</h2>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Task title" className={inputCls} />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" rows={2} className={`${inputCls} resize-none`} />
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className={inputCls}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-9 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete }) {
  const isOverdue = task.dueDate && task.status !== "Done" && new Date(task.dueDate) < new Date();
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm leading-snug">{task.title}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyles[task.status]}`}>
          {task.status}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {task.assignedTo.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-zinc-500">{task.assignedTo.name}</span>
            </div>
          )}
          {task.dueDate && (
            <span className={`text-xs tabular-nums ${isOverdue ? "text-red-500 font-medium" : "text-zinc-400"}`}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => onEdit(task)}
            className="text-xs font-medium text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Edit
          </button>
          <button onClick={() => onDelete(task._id)}
            className="text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", status: "Todo", dueDate: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/projects").then(({ data }) => setProjects(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProject) { setTasks([]); setMembers([]); return; }
    const project = projects.find((p) => p._id === selectedProject);
    setMembers(project?.members || []);
    setForm((f) => ({ ...f, assignedTo: "" }));
    fetchTasks(selectedProject);
  }, [selectedProject]);

  const fetchTasks = async (projectId) => {
    setFetching(true);
    try {
      const { data } = await API.get(`/tasks/${projectId}`);
      setTasks(data);
    } catch {
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!selectedProject) errs.project = "Select a project";
    if (!form.title.trim()) errs.title = "Title is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    setServerError("");
    try {
      const { data } = await API.post("/tasks", { ...form, project: selectedProject });
      setTasks((prev) => [data, ...prev]);
      setForm({ title: "", description: "", assignedTo: "", status: "Todo", dueDate: "" });
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch {}
  };

  const handleUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <AppShell title="Tasks">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Create Task Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">New Task</h2>
          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{serverError}</p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <select value={selectedProject}
                  onChange={(e) => { setSelectedProject(e.target.value); setErrors({ ...errors, project: "" }); }}
                  className={`${inputCls} ${errors.project ? "border-red-400" : ""}`}>
                  <option value="">Select project…</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                {errors.project && <p className="text-xs text-red-500">{errors.project}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <input type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="Task title"
                  className={`${inputCls} ${errors.title ? "border-red-400" : ""}`}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>
            </div>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Description (optional)" rows={2}
              className={`${inputCls} resize-none`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className={inputCls}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
            </div>
            <button type="submit" disabled={loading}
              className="self-end h-9 px-5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create task"}
            </button>
          </form>
        </div>

        {/* Kanban Board */}
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Board
              {!fetching && <span className="ml-2 text-zinc-400 font-normal">({tasks.length} tasks)</span>}
            </h2>
            {fetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STATUSES.map((status) => (
                  <div key={status} className={`bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-t-4 border border-zinc-200 dark:border-zinc-800 ${columnAccent[status]} p-4 flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}>{status}</span>
                      <span className="text-xs text-zinc-400 font-medium">{grouped[status].length}</span>
                    </div>
                    {grouped[status].length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-center">
                        <p className="text-xs text-zinc-400">No tasks</p>
                      </div>
                    ) : (
                      grouped[status].map((task) => (
                        <TaskCard key={task._id} task={task} onEdit={setEditingTask} onDelete={handleDelete} />
                      ))
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editingTask && (
        <EditTaskModal task={editingTask} members={members}
          onClose={() => setEditingTask(null)}
          onUpdated={handleUpdated}
        />
      )}
    </AppShell>
  );
}
