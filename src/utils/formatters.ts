/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string from GitHub API
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate the fork-to-star ratio of a repository
 * @param stars Number of stargazers
 * @param forks Number of forks
 * @returns The calculated ratio
 */
export const calculateForkToStarRatio = (stars: number, forks: number): number => {
  return forks / (stars || 1);
};

/**
 * Format a number for display (e.g. 1000 -> 1k)
 * @param num The number to format
 * @returns Formatted number as a string
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

/**
 * Calculate time difference in days between two dates
 * @param date1 First date
 * @param date2 Second date (defaults to current date)
 * @returns Number of days between dates
 */
export const daysBetween = (date1: Date, date2: Date = new Date()): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate a percentage safely
 * @param value The numerator
 * @param total The denominator
 * @param defaultValue The value to return if total is 0
 * @returns The calculated percentage or defaultValue if total is 0
 */
export const safePercentage = (value: number, total: number, defaultValue: number = 0): number => {
  if (total === 0) return defaultValue;
  return (value / total) * 100;
}; 