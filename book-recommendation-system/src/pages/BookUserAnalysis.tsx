import React, { useState, useMemo } from "react";
import { DatasetState, Book, UserStats } from "../types";
import { BookTable } from "../components/BookTable";
import { UserTable } from "../components/UserTable";
import { BookDetails } from "../components/BookDetails";
import { UserDetails } from "../components/UserDetails";
import { ChartCard } from "../components/ChartCard";
import { getGenreAnalytics } from "../utils/genreAnalysis";
import { getAuthorAnalytics } from "../utils/bookAnalysis";
import { getMostActiveUsers } from "../utils/userAnalysis";
import { BookOpen, Users, Tags, Feather, UserCheck, Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface BookUserAnalysisProps {
  dataset: DatasetState;
  onNavigateToRecommendations: (userId: string) => void;
  inspectedBookId?: string | null;
  onCloseInspectedBook?: () => void;
  onInspectBook?: (bookId: string) => void;
}

export const BookUserAnalysis: React.FC<BookUserAnalysisProps> = ({
  dataset,
  onNavigateToRecommendations,
  inspectedBookId,
  onCloseInspectedBook,
  onInspectBook,
}) => {
  const [activeTab, setActiveTab] = useState<"books" | "users" | "genres" | "authors">("books");
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserStats | null>(null);

  const activeInspectedBook = useMemo(() => {
    if (!inspectedBookId) return null;
    return dataset.bookMap.get(inspectedBookId) || null;
  }, [inspectedBookId, dataset]);

  const genreStats = useMemo(() => getGenreAnalytics(dataset), [dataset]);
  const authorStats = useMemo(() => getAuthorAnalytics(dataset, 2), [dataset]);
  const usersList = useMemo(() => Array.from(dataset.userMap.values()), [dataset]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          id="tab-book-explorer"
          onClick={() => setActiveTab("books")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "books"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Book Explorer ({dataset.totalBooks})</span>
        </button>

        <button
          id="tab-user-explorer"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Explorer ({dataset.totalUsers})</span>
        </button>

        <button
          id="tab-genre-analysis"
          onClick={() => setActiveTab("genres")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "genres"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Tags className="h-3.5 w-3.5" />
          <span>Genre Analysis</span>
        </button>

        <button
          id="tab-author-analysis"
          onClick={() => setActiveTab("authors")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "authors"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Feather className="h-3.5 w-3.5" />
          <span>Author Analysis</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "books" && (
        <div className="space-y-4">
          <BookTable
            books={dataset.books}
            genres={dataset.genres}
            onSelectBook={(id) => onInspectBook?.(id)}
          />
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <UserTable
            users={usersList}
            onSelectUser={(userId) => {
              const u = dataset.userMap.get(userId);
              if (u) setSelectedUserForModal(u);
            }}
          />
        </div>
      )}

      {activeTab === "genres" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              id="chart-genre-book-count"
              title="Catalog Composition by Genre"
              subtitle="Total unique titles classified within each literary category"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="genre"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                      formatter={(v: any) => [`${v} titles`, "Book Count"]}
                    />
                    <Bar dataKey="bookCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              id="chart-genre-rating-activity"
              title="Genre Popularity (Total Rating Volume)"
              subtitle="Cumulative reader engagement across all book genres"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreStats} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="genre"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                      formatter={(v: any) => [`${v} reviews`, "Total Ratings"]}
                    />
                    <Bar dataKey="totalRatings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Genre Summary Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Comprehensive Genre Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Genre / Category</th>
                    <th className="px-4 py-3 text-right">Catalog Books</th>
                    <th className="px-4 py-3 text-right">Total Reviews</th>
                    <th className="px-4 py-3 text-right">Average Rating</th>
                    <th className="px-4 py-3 text-right">Review Intensity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {genreStats.map((g) => (
                    <tr key={g.genre} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{g.genre}</td>
                      <td className="px-4 py-3 text-right font-mono">{g.bookCount}</td>
                      <td className="px-4 py-3 text-right font-mono">{g.totalRatings}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {g.averageRating.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {(g.totalRatings / (g.bookCount || 1)).toFixed(1)} reviews/book
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "authors" && (
        <div className="space-y-6">
          <ChartCard
            id="chart-top-authors"
            title="Top Authors by Total Rating Volume"
            subtitle="Authors receiving the greatest cumulative reader feedback"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={authorStats.slice(0, 10)}
                  margin={{ top: 10, right: 10, left: -10, bottom: 35 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="author"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} reviews (Avg: ${item.payload.averageRating}★)`,
                      item.payload.author,
                    ]}
                  />
                  <Bar dataKey="totalRatings" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Author table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Author Statistics (≥ 2 Total Ratings)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Author Name</th>
                    <th className="px-4 py-3 text-right">Books in Catalog</th>
                    <th className="px-4 py-3 text-right">Total Reviews</th>
                    <th className="px-4 py-3 text-right">Mean Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {authorStats.map((a) => (
                    <tr key={a.author} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{a.author}</td>
                      <td className="px-4 py-3 text-right font-mono">{a.bookCount}</td>
                      <td className="px-4 py-3 text-right font-mono">{a.totalRatings}</td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-600">
                        {a.averageRating.toFixed(2)} ★
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {activeInspectedBook && (
        <BookDetails
          book={activeInspectedBook}
          dataset={dataset}
          onClose={() => onCloseInspectedBook?.()}
          onSelectBook={(bId) => onInspectBook?.(bId)}
        />
      )}

      {/* User Detail Modal */}
      {selectedUserForModal && (
        <UserDetails
          user={selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onGenerateRecommendations={(uId) => {
            setSelectedUserForModal(null);
            onNavigateToRecommendations(uId);
          }}
        />
      )}
    </div>
  );
};
