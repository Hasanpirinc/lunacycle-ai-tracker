// utils/cache.ts

const getToday = (): string => new Date().toISOString().split('T')[0];

interface CacheItem<T> {
    timestamp: string;
    data: T;
}

/**
 * Sets a value in localStorage with today's timestamp.
 */
export const set = <T>(key: string, data: T): void => {
    const today = getToday();
    const item: CacheItem<T> = { timestamp: today, data };
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
export const get = <T>(key: string): T | null => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }

        const item: CacheItem<T> = JSON.parse(itemStr);
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
export const invalidate = (prefix: string): void => {
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
