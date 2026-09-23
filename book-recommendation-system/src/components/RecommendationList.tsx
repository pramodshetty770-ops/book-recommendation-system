import React from "react";
import { Book, RecommendationResult, SimilarBookResult } from "../types";
import { RecommendationCard } from "./RecommendationCard";
import { SimilarBookCard } from "./SimilarBookCard";
import { AlertCircle, Compass } from "lucide-react";

interface RecommendationListProps {
  mode: "personalized" | "similar";
  personalResults?: RecommendationResult[];
  similarResults?: SimilarBookResult[];
  isColdStart?: boolean;
  isLowActivity?: boolean;
  selectedEntityTitle?: string;
  onSelectBook?: (bookId: string) => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  mode,
  personalResults = [],
  similarResults = [],
  isColdStart = false,
  isLowActivity = false,
  selectedEntityTitle,
  onSelectBook,
}) => {
  if (mode === "personalized") {
    if (isColdStart) {
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <h5 className="font-semibold text-amber-950">Cold-Start Fallback Active</h5>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                There is not enough personal rating history for personalized recommendations for this user.
                Displaying popular and highly rated books instead.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personalResults.map((res, idx) => (
              <RecommendationCard
                key={res.book.book_id}
                id={`rec-card-${res.book.book_id}`}
                result={res}
                rank={idx + 1}
                onSelectBook={onSelectBook}
              />
            ))}
          </div>
        </div>
      );
    }

    if (personalResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <Compass className="h-8 w-8 text-slate-400" />
          <h4 className="mt-2 text-sm font-semibold text-slate-800">No Recommendations Available</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Try relaxing the genre filter or lowering the minimum similarity threshold.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {isLowActivity && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2.5 text-xs text-blue-900">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            <span>
              Low Activity User: Personalized recommendations are combined with popular genre favorites to broaden results.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personalResults.map((res, idx) => (
            <RecommendationCard
              key={res.book.book_id}
              id={`rec-card-${res.book.book_id}`}
              result={res}
              rank={idx + 1}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      </div>
    );
  }

  // Similar books mode
  if (similarResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <Compass className="h-8 w-8 text-slate-400" />
        <h4 className="mt-2 text-sm font-semibold text-slate-800">No Similar Titles Found</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          This book might not have enough overlapping ratings with other titles yet. Try lowering the similarity threshold.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedEntityTitle && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs text-slate-500">
          <span>Books with highest rating-vector cosine similarity to: <strong className="text-slate-800 font-medium">"{selectedEntityTitle}"</strong></span>
          <span>{similarResults.length} matches found</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similarResults.map((res, idx) => (
          <SimilarBookCard
            key={res.book.book_id}
            id={`sim-card-${res.book.book_id}`}
            book={res.book}
            similarity={res.similarity}
            overlapCount={res.overlapUsersCount}
            rank={idx + 1}
            onSelectBook={onSelectBook}
          />
        ))}
      </div>
    </div>
  );
};
