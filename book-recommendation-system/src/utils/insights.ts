import { DatasetState, EvaluationMetrics } from "../types";
import { getGenreAnalytics } from "./genreAnalysis";
import { getMostActiveUsers } from "./userAnalysis";

/**
 * Dynamically synthesizes real insights strictly calculated from the dataset state and evaluation metrics.
 */
export function generateDynamicInsights(
  dataset: DatasetState,
  metrics?: EvaluationMetrics | null
): string[] {
  const insights: string[] = [];

  // 1. Dataset scale
  insights.push(
    `The catalog contains ${dataset.totalBooks.toLocaleString()} unique books across ${dataset.genres.length} genres and ${dataset.totalUsers.toLocaleString()} active rating contributors.`
  );

  // 2. Ratings volume & density
  insights.push(
    `A total of ${dataset.totalRatings.toLocaleString()} ratings have been processed, with an overall catalog rating mean of ${dataset.averageDatasetRating}★ on a ${dataset.ratingScale.min}–${dataset.ratingScale.max} scale.`
  );

  // 3. Most rated book
  if (dataset.mostRatedBook) {
    insights.push(
      `The most widely reviewed title is "${dataset.mostRatedBook.title}" by ${dataset.mostRatedBook.author}, accumulating ${dataset.mostRatedBook.rating_count} community ratings (average ${dataset.mostRatedBook.average_rating}★).`
    );
  }

  // 4. Most active user
  const mostActive = getMostActiveUsers(dataset, 1)[0];
  if (mostActive) {
    insights.push(
      `User ${mostActive.user_id} is the most active reader with ${mostActive.rating_count} logged ratings, averaging ${mostActive.average_rating}★ with an affinity for ${mostActive.favorite_genre}.`
    );
  }

  // 5. Most popular genre
  const genreStats = getGenreAnalytics(dataset);
  if (genreStats.length > 0) {
    const topGenre = genreStats[0];
    insights.push(
      `The most popular genre by total rating activity is ${topGenre.genre}, accounting for ${topGenre.totalRatings} ratings across ${topGenre.bookCount} books with an average score of ${topGenre.averageRating}★.`
    );
  }

  // 6. Recommendation evaluation insight
  if (metrics && metrics.eligibleUsersCount > 0) {
    const itemHit10 = metrics.itemBased.hitRate10;
    const userHit10 = metrics.userBased.hitRate10;
    const superiorMethod = itemHit10 >= userHit10 ? "Item-Based CF" : "User-Based CF";
    const bestHit = Math.max(itemHit10, userHit10);

    insights.push(
      `Offline leave-one-out evaluation across ${metrics.eligibleUsersCount} test users reveals a peak Hit Rate@10 of ${bestHit}% achieved by ${superiorMethod}, with a catalog coverage of ${metrics.itemBased.catalogCoverage}%.`
    );
  }

  return insights;
}
