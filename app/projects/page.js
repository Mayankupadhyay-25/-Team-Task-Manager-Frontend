"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import API from "@/services/api";

function AddMemberModal({ project, onClose, onMemberAdded }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Email is required");
    setLoading(true);
    setError("");
    try {
      await API.post(`/projects/${project._id}/members`, { email });
      onMemberAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Add member to <span className="text-indigo-600 dark:text-indigo-400">{project.name}</span>
        </h2>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="member@example.com"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-9 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? "Adding…" : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCard({ project, currentUserId, onAddMember }) {
  const isAdmin = project.admin === currentUserId || project.admin?._id === currentUserId;
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            {project.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <span className="text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 rounded-full shrink-0">
            Admin
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 5).map((m) => (
              <div key={m._id} title={m.name}
                className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {m.name?.[0]?.toUpperCase()}
              </div>
            ))}
            {project.members?.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs text-zinc-500">
                +{project.members.length - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-400">{project.members?.length} member{project.members?.length !== 1 ? "s" : ""}</span>
        </div>
        {isAdmin && (
          <button onClick={() => onAddMember(project)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add member
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjects(data);
    } catch {
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required";
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
      await API.post("/projects", form);
      setForm({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Projects">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">New Project</h2>
          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{serverError}</p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="Project name"
                className={`rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700 ${
                  errors.name ? "border-red-400" : "border-zinc-300"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Description (optional)" rows={2}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50 resize-none"
            />
            <button type="submit" disabled={loading}
              className="self-end h-9 px-5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create project"}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Your Projects
            {!fetching && <span className="ml-2 text-zinc-400 font-normal">({projects.length})</span>}
          </h2>
          {fetching ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
              <p className="text-sm text-zinc-400">No projects yet. Create one above.</p>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project._id} project={project}
                currentUserId={user?._id || user?.id}
                onAddMember={setSelectedProject}
              />
            ))
          )}
        </div>
      </div>

      {selectedProject && (
        <AddMemberModal project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onMemberAdded={fetchProjects}
        />
      )}
    </AppShell>
  );
}
