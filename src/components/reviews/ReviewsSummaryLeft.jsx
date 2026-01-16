import React from "react";

// Summary aligned to the left with a CTA button to open write-review modal
const ReviewsSummaryLeft = ({
  ratingAverage = 0,
  ratingCount = 0,
  ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  onScrollToReviews,
  onOpenWriteReview,
  loading = false,
}) => {
  if (ratingCount === 0 && !loading) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 py-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {ratingAverage.toFixed(1)}
            </span>
            <div className="flex text-2xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.round(ratingAverage)
                      ? "text-blue-500"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <p className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              0 reseñas
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sé el primero en opinar sobre este producto
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="space-y-2 max-w-md">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalReviews = ratingCount;
  const breakdownWithPercentage = Object.entries(ratingBreakdown)
    .reverse()
    .map(([stars, count]) => ({
      stars: Number(stars),
      count,
      percentage:
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    }));

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-6">
      <div className="flex items-start mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {ratingAverage.toFixed(1)}
          </span>
          <div className="flex text-2xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.round(ratingAverage)
                    ? "text-blue-500"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>
          <p className="ml-3 text-sm text-gray-600 dark:text-gray-400">
            {totalReviews.toLocaleString("es-DO")}{" "}
            {totalReviews === 1 ? "reseña" : "reseñas"}
          </p>
        </div>
      </div>

      <div className="max-w-md mb-6">
        {breakdownWithPercentage.map(({ stars, percentage }) => (
          <div key={stars} className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1 w-20">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stars}
              </span>
              <span className="text-blue-500 text-sm">★</span>
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSummaryLeft;
