import React, { useState } from "react";
import { Award, Info, CheckCircle2 } from "lucide-react";
import { EvaluationMetrics } from "../types";

interface RecommendationMetricsProps {
  metrics: EvaluationMetrics | null;
  onRunReEvaluation?: () => void;
  isLoading?: boolean;
}

export const RecommendationMetrics: React.FC<RecommendationMetricsProps> = ({
  metrics,
  onRunReEvaluation,
  isLoading = false,
}) => {
  const [activeK, setActiveK] = useState<5 | 10 | 20>(10);

  if (!metrics) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
        Evaluation metrics are currently loading or not yet generated.
      </div>
    );
  }

  const { itemBased, userBased, eligibleUsersCount } = metrics;

  // Determine superior method for selected K
  const itemHit = activeK === 5 ? itemBased.hitRate5 : activeK === 10 ? itemBased.hitRate10 : itemBased.hitRate20;
  const userHit = activeK === 5 ? userBased.hitRate5 : activeK === 10 ? userBased.hitRate10 : userBased.hitRate20;
  const superiorName = itemHit >= userHit ? "Item-Based Collaborative Filtering" : "User-Based Collaborative Filtering";
  const superiorMargin = Math.abs(itemHit - userHit).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner with Winner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-blue-700 uppercase">
              Evaluation Result (Top-{activeK})
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {superiorName} leads with {Math.max(itemHit, userHit)}% Hit Rate
            </h4>
            <p className="mt-0.5 text-xs text-slate-600">
              Evaluated across {eligibleUsersCount} active test readers holding out positive historical ratings.
            </p>
          </div>
        </div>

        {/* K Selector Pills */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          <span className="px-2 text-xs font-medium text-slate-500">Target K:</span>
          {([5, 10, 20] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveK(k)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeK === k
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              K = {k}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Collaborative Filtering Offline Performance Comparison
          </h3>
          <span className="text-[11px] text-slate-500">Leave-One-Out Evaluation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Evaluation Metric</th>
                <th className="px-4 py-3 text-right">Item-Based CF</th>
                <th className="px-4 py-3 text-right">User-Based CF</th>
                <th className="px-4 py-3 text-right">Advantage / Delta</th>
                <th className="px-4 py-3">Stronger Approach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Hit Rate row */}
              <tr className="bg-blue-50/20 font-medium">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Hit Rate@{activeK}</div>
                  <div className="text-[10px] text-slate-500">% of test users where held-out book was in top {activeK}</div>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                  {itemHit}%
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                  {userHit}%
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                  +{superiorMargin}%
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      itemHit >= userHit
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {itemHit >= userHit ? "Item-Based CF" : "User-Based CF"}
                  </span>
                </td>
              </tr>

              {/* Precision row */}
              <tr>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Precision@{activeK}</div>
                  <div className="text-[10px] text-slate-500">Proportion of top {activeK} recommendations that are relevant</div>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {activeK === 5
                    ? itemBased.precision5.toFixed(3)
                    : activeK === 10
                    ? itemBased.precision10.toFixed(3)
                    : itemBased.precision20.toFixed(3)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {activeK === 5
                    ? userBased.precision5.toFixed(3)
                    : activeK === 10
                    ? userBased.precision10.toFixed(3)
                    : userBased.precision20.toFixed(3)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                  {(
                    Math.abs(
                      (activeK === 5 ? itemBased.precision5 : activeK === 10 ? itemBased.precision10 : itemBased.precision20) -
                        (activeK === 5 ? userBased.precision5 : activeK === 10 ? userBased.precision10 : userBased.precision20)
                    )
                  ).toFixed(3)}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[11px] font-medium text-slate-700">
                    {(activeK === 5 ? itemBased.precision5 : activeK === 10 ? itemBased.precision10 : itemBased.precision20) >=
                    (activeK === 5 ? userBased.precision5 : activeK === 10 ? userBased.precision10 : userBased.precision20)
                      ? "Item-Based CF"
                      : "User-Based CF"}
                  </span>
                </td>
              </tr>

              {/* Recall row */}
              <tr>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Recall@{activeK}</div>
                  <div className="text-[10px] text-slate-500">Ratio of held-out items recovered in top {activeK} recommendations</div>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {activeK === 5
                    ? itemBased.recall5.toFixed(3)
                    : activeK === 10
                    ? itemBased.recall10.toFixed(3)
                    : itemBased.recall20.toFixed(3)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {activeK === 5
                    ? userBased.recall5.toFixed(3)
                    : activeK === 10
                    ? userBased.recall10.toFixed(3)
                    : userBased.recall20.toFixed(3)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                  {(
                    Math.abs(
                      (activeK === 5 ? itemBased.recall5 : activeK === 10 ? itemBased.recall10 : itemBased.recall20) -
                        (activeK === 5 ? userBased.recall5 : activeK === 10 ? userBased.recall10 : userBased.recall20)
                    )
                  ).toFixed(3)}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[11px] font-medium text-slate-700">
                    {(activeK === 5 ? itemBased.recall5 : activeK === 10 ? itemBased.recall10 : itemBased.recall20) >=
                    (activeK === 5 ? userBased.recall5 : activeK === 10 ? userBased.recall10 : userBased.recall20)
                      ? "Item-Based CF"
                      : "User-Based CF"}
                  </span>
                </td>
              </tr>

              {/* Catalog Coverage row */}
              <tr>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Catalog Coverage</div>
                  <div className="text-[10px] text-slate-500">% of catalog books recommended across test user cohort</div>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {itemBased.catalogCoverage}%
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {userBased.catalogCoverage}%
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                  {Math.abs(itemBased.catalogCoverage - userBased.catalogCoverage).toFixed(1)}%
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[11px] font-medium text-slate-700">
                    {itemBased.catalogCoverage >= userBased.catalogCoverage ? "Item-Based CF" : "User-Based CF"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Metric Definitions Explainer */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Info className="h-3.5 w-3.5 text-blue-600" />
            <span>Precision@K</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            Measures the accuracy of the top-K recommendations: the ratio of recommended books that the reader actually rated positively.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Info className="h-3.5 w-3.5 text-blue-600" />
            <span>Recall@K</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            Measures the model's ability to retrieve the user's preferred books out of all books they would have enjoyed reading.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Info className="h-3.5 w-3.5 text-blue-600" />
            <span>Hit Rate@K</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            The percentage of test readers for whom the recommendation engine successfully placed at least one target book into their top-K list.
          </p>
        </div>
      </div>
    </div>
  );
};
