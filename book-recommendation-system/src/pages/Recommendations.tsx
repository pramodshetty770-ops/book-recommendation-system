import React, { useState, useMemo } from "react";
import { DatasetState, UserStats } from "../types";
import { RecommendationMode } from "../components/RecommendationMode";
import { UserSelector } from "../components/UserSelector";
import { BookSelector } from "../components/BookSelector";
import { RecommendationList } from "../components/RecommendationList";
import { generateUserRecommendations, getSimilarBooks } from "../recommendation/recommendationEngine";
import { Filter, SlidersHorizontal, BookOpen, Star, RefreshCw } from "lucide-react";

interface RecommendationsProps {
  dataset: DatasetState;
  selectedUserId: string;
  selectedBookId: string;
  onSelectUserId: (id: string) => void;
  onSelectBookId: (id: string) => void;
  onInspectBookDetails: (bookId: string) => void;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  dataset,
  selectedUserId,
  selectedBookId,
  onSelectUserId,
  onSelectBookId,
  onInspectBookDetails,
}) => {
  const [mode, setMode] = useState<"personalized" | "similar">("personalized");
  const [topN, setTopN] = useState<number>(10);
  const [genreFilter, setGenreFilter] = useState<string>("ALL");
  const [minSimilarity, setMinSimilarity] = useState<number>(0.05);
  const [method, setMethod] = useState<"item-based" | "user-based">("item-based");

  // Users sorted with active readers first
  const usersList = useMemo(() => {
    return (Array.from(dataset.userMap.values()) as UserStats[]).sort(
      (a: UserStats, b: UserStats) => b.rating_count - a.rating_count
    );
  }, [dataset]);

  // Selected User Object
  const currentUser = dataset.userMap.get(selectedUserId) || usersList[0];

  // Selected Book Object
  const currentBook = dataset.bookMap.get(selectedBookId) || dataset.books[0];

  // Compute Personalized Recommendations
  const personalRecs = useMemo(() => {
    if (!currentUser) return { recommendations: [], isColdStart: true, isLowActivity: false, userRatingCount: 0 };
    return generateUserRecommendations(currentUser.user_id, dataset, {
      method,
      topN,
      genreFilter,
      minSimilarity,
    });
  }, [currentUser, dataset, method, topN, genreFilter, minSimilarity]);

  // Compute Similar Books
  const similarRecs = useMemo(() => {
    if (!currentBook) return [];
    return getSimilarBooks(currentBook.book_id, dataset, topN, minSimilarity, genreFilter);
  }, [currentBook, dataset, topN, minSimilarity, genreFilter]);

  return (
    <div className="space-y-6">
      {/* Top Mode Segmented Switcher */}
      <div className="max-w-md mx-auto sm:mx-0">
        <RecommendationMode mode={mode} onChangeMode={setMode} />
      </div>

      {/* Control Panel Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Primary Selector: User or Book */}
          <div className="lg:col-span-1">
            {mode === "personalized" ? (
              <UserSelector
                users={usersList}
                selectedUserId={currentUser ? currentUser.user_id : ""}
                onSelectUser={onSelectUserId}
              />
            ) : (
              <BookSelector
                books={dataset.books}
                selectedBookId={currentBook ? currentBook.book_id : ""}
                onSelectBook={onSelectBookId}
              />
            )}
          </div>

          {/* Controls: Top N & Genre Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Top Recommendations
              </label>
              <select
                id="select-top-n"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value={5}>Top 5 Books</option>
                <option value={10}>Top 10 Books</option>
                <option value={15}>Top 15 Books</option>
                <option value={20}>Top 20 Books</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Genre Filter
              </label>
              <select
                id="select-genre-filter"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="ALL">All Genres ({dataset.genres.length})</option>
                {dataset.genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls: Min Similarity & Algorithm Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Min Similarity
              </label>
              <select
                id="select-min-similarity"
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value={0.01}>0.01 (Broadest)</option>
                <option value={0.05}>0.05 (Standard)</option>
                <option value={0.15}>0.15 (Moderate)</option>
                <option value={0.30}>0.30 (Strict)</option>
              </select>
            </div>

            {mode === "personalized" ? (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  CF Approach
                </label>
                <select
                  id="select-cf-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="item-based">Item-Based CF</option>
                  <option value="user-based">User-Based CF</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Metric
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 font-medium truncate">
                  Cosine Similarity
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Context Summary Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
          {mode === "personalized" && currentUser ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Active Profile:</span>
              <span>{currentUser.user_id}</span>
              <span className="text-slate-300">•</span>
              <span>{currentUser.rating_count} recorded ratings</span>
              <span className="text-slate-300">•</span>
              <span>Prefers {currentUser.favorite_genre}</span>
            </div>
          ) : currentBook ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Reference Title:</span>
              <span className="font-medium text-slate-800">{currentBook.title}</span>
              <span className="text-slate-300">•</span>
              <span>by {currentBook.author} ({currentBook.genre})</span>
            </div>
          ) : null}

          <div className="text-[11px] text-slate-400">
            {mode === "personalized" ? `Method: ${method === "item-based" ? "Item-Based CF" : "User-Based CF"}` : "Calculated via shared reader vectors"}
          </div>
        </div>
      </div>

      {/* Recommendations Results List */}
      <RecommendationList
        mode={mode}
        personalResults={personalRecs.recommendations}
        similarResults={similarRecs}
        isColdStart={personalRecs.isColdStart}
        isLowActivity={personalRecs.isLowActivity}
        selectedEntityTitle={mode === "similar" ? currentBook?.title : undefined}
        onSelectBook={onInspectBookDetails}
      />
    </div>
  );
};
