import { Book, DatasetState, RecommendationResult } from "../types";
import { calculateUserCosineSimilarity } from "./cosineSimilarity";

export interface UserBasedOptions {
  minSimilarity?: number;
  topN?: number;
  genreFilter?: string;
  minOverlap?: number;
}

/**
 * Generates personalized recommendations for a user using User-Based Collaborative Filtering.
 */
export function getUserBasedRecommendations(
  userId: string,
  dataset: DatasetState,
  options: UserBasedOptions = {}
): RecommendationResult[] {
  const { minSimilarity = 0.05, topN = 10, genreFilter = "ALL", minOverlap = 1 } = options;

  const targetUserRatings = dataset.userRatings.get(userId);
  const targetUserStats = dataset.userMap.get(userId);

  if (!targetUserRatings || targetUserRatings.size === 0 || !targetUserStats) {
    return [];
  }

  const targetAvg = targetUserStats.average_rating;

  // Calculate similarity between target user and all other users
  const similarUsers: Array<{
    userId: string;
    similarity: number;
    avgRating: number;
    ratings: Map<string, number>;
  }> = [];

  dataset.userRatings.forEach((ratings, otherUserId) => {
    if (otherUserId === userId) return;

    const { similarity } = calculateUserCosineSimilarity(
      userId,
      otherUserId,
      dataset.userRatings,
      minOverlap
    );

    if (similarity >= minSimilarity) {
      const otherStats = dataset.userMap.get(otherUserId);
      similarUsers.push({
        userId: otherUserId,
        similarity,
        avgRating: otherStats ? otherStats.average_rating : 3.5,
        ratings,
      });
    }
  });

  if (similarUsers.length === 0) {
    return [];
  }

  // Aggregate candidate book scores
  const candidateMap = new Map<
    string,
    { numerator: number; denominator: number; highestSimUser: string; bestUserRating: number }
  >();

  dataset.books.forEach((book) => {
    // Exclude books already rated
    if (targetUserRatings.has(book.book_id)) return;

    // Genre filter
    if (genreFilter !== "ALL" && book.genre !== genreFilter) return;

    let numerator = 0;
    let denominator = 0;
    let highestSim = -1;
    let highestSimUser = "";
    let bestUserRating = 0;

    similarUsers.forEach((u) => {
      const r = u.ratings.get(book.book_id);
      if (r !== undefined) {
        numerator += u.similarity * (r - u.avgRating);
        denominator += Math.abs(u.similarity);

        if (u.similarity > highestSim) {
          highestSim = u.similarity;
          highestSimUser = u.userId;
          bestUserRating = r;
        }
      }
    });

    if (denominator > 0) {
      candidateMap.set(book.book_id, {
        numerator,
        denominator,
        highestSimUser,
        bestUserRating,
      });
    }
  });

  const results: RecommendationResult[] = [];

  candidateMap.forEach((data, bookId) => {
    const book = dataset.bookMap.get(bookId);
    if (!book) return;

    const predictedRating = Math.max(
      dataset.ratingScale.min,
      Math.min(dataset.ratingScale.max, targetAvg + data.numerator / data.denominator)
    );

    const normalizedScore = Number(
      Math.min(1.0, Math.max(0, predictedRating / dataset.ratingScale.max)).toFixed(2)
    );

    const explanation = `Recommended via peer collaborative filtering; users with reading profiles matching yours (e.g. ${data.highestSimUser}) gave this a high rating (${data.bestUserRating}★).`;

    results.push({
      book,
      score: Number(predictedRating.toFixed(2)),
      normalizedScore,
      explanation,
      isColdStartFallback: false,
    });
  });

  results.sort((a, b) => b.score - a.score || b.book.average_rating - a.book.average_rating);

  return results.slice(0, topN);
}
