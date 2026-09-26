import { useEffect, useMemo, useState } from "react";
import {
  User,
  Bell,
  Palette,
  BrainCircuit,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Monitor,
  Moon,
  Sun,
  Info,
  RotateCcw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const STORAGE_KEY_PREFIX = "resume-intelligence-settings";

function Settings() {
  const { admin } = useAuth();

  const storageKey = `${STORAGE_KEY_PREFIX}-${admin?.id || admin?.email || "default"}`;

  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: admin?.name || "Administrator",
    email: admin?.email || "",
    role: "Administrator",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    match: true,
    resume: true,
  });

  const [theme, setTheme] = useState("light");
  const [aiModel, setAiModel] = useState("gemini");
  const [threshold, setThreshold] = useState(70);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "ai", label: "AI Settings", icon: BrainCircuit },
    { id: "system", label: "System", icon: Database },
  ];

  const initials = useMemo(
    () =>
      profile.name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AD",
    [profile.name]
  );

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: admin?.name || prev.name,
      email: admin?.email || prev.email,
    }));
  }, [admin]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(storageKey);

      if (!savedSettings) return;

      const parsed = JSON.parse(savedSettings);

      if (parsed.notifications) {
        setNotifications((prev) => ({
          ...prev,
          ...parsed.notifications,
        }));
      }

      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.aiModel) setAiModel(parsed.aiModel);
      if (typeof parsed.threshold === "number") {
        setThreshold(parsed.threshold);
      }
    } catch (error) {
      console.error("Failed to load saved settings:", error);
    }
  }, [storageKey]);


  const savePreferences = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          notifications,
          theme,
          aiModel,
          threshold,
        })
      );

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleSave = () => {
    savePreferences();
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset workspace preferences to their default values?"
    );

    if (!confirmed) return;

    const defaults = {
      notifications: {
        email: true,
        match: true,
        resume: true,
      },
      theme: "light",
      aiModel: "gemini",
      threshold: 70,
    };

    setNotifications(defaults.notifications);
    setTheme(defaults.theme);
    setAiModel(defaults.aiModel);
    setThreshold(defaults.threshold);

    localStorage.removeItem(storageKey);

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="border-b border-slate-100 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <SlidersHorizontal size={13} />
            Workspace Preferences
          </div>

          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage your account, AI preferences, notifications and system
            settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          {saved && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              <CheckCircle2 size={17} />
              Saved
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Settings
            </p>
          </div>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="rounded-xl bg-green-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-green-600">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    System Secure
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Your workspace is protected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">
          {/* Profile */}
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={User}
                title="Profile Settings"
                description="View the administrator profile currently associated with this session."
              />

              <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-sm">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-800">
                      {profile.name || "Administrator"}
                    </p>
                    <p className="text-sm text-slate-500">{profile.role}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {profile.email || "No email available"}
                    </p>
                  </div>

                  <div className="sm:ml-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={13} />
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      readOnly
                      autoComplete="name"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      autoComplete="email"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Role
                    </label>

                    <input
                      type="text"
                      value={profile.role}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />
                    <p className="text-sm leading-6 text-slate-600">
                      Profile edits on this page are local UI preferences.
                      They do not update the administrator record in the
                      backend because no profile-update API is connected here.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <p className="text-xs text-slate-400">
                    Name and email come from the authenticated administrator account.
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600">
                    <ShieldCheck size={15} />
                    Account Managed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={Bell}
                title="Notifications"
                description="Choose which events should generate workspace notifications."
              />

              <div className="divide-y divide-slate-100">
                {[
                  [
                    "email",
                    "Email Notifications",
                    "Receive important account and system updates by email.",
                  ],
                  [
                    "match",
                    "Match Notifications",
                    "Get notified when resume-job matching results are ready.",
                  ],
                  [
                    "resume",
                    "Resume Processing",
                    "Notify when AI resume analysis has completed.",
                  ],
                ].map(([key, title, description]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-5 p-6"
                  >
                    <div>
                      <p className="font-medium text-slate-700">{title}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-400">
                        {description}
                      </p>
                    </div>

                    <Toggle
                      checked={notifications[key]}
                      label={`Toggle ${title}`}
                      onChange={(value) => {
                        setNotifications((prev) => ({
                          ...prev,
                          [key]: value,
                        }));
                        setSaved(false);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-slate-100 p-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Save size={17} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={Palette}
                title="Appearance"
                description="Customize the visual preferences of your dashboard."
              />

              <div className="space-y-6 p-6">
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Theme
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      ["light", "Light", Sun, "Clean and bright interface"],
                      [
                        "dark",
                        "Dark",
                        Moon,
                        "Comfortable for low-light use",
                      ],
                      [
                        "system",
                        "System",
                        Monitor,
                        "Follow your device preference",
                      ],
                    ].map(([value, label, Icon, description]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setTheme(value);
                          setSaved(false);
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition ${
                          theme === value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-4 flex h-20 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <Icon size={27} />
                        </div>

                        <p className="font-semibold text-slate-800">{label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start gap-3">
                    <Palette
                      className="mt-0.5 shrink-0 text-indigo-600"
                      size={18}
                    />

                    <p className="text-sm leading-6 text-slate-600">
                      Theme selection is stored as a workspace preference.
                      Applying a full dark theme requires a global theme
                      provider to be connected to the application layout.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Save size={17} />
                    Save Appearance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI */}
          {activeTab === "ai" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={BrainCircuit}
                title="AI Settings"
                description="Configure frontend preferences for the AI-powered resume intelligence experience."
              />

              <div className="space-y-6 p-6">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800">
                        AI Resume Intelligence
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        Resume analysis, matching insights and AI explanations
                        are enabled.
                      </p>
                    </div>

                    <span className="ml-auto shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                      Enabled
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ai-model"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    AI Model
                  </label>

                  <select
                    id="ai-model"
                    value={aiModel}
                    onChange={(e) => {
                      setAiModel(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="local">Local Model</option>
                  </select>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="matching-threshold"
                      className="text-sm font-medium text-slate-700"
                    >
                      Matching Threshold
                    </label>

                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-600">
                      {threshold}%
                    </span>
                  </div>

                  <input
                    id="matching-threshold"
                    type="range"
                    min="0"
                    max="100"
                    value={threshold}
                    onChange={(e) => {
                      setThreshold(Number(e.target.value));
                      setSaved(false);
                    }}
                    className="w-full accent-indigo-600"
                  />

                  <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                    <span>0% — Broad</span>
                    <span>100% — Strict</span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Candidates at or above this score are treated as strong
                    matches in the UI.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 shrink-0 text-slate-400" />
                    <p className="text-sm leading-6 text-slate-500">
                      These controls are frontend preferences. They do not
                      change backend AI provider configuration, API keys,
                      environment secrets, or matching code.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Save size={17} />
                    Save AI Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System */}
          {activeTab === "system" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={Database}
                title="System Information"
                description="Technology and operational information for this application."
              />

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                {[
                  ["Application", "AI Resume Intelligence System"],
                  ["Frontend", "React + Vite + Tailwind"],
                  ["Backend", "FastAPI"],
                  ["Database", "SQLite + SQLAlchemy"],
                  ["AI", "Gemini AI"],
                  ["Matching", "Exact + Semantic + Experience"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>

                    <p className="mt-2 font-semibold text-slate-800">{value}</p>
                  </div>
                ))}

                <div className="rounded-2xl border border-green-200 bg-green-50 p-5 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-600">
                      <CheckCircle2 size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        System Operational
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        Resume analysis, job matching and AI chat modules are
                        configured in the application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Settings;
