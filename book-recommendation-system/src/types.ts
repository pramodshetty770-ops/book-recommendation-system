export interface Book {
  book_id: string;
  title: string;
  author: string;
  genre: string;
  publication_year: number;
  pages?: number;
  language?: string;
  average_rating: number;
  rating_count: number;
  rating_distribution?: Record<number, number>;
}

export interface RatingRecord {
  user_id: string;
  book_id: string;
  rating: number;
  timestamp?: number | string;
}

export interface UserStats {
  user_id: string;
  rating_count: number;
  average_rating: number;
  highest_rating: number;
  lowest_rating: number;
  favorite_genre: string;
  rated_books: Array<{ book_id: string; rating: number; title: string; genre: string }>;
  genre_distribution: Record<string, number>;
}

export interface DatasetState {
  books: Book[];
  ratings: RatingRecord[];
  bookMap: Map<string, Book>;
  userMap: Map<string, UserStats>;
  userRatings: Map<string, Map<string, number>>; // userId -> (bookId -> rating)
  bookRatings: Map<string, Map<string, number>>; // bookId -> (userId -> rating)
  ratingScale: { min: number; max: number; step: number };
  genres: string[];
  totalBooks: number;
  totalUsers: number;
  totalRatings: number;
  averageDatasetRating: number;
  avgRatingsPerUser: number;
  avgRatingsPerBook: number;
  mostRatedBook: Book | null;
}

export interface SimilarBookResult {
  book: Book;
  similarity: number;
  overlapUsersCount: number;
}

export interface RecommendationResult {
  book: Book;
  score: number;
  normalizedScore: number;
  explanation: string;
  supportingBook?: {
    book_id: string;
    title: string;
    userRating: number;
    similarity: number;
  };
  isColdStartFallback?: boolean;
}

export interface EvaluationMetrics {
  itemBased: {
    precision5: number;
    recall5: number;
    hitRate5: number;
    precision10: number;
    recall10: number;
    hitRate10: number;
    precision20: number;
    recall20: number;
    hitRate20: number;
    catalogCoverage: number;
  };
  userBased: {
    precision5: number;
    recall5: number;
    hitRate5: number;
    precision10: number;
    recall10: number;
    hitRate10: number;
    precision20: number;
    recall20: number;
    hitRate20: number;
    catalogCoverage: number;
  };
  eligibleUsersCount: number;
  testSetSize: number;
  similarityDistribution: Array<{ range: string; count: number; percentage: number }>;
}
