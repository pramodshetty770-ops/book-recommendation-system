import React from "react";
import {
  BookOpen,
  Users,
  Star,
  Layers,
  BookmarkCheck,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DatasetState, EvaluationMetrics } from "../types";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { RatingDistributionChart } from "../components/RatingDistributionChart";
import { SimilarityChart } from "../components/SimilarityChart";
import { CoverageChart } from "../components/CoverageChart";
import {
  getMostRatedBooks,
  getHighestRatedBooks,
  getOverallRatingDistribution,
  getBookRatingCountDistribution,
} from "../utils/bookAnalysis";
import { getGenreAnalytics } from "../utils/genreAnalysis";
import { getUserActivityDistribution } from "../utils/userAnalysis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

interface DashboardProps {
  dataset: DatasetState;
  metrics: EvaluationMetrics | null;
  insights: string[];
  onNavigateToRecommendations: (userId?: string) => void;
  onNavigateToBookDetails: (bookId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  dataset,
  metrics,
  insights,
  onNavigateToRecommendations,
  onNavigateToBookDetails,
}) => {
  const ratingDistData = getOverallRatingDistribution(dataset);
  const genreData = getGenreAnalytics(dataset);
  const mostRated = getMostRatedBooks(dataset, 6);
  const highestRated = getHighestRatedBooks(dataset, 6, 3);
  const userActivity = getUserActivityDistribution(dataset);
  const ratingCountDist = getBookRatingCountDistribution(dataset);

  const topGenresByVolume = [...genreData].sort((a, b) => b.totalRatings - a.totalRatings).slice(0, 7);
  const topGenresByAvg = [...genreData].filter((g) => g.totalRatings >= 3).sort((a, b) => b.averageRating - a.averageRating).slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Dynamic Insights Highlights Bar */}
      {insights.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Dynamic Engine Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
            {insights.slice(0, 4).map((ins, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 Statistic Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          id="stat-total-books"
          title="Total Books"
          value={dataset.totalBooks.toLocaleString()}
          subtitle="Processed in catalog"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          id="stat-total-users"
          title="Total Users"
          value={dataset.totalUsers.toLocaleString()}
          subtitle="Active rating profiles"
          icon={Users}
          color="indigo"
        />
        <StatCard
          id="stat-total-ratings"
          title="Total Ratings"
          value={dataset.totalRatings.toLocaleString()}
          subtitle={`Scale: ${dataset.ratingScale.min}–${dataset.ratingScale.max} stars`}
          icon={Star}
          color="amber"
        />
        <StatCard
          id="stat-avg-rating"
          title="Average Book Rating"
          value={`${dataset.averageDatasetRating} ★`}
          subtitle="Across all reviews"
          icon={BookmarkCheck}
          color="emerald"
        />
        <StatCard
          id="stat-avg-per-user"
          title="Avg Ratings / User"
          value={dataset.avgRatingsPerUser}
          subtitle="Reader review density"
          icon={Activity}
          color="purple"
        />
        <StatCard
          id="stat-avg-per-book"
          title="Avg Ratings / Book"
          value={dataset.avgRatingsPerBook}
          subtitle="Co-occurrence support"
          icon={Layers}
          color="slate"
        />
        <StatCard
          id="stat-genres-count"
          title="Number of Genres"
          value={dataset.genres.length}
          subtitle="Category partitions"
          icon={TrendingUp}
          color="rose"
        />
        <StatCard
          id="stat-most-rated-book"
          title="Most Rated Book"
          value={dataset.mostRatedBook ? `${dataset.mostRatedBook.rating_count} ratings` : "None"}
          subtitle={dataset.mostRatedBook ? dataset.mostRatedBook.title.slice(0, 22) : "N/A"}
          icon={Award}
          color="blue"
        />
      </div>

      {/* Chart Grid Row 1: Rating Distribution & Genre Book Count */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          id="chart-rating-distribution"
          title="Rating Distribution"
          subtitle="Frequency breakdown of star ratings across the dataset"
        >
          <RatingDistributionChart data={ratingDistData} />
        </ChartCard>

        <ChartCard
          id="chart-genre-distribution"
          title="Genre/Category Distribution"
          subtitle="Number of unique book titles in each category"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={genreData.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis
                  dataKey="genre"
                  type="category"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  width={85}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(v: any) => [`${v} titles`, "Catalog Count"]}
                />
                <Bar dataKey="bookCount" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Chart Grid Row 2: Most Rated Books & Highest Rated Books */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          id="chart-most-rated-books"
          title="Most Rated Books"
          subtitle="Titles with the highest volume of community ratings"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mostRated.map((b) => ({
                  title: b.title.length > 18 ? b.title.slice(0, 18) + "…" : b.title,
                  fullName: b.title,
                  ratings: b.rating_count,
                  id: b.book_id,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
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
                  formatter={(val: any, name: any, item: any) => [
                    `${val} ratings`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="ratings" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          id="chart-highest-rated-books"
          title="Highest Rated Books"
          subtitle="Top scoring books meeting minimum threshold (≥ 3 ratings)"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={highestRated.map((b) => ({
                  title: b.title.length > 18 ? b.title.slice(0, 18) + "…" : b.title,
                  fullName: b.title,
                  avg: b.average_rating,
                  id: b.book_id,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  domain={[3.0, 5.0]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} ★`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="avg" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Chart Grid Row 3: Genre Average Rating & Popular Genres Volume */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          id="chart-avg-rating-by-genre"
          title="Average Rating by Genre"
          subtitle="Average score across genres with at least 3 ratings"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topGenresByAvg}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="genre"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis domain={[3.0, 5.0]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} ★`, "Average Rating"]}
                />
                <Bar dataKey="averageRating" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          id="chart-popular-genres"
          title="Popular Genres"
          subtitle="Genres commanding the highest cumulative rating engagement"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topGenresByVolume}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
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
                  formatter={(val: any) => [`${val} reviews`, "Total Activity"]}
                />
                <Bar dataKey="totalRatings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Chart Grid Row 4: User Rating Activity & Rating Count Distribution */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          id="chart-user-activity"
          title="User Rating Activity Distribution"
          subtitle="Number of users grouped by submitted review volume"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="activityRange" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} users`, "User Count"]}
                />
                <Bar dataKey="users" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          id="chart-rating-count-distribution"
          title="Rating Count Distribution per Book"
          subtitle="Catalog distribution based on total rating depth"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ratingCountDist}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} titles`, "Book Count"]}
                />
                <Bar dataKey="books" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Chart Grid Row 5: Similarity Distribution & Recommendation Coverage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          id="chart-similarity-distribution"
          title="Similarity Score Distribution"
          subtitle="Pairwise cosine similarity frequency across overlapping book vectors"
        >
          <SimilarityChart data={metrics?.similarityDistribution || []} />
        </ChartCard>

        <ChartCard
          id="chart-recommendation-coverage"
          title="Recommendation Coverage"
          subtitle="Proportion of the book catalog surfaced in recommendation candidates"
        >
          <CoverageChart
            coveragePercentage={metrics?.itemBased.catalogCoverage || 0}
            totalBooks={dataset.totalBooks}
          />
        </ChartCard>
      </div>
    </div>
  );
};
