"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import API from "@/services/api";

const statusStyles = {
  "Todo": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "Done": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
};

function StatCard({ label, value, accent, icon }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 shadow-sm border ${accent}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium opacity-75">{label}</p>
        <span className="text-xl opacity-80">{icon}</span>
      </div>
      <p className="text-4xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function TaskRow({ task }) {
  const isOverdue = task.dueDate && task.status !== "Done" && new Date(task.dueDate) < new Date();
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          task.status === "Done" ? "bg-emerald-500" :
          task.status === "In Progress" ? "bg-blue-500" : "bg-zinc-400"
        }`} />
        <div className="flex flex-col min-w-0">
          <p className={`text-sm font-medium truncate ${
            isOverdue ? "text-red-500" : "text-zinc-900 dark:text-zinc-50"
          }`}>{task.title}</p>
          <p className="text-xs text-zinc-400 truncate">{task.project?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {task.assignedTo && (
          <div title={task.assignedTo.name} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:flex">
            {task.assignedTo.name?.[0]?.toUpperCase()}
          </div>
        )}
        {task.dueDate && (
          <span className={`text-xs tabular-nums ${
            isOverdue ? "text-red-400 font-medium" : "text-zinc-400"
          }`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[task.status]}`}>
          {task.status}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get("/tasks/all/me")
      .then(({ data }) => setTasks(data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter((t) => t.dueDate && t.status !== "Done" && new Date(t.dueDate) < now).length;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0))
    .slice(0, 8);

  return (
    <AppShell title="Dashboard">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Stat Cards */}
        {fetching ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Tasks" value={total} icon="📋"
              accent="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50" />
            <StatCard label="Completed" value={completed} icon="✅"
              accent="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300" />
            <StatCard label="In Progress" value={inProgress} icon="🔄"
              accent="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300" />
            <StatCard label="Overdue" value={overdue} icon="⚠️"
              accent="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400" />
          </div>
        )}

        {/* Recent Tasks */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Recent Tasks</h2>
          {fetching ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="text-sm text-zinc-400">No tasks found.</p>
          ) : (
            recentTasks.map((task) => <TaskRow key={task._id} task={task} />)
          )}
        </div>

      </div>
    </AppShell>
  );
}
