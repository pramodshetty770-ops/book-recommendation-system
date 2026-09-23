import React from "react";
import { Menu, FileDown, Upload, Database, Check } from "lucide-react";
import { DatasetState } from "../types";

interface HeaderProps {
  title: string;
  subtitle: string;
  dataset: DatasetState | null;
  onOpenMobileMenu: () => void;
  onDownloadReport: () => void;
  isDownloadingReport: boolean;
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  dataset,
  onOpenMobileMenu,
  onDownloadReport,
  isDownloadingReport,
  onOpenUploadModal,
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Dataset Quick Stats Badge */}
        {dataset && (
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-medium">
            <Database className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {dataset.totalBooks} books • {dataset.totalUsers} users • {dataset.totalRatings} ratings
            </span>
          </div>
        )}

        {/* Upload Custom CSV button */}
        <button
          id="header-upload-dataset-btn"
          type="button"
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
          title="Upload custom books.csv and ratings.csv"
        >
          <Upload className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">Upload CSV</span>
        </button>

        {/* Download PDF Report button */}
        <button
          id="header-download-report-btn"
          type="button"
          onClick={onDownloadReport}
          disabled={isDownloadingReport || !dataset}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span>{isDownloadingReport ? "Generating PDF..." : "Download PDF Report"}</span>
        </button>
      </div>
    </header>
  );
};
