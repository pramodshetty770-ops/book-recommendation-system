import React from "react";
import { Star, BookOpen, GitCompare } from "lucide-react";
import { Book } from "../types";

interface SimilarBookCardProps {
  id: string;
  book: Book;
  similarity: number;
  overlapCount: number;
  rank: number;
  onSelectBook?: (bookId: string) => void;
}

export const SimilarBookCard: React.FC<SimilarBookCardProps> = ({
  id,
  book,
  similarity,
  overlapCount,
  rank,
  onSelectBook,
}) => {
  return (
    <div
      id={id}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              {rank}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {book.genre}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <GitCompare className="h-3 w-3 text-emerald-600" />
            <span>{(similarity * 100).toFixed(0)}% Similar</span>
          </div>
        </div>

        <div className="mt-3">
          <h4
            className="cursor-pointer font-serif text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
            onClick={() => onSelectBook?.(book.book_id)}
          >
            {book.title}
          </h4>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{book.author}</p>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1 font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{book.average_rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span>{book.rating_count} total ratings</span>
          <span className="text-slate-300">•</span>
          <span>{overlapCount} common users</span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
          Calculated via cosine similarity across co-rated reading vectors with {overlapCount} overlapping reviewer{overlapCount > 1 ? "s" : ""}.
        </div>

        {onSelectBook && (
          <button
            id={`inspect-sim-${book.book_id}`}
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
