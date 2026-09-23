import { DatasetState, UserStats } from "../types";

/**
 * Returns most active users ranked by rating count.
 */
export function getMostActiveUsers(dataset: DatasetState, limit: number = 10): UserStats[] {
  return Array.from(dataset.userMap.values())
    .sort((a, b) => b.rating_count - a.rating_count)
    .slice(0, limit);
}

/**
 * Calculates user activity distribution (how many users have 1-3 ratings, 4-7, 8-12, 13+ ratings).
 */
export function getUserActivityDistribution(dataset: DatasetState) {
  const bins = [
    { label: "1-3 ratings", min: 1, max: 3, users: 0 },
    { label: "4-7 ratings", min: 4, max: 7, users: 0 },
    { label: "8-12 ratings", min: 8, max: 12, users: 0 },
    { label: "13+ ratings", min: 13, max: 9999, users: 0 },
  ];

  dataset.userMap.forEach((u) => {
    const bin = bins.find((b) => u.rating_count >= b.min && u.rating_count <= b.max);
    if (bin) {
      bin.users++;
    }
  });

  return bins.map((b) => ({ activityRange: b.label, users: b.users }));
}
