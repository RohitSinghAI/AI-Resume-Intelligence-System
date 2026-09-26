import { useState } from "react";
import {
  CheckCircle,
  FileText,
  Sparkles,
  Loader2,
  XCircle,
  X,
  UploadCloud,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ResumeUpload from "../../components/resume/ResumeUpload";
import {
  uploadMultipleResumes,
} from "../../services/resumeApi";

function UploadResume() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [uploadSummary, setUploadSummary] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message,
    });

    window.setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: "",
      });
    }, 5000);
  };

  // =====================================================
  // FILE SELECTION
  // =====================================================

  const handleFileSelect = (selectedFiles) => {
    const nextFiles = Array.isArray(selectedFiles)
      ? selectedFiles
      : selectedFiles
        ? [selectedFiles]
        : [];

    setFiles(nextFiles);
    setUploadSummary(null);

    if (nextFiles.length === 0) {
      return;
    }
  };

  // =====================================================
  // UPLOAD MULTIPLE RESUMES
  // =====================================================

  const handleUpload = async () => {
    if (!files.length) {
      showNotification(
        "error",
        "Please select at least one PDF resume first."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadSummary(null);

      const result = await uploadMultipleResumes(files);

      console.log("Bulk Upload Response:", result);

      const successful = Array.isArray(result?.successful)
        ? result.successful
        : [];

      const failed = Array.isArray(result?.failed)
        ? result.failed
        : [];

      const summary = {
        total:
          Number(result?.total_files) || files.length,
        successful:
          Number(result?.successful_uploads) ||
          successful.length,
        failed:
          Number(result?.failed_uploads) ||
          failed.length,
        successfulItems: successful,
        failedItems: failed,
      };

      setUploadSummary(summary);

      if (summary.failed === 0) {
        showNotification(
          "success",
          `${summary.successful} resume${
            summary.successful === 1 ? "" : "s"
          } uploaded and analyzed successfully.`
        );
      } else {
        showNotification(
          "error",
          `${summary.successful} uploaded successfully and ${summary.failed} failed.`
        );
      }
    } catch (error) {
      console.error(
        "Multiple resume upload error:",
        error
      );

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to upload resumes. Please try again.";

      showNotification("error", message);
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetUpload = () => {
    setFiles([]);
    setUploadSummary(null);

    setNotification({
      show: false,
      type: "",
      message: "",
    });
  };

  // =====================================================
  // VIEW SUCCESSFUL RESUME
  // =====================================================

  const viewResume = (resumeId) => {
    if (!resumeId) {
      return;
    }

    navigate(`/resumes/${resumeId}`);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          className={`fixed right-6 top-6 z-50 flex w-[min(420px,calc(100vw-32px))] items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
            notification.type === "success"
              ? "border-emerald-200"
              : "border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle
              size={22}
              className="mt-0.5 shrink-0 text-emerald-500"
            />
          ) : (
            <XCircle
              size={22}
              className="mt-0.5 shrink-0 text-red-500"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {notification.type === "success"
                ? "Upload Complete"
                : "Upload Notice"}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setNotification({
                show: false,
                type: "",
                message: "",
              })
            }
            className="text-slate-400 transition hover:text-slate-600"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <Sparkles size={14} />
            AI Resume Intelligence
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Upload Resumes
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Upload one or multiple candidate resumes.
            The system extracts resume data, performs AI
            analysis, and stores each candidate separately.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <ShieldCheck
            size={16}
            className="text-emerald-500"
          />
          Secure resume processing
        </div>
      </div>

      {/* =================================================
          UPLOAD CARD
      ================================================= */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/60 px-6 py-5">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <UploadCloud size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Multiple Resume Upload
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                PDF only · Maximum 10 MB per file · Maximum
                20 files per batch
              </p>
            </div>

          </div>
        </div>

        <div className="p-6">

          <ResumeUpload
            onFileSelect={handleFileSelect}
          />

          {/* =================================================
              SELECTED FILE SUMMARY
          ================================================= */}

          {files.length > 0 && !uploadSummary && (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <FileText size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      {files.length} resume
                      {files.length === 1 ? "" : "s"} ready
                    </p>

                    <p className="mt-1 text-xs text-indigo-600">
                      All selected files will be processed one
                      by one by the server.
                    </p>
                  </div>

                </div>

                {!uploading && (
                  <button
                    type="button"
                    onClick={resetUpload}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <RotateCcw size={14} />
                    Clear Selection
                  </button>
                )}

              </div>
            </div>
          )}

          {/* =================================================
              PROCESSING
          ================================================= */}

          {uploading && (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-slate-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Processing {files.length} resume
                    {files.length === 1 ? "" : "s"}...
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    PDF extraction, resume parsing and AI
                    analysis are running. Please keep this page
                    open until processing finishes.
                  </p>
                </div>

              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-600" />
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Sparkles
                  size={14}
                  className="text-indigo-600"
                />
                Server is processing resumes sequentially.
              </div>

            </div>
          )}

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          {!uploadSummary && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={!files.length || uploading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Processing Resumes...
                </>
              ) : (
                <>
                  <BrainCircuit size={18} />
                  Upload & Analyze{" "}
                  {files.length > 0
                    ? `${files.length} Resume${
                        files.length === 1 ? "" : "s"
                      }`
                    : "Resumes"}
                </>
              )}
            </button>
          )}

          {/* =================================================
              RESULT SUMMARY
          ================================================= */}

          {uploadSummary && (
            <div className="mt-5 space-y-4">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-start gap-3">

                  {uploadSummary.failed === 0 ? (
                    <CheckCircle
                      size={23}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <AlertCircle
                      size={23}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      Batch processing completed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {uploadSummary.successful} of{" "}
                      {uploadSummary.total} resumes were
                      uploaded successfully.
                    </p>
                  </div>

                </div>


                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <SummaryCard
                    label="Total"
                    value={uploadSummary.total}
                    icon={FileText}
                  />

                  <SummaryCard
                    label="Successful"
                    value={uploadSummary.successful}
                    icon={CheckCircle}
                  />

                  <SummaryCard
                    label="Failed"
                    value={uploadSummary.failed}
                    icon={XCircle}
                  />

                </div>

              </div>


              {/* Successful */}

              {uploadSummary.successfulItems.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">

                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={18}
                      className="text-emerald-600"
                    />

                    <h3 className="text-sm font-bold text-emerald-900">
                      Successfully Processed
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2">

                    {uploadSummary.successfulItems.map(
                      (item, index) => (
                        <div
                          key={`${item.resume_id || item.file_name}-${index}`}
                          className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {item.candidate_name ||
                                  item.file_name ||
                                  "Resume"}
                              </p>

                              {item.file_name &&
                                item.candidate_name && (
                                  <p className="mt-0.5 truncate text-xs text-slate-400">
                                    {item.file_name}
                                  </p>
                                )}
                            </div>

                          </div>

                          {item.resume_id && (
                            <button
                              type="button"
                              onClick={() =>
                                viewResume(
                                  item.resume_id
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            >
                              View Resume
                              <ArrowRight size={14} />
                            </button>
                          )}

                        </div>
                      )
                    )}

                  </div>
                </div>
              )}


              {/* Failed */}

              {uploadSummary.failedItems.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                  <div className="flex items-center gap-2">
                    <XCircle
                      size={18}
                      className="text-red-600"
                    />

                    <h3 className="text-sm font-bold text-red-900">
                      Failed Resumes
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2">

                    {uploadSummary.failedItems.map(
                      (item, index) => (
                        <div
                          key={`${item.file_name}-${index}`}
                          className="rounded-xl border border-red-100 bg-white p-3"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {item.file_name ||
                              "Unknown file"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            {item.error ||
                              "Processing failed."}
                          </p>
                        </div>
                      )
                    )}

                  </div>
                </div>
              )}


              {/* Final Actions */}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/resumes")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FileText size={17} />
                  View All Resumes
                </button>

                <button
                  type="button"
                  onClick={resetUpload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <UploadCloud size={17} />
                  Upload More
                </button>

              </div>

            </div>
          )}

        </div>
      </div>


      {/* =================================================
          PROCESSING STEPS
      ================================================= */}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles
            size={17}
            className="text-indigo-600"
          />

          <h2 className="font-semibold text-slate-800">
            What happens after upload?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <InfoCard
            icon={FileText}
            title="1. Extract"
            description="Resume content is extracted from each uploaded PDF."
          />

          <InfoCard
            icon={BrainCircuit}
            title="2. Analyze"
            description="AI identifies skills, experience, education, projects and other resume information."
          />

          <InfoCard
            icon={CheckCircle}
            title="3. Match"
            description="Each processed resume can then be compared with jobs using intelligent matching."
          />

        </div>
      </div>


      {/* =================================================
          TIPS
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">

        <h3 className="text-sm font-semibold text-slate-800">
          Upload tips
        </h3>

        <div className="mt-3 grid grid-cols-1 gap-3 text-xs leading-5 text-slate-500 md:grid-cols-2">

          <p>
            • Use clear, text-based PDF resumes for better extraction.
          </p>

          <p>
            • Keep every resume within the 10 MB file-size limit.
          </p>

          <p>
            • Maximum 20 resumes can be processed in one batch.
          </p>

          <p>
            • Avoid password-protected or corrupted PDF files.
          </p>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">
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


// =========================================================
// INFO CARD
// =========================================================

function InfoCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-700">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default UploadResume;
