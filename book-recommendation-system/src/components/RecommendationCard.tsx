import React from "react";
import { Star, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { RecommendationResult } from "../types";

interface RecommendationCardProps {
  id: string;
  result: RecommendationResult;
  rank: number;
  onSelectBook?: (bookId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  result,
  rank,
  onSelectBook,
}) => {
  const { book, normalizedScore, score, explanation, isColdStartFallback } = result;

  return (
    <div
      id={id}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div>
        {/* Top badge row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {rank}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {book.genre}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span>Score: {normalizedScore.toFixed(2)}</span>
          </div>
        </div>

        {/* Title & Author */}
        <div className="mt-3">
          <h4
            className="cursor-pointer font-serif text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
            onClick={() => onSelectBook?.(book.book_id)}
          >
            {book.title}
          </h4>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{book.author}</p>
        </div>

        {/* Rating and Year stats */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1 font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{book.average_rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span>{book.rating_count} ratings</span>
          {book.publication_year && (
            <>
              <span className="text-slate-300">•</span>
              <span>{book.publication_year}</span>
            </>
          )}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div
          className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
            isColdStartFallback
              ? "bg-amber-50/80 text-amber-800"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          <CheckCircle2
            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
              isColdStartFallback ? "text-amber-600" : "text-emerald-600"
            }`}
          />
          <p className="leading-relaxed">{explanation}</p>
        </div>

        {onSelectBook && (
          <button
            id={`inspect-${book.book_id}`}
            onClick={() => onSelectBook(book.book_id)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Inspect Book Details</span>
          </button>
        )}
      </div>
    </div>
  );
};
