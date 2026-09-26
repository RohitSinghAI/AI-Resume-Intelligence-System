import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function ResumeUpload({ onFileSelect }) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
  const MAX_FILES = 20;

  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${Math.max(
      1,
      Math.round(bytes / 1024)
    )} KB`;
  };

  // =====================================================
  // VALIDATE ONE FILE
  // =====================================================

  const validateFile = (file) => {
    if (!file) {
      return {
        valid: false,
        message: "Invalid file.",
      };
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      return {
        valid: false,
        message: `${file.name}: Only PDF resume files are supported.`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `${file.name}: File size must be less than 10 MB.`,
      };
    }

    return {
      valid: true,
      message: "",
    };
  };

  // =====================================================
  // CHECK DUPLICATE
  // =====================================================

  const isDuplicate = (file, existingFiles) => {
    return existingFiles.some(
      (existingFile) =>
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified ===
          file.lastModified
    );
  };

  // =====================================================
  // HANDLE FILES
  // =====================================================

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles?.length) {
      return;
    }

    setError("");

    const incomingFiles = Array.from(
      selectedFiles
    );

    const validFiles = [];
    const errors = [];

    let currentFiles = [...files];

    for (const file of incomingFiles) {
      // Validate
      const validation =
        validateFile(file);

      if (!validation.valid) {
        errors.push(validation.message);
        continue;
      }

      // Duplicate check
      if (
        isDuplicate(
          file,
          currentFiles
        )
      ) {
        errors.push(
          `${file.name}: Already selected.`
        );
        continue;
      }

      // Max files
      if (
        currentFiles.length +
          validFiles.length >=
        MAX_FILES
      ) {
        errors.push(
          `Maximum ${MAX_FILES} resumes can be selected at once.`
        );
        break;
      }

      validFiles.push(file);
      currentFiles.push(file);
    }

    const updatedFiles = [
      ...files,
      ...validFiles,
    ];

    setFiles(updatedFiles);

    // Send updated file list to parent
    onFileSelect(updatedFiles);

    if (errors.length > 0) {
      setError(errors.join(" "));
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  // =====================================================
  // DROP
  // =====================================================

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    handleFiles(e.dataTransfer.files);
  };

  // =====================================================
  // DRAG EVENTS
  // =====================================================

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // =====================================================
  // REMOVE ONE FILE
  // =====================================================

  const removeFile = (indexToRemove) => {
    const updatedFiles = files.filter(
      (_, index) =>
        index !== indexToRemove
    );

    setFiles(updatedFiles);
    setError("");

    onFileSelect(updatedFiles);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // =====================================================
  // REMOVE ALL
  // =====================================================

  const removeAllFiles = () => {
    setFiles([]);
    setError("");

    onFileSelect([]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-4">

      {/* =================================================
          UPLOAD AREA
      ================================================= */}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 shadow-inner"
            : error
            ? "border-red-300 bg-red-50/40"
            : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30"
        }`}
      >

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Icon */}

        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition ${
            isDragging
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          <UploadCloud size={29} />
        </div>

        {/* Heading */}

        <h3 className="mt-5 text-lg font-semibold text-slate-800">
          {isDragging
            ? "Drop your resumes here"
            : "Upload multiple resumes"}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Drag and drop multiple PDF resumes here,
          or browse your computer to select several
          files at once.
        </p>

        {/* Browse */}

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <UploadCloud size={17} />
          Select Resumes
        </button>

        {/* Limits */}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">

          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            PDF only
          </span>

          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            Max 10 MB each
          </span>

          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            Max {MAX_FILES} files
          </span>

        </div>
      </div>


      {/* =================================================
          SELECTED FILES
      ================================================= */}

      {files.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">

          {/* Header */}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">

                <CheckCircle
                  size={18}
                  className="text-emerald-500"
                />

                <h3 className="text-sm font-bold text-slate-800">
                  {files.length} resume
                  {files.length === 1
                    ? ""
                    : "s"} selected
                </h3>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                All files are ready for upload.
              </p>
            </div>

            <button
              type="button"
              onClick={removeAllFiles}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <X size={14} />
              Remove All
            </button>

          </div>


          {/* File List */}

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">

            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >

                {/* File icon */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText size={18} />
                </div>

                {/* File details */}

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-2">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {file.name}
                    </p>

                    <CheckCircle
                      size={15}
                      className="shrink-0 text-emerald-500"
                    />

                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                    <span>PDF</span>

                    <span>•</span>

                    <span>
                      {formatFileSize(
                        file.size
                      )}
                    </span>

                    <span>•</span>

                    <span className="font-medium text-emerald-600">
                      Ready
                    </span>

                  </div>
                </div>

                {/* Remove */}

                <button
                  type="button"
                  onClick={() =>
                    removeFile(index)
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove resume"
                >
                  <X size={17} />
                </button>

              </div>
            ))}

          </div>
        </div>
      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="text-xs leading-5 text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* =================================================
          SECURITY NOTE
      ================================================= */}

      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">

        <CheckCircle
          size={14}
          className="text-emerald-500"
        />

        Resumes will be processed securely for
        AI analysis.

      </div>

    </div>
  );
}

export default ResumeUpload;