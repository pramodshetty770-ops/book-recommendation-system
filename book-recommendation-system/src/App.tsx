import React, { useState, useEffect, useCallback } from "react";
import { DatasetState, EvaluationMetrics, RecommendationResult } from "./types";
import { loadDefaultDatasets, loadCustomDatasets } from "./services/dataset";
import { runOfflineEvaluation } from "./recommendation/evaluation";
import { generateDynamicInsights } from "./utils/insights";
import { generatePDFReport } from "./utils/reportGenerator";
import { generateUserRecommendations } from "./recommendation/recommendationEngine";

import { Sidebar, NavSection } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UploadModal } from "./components/UploadModal";
import { Dashboard } from "./pages/Dashboard";
import { Recommendations } from "./pages/Recommendations";
import { BookUserAnalysis } from "./pages/BookUserAnalysis";
import { RecommendationPerformance } from "./pages/RecommendationPerformance";

import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function App() {
  const [dataset, setDataset] = useState<DatasetState | null>(null);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Navigation & interaction state
  const [currentSection, setCurrentSection] = useState<NavSection>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [inspectedBookId, setInspectedBookId] = useState<string | null>(null);

  // Modals & triggers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Initial Load
  const initDataset = useCallback(async () => {
    setLoading(true);
    setErrorMessages([]);

    const result = await loadDefaultDatasets();
    if (!result.dataset) {
      setErrorMessages(result.errors.length > 0 ? result.errors : ["Failed to load default dataset."]);
      setLoading(false);
      return;
    }

    setDataset(result.dataset);

    // Initial selections
    const firstUser = result.dataset.userMap.keys().next().value || "";
    const firstBook = result.dataset.books[0]?.book_id || "";
    setSelectedUserId(firstUser);
    setSelectedBookId(firstBook);

    // Run offline evaluation
    const evalMetrics = runOfflineEvaluation(result.dataset);
    setMetrics(evalMetrics);

    // Generate dynamic insights
    const ins = generateDynamicInsights(result.dataset, evalMetrics);
    setInsights(ins);

    setLoading(false);
  }, []);

  useEffect(() => {
    initDataset();
  }, [initDataset]);

  // Custom Dataset Upload
  const handleCustomUpload = async (booksFile: File, ratingsFile: File) => {
    setLoading(true);
    const result = await loadCustomDatasets(booksFile, ratingsFile);
    if (!result.dataset) {
      setToastMessage({
        type: "error",
        text: result.errors[0] || "Custom dataset validation failed.",
      });
      setLoading(false);
      return;
    }

    setDataset(result.dataset);
    const firstUser = result.dataset.userMap.keys().next().value || "";
    const firstBook = result.dataset.books[0]?.book_id || "";
    setSelectedUserId(firstUser);
    setSelectedBookId(firstBook);

    const evalMetrics = runOfflineEvaluation(result.dataset);
    setMetrics(evalMetrics);
    const ins = generateDynamicInsights(result.dataset, evalMetrics);
    setInsights(ins);

    setIsUploadModalOpen(false);
    setLoading(false);
    setToastMessage({
      type: "success",
      text: `Loaded custom dataset (${result.dataset.totalBooks} books, ${result.dataset.totalUsers} users).`,
    });
  };

  // Re-run evaluation
  const handleReRunEvaluation = () => {
    if (!dataset) return;
    setIsEvaluating(true);
    setTimeout(() => {
      const evalMetrics = runOfflineEvaluation(dataset);
      setMetrics(evalMetrics);
      const ins = generateDynamicInsights(dataset, evalMetrics);
      setInsights(ins);
      setIsEvaluating(false);
      setToastMessage({
        type: "success",
        text: "Offline collaborative filtering evaluation completed.",
      });
    }, 150);
  };

  // PDF Report Download
  const handleDownloadPDF = async () => {
    if (!dataset) return;
    setIsDownloadingReport(true);

    try {
      const activeUser = dataset.userMap.get(selectedUserId) || null;
      const activeBook = dataset.bookMap.get(selectedBookId) || null;
      let activeRecs: RecommendationResult[] = [];

      if (activeUser) {
        const gen = generateUserRecommendations(activeUser.user_id, dataset, { topN: 8 });
        activeRecs = gen.recommendations;
      }

      const success = await generatePDFReport({
        dataset,
        metrics,
        selectedUser: activeUser,
        selectedBook: activeBook,
        recommendations: activeRecs,
        insights,
      });

      if (success) {
        setToastMessage({
          type: "success",
          text: "Report generated and downloaded as book-recommendation-report.pdf",
        });
      } else {
        setToastMessage({
          type: "error",
          text: "Unable to generate the report. Please try again.",
        });
      }
    } catch (err) {
      setToastMessage({
        type: "error",
        text: "Unable to generate the report. Please try again.",
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  // Section titles
  const sectionMeta: Record<NavSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Recommendation System Dashboard",
      subtitle: "Catalog summary, distributions, and reading activity overview",
    },
    recommendations: {
      title: "Book Recommendations Engine",
      subtitle: "Personalized user recommendations and item-to-item cosine similarity",
    },
    analysis: {
      title: "Book & User Reading Analytics",
      subtitle: "Catalog explorer, reader profiles, and genre preferences",
    },
    performance: {
      title: "Model Performance & Offline Evaluation",
      subtitle: "Precision@K, Recall@K, Hit Rate@K, and Collaborative Filtering benchmarks",
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <h2 className="mt-4 font-serif text-lg font-bold text-slate-900">
          Initializing Recommendation Engine
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Loading CSV datasets, building rating matrices, and calculating collaborative vectors...
        </p>
      </div>
    );
  }

  if (errorMessages.length > 0 || !dataset) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-serif text-lg font-bold text-slate-900">
          Dataset Initialization Failed
        </h2>
        <div className="mt-2 text-xs text-rose-700 max-w-md space-y-1">
          {errorMessages.map((e, idx) => (
            <p key={idx}>{e}</p>
          ))}
        </div>
        <button
          onClick={initDataset}
          className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Loading Datasets</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-lg transition-all ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-200 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          title={sectionMeta[currentSection].title}
          subtitle={sectionMeta[currentSection].subtitle}
          dataset={dataset}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onDownloadReport={handleDownloadPDF}
          isDownloadingReport={isDownloadingReport}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {currentSection === "dashboard" && (
            <Dashboard
              dataset={dataset}
              metrics={metrics}
              insights={insights}
              onNavigateToRecommendations={(userId) => {
                if (userId) setSelectedUserId(userId);
                setCurrentSection("recommendations");
              }}
              onNavigateToBookDetails={(bookId) => {
                setInspectedBookId(bookId);
              }}
            />
          )}

          {currentSection === "recommendations" && (
            <Recommendations
              dataset={dataset}
              selectedUserId={selectedUserId}
              selectedBookId={selectedBookId}
              onSelectUserId={setSelectedUserId}
              onSelectBookId={setSelectedBookId}
              onInspectBookDetails={(bookId) => {
                setInspectedBookId(bookId);
              }}
            />
          )}

          {currentSection === "analysis" && (
            <BookUserAnalysis
              dataset={dataset}
              onNavigateToRecommendations={(userId) => {
                setSelectedUserId(userId);
                setCurrentSection("recommendations");
              }}
              inspectedBookId={inspectedBookId}
              onCloseInspectedBook={() => setInspectedBookId(null)}
              onInspectBook={(bookId) => setInspectedBookId(bookId)}
            />
          )}

          {currentSection === "performance" && (
            <RecommendationPerformance
              dataset={dataset}
              metrics={metrics}
              onReRunEvaluation={handleReRunEvaluation}
              isEvaluating={isEvaluating}
            />
          )}
        </main>
      </div>

      {/* Custom Dataset Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleCustomUpload}
        onResetToDefault={initDataset}
        isLoading={loading}
      />
    </div>
  );
}
