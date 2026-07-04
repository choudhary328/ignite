const API_BASE = 'http://localhost:5000';

/**
 * Resolve an event image URL.
 * - Full URLs (http/https) are returned as-is.
 * - Relative paths like /uploads/... are prefixed with the backend base URL.
 * - Falsy values return the provided fallback or a placeholder.
 */
export const getImageUrl = (imageUrl, fallback) => {
    if (!imageUrl) return fallback || '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${API_BASE}${imageUrl}`;
    return `${API_BASE}/${imageUrl}`;
};
