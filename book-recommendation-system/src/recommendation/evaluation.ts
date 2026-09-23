import { DatasetState, EvaluationMetrics, Book } from "../types";
import { calculateBookCosineSimilarity } from "./cosineSimilarity";
import { getItemBasedRecommendations } from "./itemBasedCF";
import { getUserBasedRecommendations } from "./userBasedCF";

/**
 * Performs offline recommendation evaluation using hold-out testing.
 * Runs across users with sufficient rating count (>= 4 ratings).
 */
export function runOfflineEvaluation(dataset: DatasetState): EvaluationMetrics {
  // Find users eligible for hold-out evaluation (at least 4 ratings, at least one rating >= 3.5)
  const eligibleUsers: Array<{
    userId: string;
    heldOutBookId: string;
    heldOutRating: number;
    trainRatingsMap: Map<string, number>;
  }> = [];

  dataset.userRatings.forEach((ratingsMap, userId) => {
    if (ratingsMap.size >= 4) {
      // Find a highly-rated book to hold out
      const positiveEntries = Array.from(ratingsMap.entries()).filter(([_, r]) => r >= 3.5);
      if (positiveEntries.length > 0) {
        // Pick the last positive entry as held out
        const [heldOutBookId, heldOutRating] = positiveEntries[positiveEntries.length - 1];

        const trainMap = new Map<string, number>();
        ratingsMap.forEach((r, bId) => {
          if (bId !== heldOutBookId) {
            trainMap.set(bId, r);
          }
        });

        eligibleUsers.push({
          userId,
          heldOutBookId,
          heldOutRating,
          trainRatingsMap: trainMap,
        });
      }
    }
  });

  const evalUsers = eligibleUsers.slice(0, 30); // evaluate on up to 30 eligible users for responsiveness
  const eligibleCount = evalUsers.length;

  if (eligibleCount === 0) {
    return {
      itemBased: {
        precision5: 0,
        recall5: 0,
        hitRate5: 0,
        precision10: 0,
        recall10: 0,
        hitRate10: 0,
        precision20: 0,
        recall20: 0,
        hitRate20: 0,
        catalogCoverage: 0,
      },
      userBased: {
        precision5: 0,
        recall5: 0,
        hitRate5: 0,
        precision10: 0,
        recall10: 0,
        hitRate10: 0,
        precision20: 0,
        recall20: 0,
        hitRate20: 0,
        catalogCoverage: 0,
      },
      eligibleUsersCount: 0,
      testSetSize: 0,
      similarityDistribution: [],
    };
  }

  // Helper to evaluate a specific method
  const evaluateMethod = (method: "item-based" | "user-based") => {
    let hits5 = 0;
    let hits10 = 0;
    let hits20 = 0;
    const recommendedBookIds = new Set<string>();

    evalUsers.forEach((testCase) => {
      // Create temporary dataset view with trainRatings for this user
      const tempUserRatings = new Map(dataset.userRatings);
      tempUserRatings.set(testCase.userId, testCase.trainRatingsMap);

      // Also adjust bookRatings temporarily
      const tempBookRatings = new Map<string, Map<string, number>>();
      dataset.bookRatings.forEach((uMap, bId) => {
        const copyMap = new Map(uMap);
        if (bId === testCase.heldOutBookId) {
          copyMap.delete(testCase.userId);
        }
        tempBookRatings.set(bId, copyMap);
      });

      const tempDataset: DatasetState = {
        ...dataset,
        userRatings: tempUserRatings,
        bookRatings: tempBookRatings,
      };

      const topRecs =
        method === "item-based"
          ? getItemBasedRecommendations(testCase.userId, tempDataset, { topN: 20 })
          : getUserBasedRecommendations(testCase.userId, tempDataset, { topN: 20 });

      const top20Ids = topRecs.map((r) => r.book.book_id);
      top20Ids.forEach((id) => recommendedBookIds.add(id));

      const top5Ids = top20Ids.slice(0, 5);
      const top10Ids = top20Ids.slice(0, 10);

      if (top5Ids.includes(testCase.heldOutBookId)) hits5++;
      if (top10Ids.includes(testCase.heldOutBookId)) hits10++;
      if (top20Ids.includes(testCase.heldOutBookId)) hits20++;
    });

    const hitRate5 = hits5 / eligibleCount;
    const hitRate10 = hits10 / eligibleCount;
    const hitRate20 = hits20 / eligibleCount;

    // Precision@K: hits / (K * eligibleCount)
    const precision5 = hits5 / (5 * eligibleCount);
    const precision10 = hits10 / (10 * eligibleCount);
    const precision20 = hits20 / (20 * eligibleCount);

    // Recall@K: each user has 1 held-out item, so recall = hits / eligibleCount = hitRate
    const recall5 = hitRate5;
    const recall10 = hitRate10;
    const recall20 = hitRate20;

    const catalogCoverage =
      dataset.books.length > 0 ? (recommendedBookIds.size / dataset.books.length) * 100 : 0;

    return {
      precision5: Number(precision5.toFixed(4)),
      recall5: Number(recall5.toFixed(4)),
      hitRate5: Number((hitRate5 * 100).toFixed(1)),
      precision10: Number(precision10.toFixed(4)),
      recall10: Number(recall10.toFixed(4)),
      hitRate10: Number((hitRate10 * 100).toFixed(1)),
      precision20: Number(precision20.toFixed(4)),
      recall20: Number(recall20.toFixed(4)),
      hitRate20: Number((hitRate20 * 100).toFixed(1)),
      catalogCoverage: Number(catalogCoverage.toFixed(1)),
    };
  };

  const itemBasedResults = evaluateMethod("item-based");
  const userBasedResults = evaluateMethod("user-based");

  // Calculate similarity distribution across pairs of books that share at least 1 user
  const bins = [
    { range: "0.0 - 0.2", count: 0, min: 0, max: 0.2 },
    { range: "0.2 - 0.4", count: 0, min: 0.2, max: 0.4 },
    { range: "0.4 - 0.6", count: 0, min: 0.4, max: 0.6 },
    { range: "0.6 - 0.8", count: 0, min: 0.6, max: 0.8 },
    { range: "0.8 - 1.0", count: 0, min: 0.8, max: 1.01 },
  ];

  let totalPairsWithOverlap = 0;
  const books = dataset.books;
  for (let i = 0; i < books.length; i++) {
    for (let j = i + 1; j < books.length; j++) {
      const { similarity, overlap } = calculateBookCosineSimilarity(
        books[i].book_id,
        books[j].book_id,
        dataset.bookRatings,
        1
      );
      if (overlap > 0 && similarity > 0) {
        totalPairsWithOverlap++;
        const targetBin = bins.find((b) => similarity >= b.min && similarity < b.max);
        if (targetBin) {
          targetBin.count++;
        }
      }
    }
  }

  const similarityDistribution = bins.map((b) => ({
    range: b.range,
    count: b.count,
    percentage:
      totalPairsWithOverlap > 0 ? Number(((b.count / totalPairsWithOverlap) * 100).toFixed(1)) : 0,
  }));

  return {
    itemBased: itemBasedResults,
    userBased: userBasedResults,
    eligibleUsersCount: eligibleCount,
    testSetSize: eligibleCount,
    similarityDistribution,
  };
}
