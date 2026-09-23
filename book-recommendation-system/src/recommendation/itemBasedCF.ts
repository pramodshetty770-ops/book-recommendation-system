import { Book, DatasetState, RecommendationResult } from "../types";
import { calculateBookCosineSimilarity } from "./cosineSimilarity";

export interface ItemBasedOptions {
  minSimilarity?: number;
  topN?: number;
  genreFilter?: string;
  minOverlap?: number;
}

/**
 * Generates personalized recommendations for a user using Item-Based Collaborative Filtering.
 */
export function getItemBasedRecommendations(
  userId: string,
  dataset: DatasetState,
  options: ItemBasedOptions = {}
): RecommendationResult[] {
  const { minSimilarity = 0.05, topN = 10, genreFilter = "ALL", minOverlap = 1 } = options;

  const userRatedMap = dataset.userRatings.get(userId);
  if (!userRatedMap || userRatedMap.size === 0) {
    return [];
  }

  // Get books rated positively (or all rated books)
  const ratedBookEntries = Array.from(userRatedMap.entries()).filter(([_, rating]) => rating >= 2.5);
  if (ratedBookEntries.length === 0) {
    return [];
  }

  const candidateScores = new Map<
    string,
    {
      numerator: number;
      denominator: number;
      bestSupporting: { book_id: string; title: string; userRating: number; similarity: number };
    }
  >();

  // Compare each unrated book with each rated book
  dataset.books.forEach((book) => {
    // Exclude books already rated by the user
    if (userRatedMap.has(book.book_id)) {
      return;
    }

    // Genre filter
    if (genreFilter !== "ALL" && book.genre !== genreFilter) {
      return;
    }

    let numerator = 0;
    let denominator = 0;
    let bestSim = -1;
    let bestSupporting: { book_id: string; title: string; userRating: number; similarity: number } | null = null;

    ratedBookEntries.forEach(([ratedBookId, userRating]) => {
      const { similarity, overlap } = calculateBookCosineSimilarity(
        book.book_id,
        ratedBookId,
        dataset.bookRatings,
        minOverlap
      );

      if (similarity > 0) {
        numerator += similarity * userRating;
        denominator += similarity;

        if (similarity > bestSim) {
          bestSim = similarity;
          const ratedBookObj = dataset.bookMap.get(ratedBookId);
          bestSupporting = {
            book_id: ratedBookId,
            title: ratedBookObj?.title || ratedBookId,
            userRating,
            similarity,
          };
        }
      }
    });

    if (denominator > 0 && bestSim >= minSimilarity && bestSupporting) {
      candidateScores.set(book.book_id, {
        numerator,
        denominator,
        bestSupporting,
      });
    }
  });

  const results: RecommendationResult[] = [];

  candidateScores.forEach((data, bookId) => {
    const book = dataset.bookMap.get(bookId);
    if (!book) return;

    const predictedRating = data.numerator / data.denominator;
    // Normalize to 0 - 1 score (based on rating max scale 5)
    const normalizedScore = Number(Math.min(1.0, Math.max(0, predictedRating / dataset.ratingScale.max)).toFixed(2));

    const explanation = `Recommended because of high similarity (${(data.bestSupporting.similarity * 100).toFixed(0)}%) to "${data.bestSupporting.title}" which you rated ${data.bestSupporting.userRating}★.`;

    results.push({
      book,
      score: Number(predictedRating.toFixed(2)),
      normalizedScore,
      explanation,
      supportingBook: data.bestSupporting,
      isColdStartFallback: false,
    });
  });

  // Sort by predicted rating / score descending
  results.sort((a, b) => b.score - a.score || b.book.average_rating - a.book.average_rating);

  return results.slice(0, topN);
}

/**
 * Finds similar books for a selected book using Item-Based Cosine Similarity.
 */
export function getSimilarBooks(
  bookId: string,
  dataset: DatasetState,
  topN: number = 10,
  minSimilarity: number = 0.05,
  genreFilter: string = "ALL"
): Array<{ book: Book; similarity: number; overlapUsersCount: number }> {
  const targetBook = dataset.bookMap.get(bookId);
  if (!targetBook) return [];

  const results: Array<{ book: Book; similarity: number; overlapUsersCount: number }> = [];

  dataset.books.forEach((candidate) => {
    if (candidate.book_id === bookId) return;

    if (genreFilter !== "ALL" && candidate.genre !== genreFilter) return;

    const { similarity, overlap } = calculateBookCosineSimilarity(
      bookId,
      candidate.book_id,
      dataset.bookRatings,
      1
    );

    if (similarity >= minSimilarity) {
      results.push({
        book: candidate,
        similarity,
        overlapUsersCount: overlap,
      });
    }
  });

  results.sort((a, b) => b.similarity - a.similarity || b.overlapUsersCount - a.overlapUsersCount);

  return results.slice(0, topN);
}
