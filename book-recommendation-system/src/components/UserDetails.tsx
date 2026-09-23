import React from "react";
import { X, Star, User, Sparkles, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import { UserStats } from "../types";

interface UserDetailsProps {
  user: UserStats;
  onClose: () => void;
  onGenerateRecommendations: (userId: string) => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  onClose,
  onGenerateRecommendations,
}) => {
  const topRated = user.rated_books.filter((b) => b.rating >= 4.0).slice(0, 4);
  const lowestRated = [...user.rated_books].reverse().filter((b) => b.rating <= 3.5).slice(0, 3);

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

        {/* Top Header */}
        <div className="flex items-start gap-4 pr-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-base">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-slate-900">User {user.user_id}</h3>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Prefers {user.favorite_genre}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Reader profile with {user.rating_count} recorded ratings across the catalog.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Average Rating Given</div>
            <div className="mt-1 flex items-center gap-1 text-lg font-bold text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{user.average_rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Books Rated</div>
            <div className="mt-1 text-lg font-bold text-slate-800">{user.rating_count}</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] text-slate-500">Rating Span</div>
            <div className="mt-1 text-lg font-bold text-slate-800">
              {user.lowest_rating}★ – {user.highest_rating}★
            </div>
          </div>
        </div>

        {/* Genre Preference Distribution */}
        <div className="mt-5 rounded-xl border border-slate-200/70 bg-slate-50/40 p-4">
          <h4 className="text-xs font-semibold text-slate-800">Genre Reading Distribution</h4>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {Object.entries(user.genre_distribution).map(([genre, count]) => (
              <div
                key={genre}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs"
              >
                <span className="font-medium text-slate-700">{genre}:</span>
                <span className="font-semibold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest and Lowest Rated Books */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Top Liked */}
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Highest Rated by User</span>
            </div>
            <div className="mt-2.5 space-y-2">
              {topRated.length === 0 ? (
                <div className="text-xs text-slate-400">No high ratings found.</div>
              ) : (
                topRated.map((b) => (
                  <div key={b.book_id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 truncate pr-2 max-w-[170px]">{b.title}</span>
                    <span className="font-semibold text-amber-600 shrink-0">{b.rating}★</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lowest Liked */}
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ThumbsDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Lowest Rated / Critical</span>
            </div>
            <div className="mt-2.5 space-y-2">
              {lowestRated.length === 0 ? (
                <div className="text-xs text-slate-400">No critical ratings found.</div>
              ) : (
                lowestRated.map((b) => (
                  <div key={b.book_id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 truncate pr-2 max-w-[170px]">{b.title}</span>
                    <span className="font-semibold text-slate-500 shrink-0">{b.rating}★</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGenerateRecommendations(user.user_id);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Recommendations for {user.user_id}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
