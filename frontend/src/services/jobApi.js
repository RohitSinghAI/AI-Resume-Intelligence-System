import API from "./api";

// ==========================================
// GET ALL JOBS
// ==========================================

export const getJobs = async () => {
  const response = await API.get("/jobs/");
  return response.data;
};

// ==========================================
// GET SINGLE JOB
// ==========================================

export const getJobById = async (id) => {
  if (!id) {
    throw new Error("Job ID is required.");
  }

  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

// ==========================================
// CREATE NEW JOB
// ==========================================

export const createJob = async (jobData) => {
  if (!jobData) {
    throw new Error("Job data is required.");
  }

  const response = await API.post("/jobs/", jobData);
  return response.data;
};

// ==========================================
// UPDATE JOB
// ==========================================

export const updateJob = async (id, jobData) => {
  if (!id) {
    throw new Error("Job ID is required.");
  }

  if (!jobData) {
    throw new Error("Job data is required.");
  }

  const response = await API.put(
    `/jobs/${id}`,
    jobData
  );

  return response.data;
};

// ==========================================
// GET TOTAL MATCH COUNT
// ==========================================

export const getMatchCount = async () => {
  const response = await API.get("/jobs/match/count");
  return response.data;
};

// ==========================================
// DELETE JOB
// ==========================================

export const deleteJob = async (id) => {
  if (!id) {
    throw new Error("Job ID is required.");
  }

  const response = await API.delete(`/jobs/${id}`);
  return response.data;
};