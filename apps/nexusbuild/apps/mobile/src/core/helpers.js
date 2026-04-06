/**
 * 🧠 CORE HELPERS
 * 
 * Pure utility functions - no side effects, no external dependencies.
 * These can be used anywhere in the codebase.
 */

// ============================================
// FORMATTING
// ============================================

/**
 * Format a number as a price with currency symbol.
 * @param {number} value - The price value
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price string
 */
export const formatPrice = (value, currency = 'USD') => {
    if (value == null || isNaN(value)) return '$0.00';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Format a date for display.
 * @param {Date|string} date - The date to format
 * @param {string} style - 'short', 'medium', or 'long'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, style = 'medium') => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;

    const options = {
        short: { month: 'numeric', day: 'numeric' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };

    return d.toLocaleDateString('en-US', options[style] || options.medium);
};

/**
 * Format bytes to human readable size.
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string (e.g., "1.5 GB")
 */
export const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ============================================
// PART SPEC EXTRACTION
// ============================================

/**
 * Extract a specific spec value from a part object.
 * Handles both object and JSON string formats.
 * @param {object} part - The part object
 * @param {string} key - The spec key to extract
 * @returns {string|null} The spec value or null
 */
export const getSpec = (part, key) => {
    if (!part || !part.specs) return null;

    let specs = part.specs;

    // Handle JSON string format
    if (typeof specs === 'string') {
        try {
            specs = JSON.parse(specs);
        } catch (e) {
            return null;
        }
    }

    return specs[key] || null;
};

/**
 * Parse a numeric value from a spec string.
 * @param {string} value - String like "1000W" or "64GB"
 * @returns {number} The numeric value
 */
export const parseSpecNumber = (value) => {
    if (!value) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

/**
 * Extract RAM type (DDR4/DDR5) from a spec string.
 * @param {string} value - String like "DDR5-6000" or "32GB DDR4"
 * @returns {string|null} "DDR4", "DDR5", or null
 */
export const extractRamType = (value) => {
    if (!value) return null;
    if (value.includes('DDR5')) return 'DDR5';
    if (value.includes('DDR4')) return 'DDR4';
    return null;
};

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate a string to a maximum length with ellipsis.
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 50) => {
    if (!str || str.length <= maxLength) return str;
    return `${str.substring(0, maxLength - 3)}...`;
};

/**
 * Capitalize the first letter of a string.
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate a unique ID (for local use, not cryptographic).
 * @returns {string} Unique identifier
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check if a value is a valid email format.
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Check if a budget value is within valid range.
 * @param {number} budget - The budget value
 * @param {number} min - Minimum allowed (default: 300)
 * @param {number} max - Maximum allowed (default: 50000)
 * @returns {boolean} True if valid budget
 */
export const isValidBudget = (budget, min = 300, max = 50000) => {
    return budget >= min && budget <= max;
};

export default {
    formatPrice,
    formatDate,
    formatBytes,
    getSpec,
    parseSpecNumber,
    extractRamType,
    truncate,
    capitalize,
    generateId,
    isValidEmail,
    isValidBudget,
};
