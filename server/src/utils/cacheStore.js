const cache = new Map();

export const getCacheValue = (key) => {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

export const setCacheValue = (key, value, ttlMs = 60_000) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
};

export const clearCacheValue = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};
