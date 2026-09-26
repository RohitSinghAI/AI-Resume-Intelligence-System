import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Search,
  Eye,
  Sparkles,
  RefreshCw,
  Trash2,
  MessageSquare,
  Briefcase,
  Filter,
  Plus,
  Users,
  ArrowUpDown,
  X,
} from "lucide-react";

import {
  getResumes,
  deleteResume,
} from "../../services/resumeApi";

function Resumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // =========================================================
  // FETCH RESUMES
  // =========================================================

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getResumes();

      setResumes(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error("Failed to fetch resumes:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load resumes."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchResumes();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getScore = (resume) => {
    const nestedScore =
      resume?.ai_analysis?.resume_score;

    const directScore =
      resume?.resume_score;

    const score = Number(
      nestedScore ?? directScore ?? 0
    );

    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, Math.round(score))
    );
  };

  const getSkills = (resume) => {
    const skills = resume?.skills;

    if (Array.isArray(skills)) {
      return skills.filter(Boolean);
    }

    if (typeof skills === "string") {
      const value = skills.trim();

      if (!value) {
        return [];
      }

      // Try JSON array first
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean);
        }
      } catch {
        // Ignore JSON parsing error
      }

      // Fallback for comma / newline separated skills
      return value
        .split(/[,|\n]/)
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const getSkillName = (skill) => {
    if (typeof skill === "string") {
      return skill;
    }

    if (skill?.name) {
      return skill.name;
    }

    return String(skill);
  };

  const getResumeSummary = (resume) => {
    return (
      resume?.ai_analysis?.summary ||
      resume?.ai_summary ||
      "No AI summary available."
    );
  };

  const getScoreLabel = (score) => {
    if (score >= 80) {
      return "Strong";
    }

    if (score >= 60) {
      return "Moderate";
    }

    if (score > 0) {
      return "Needs Review";
    }

    return "Not Scored";
  };

  const getScoreClasses = (score) => {
    if (score >= 80) {
      return {
        text: "text-emerald-600",
        badge: "bg-emerald-50 text-emerald-700",
      };
    }

    if (score >= 60) {
      return {
        text: "text-amber-600",
        badge: "bg-amber-50 text-amber-700",
      };
    }

    if (score > 0) {
      return {
        text: "text-rose-600",
        badge: "bg-rose-50 text-rose-700",
      };
    }

    return {
      text: "text-slate-400",
      badge: "bg-slate-100 text-slate-500",
    };
  };

  // =========================================================
  // DELETE RESUME
  // =========================================================

  const handleDeleteResume = async (
    id,
    name
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        name || "this resume"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteResume(id);

      setResumes((prev) =>
        prev.filter(
          (resume) => resume.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete resume error:",
        error
      );

      window.alert(
        error.response?.data?.detail ||
          "Failed to delete resume."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // SEARCH + FILTER + SORT
  // =========================================================

  const filteredResumes = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    const result = resumes.filter(
      (resume) => {
        const skillsText = getSkills(resume)
          .map(getSkillName)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchText ||
          resume?.name
            ?.toLowerCase()
            .includes(searchText) ||
          resume?.email
            ?.toLowerCase()
            .includes(searchText) ||
          resume?.phone
            ?.toLowerCase()
            .includes(searchText) ||
          skillsText.includes(searchText) ||
          resume?.file_name
            ?.toLowerCase()
            .includes(searchText);

        const score = getScore(resume);

        const matchesScore =
          scoreFilter === "all" ||
          (scoreFilter === "high" &&
            score >= 80) ||
          (scoreFilter === "medium" &&
            score >= 60 &&
            score < 80) ||
          (scoreFilter === "low" &&
            score > 0 &&
            score < 60) ||
          (scoreFilter === "not_scored" &&
            score === 0);

        return (
          matchesSearch &&
          matchesScore
        );
      }
    );

    return [...result].sort((a, b) => {
      if (sortBy === "score_high") {
        return (
          getScore(b) -
          getScore(a)
        );
      }

      if (sortBy === "score_low") {
        return (
          getScore(a) -
          getScore(b)
        );
      }

      if (sortBy === "name") {
        return (
          (a?.name || "")
            .toLowerCase()
            .localeCompare(
              (b?.name || "")
                .toLowerCase()
            )
        );
      }

      // latest
      return (
        new Date(
          b?.created_at || 0
        ) -
        new Date(
          a?.created_at || 0
        )
      );
    });
  }, [
    resumes,
    search,
    scoreFilter,
    sortBy,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total = resumes.length;

    const scoredResumes = resumes.filter(
      (resume) =>
        getScore(resume) > 0
    );

    const analyzed =
      resumes.filter(
        (resume) =>
          resume?.ai_summary ||
          resume?.ai_analysis
      ).length;

    const average =
      scoredResumes.length > 0
        ? Math.round(
            scoredResumes.reduce(
              (sum, resume) =>
                sum + getScore(resume),
              0
            ) /
              scoredResumes.length
          )
        : 0;

    const strong = resumes.filter(
      (resume) =>
        getScore(resume) >= 80
    ).length;

    const moderate = resumes.filter(
      (resume) => {
        const score =
          getScore(resume);

        return (
          score >= 60 &&
          score < 80
        );
      }
    ).length;

    const needsReview =
      resumes.filter(
        (resume) => {
          const score =
            getScore(resume);

          return (
            score > 0 &&
            score < 60
          );
        }
      ).length;

    return {
      total,
      analyzed,
      average,
      strong,
      moderate,
      needsReview,
    };
  }, [resumes]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const hasFilters =
    search.trim() ||
    scoreFilter !== "all" ||
    sortBy !== "latest";

  const clearFilters = () => {
    setSearch("");
    setScoreFilter("all");
    setSortBy("latest");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 pb-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                Resumes
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage, analyze and review candidate resumes.
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={fetchResumes}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/resumes/upload")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Upload Resume
          </button>

        </div>
      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">

        <StatCard
          icon={Users}
          label="Total"
          value={stats.total}
        />

        <StatCard
          icon={Sparkles}
          label="AI Analyzed"
          value={stats.analyzed}
        />

        <StatCard
          icon={FileText}
          label="Average Score"
          value={
            stats.average
              ? `${stats.average}%`
              : "--"
          }
        />

        <StatCard
          icon={Briefcase}
          label="Strong"
          value={stats.strong}
        />

        <StatCard
          icon={ArrowUpDown}
          label="Moderate"
          value={stats.moderate}
        />

        <StatCard
          icon={Filter}
          label="Needs Review"
          value={stats.needsReview}
        />

      </div>


      {/* =====================================================
          SEARCH / FILTERS
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 xl:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name, email, phone, skills or file name..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}

          </div>


          {/* Score */}

          <div className="relative xl:w-52">

            <Filter
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={scoreFilter}
              onChange={(e) =>
                setScoreFilter(
                  e.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400"
            >
              <option value="all">
                All Scores
              </option>

              <option value="high">
                80+ Strong
              </option>

              <option value="medium">
                60–79 Moderate
              </option>

              <option value="low">
                1–59 Needs Review
              </option>

              <option value="not_scored">
                Not Scored
              </option>
            </select>

          </div>


          {/* Sort */}

          <div className="relative xl:w-52">

            <ArrowUpDown
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400"
            >
              <option value="latest">
                Latest First
              </option>

              <option value="score_high">
                Highest Score
              </option>

              <option value="score_low">
                Lowest Score
              </option>

              <option value="name">
                Candidate Name
              </option>
            </select>

          </div>

        </div>


        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">

          <span>
            Showing{" "}
            <b className="text-slate-600">
              {filteredResumes.length}
            </b>{" "}
            of{" "}
            <b className="text-slate-600">
              {resumes.length}
            </b>{" "}
            resumes
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchResumes}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Try Again
            </button>

          </div>

        </div>
      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">

          <div className="flex flex-col items-center">

            <RefreshCw
              size={28}
              className="animate-spin text-indigo-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading resumes...
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        filteredResumes.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              {hasFilters ? (
                <Search size={30} />
              ) : (
                <FileText size={30} />
              )}
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-700">
              {hasFilters
                ? "No matching resumes"
                : "No resumes yet"}
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-400">
              {hasFilters
                ? "Try changing your search or filters."
                : "Upload your first resume to start building your candidate database."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}

              {!hasFilters && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/resumes/upload")
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Upload Resume
                </button>
              )}

            </div>

          </div>
        )}


      {/* =====================================================
          RESUME GRID
      ===================================================== */}

      {!loading &&
        !error &&
        filteredResumes.length > 0 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {filteredResumes.map(
              (resume, index) => {
                const score =
                  getScore(resume);

                const scoreStyle =
                  getScoreClasses(
                    score
                  );

                const skills =
                  getSkills(resume);

                return (
                  <div
                    key={resume.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md"
                  >

                    {/* ======================================
                        TOP
                    ====================================== */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FileText size={22} />
                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <span className="text-[10px] font-bold text-slate-400">
                              #{index + 1}
                            </span>

                            <h3 className="truncate font-semibold text-slate-800">
                              {resume?.name ||
                                "Unknown Candidate"}
                            </h3>

                          </div>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {resume?.email ||
                              resume?.file_name ||
                              "No contact information"}
                          </p>

                        </div>

                      </div>


                      {/* SCORE */}

                      <div className="shrink-0 text-right">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Resume Score
                        </p>

                        <p
                          className={`mt-0.5 text-2xl font-bold ${scoreStyle.text}`}
                        >
                          {score > 0
                            ? `${score}%`
                            : "--"}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${scoreStyle.badge}`}
                        >
                          {getScoreLabel(
                            score
                          )}
                        </span>

                      </div>

                    </div>


                    {/* ======================================
                        CONTACT
                    ====================================== */}

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                      <div className="rounded-xl bg-slate-50 px-3 py-2">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 truncate text-xs font-medium text-slate-600">
                          {resume?.email ||
                            "Not available"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 px-3 py-2">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 truncate text-xs font-medium text-slate-600">
                          {resume?.phone ||
                            "Not available"}
                        </p>

                      </div>

                    </div>


                    {/* ======================================
                        SKILLS
                    ====================================== */}

                    <div className="mt-5">

                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Skills
                      </p>

                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">

                          {skills
                            .slice(0, 7)
                            .map(
                              (
                                skill,
                                skillIndex
                              ) => (
                                <span
                                  key={`${resume.id}-${skillIndex}`}
                                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                >
                                  {getSkillName(
                                    skill
                                  )}
                                </span>
                              )
                            )}

                          {skills.length >
                            7 && (
                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                              +
                              {skills.length -
                                7}{" "}
                              more
                            </span>
                          )}

                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No skills extracted.
                        </p>
                      )}

                    </div>


                    {/* ======================================
                        SUMMARY
                    ====================================== */}

                    <div className="mt-5">

                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        AI Summary
                      </p>

                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {getResumeSummary(
                          resume
                        )}
                      </p>

                    </div>


                    {/* ======================================
                        ACTIONS
                    ====================================== */}

                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4">

                      {/* View */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/resumes/${resume.id}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </button>


                      {/* Analysis */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/resumes/${resume.id}/analysis`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        <Sparkles size={15} />
                        Analysis
                      </button>


                      {/* AI Chat */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/resume-chat/${resume.id}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                      >
                        <MessageSquare
                          size={15}
                        />
                        AI Chat
                      </button>


                      {/* Delete */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteResume(
                            resume.id,
                            resume?.name
                          )
                        }
                        disabled={
                          deletingId ===
                          resume.id
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        resume.id ? (
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}

                        {deletingId ===
                        resume.id
                          ? "Deleting"
                          : "Delete"}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </div>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={19} />
        </div>

        <div className="min-w-0">

          <p className="truncate text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold text-slate-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Resumes;