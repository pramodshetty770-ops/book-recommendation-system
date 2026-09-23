import React from "react";
import { X, Star, Calendar, Bookmark, BookOpen, Layers, Users } from "lucide-react";
import { Book, DatasetState } from "../types";
import { getSimilarBooks } from "../recommendation/itemBasedCF";

interface BookDetailsProps {
  book: Book;
  dataset: DatasetState;
  onClose: () => void;
  onSelectBook: (bookId: string) => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({
  book,
  dataset,
  onClose,
  onSelectBook,
}) => {
  const similar = getSimilarBooks(book.book_id, dataset, 5, 0.05);

  // Compute popularity rank among all books by rating count
  const sortedByPopularity = [...dataset.books].sort((a, b) => b.rating_count - a.rating_count);
  const popularityRank = sortedByPopularity.findIndex((b) => b.book_id === book.book_id) + 1;

  const dist = book.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalInDist: number =
    Number(Object.values(dist).reduce((acc: number, val: any) => acc + Number(val || 0), 0)) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Info */}
        <div className="flex items-start gap-4 pr-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400 font-semibold">{book.book_id}</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {book.genre}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                Rank #{popularityRank} of {dataset.totalBooks}
              </span>
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">{book.title}</h3>
            <p className="text-xs font-medium text-slate-500">By {book.author}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Average Rating</div>
            <div className="mt-1 flex items-center gap-1 text-lg font-bold text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{book.average_rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Total Ratings</div>
            <div className="mt-1 flex items-center gap-1 text-lg font-bold text-slate-800">
              <Users className="h-4 w-4 text-slate-400" />
              <span>{book.rating_count}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Published</div>
            <div className="mt-1 flex items-center gap-1 text-lg font-bold text-slate-800">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{book.publication_year || "—"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Pages / Format</div>
            <div className="mt-1 flex items-center gap-1 text-lg font-bold text-slate-800">
              <Layers className="h-4 w-4 text-slate-400" />
              <span>{book.pages ? `${book.pages} p.` : book.language || "Standard"}</span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="mt-5 rounded-xl border border-slate-200/70 bg-slate-50/40 p-4">
          <h4 className="text-xs font-semibold text-slate-800">Rating Distribution</h4>
          <div className="mt-2 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = Number((dist as any)[stars] || 0);
              const pct = Math.round((count / (totalInDist || 1)) * 100);
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-600 font-medium">{stars} Star{stars > 1 ? "s" : ""}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500 font-mono text-[11px]">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Similar Books */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-slate-800">
            Top Similar Books (Collaborative Cosine Similarity)
          </h4>
          <div className="mt-2.5 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {similar.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No overlapping ratings with other books yet.
              </div>
            ) : (
              similar.map((s) => (
                <div
                  key={s.book.book_id}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{s.book.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {s.book.author} • {s.book.genre}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {(s.similarity * 100).toFixed(0)}% sim
                    </span>
                    <button
                      onClick={() => onSelectBook(s.book.book_id)}
                      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
