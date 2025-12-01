// import { formatInTimeZone } from 'date-fns-tz';

// const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert UTC date to IST Date object
 */
export function toIST(date: Date): Date {
  // This keeps it as a Date object with IST time baked in
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
}

/**
 * Format a date in IST as a string
 */
// export function formatIST(date: Date, formatStr = 'yyyy-MM-dd HH:mm:ss'): string {
//   return formatInTimeZone(date, IST_TIMEZONE, formatStr);
// }

/**
 * Get current IST date as a Date object
 */
export function getCurrentISTDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000) - now.getTimezoneOffset() * 60 * 1000);
}

// export function getCurrentISTDate(): Date {
//   const now = new Date();
//   // Get string in IST, then parse back into Date
//   const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//   return new Date(istString);
// }