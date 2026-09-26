import API from "./api";

// =========================
// MATCH RESUME WITH JOB
// =========================

export const matchResumeWithJob = async (jobId, resumeId) => {
  if (!jobId || !resumeId) {
    throw new Error("Job ID and Resume ID are required.");
  }

  const response = await API.get(
    `/jobs/match/${jobId}/${resumeId}`
  );

  return response.data;
};

// =========================
// SAVE JOB MATCH
// =========================

export const saveJobMatch = async (jobId, resumeId) => {
  if (!jobId || !resumeId) {
    throw new Error("Job ID and Resume ID are required.");
  }

  const response = await API.post(
    `/jobs/match/save/${jobId}/${resumeId}`
  );

  return response.data;
};

// =========================
// GET MATCH HISTORY
// =========================

export const getMatchHistory = async (resumeId) => {
  if (!resumeId) {
    throw new Error("Resume ID is required.");
  }

  const response = await API.get(
    `/jobs/match/history/${resumeId}`
  );

  return response.data;
};