import Papa from "papaparse";
import { Book, RatingRecord, DatasetState, UserStats } from "../types";

export interface ParseResult {
  dataset: DatasetState;
  errors: string[];
}

export function parseCSVString<T>(csvContent: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

export function processRawData(rawBooks: any[], rawRatings: any[]): ParseResult {
  const errors: string[] = [];

  if (!rawBooks || rawBooks.length === 0) {
    errors.push("Books dataset is empty or could not be loaded.");
  }
  if (!rawRatings || rawRatings.length === 0) {
    errors.push("Ratings dataset is empty or could not be loaded.");
  }

  // 1. Process books
  const bookMap = new Map<string, Book>();
  const validBooks: Book[] = [];

  rawBooks.forEach((row, idx) => {
    const rawId = row.book_id || row.bookId || row.id;
    const rawTitle = row.title;
    const rawAuthor = row.author;
    const rawGenre = row.genre || row.category || "Uncategorized";
    const rawYear = row.publication_year || row.year || row.pub_year;

    if (!rawId || !rawTitle) {
      // invalid book row
      return;
    }

    const bookId = String(rawId).trim();
    if (bookMap.has(bookId)) {
      // duplicate book ID, skip duplicate
      return;
    }

    const book: Book = {
      book_id: bookId,
      title: String(rawTitle).trim(),
      author: rawAuthor ? String(rawAuthor).trim() : "Unknown Author",
      genre: String(rawGenre).trim(),
      publication_year: Number(rawYear) || 2000,
      pages: row.pages ? Number(row.pages) : undefined,
      language: row.language ? String(row.language).trim() : "English",
      average_rating: 0,
      rating_count: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    bookMap.set(bookId, book);
    validBooks.push(book);
  });

  if (validBooks.length === 0) {
    errors.push("No valid book records could be processed.");
  }

  // 2. Process ratings
  const validRatings: RatingRecord[] = [];
  const userRatings = new Map<string, Map<string, number>>();
  const bookRatings = new Map<string, Map<string, number>>();
  const seenUserBookPairs = new Set<string>();

  let detectedMin = Infinity;
  let detectedMax = -Infinity;

  rawRatings.forEach((row) => {
    const rawUserId = row.user_id || row.userId || row.user;
    const rawBookId = row.book_id || row.bookId || row.book;
    const rawRating = row.rating || row.score;

    if (!rawUserId || !rawBookId || rawRating === undefined || rawRating === null) {
      return;
    }

    const userId = String(rawUserId).trim();
    const bookId = String(rawBookId).trim();
    const rating = Number(rawRating);

    // Validate rating is numeric and not NaN
    if (isNaN(rating) || rating < 0 || rating > 10) {
      return;
    }

    // Must refer to an existing book
    if (!bookMap.has(bookId)) {
      return;
    }

    // Detect duplicates: if same user rated same book twice, take the latest or ignore duplicate
    const pairKey = `${userId}::${bookId}`;
    if (seenUserBookPairs.has(pairKey)) {
      return;
    }
    seenUserBookPairs.add(pairKey);

    if (rating < detectedMin) detectedMin = rating;
    if (rating > detectedMax) detectedMax = rating;

    const record: RatingRecord = {
      user_id: userId,
      book_id: bookId,
      rating,
      timestamp: row.timestamp || Date.now(),
    };

    validRatings.push(record);

    // Build userRatings
    if (!userRatings.has(userId)) {
      userRatings.set(userId, new Map());
    }
    userRatings.get(userId)!.set(bookId, rating);

    // Build bookRatings
    if (!bookRatings.has(bookId)) {
      bookRatings.set(bookId, new Map());
    }
    bookRatings.get(bookId)!.set(userId, rating);
  });

  if (validRatings.length === 0) {
    errors.push("No valid rating records could be linked to existing books.");
  }

  // 3. Compute dynamic book stats (average_rating, rating_count, rating_distribution)
  let totalRatingSum = 0;
  let mostRatedBook: Book | null = null;
  let maxRatingCount = -1;

  validBooks.forEach((book) => {
    const ratingsForBook = bookRatings.get(book.book_id);
    if (ratingsForBook && ratingsForBook.size > 0) {
      let sum = 0;
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingsForBook.forEach((val) => {
        sum += val;
        totalRatingSum += val;
        const roundedBucket = Math.min(5, Math.max(1, Math.round(val)));
        dist[roundedBucket] = (dist[roundedBucket] || 0) + 1;
      });

      book.rating_count = ratingsForBook.size;
      book.average_rating = Number((sum / ratingsForBook.size).toFixed(2));
      book.rating_distribution = dist;

      if (book.rating_count > maxRatingCount) {
        maxRatingCount = book.rating_count;
        mostRatedBook = book;
      }
    } else {
      book.rating_count = 0;
      book.average_rating = 0;
      book.rating_distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  });

  // 4. Compute User stats
  const userMap = new Map<string, UserStats>();
  userRatings.forEach((ratingsMap, userId) => {
    let sum = 0;
    let high = -Infinity;
    let low = Infinity;
    const genreCount: Record<string, number> = {};
    const ratedBooksList: Array<{ book_id: string; rating: number; title: string; genre: string }> = [];

    ratingsMap.forEach((rating, bId) => {
      sum += rating;
      if (rating > high) high = rating;
      if (rating < low) low = rating;

      const bk = bookMap.get(bId);
      const genre = bk ? bk.genre : "Unknown";
      const title = bk ? bk.title : bId;

      genreCount[genre] = (genreCount[genre] || 0) + 1;
      ratedBooksList.push({ book_id: bId, rating, title, genre });
    });

    let favGenre = "Varied";
    let maxGCount = 0;
    Object.entries(genreCount).forEach(([g, count]) => {
      if (count > maxGCount) {
        maxGCount = count;
        favGenre = g;
      }
    });

    userMap.set(userId, {
      user_id: userId,
      rating_count: ratingsMap.size,
      average_rating: ratingsMap.size > 0 ? Number((sum / ratingsMap.size).toFixed(2)) : 0,
      highest_rating: high === -Infinity ? 0 : high,
      lowest_rating: low === Infinity ? 0 : low,
      favorite_genre: favGenre,
      rated_books: ratedBooksList.sort((a, b) => b.rating - a.rating),
      genre_distribution: genreCount,
    });
  });

  // Unique genres
  const genreSet = new Set<string>();
  validBooks.forEach((b) => genreSet.add(b.genre));
  const genres = Array.from(genreSet).sort();

  const ratingScale = {
    min: detectedMin === Infinity ? 1 : Math.floor(detectedMin),
    max: detectedMax === -Infinity ? 5 : Math.ceil(detectedMax),
    step: 0.5,
  };

  const totalRatings = validRatings.length;
  const totalBooks = validBooks.length;
  const totalUsers = userRatings.size;

  const dataset: DatasetState = {
    books: validBooks,
    ratings: validRatings,
    bookMap,
    userMap,
    userRatings,
    bookRatings,
    ratingScale,
    genres,
    totalBooks,
    totalUsers,
    totalRatings,
    averageDatasetRating: totalRatings > 0 ? Number((totalRatingSum / totalRatings).toFixed(2)) : 0,
    avgRatingsPerUser: totalUsers > 0 ? Number((totalRatings / totalUsers).toFixed(1)) : 0,
    avgRatingsPerBook: totalBooks > 0 ? Number((totalRatings / totalBooks).toFixed(1)) : 0,
    mostRatedBook,
  };

  return { dataset, errors };
}
