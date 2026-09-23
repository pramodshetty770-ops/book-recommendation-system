import React from "react";
import { Sparkles, GitCompare } from "lucide-react";

interface RecommendationModeProps {
  mode: "personalized" | "similar";
  onChangeMode: (mode: "personalized" | "similar") => void;
}

export const RecommendationMode: React.FC<RecommendationModeProps> = ({
  mode,
  onChangeMode,
}) => {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1">
      <button
        id="mode-tab-for-you"
        type="button"
        onClick={() => onChangeMode("personalized")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
          mode === "personalized"
            ? "bg-white text-slate-900 shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
        <span>For You (Personalized)</span>
      </button>

      <button
        id="mode-tab-similar-books"
        type="button"
        onClick={() => onChangeMode("similar")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
          mode === "similar"
            ? "bg-white text-slate-900 shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <GitCompare className="h-3.5 w-3.5 text-emerald-600" />
        <span>Similar Books</span>
      </button>
    </div>
  );
};
