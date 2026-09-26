import {
  FileText,
  Briefcase,
  Users,
  Target,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Upload,
  Plus,
  MessageSquare,
  History,
  AlertCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import RecentResumes from "../components/dashboard/RecentResumes";
import RecentJobs from "../components/dashboard/RecentJobs";
import MatchOverview from "../components/dashboard/MatchOverview";

import { getResumes } from "../services/resumeApi";
import {
  getJobs,
  getMatchCount,
} from "../services/jobApi";


function Dashboard() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matchCount, setMatchCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     Admin / User
  ------------------------------------------------------- */

  const admin = useMemo(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");

      return storedAdmin
        ? JSON.parse(storedAdmin)
        : null;
    } catch {
      return null;
    }
  }, []);

  const adminName = admin?.name || "Rohit";

  /* -------------------------------------------------------
     Load Dashboard Data
  ------------------------------------------------------- */

  const loadDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const results = await Promise.allSettled([
          getResumes(),
          getJobs(),
          getMatchCount(),
        ]);

        const [resumeResult, jobResult, matchResult] = results;

        /* ---------------------------
           Resumes
        --------------------------- */

        if (resumeResult.status === "fulfilled") {
          const resumeData = resumeResult.value;

          setResumes(
            Array.isArray(resumeData)
              ? resumeData
              : []
          );
        } else {
          console.error(
            "Resume dashboard error:",
            resumeResult.reason
          );

          setResumes([]);
        }

        /* ---------------------------
           Jobs
        --------------------------- */

        if (jobResult.status === "fulfilled") {
          const jobData = jobResult.value;

          setJobs(
            Array.isArray(jobData)
              ? jobData
              : []
          );
        } else {
          console.error(
            "Job dashboard error:",
            jobResult.reason
          );

          setJobs([]);
        }

        /* ---------------------------
           Matches
        --------------------------- */

        if (matchResult.status === "fulfilled") {
          const matchData = matchResult.value;

          setMatchCount(
            Number(matchData?.total_matches || 0)
          );
        } else {
          console.error(
            "Match dashboard error:",
            matchResult.reason
          );

          setMatchCount(0);
        }

        /* ---------------------------
           Partial Error Handling
        --------------------------- */

        const failedRequests = results.filter(
          (result) => result.status === "rejected"
        );

        if (failedRequests.length > 0) {
          setError(
            "Some dashboard data could not be loaded. Please refresh and try again."
          );
        }
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* -------------------------------------------------------
     Initial Load
  ------------------------------------------------------- */

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /* -------------------------------------------------------
     Statistics
  ------------------------------------------------------- */

  const totalResumes = resumes.length;
  const totalJobs = jobs.length;
  const totalCandidates = resumes.length;

  /* -------------------------------------------------------
     Latest Resume
  ------------------------------------------------------- */

  const latestResume = useMemo(() => {
    if (!resumes.length) {
      return null;
    }

    return [...resumes].sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )[0];
  }, [resumes]);

  /* -------------------------------------------------------
     Latest Job
  ------------------------------------------------------- */

  const latestJob = useMemo(() => {
    if (!jobs.length) {
      return null;
    }

    return [...jobs].sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )[0];
  }, [jobs]);

  /* -------------------------------------------------------
     Resume AI Analysis Completion
  ------------------------------------------------------- */

  const resumeCompletion = useMemo(() => {
    if (!totalResumes) {
      return 0;
    }

    const analyzedResumes = resumes.filter(
      (resume) =>
        resume?.ai_summary ||
        resume?.ai_analysis
    ).length;

    return Math.min(
      100,
      Math.round(
        (analyzedResumes / totalResumes) * 100
      )
    );
  }, [resumes, totalResumes]);

  /* -------------------------------------------------------
     Job Completion
  ------------------------------------------------------- */

  const jobCompletion = useMemo(() => {
    if (!totalJobs) {
      return 0;
    }

    const jobsWithSkills = jobs.filter(
      (job) =>
        job?.required_skills &&
        String(job.required_skills).trim()
    ).length;

    return Math.min(
      100,
      Math.round(
        (jobsWithSkills / totalJobs) * 100
      )
    );
  }, [jobs, totalJobs]);

  /* -------------------------------------------------------
     Resume Score Summary
     Uses existing stored resume score when available.
  ------------------------------------------------------- */

  const averageResumeScore = useMemo(() => {
    const scores = resumes
      .map((resume) => {
        const score =
          resume?.ai_analysis?.resume_score ??
          resume?.resume_score;

        const numericScore = Number(score);

        return Number.isFinite(numericScore)
          ? numericScore
          : null;
      })
      .filter(
        (score) =>
          score !== null &&
          score >= 0
      );

    if (!scores.length) {
      return 0;
    }

    return Math.round(
      scores.reduce(
        (total, score) => total + score,
        0
      ) / scores.length
    );
  }, [resumes]);

  /* -------------------------------------------------------
     Actions
  ------------------------------------------------------- */

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const goToResume = () => {
    if (latestResume?.id) {
      navigate(`/resumes/${latestResume.id}`);
    }
  };

  const goToJob = () => {
    if (latestJob?.id) {
      navigate(`/jobs/${latestJob.id}`);
    }
  };

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <div className="space-y-6 pb-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-indigo-600"
            />

            <p className="text-sm font-semibold text-indigo-600">
              AI Resume Intelligence
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Welcome back, {adminName} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your resume
            intelligence system.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading || refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/resumes/upload")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Upload size={17} />
            Upload Resume
          </button>
        </div>
      </div>


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              Dashboard data issue
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Resumes"
          value={loading ? "..." : totalResumes}
          change="Live Data"
          icon={FileText}
        />

        <StatCard
          title="Active Jobs"
          value={loading ? "..." : totalJobs}
          change="Live Data"
          icon={Briefcase}
        />

        <StatCard
          title="Candidates"
          value={loading ? "..." : totalCandidates}
          change="Live Data"
          icon={Users}
        />

        <StatCard
          title="Matches"
          value={loading ? "..." : matchCount}
          change="Live Data"
          icon={Target}
        />

        <StatCard
          title="Avg. Resume Score"
          value={
            loading
              ? "..."
              : totalResumes
                ? `${averageResumeScore}%`
                : "—"
          }
          change={
            totalResumes
              ? "From analyzed resumes"
              : "No data yet"
          }
          icon={TrendingUp}
        />

      </div>


      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* System Overview */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex items-start justify-between gap-4">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    System Overview
                  </h2>

                  <p className="text-xs text-slate-500">
                    Current data and processing coverage
                  </p>
                </div>

              </div>
            </div>

            <Sparkles
              size={20}
              className="text-indigo-500"
            />
          </div>


          <div className="mt-6 space-y-6">

            {/* Resume Analysis */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-medium text-slate-700">
                  Resume AI Analysis
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {loading
                    ? "..."
                    : `${resumeCompletion}%`}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                  style={{
                    width: `${resumeCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {totalResumes
                  ? `${resumes.filter(
                      (resume) =>
                        resume?.ai_summary ||
                        resume?.ai_analysis
                    ).length} of ${totalResumes} resumes analyzed`
                  : "No resumes uploaded yet"}
              </p>
            </div>


            {/* Job Completion */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-medium text-slate-700">
                  Jobs With Required Skills
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {loading
                    ? "..."
                    : `${jobCompletion}%`}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                  style={{
                    width: `${jobCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {totalJobs
                  ? `${jobs.filter(
                      (job) =>
                        job?.required_skills &&
                        String(job.required_skills).trim()
                    ).length} of ${totalJobs} jobs configured`
                  : "No jobs created yet"}
              </p>
            </div>

          </div>
        </div>


        {/* Latest Activity */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Latest Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest workspace items
              </p>
            </div>

            <Sparkles
              size={18}
              className="text-indigo-500"
            />
          </div>


          <div className="mt-5 space-y-3">

            {/* Latest Resume */}

            <button
              type="button"
              onClick={goToResume}
              disabled={!latestResume?.id}
              className="group flex w-full items-start gap-3 rounded-xl bg-slate-50 p-4 text-left transition hover:bg-indigo-50 disabled:cursor-default"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <FileText size={18} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Latest Resume
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {latestResume?.name ||
                    latestResume?.file_name ||
                    "No resume uploaded"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {latestResume?.email ||
                    "View resume details"}
                </p>

              </div>

              {latestResume?.id && (
                <ArrowRight
                  size={16}
                  className="mt-2 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
                />
              )}

            </button>


            {/* Latest Job */}

            <button
              type="button"
              onClick={goToJob}
              disabled={!latestJob?.id}
              className="group flex w-full items-start gap-3 rounded-xl bg-slate-50 p-4 text-left transition hover:bg-indigo-50 disabled:cursor-default"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Briefcase size={18} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Latest Job
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {latestJob?.title ||
                    "No job created"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {latestJob?.company ||
                    "View job details"}
                </p>

              </div>

              {latestJob?.id && (
                <ArrowRight
                  size={16}
                  className="mt-2 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
                />
              )}

            </button>


            {/* Match History */}

            <button
              type="button"
              onClick={() =>
                navigate("/matching/history")
              }
              className="group flex w-full items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-left transition hover:bg-indigo-100"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <History size={17} />
                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-500">
                    Match History
                  </p>

                  <p className="mt-1 text-sm font-semibold text-indigo-700">
                    View {matchCount} saved match
                    {matchCount === 1
                      ? ""
                      : "es"}
                  </p>

                </div>

              </div>

              <ArrowRight
                size={18}
                className="text-indigo-600 transition group-hover:translate-x-0.5"
              />

            </button>

          </div>
        </div>

      </div>


      {/* =====================================================
          RECENT DATA
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <RecentResumes />

        <RecentJobs />

      </div>


      {/* =====================================================
          MATCHING OVERVIEW
      ===================================================== */}

      <MatchOverview />


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles size={18} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Quick Actions
              </h2>

              <p className="text-sm text-slate-500">
                Continue working with your resume intelligence system.
              </p>
            </div>

          </div>

        </div>


        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Upload Resume */}

          <button
            type="button"
            onClick={() =>
              navigate("/resumes/upload")
            }
            className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-white">
              <Upload size={20} />
            </div>

            <p className="font-semibold text-slate-800">
              Upload Resume
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add and analyze a new resume
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              Upload
              <ArrowRight size={13} />
            </div>

          </button>


          {/* Create Job */}

          <button
            type="button"
            onClick={() =>
              navigate("/jobs/create")
            }
            className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-white">
              <Plus size={20} />
            </div>

            <p className="font-semibold text-slate-800">
              Create Job
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add a new job description
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              Create
              <ArrowRight size={13} />
            </div>

          </button>


          {/* Run Matching */}

          <button
            type="button"
            onClick={() =>
              navigate("/matching")
            }
            className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-white">
              <Target size={20} />
            </div>

            <p className="font-semibold text-slate-800">
              Run Matching
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Compare a resume with a job
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              Match
              <ArrowRight size={13} />
            </div>

          </button>


          {/* AI Resume Chat */}

          <button
            type="button"
            onClick={() => {
              if (latestResume?.id) {
                navigate(
                  `/resume-chat/${latestResume.id}`
                );
              } else {
                navigate("/resumes");
              }
            }}
            className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-white">
              <MessageSquare size={20} />
            </div>

            <p className="font-semibold text-slate-800">
              AI Resume Chat
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Ask questions about a resume
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              Open Chat
              <ArrowRight size={13} />
            </div>

          </button>

        </div>
      </div>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!loading &&
        totalResumes === 0 &&
        totalJobs === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              Start building your hiring workspace
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Upload your first resume or create a job
              to start using resume intelligence and
              candidate matching.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/resumes/upload")
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Upload size={16} />
                Upload Resume
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/jobs/create")
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Briefcase size={16} />
                Create Job
              </button>

            </div>
          </div>
        )}

    </div>
  );
}

export default Dashboard;