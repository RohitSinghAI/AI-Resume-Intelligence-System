import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  Upload,
  Briefcase,
  Users,
  Target,
  Settings,
  History,
  Sparkles,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Resumes",
    path: "/resumes",
    icon: FileText,
  },
  {
    name: "Upload Resume",
    path: "/resumes/upload",
    icon: Upload,
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Candidates",
    path: "/candidates",
    icon: Users,
  },
  {
    name: "Matching",
    path: "/matching",
    icon: Target,
  },
  {
    name: "Match History",
    path: "/matching/history",
    icon: History,
  },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
          <Sparkles size={21} strokeWidth={2.2} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-800">
            Resume AI
          </h1>

          <p className="truncate text-[11px] font-medium text-slate-400">
            Intelligence System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "bg-transparent text-slate-400 group-hover:text-indigo-600"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>

                    <span className="truncate">{item.name}</span>

                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Workspace status */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <Sparkles size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700">
                AI Workspace
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Resume analysis and intelligent matching are ready.
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-slate-200 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
              isActive
                ? "bg-slate-100 text-slate-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-white text-slate-700 shadow-sm"
                    : "text-slate-400 group-hover:text-indigo-600"
                }`}
              >
                <Settings size={18} />
              </span>

              <span>Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
