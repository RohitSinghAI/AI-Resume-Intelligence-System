import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  BriefcaseBusiness,
  Users,
  Search,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCircle2,
  BarChart3,
  History,
  MessageSquare,
  UserSearch,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { getJobs } from "../../services/jobApi";
import { getResumes } from "../../services/resumeApi";
import {
  matchResumeWithJob,
  matchAllResumesWithJob,
  saveJobMatch,
} from "../../services/matchApi";

function MatchResults() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [selectedJob, setSelectedJob] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");

  const [candidateSearch, setCandidateSearch] = useState("");
  const [resultSearch, setResultSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("score_desc");

  // Bulk result pagination
  const [bulkPage, setBulkPage] = useState(1);
  const [bulkPageSize, setBulkPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [bulkMatching, setBulkMatching] = useState(false);

  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");

  const [result, setResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  const [saving, setSaving] = useState(false);
  const [savingResumeId, setSavingResumeId] = useState(null);
  const [savedResumeIds, setSavedResumeIds] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  const [selectedJobData, setSelectedJobData] = useState(null);
  const [selectedCandidateData, setSelectedCandidateData] = useState(null);

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobsData, resumesData] = await Promise.all([
        getJobs(),
        getResumes(),
      ]);

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setCandidates(Array.isArray(resumesData) ? resumesData : []);
    } catch (err) {
      console.error("Matching data error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load jobs and candidates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // SELECTED DATA
  // =========================================================

  useEffect(() => {
    setSelectedJobData(
      jobs.find(
        (job) => String(job.id) === String(selectedJob)
      ) || null
    );

    setSelectedCandidate("");
    setSelectedCandidateData(null);
    setResult(null);
    setBulkResult(null);
    setMatchError("");
    setSaveMessage("");
    setSavedResumeIds([]);
  }, [selectedJob, jobs]);

  useEffect(() => {
    setSelectedCandidateData(
      candidates.find(
        (candidate) =>
          String(candidate.id) === String(selectedCandidate)
      ) || null
    );
  }, [candidates, selectedCandidate]);

  // =========================================================
  // SINGLE MATCH
  // =========================================================

  const handleMatch = async () => {
    if (!selectedJob || !selectedCandidate) {
      setMatchError(
        "Please select both a job and a candidate."
      );
      return;
    }

    try {
      setMatching(true);
      setMatchError("");
      setResult(null);
      setBulkResult(null);
      setSaveMessage("");

      const data = await matchResumeWithJob(
        selectedJob,
        selectedCandidate
      );

      setResult(data);
    } catch (err) {
      console.error("Matching error:", err);

      setMatchError(
        err.response?.data?.detail ||
          "Failed to match candidate with job."
      );
    } finally {
      setMatching(false);
    }
  };

  // =========================================================
  // BULK MATCH
  // =========================================================

  const handleBulkMatch = async () => {
    if (!selectedJob) {
      setMatchError("Please select a job first.");
      return;
    }

    if (!candidates.length) {
      setMatchError("No resumes are available for matching.");
      return;
    }

    try {
      setBulkMatching(true);
      setMatchError("");
      setResult(null);
      setBulkResult(null);
      setSaveMessage("");
      setSavedResumeIds([]);

      const data = await matchAllResumesWithJob(selectedJob);

      setBulkResult(data);
    } catch (err) {
      console.error("Bulk matching error:", err);

      setMatchError(
        err.response?.data?.detail ||
          "Failed to match resumes with this job."
      );
    } finally {
      setBulkMatching(false);
    }
  };

  // =========================================================
  // SAVE SINGLE MATCH
  // =========================================================

  const handleSaveMatch = async () => {
    if (!result) return;

    try {
      setSaving(true);
      setSaveMessage("");

      await saveJobMatch(
        result.job_id,
        result.resume_id
      );

      setSavedResumeIds((prev) => [
        ...new Set([...prev, Number(result.resume_id)]),
      ]);

      setSaveMessage("Match saved successfully!");
    } catch (err) {
      console.error("Save match error:", err);

      setSaveMessage(
        err.response?.data?.detail ||
          "Failed to save match."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SAVE BULK RESULT ITEM
  // =========================================================

  const handleSaveBulkMatch = async (candidate) => {
    if (!bulkResult?.job_id || !candidate?.resume_id) {
      return;
    }

    try {
      setSavingResumeId(candidate.resume_id);
      setSaveMessage("");

      await saveJobMatch(
        bulkResult.job_id,
        candidate.resume_id
      );

      setSavedResumeIds((prev) => [
        ...new Set([...prev, Number(candidate.resume_id)]),
      ]);
    } catch (err) {
      console.error("Save bulk match error:", err);

      setSaveMessage(
        err.response?.data?.detail ||
          "Failed to save selected match."
      );
    } finally {
      setSavingResumeId(null);
    }
  };

  // =========================================================
  // CANDIDATE SELECT OPTIONS
  // =========================================================

  const filteredCandidates = useMemo(() => {
    const text = candidateSearch.trim().toLowerCase();

    if (!text) return candidates;

    return candidates.filter((candidate) => {
      return (
        candidate?.name?.toLowerCase().includes(text) ||
        candidate?.email?.toLowerCase().includes(text) ||
        candidate?.phone?.toLowerCase().includes(text)
      );
    });
  }, [candidates, candidateSearch]);

  // =========================================================
  // BULK RESULT FILTERING / SORTING
  // =========================================================

  const bulkResults = useMemo(() => {
    const source = Array.isArray(bulkResult?.results)
      ? bulkResult.results
      : [];

    const text = resultSearch.trim().toLowerCase();

    const filtered = source.filter((item) => {
      if (!text) return true;

      return (
        item?.candidate_name?.toLowerCase().includes(text) ||
        item?.email?.toLowerCase().includes(text) ||
        item?.phone?.toLowerCase().includes(text)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "score_asc") {
        return (
          Number(a?.final_match_score || 0) -
          Number(b?.final_match_score || 0)
        );
      }

      if (sortOrder === "name") {
        return (a?.candidate_name || "")
          .toLowerCase()
          .localeCompare(
            (b?.candidate_name || "").toLowerCase()
          );
      }

      return (
        Number(b?.final_match_score || 0) -
        Number(a?.final_match_score || 0)
      );
    });
  }, [bulkResult, resultSearch, sortOrder]);

  const bulkTotalPages = Math.max(
    1,
    Math.ceil(bulkResults.length / bulkPageSize)
  );

  const paginatedBulkResults = useMemo(() => {
    const start = (bulkPage - 1) * bulkPageSize;

    return bulkResults.slice(
      start,
      start + bulkPageSize
    );
  }, [bulkResults, bulkPage, bulkPageSize]);

  useEffect(() => {
    setBulkPage(1);
  }, [resultSearch, sortOrder, bulkPageSize, selectedJob]);

  useEffect(() => {
    if (bulkPage > bulkTotalPages) {
      setBulkPage(bulkTotalPages);
    }
  }, [bulkPage, bulkTotalPages]);

  // =========================================================
  // STATS
  // =========================================================

  const totalJobs = jobs.length;
  const totalCandidates = candidates.length;

  const bulkStats = useMemo(() => {
    const results = Array.isArray(bulkResult?.results)
      ? bulkResult.results
      : [];

    const scores = results.map((item) =>
      Number(item?.final_match_score || 0)
    );

    const average = scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) /
            scores.length
        )
      : 0;

    const strong = results.filter(
      (item) => Number(item?.final_match_score || 0) >= 80
    ).length;

    const review = results.filter(
      (item) => {
        const score = Number(item?.final_match_score || 0);
        return score > 0 && score < 60;
      }
    ).length;

    return {
      total: results.length,
      average,
      strong,
      review,
    };
  }, [bulkResult]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getScore = (score) => {
    const value = Number(score || 0);
    return Math.min(100, Math.max(0, value));
  };

  const getScoreLabel = (score) => {
    const value = getScore(score);

    if (value >= 80) return "Strong Match";
    if (value >= 60) return "Moderate Match";
    if (value > 0) return "Needs Review";
    return "Not Scored";
  };

  const getScoreClass = (score) => {
    const value = getScore(score);

    if (value >= 80) {
      return "bg-green-100 text-green-700";
    }

    if (value >= 60) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  const getSkillsCount = (skills) => {
    return Array.isArray(skills) ? skills.length : 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto mb-3 animate-spin text-indigo-600"
          />
          <p className="text-sm text-slate-500">
            Loading matching data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <BrainCircuit size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Resume Matching
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Compare candidates with jobs using AI-powered matching.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox
          icon={BriefcaseBusiness}
          title="Available Jobs"
          value={totalJobs}
          color="indigo"
        />

        <StatBox
          icon={Users}
          title="Candidates"
          value={totalCandidates}
          color="purple"
        />

        <StatBox
          icon={BarChart3}
          title="Matching Engine"
          value="AI Powered"
          subtitle="Skills + Semantic + Experience"
          color="green"
        />
      </div>

      {/* SELECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Start Matching
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Match one candidate or compare every resume against the selected job.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* JOB */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BriefcaseBusiness size={17} />
              Select Job
            </label>

            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a job</option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                  {job.company ? ` - ${job.company}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* CANDIDATE */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users size={17} />
              Select Candidate
            </label>

            <select
              value={selectedCandidate}
              onChange={(e) => {
                setSelectedCandidate(e.target.value);
                setResult(null);
                setBulkResult(null);
                setMatchError("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a candidate</option>

              {filteredCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name || `Candidate #${candidate.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CANDIDATE SEARCH */}
        <div className="mt-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search candidate by name or email..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            {candidateSearch && (
              <button
                type="button"
                onClick={() => setCandidateSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* JOB INFO */}
        {selectedJobData && (
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                <BriefcaseBusiness size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-500">
                  Selected Job
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedJobData.title}
                </p>
                {selectedJobData.company && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {selectedJobData.company}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {Array.isArray(selectedJobData.required_skills)
                    ? `${selectedJobData.required_skills.length} required skills`
                    : "Job requirements loaded"}
                </p>
              </div>
            </div>
          </div>
        )}

        {matchError && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{matchError}</span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs text-slate-400">
              Choose one candidate for detailed matching or match all resumes for ranking.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleMatch}
                disabled={matching || bulkMatching || !selectedJob || !selectedCandidate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {matching ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                {matching ? "Analyzing..." : "Match Candidate"}
              </button>

              <button
                type="button"
                onClick={handleBulkMatch}
                disabled={matching || bulkMatching || !selectedJob || !candidates.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkMatching ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Users size={18} />
                )}
                {bulkMatching ? "Matching All..." : `Match All Resumes (${totalCandidates})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BULK RESULTS */}
      {bulkResult && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={19} className="text-indigo-600" />
                  <p className="text-sm font-semibold text-indigo-600">
                    Bulk Matching Results
                  </p>
                </div>

                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  {bulkResult.job_title}
                </h2>

                {bulkResult.company && (
                  <p className="mt-1 text-sm text-slate-500">
                    {bulkResult.company}
                  </p>
                )}
              </div>

              <Link
                to="/matching/history"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <History size={16} />
                Match History
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MiniStat
                label="Matched"
                value={bulkStats.total}
              />
              <MiniStat
                label="Average Score"
                value={`${bulkStats.average}%`}
              />
              <MiniStat
                label="80+ Matches"
                value={bulkStats.strong}
              />
              <MiniStat
                label="Needs Review"
                value={bulkStats.review}
              />
            </div>
          </div>

          {/* RESULTS FILTER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={resultSearch}
                  onChange={(e) => setResultSearch(e.target.value)}
                  placeholder="Search matched candidates..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="relative lg:w-56">
                <ListFilter
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400"
                >
                  <option value="score_desc">Highest Score</option>
                  <option value="score_asc">Lowest Score</option>
                  <option value="name">Candidate Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* RESULT CARDS */}
          <div className="space-y-3">
            {bulkResults.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Search size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No matching candidate found
                </p>
              </div>
            ) : (
              paginatedBulkResults.map((candidate) => {
                const score = getScore(candidate.final_match_score);
                const saved = savedResumeIds.includes(
                  Number(candidate.resume_id)
                );

                return (
                  <div
                    key={candidate.resume_id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-100 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <span className="text-sm font-bold">
                            #{candidate.rank}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-800">
                            {candidate.candidate_name || "Unknown Candidate"}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {candidate.email ||
                              candidate.phone ||
                              `Resume #${candidate.resume_id}`}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[620px]">
                        <ScoreMini
                          label="Final"
                          score={candidate.final_match_score}
                        />
                        <ScoreMini
                          label="Exact Skills"
                          score={candidate.exact_skill_score}
                        />
                        <ScoreMini
                          label="Semantic"
                          score={candidate.semantic_skill_score}
                        />
                        <ScoreMini
                          label="Experience"
                          score={candidate.experience_score}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${getScoreClass(score)}`}>
                          {getScoreLabel(score)}
                        </span>
                        <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
                          {getSkillsCount(candidate.matched_skills)} matched skills
                        </span>
                        <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-700">
                          {getSkillsCount(candidate.missing_skills)} missing
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/resumes/${candidate.resume_id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <UserSearch size={14} />
                          Profile
                        </Link>

                        <Link
                          to={`/resume-chat/${candidate.resume_id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                        >
                          <MessageSquare size={14} />
                          AI Chat
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleSaveBulkMatch(candidate)}
                          disabled={saved || savingResumeId === candidate.resume_id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingResumeId === candidate.resume_id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : saved ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Save size={14} />
                          )}
                          {saved ? "Saved" : "Save Match"}
                        </button>

                        <Link
                          to={`/matching/${bulkResult.job_id}/${candidate.resume_id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
                        >
                          Details
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {bulkResults.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {((bulkPage - 1) * bulkPageSize) + 1}
                </span>{" – "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    bulkPage * bulkPageSize,
                    bulkResults.length
                  )}
                </span>{" of "}
                <span className="font-semibold text-slate-700">
                  {bulkResults.length}
                </span>{" "}
                candidates
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={bulkPageSize}
                  onChange={(e) =>
                    setBulkPageSize(Number(e.target.value))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setBulkPage((page) => Math.max(1, page - 1))
                  }
                  disabled={bulkPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="min-w-[78px] text-center text-xs font-semibold text-slate-600">
                  Page {bulkPage} / {bulkTotalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setBulkPage((page) =>
                      Math.min(bulkTotalPages, page + 1)
                    )
                  }
                  disabled={bulkPage === bulkTotalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SINGLE RESULT */}
      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Match Result</p>
                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  {result.candidate_name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {result.job_title}
                </p>
              </div>

              <div
                className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full ${getScoreClass(
                  result.final_match_score
                )}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide">
                  Match Score
                </p>
                <p className="mt-1 text-3xl font-bold">
                  {result.final_match_score ?? 0}%
                </p>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">
                  {getScoreLabel(result.final_match_score ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniStat
              label="Matched Skills"
              value={getSkillsCount(result.matched_skills)}
            />
            <MiniStat
              label="Missing Skills"
              value={getSkillsCount(result.missing_skills)}
            />
            <MiniStat
              label="Overall Compatibility"
              value={`${result.final_match_score ?? 0}%`}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ScoreCard title="Exact Skill Match" score={result.exact_skill_score} />
            <ScoreCard title="Semantic Skill Match" score={result.semantic_skill_score} />
            <ScoreCard title="Experience Match" score={result.experience_score} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkillCard
              title="Matched Skills"
              skills={result.matched_skills}
              type="matched"
            />
            <SkillCard
              title="Missing Skills"
              skills={result.missing_skills}
              type="missing"
            />
          </div>

          {result.ai_analysis && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">
                    AI Match Analysis
                  </h2>
                  <p className="text-xs text-slate-500">
                    AI-generated candidate-job analysis
                  </p>
                </div>
              </div>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {typeof result.ai_analysis === "string"
                  ? result.ai_analysis
                  : JSON.stringify(result.ai_analysis, null, 2)}
              </div>
            </div>
          )}

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            <Link
              to={`/resumes/${result.resume_id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <UserSearch size={17} />
              Candidate Profile
            </Link>

            <Link
              to={`/resume-chat/${result.resume_id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <MessageSquare size={17} />
              Chat with Resume
            </Link>

            <button
              type="button"
              onClick={handleSaveMatch}
              disabled={saving || savedResumeIds.includes(Number(result.resume_id))}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {savedResumeIds.includes(Number(result.resume_id))
                ? "Saved"
                : "Save Match"}
            </button>

            <Link
              to="/matching/history"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <History size={17} />
              History
            </Link>
          </div>

          {saveMessage && (
            <p className="text-right text-sm font-medium text-slate-500">
              {saveMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, title, value, subtitle, color }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            colorClasses[color] || colorClasses.indigo
          }`}
        >
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ScoreMini({ label, score }) {
  const value = Math.min(100, Math.max(0, Number(score || 0)));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

function ScoreCard({ title, score }) {
  const value = Math.min(100, Math.max(0, Number(score || 0)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <span className="text-3xl font-bold text-slate-800">
            {value.toFixed(1)}
          </span>
          <span className="mb-1 ml-1 text-sm text-slate-400">%</span>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
            value >= 80
              ? "bg-green-50 text-green-700"
              : value >= 60
              ? "bg-yellow-50 text-yellow-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {value >= 80 ? "Strong" : value >= 60 ? "Moderate" : "Low"}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SkillCard({ title, skills, type }) {
  const list = Array.isArray(skills) ? skills : [];

  const renderSkill = (skill) => {
    if (skill === null || skill === undefined) return "";

    if (["string", "number", "boolean"].includes(typeof skill)) {
      return String(skill);
    }

    if (typeof skill === "object") {
      if (skill.name) return String(skill.name);
      if (skill.skill) return String(skill.skill);
      if (skill.title) return String(skill.title);

      return Object.values(skill)
        .filter((value) => ["string", "number"].includes(typeof value))
        .join(" • ");
    }

    return "";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {list.length > 0 ? (
          list.map((skill, index) => {
            const skillText = renderSkill(skill);
            if (!skillText) return null;

            return (
              <span
                key={`${skillText}-${index}`}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  type === "matched"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {skillText}
              </span>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">
            No skills available.
          </p>
        )}
      </div>
    </div>
  );
}

export default MatchResults;
