import React from "react";
import { DatasetState, EvaluationMetrics } from "../types";
import { RecommendationMetrics } from "../components/RecommendationMetrics";
import { ChartCard } from "../components/ChartCard";
import { SimilarityChart } from "../components/SimilarityChart";
import { CoverageChart } from "../components/CoverageChart";
import { RefreshCw, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface RecommendationPerformanceProps {
  dataset: DatasetState;
  metrics: EvaluationMetrics | null;
  onReRunEvaluation: () => void;
  isEvaluating: boolean;
}

export const RecommendationPerformance: React.FC<RecommendationPerformanceProps> = ({
  dataset,
  metrics,
  onReRunEvaluation,
  isEvaluating,
}) => {
  return (
    <div className="space-y-6">
      {/* Header action strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Offline Collaborative Filtering Benchmarks
          </h2>
          <p className="text-xs text-slate-500">
            Leave-One-Out validation on actual historical user rating vectors
          </p>
        </div>

        <button
          id="re-run-evaluation-btn"
          type="button"
          onClick={onReRunEvaluation}
          disabled={isEvaluating}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isEvaluating ? "animate-spin" : ""}`} />
          <span>{isEvaluating ? "Evaluating Models..." : "Re-Run Offline Evaluation"}</span>
        </button>
      </div>

      {/* Main Metrics Component */}
      <RecommendationMetrics metrics={metrics} isLoading={isEvaluating} />

      {/* Charts Row: Similarity Distribution & Coverage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          id="perf-similarity-chart"
          title="Pairwise Cosine Similarity Distribution"
          subtitle="Frequency of similarity strengths across all co-rated book pairs"
        >
          <SimilarityChart data={metrics?.similarityDistribution || []} />
        </ChartCard>

        <ChartCard
          id="perf-coverage-chart"
          title="Catalog Coverage & Long-Tail Distribution"
          subtitle="Proportion of distinct catalog books appearing in Top-K evaluations"
        >
          <CoverageChart
            coveragePercentage={metrics?.itemBased.catalogCoverage || 0}
            totalBooks={dataset.totalBooks}
          />
        </ChartCard>
      </div>

      {/* Evaluation Methodology Architecture Note */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Evaluation Methodology & Validation Guarantees
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <strong className="text-slate-800">Unbiased Hold-Out:</strong>
              <p className="mt-0.5 leading-normal">
                Held-out items are strictly omitted from both user and book rating vectors during candidate ranking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <strong className="text-slate-800">No Zero-Rating Distortion:</strong>
              <p className="mt-0.5 leading-normal">
                Unrated titles are treated as unobserved rather than synthetic zero ratings during cosine dot products.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
            <div>
              <strong className="text-slate-800">Damping Shrinkage:</strong>
              <p className="mt-0.5 leading-normal">
                Single-user overlaps undergo fractional damping to guard against spurious 1.0 similarity scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
