import { DatasetState } from "../types";

export interface GenreAnalytics {
  genre: string;
  bookCount: number;
  totalRatings: number;
  averageRating: number;
}

/**
 * Computes comprehensive genre-level distribution, rating volume, and average score.
 */
export function getGenreAnalytics(dataset: DatasetState): GenreAnalytics[] {
  const genreMap = new Map<
    string,
    {
      bookCount: number;
      totalRatings: number;
      weightedRatingSum: number;
    }
  >();

  dataset.books.forEach((b) => {
    const g = b.genre || "Uncategorized";
    const cur = genreMap.get(g) || { bookCount: 0, totalRatings: 0, weightedRatingSum: 0 };
    cur.bookCount += 1;
    cur.totalRatings += b.rating_count;
    cur.weightedRatingSum += b.average_rating * b.rating_count;
    genreMap.set(g, cur);
  });

  const list: GenreAnalytics[] = [];
  genreMap.forEach((val, genre) => {
    const avg = val.totalRatings > 0 ? Number((val.weightedRatingSum / val.totalRatings).toFixed(2)) : 0;
    list.push({
      genre,
      bookCount: val.bookCount,
      totalRatings: val.totalRatings,
      averageRating: avg,
    });
  });

  return list.sort((a, b) => b.totalRatings - a.totalRatings);
}
