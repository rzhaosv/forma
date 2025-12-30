/**
 * Utility functions for handling dates in local time.
 * This ensures that "today" is always calculated based on the user's local midnight.
 */

/**
 * Returns the current date in YYYY-MM-DD format based on local time.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Returns an ISO timestamp adjusted or representing local time for consistent logging.
 */
export const getLocalTimestamp = (date: Date = new Date()): string => {
    return date.toISOString();
};

/**
 * Checks if a given timestamp represents "today" in local time.
 */
export const isToday = (timestamp: string): boolean => {
    const today = getLocalDateString();
    const dateStr = getLocalDateString(new Date(timestamp));
    return today === dateStr;
};
/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Checks if a given Date object represents "today" in local time.
 */
export const isDateToday = (date: Date): boolean => {
    return getLocalDateString(date) === getLocalDateString(new Date());
};

/**
 * Checks if a given Date object represents "yesterday" in local time.
 */
export const isDateYesterday = (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDateString(date) === getLocalDateString(yesterday);
};
