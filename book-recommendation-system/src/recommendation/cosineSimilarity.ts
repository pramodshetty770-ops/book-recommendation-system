/**
 * Cosine Similarity implementation for Item-Based and User-Based Collaborative Filtering.
 * Follows the PRD requirement:
 * - Only considers common ratings (unrated items are NOT treated as 0).
 * - Implements minimum overlap checks.
 * - Applies shrinkage/damping to prevent false strong similarities from small overlaps.
 */

export interface SimilarityResult {
  similarity: number;
  overlap: number;
}

/**
 * Calculates cosine similarity between two books based on user ratings.
 * @param bookId1 First book ID
 * @param bookId2 Second book ID
 * @param bookRatings Map of bookId -> Map of userId -> rating
 * @param minOverlap Minimum required overlapping users (default 1)
 */
export function calculateBookCosineSimilarity(
  bookId1: string,
  bookId2: string,
  bookRatings: Map<string, Map<string, number>>,
  minOverlap: number = 1
): SimilarityResult {
  if (bookId1 === bookId2) {
    return { similarity: 1.0, overlap: 0 };
  }

  const ratings1 = bookRatings.get(bookId1);
  const ratings2 = bookRatings.get(bookId2);

  if (!ratings1 || !ratings2 || ratings1.size === 0 || ratings2.size === 0) {
    return { similarity: 0, overlap: 0 };
  }

  // Find common users who rated both books
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  let overlap = 0;

  ratings1.forEach((r1, userId) => {
    const r2 = ratings2.get(userId);
    if (r2 !== undefined) {
      dotProduct += r1 * r2;
      norm1 += r1 * r1;
      norm2 += r2 * r2;
      overlap++;
    }
  });

  if (overlap < minOverlap || norm1 === 0 || norm2 === 0) {
    return { similarity: 0, overlap };
  }

  const rawSim = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));

  // Shrinkage damping for small overlaps (if overlap is 1 or 2, dampen to avoid spurious 1.0)
  const damping = Math.min(1.0, overlap / 2.5);
  const similarity = Math.max(0, Math.min(1.0, rawSim * damping));

  return {
    similarity: Number(similarity.toFixed(4)),
    overlap,
  };
}

/**
 * Calculates cosine similarity between two users based on book ratings.
 * @param userId1 First user ID
 * @param userId2 Second user ID
 * @param userRatings Map of userId -> Map of bookId -> rating
 * @param minOverlap Minimum required overlapping books (default 1)
 */
export function calculateUserCosineSimilarity(
  userId1: string,
  userId2: string,
  userRatings: Map<string, Map<string, number>>,
  minOverlap: number = 1
): SimilarityResult {
  if (userId1 === userId2) {
    return { similarity: 1.0, overlap: 0 };
  }

  const ratings1 = userRatings.get(userId1);
  const ratings2 = userRatings.get(userId2);

  if (!ratings1 || !ratings2 || ratings1.size === 0 || ratings2.size === 0) {
    return { similarity: 0, overlap: 0 };
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  let overlap = 0;

  ratings1.forEach((r1, bookId) => {
    const r2 = ratings2.get(bookId);
    if (r2 !== undefined) {
      dotProduct += r1 * r2;
      norm1 += r1 * r1;
      norm2 += r2 * r2;
      overlap++;
    }
  });

  if (overlap < minOverlap || norm1 === 0 || norm2 === 0) {
    return { similarity: 0, overlap };
  }

  const rawSim = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  const damping = Math.min(1.0, overlap / 2.5);
  const similarity = Math.max(0, Math.min(1.0, rawSim * damping));

  return {
    similarity: Number(similarity.toFixed(4)),
    overlap,
  };
}
