import React, { useState } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (booksFile: File, ratingsFile: File) => Promise<void>;
  onResetToDefault: () => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onResetToDefault,
  isLoading,
  errorMessage,
}) => {
  const [booksFile, setBooksFile] = useState<File | null>(null);
  const [ratingsFile, setRatingsFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booksFile || !ratingsFile) {
      setLocalError("Please select both books.csv and ratings.csv files.");
      return;
    }
    setLocalError(null);
    await onUpload(booksFile, ratingsFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Datasets</h3>
            <p className="text-xs text-slate-500">Upload custom CSV datasets or reset to default</p>
          </div>
        </div>

        {(localError || errorMessage) && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{localError || errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Books CSV input */}
          <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <label className="block text-xs font-semibold text-slate-800">
              1. Books Dataset (books.csv)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Expected columns: <code>book_id, title, author, genre</code>
            </p>
            <input
              id="upload-books-file"
              type="file"
              accept=".csv"
              onChange={(e) => setBooksFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
            />
            {booksFile && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{booksFile.name} ({(booksFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Ratings CSV input */}
          <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <label className="block text-xs font-semibold text-slate-800">
              2. User Ratings Dataset (ratings.csv)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Expected columns: <code>user_id, book_id, rating</code>
            </p>
            <input
              id="upload-ratings-file"
              type="file"
              accept=".csv"
              onChange={(e) => setRatingsFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
            />
            {ratingsFile && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{ratingsFile.name} ({(ratingsFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={async () => {
                await onResetToDefault();
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Reset to Default Dataset</span>
            </button>

            <button
              id="submit-upload-btn"
              type="submit"
              disabled={isLoading || !booksFile || !ratingsFile}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Process Custom Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
