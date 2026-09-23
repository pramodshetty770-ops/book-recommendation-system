import { Book, DatasetState } from "../types";

export interface AuthorStats {
  author: string;
  bookCount: number;
  totalRatings: number;
  averageRating: number;
}

/**
 * Returns books with the highest rating count.
 */
export function getMostRatedBooks(dataset: DatasetState, limit: number = 10): Book[] {
  return [...dataset.books]
    .sort((a, b) => b.rating_count - a.rating_count)
    .slice(0, limit);
}

/**
 * Returns highest rated books with a minimum rating count threshold to avoid 1-vote anomalies.
 */
export function getHighestRatedBooks(
  dataset: DatasetState,
  limit: number = 10,
  minRatings: number = 3
): Book[] {
  const filtered = dataset.books.filter((b) => b.rating_count >= minRatings);
  return filtered
    .sort((a, b) => b.average_rating - a.average_rating || b.rating_count - a.rating_count)
    .slice(0, limit);
}

/**
 * Analyzes authors across the dataset: count, ratings, average rating.
 */
export function getAuthorAnalytics(dataset: DatasetState, minRatingsThreshold: number = 2): AuthorStats[] {
  const authorMap = new Map<string, { bookCount: number; totalRatings: number; weightedRatingSum: number }>();

  dataset.books.forEach((book) => {
    const a = book.author || "Unknown";
    const current = authorMap.get(a) || { bookCount: 0, totalRatings: 0, weightedRatingSum: 0 };
    current.bookCount += 1;
    current.totalRatings += book.rating_count;
    current.weightedRatingSum += book.average_rating * book.rating_count;
    authorMap.set(a, current);
  });

  const list: AuthorStats[] = [];
  authorMap.forEach((val, author) => {
    const avg = val.totalRatings > 0 ? Number((val.weightedRatingSum / val.totalRatings).toFixed(2)) : 0;
    list.push({
      author,
      bookCount: val.bookCount,
      totalRatings: val.totalRatings,
      averageRating: avg,
    });
  });

  return list
    .filter((a) => a.totalRatings >= minRatingsThreshold)
    .sort((a, b) => b.totalRatings - a.totalRatings);
}

/**
 * Rating distribution across all ratings in the dataset.
 */
export function getOverallRatingDistribution(dataset: DatasetState) {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dataset.ratings.forEach((r) => {
    const bucket = Math.min(5, Math.max(1, Math.round(r.rating)));
    counts[bucket] = (counts[bucket] || 0) + 1;
  });

  return [
    { stars: "1 Star", count: counts[1], score: 1 },
    { stars: "2 Stars", count: counts[2], score: 2 },
    { stars: "3 Stars", count: counts[3], score: 3 },
    { stars: "4 Stars", count: counts[4], score: 4 },
    { stars: "5 Stars", count: counts[5], score: 5 },
  ];
}

/**
 * Distribution of rating counts per book (e.g. 1-2 ratings, 3-5, 6-10, 11+).
 */
export function getBookRatingCountDistribution(dataset: DatasetState) {
  const bins = [
    { label: "1-2 ratings", min: 1, max: 2, count: 0 },
    { label: "3-5 ratings", min: 3, max: 5, count: 0 },
    { label: "6-10 ratings", min: 6, max: 10, count: 0 },
    { label: "11+ ratings", min: 11, max: 9999, count: 0 },
  ];

  dataset.books.forEach((b) => {
    const bin = bins.find((bn) => b.rating_count >= bn.min && b.rating_count <= bn.max);
    if (bin) bin.count++;
  });

  return bins.map((b) => ({ range: b.label, books: b.count }));
}
