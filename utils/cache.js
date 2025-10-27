// utils/cache.js

const getToday = () => new Date().toISOString().split('T')[0];

/**
 * Sets a value in localStorage with today's timestamp.
 */
export const set = (key, data) => {
    const today = getToday();
    const item = { timestamp: today, data };
    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
};

/**
 * Gets a value from localStorage if it was stored today.
 * If the item is stale or doesn't exist, it returns null.
 */
export const get = (key) => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }

        const item = JSON.parse(itemStr);
        const today = getToday();

        if (item.timestamp === today) {
            return item.data;
        } else {
            // Item is stale, remove it
            localStorage.removeItem(key);
            return null;
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return null;
    }
};

/**
 * Removes all items from localStorage that start with a given prefix.
 * Used to invalidate related caches at once.
 */
export const invalidate = (prefix) => {
     try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error("Error invalidating cache", error);
    }
};
