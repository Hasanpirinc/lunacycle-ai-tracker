const getToday = () => new Date().toISOString().split('T')[0];

export const set = (key, data) => {
    const today = getToday();
    const item = { timestamp: today, data };
    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
};

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
            localStorage.removeItem(key);
            return null;
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return null;
    }
};

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