/**
 * Relative-time formatter, extracted from the copy that was duplicated in
 * ActivityTimeline, Studio, and DashboardJobs.
 *
 * Accepts an ISO string, a Date, or a Unix timestamp (seconds or ms) and
 * degrades to 'Recently' on anything unparseable.
 *
 * @param {string|number|Date} value
 * @returns {string}
 */
export function timeAgo(value) {
  if (!value) return 'Recently';

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    // Unix seconds vs milliseconds: anything below ~10^12 is seconds.
    date = new Date(value < 1e12 ? value * 1000 : value);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
