import API from "./api";

// =====================================================
// UPLOAD SINGLE RESUME
// =====================================================

export const uploadResume = async (file) => {
  if (!file) {
    throw new Error("Resume file is required.");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/resumes/upload",
    formData
  );

  return response.data;
};


// =====================================================
// UPLOAD MULTIPLE RESUMES
// =====================================================

export const uploadMultipleResumes = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error(
      "At least one resume file is required."
    );
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await API.post(
    "/resumes/upload-multiple",
    formData
  );

  return response.data;
};


// =====================================================
// GET ALL RESUMES
// =====================================================

export const getResumes = async () => {
  const response = await API.get(
    "/resumes/"
  );

  return response.data;
};


// =====================================================
// GET RESUME BY ID
// =====================================================

export const getResumeById = async (id) => {
  if (!id) {
    throw new Error(
      "Resume ID is required."
    );
  }

  const response = await API.get(
    `/resumes/${id}`
  );

  return response.data;
};


// =====================================================
// DELETE RESUME
// =====================================================

export const deleteResume = async (id) => {
  if (!id) {
    throw new Error(
      "Resume ID is required."
    );
  }

  const response = await API.delete(
    `/resumes/${id}`
  );

  return response.data;
};