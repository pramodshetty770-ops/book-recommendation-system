import { Book, DatasetState, RecommendationResult } from "../types";
import { getItemBasedRecommendations, getSimilarBooks } from "./itemBasedCF";
import { getUserBasedRecommendations } from "./userBasedCF";

export interface EngineRecommendationOptions {
  method?: "item-based" | "user-based";
  minSimilarity?: number;
  topN?: number;
  genreFilter?: string;
  minOverlap?: number;
}

/**
 * Computes popular and highest-rated fallback books (Bayesian or weighted rating).
 */
export function getPopularFallbackBooks(
  dataset: DatasetState,
  topN: number = 10,
  genreFilter: string = "ALL",
  excludedBookIds: Set<string> = new Set()
): RecommendationResult[] {
  // Global average rating
  const C = dataset.averageDatasetRating || 4.0;
  const m = 2; // minimum votes weight

  const eligibleBooks = dataset.books.filter((b) => {
    if (excludedBookIds.has(b.book_id)) return false;
    if (genreFilter !== "ALL" && b.genre !== genreFilter) return false;
    return true;
  });

  const scored = eligibleBooks.map((b) => {
    const v = b.rating_count;
    const R = b.average_rating;
    // Bayesian weighted score: (v / (v + m)) * R + (m / (v + m)) * C
    const bayesianScore = (v / (v + m)) * R + (m / (v + m)) * C;
    const normalizedScore = Number(Math.min(1.0, Math.max(0, bayesianScore / dataset.ratingScale.max)).toFixed(2));

    return {
      book: b,
      score: Number(bayesianScore.toFixed(2)),
      normalizedScore,
      explanation: `Popularity fallback: Community favorite with an average of ${b.average_rating}★ across ${b.rating_count} ratings.`,
      isColdStartFallback: true,
    };
  });

  scored.sort((a, b) => b.score - a.score || b.book.rating_count - a.book.rating_count);
  return scored.slice(0, topN);
}

/**
 * Main recommendation generator with automatic cold-start handling and explanation synthesis.
 */
export function generateUserRecommendations(
  userId: string,
  dataset: DatasetState,
  options: EngineRecommendationOptions = {}
): {
  recommendations: RecommendationResult[];
  isColdStart: boolean;
  isLowActivity: boolean;
  userRatingCount: number;
} {
  const {
    method = "item-based",
    minSimilarity = 0.05,
    topN = 10,
    genreFilter = "ALL",
    minOverlap = 1,
  } = options;

  const userStats = dataset.userMap.get(userId);
  const ratingCount = userStats ? userStats.rating_count : 0;
  const userRatingsMap = dataset.userRatings.get(userId);
  const excluded = new Set<string>(userRatingsMap ? Array.from(userRatingsMap.keys()) : []);

  // Cold Start Case 1: Zero ratings
  if (ratingCount === 0) {
    const fallback = getPopularFallbackBooks(dataset, topN, genreFilter, excluded);
    return {
      recommendations: fallback,
      isColdStart: true,
      isLowActivity: false,
      userRatingCount: 0,
    };
  }

  // Attempt collaborative filtering
  let recs: RecommendationResult[] = [];
  if (method === "item-based") {
    recs = getItemBasedRecommendations(userId, dataset, {
      minSimilarity,
      topN,
      genreFilter,
      minOverlap,
    });
  } else {
    recs = getUserBasedRecommendations(userId, dataset, {
      minSimilarity,
      topN,
      genreFilter,
      minOverlap,
    });
  }

  const isLowActivity = ratingCount > 0 && ratingCount < 3;

  // If CF yielded fewer recommendations than requested and user is low activity or strict threshold
  if (recs.length < topN) {
    const existingIds = new Set([...Array.from(excluded), ...recs.map((r) => r.book.book_id)]);
    const fillCount = topN - recs.length;
    const fillers = getPopularFallbackBooks(dataset, fillCount, genreFilter, existingIds);

    // Modify explanation to indicate hybrid filling
    fillers.forEach((f) => {
      f.explanation = `Catalog highlight: High community reception (${f.book.average_rating}★) to broaden your initial recommendations.`;
      recs.push(f);
    });
  }

  return {
    recommendations: recs.slice(0, topN),
    isColdStart: false,
    isLowActivity,
    userRatingCount: ratingCount,
  };
}

export { getSimilarBooks };
