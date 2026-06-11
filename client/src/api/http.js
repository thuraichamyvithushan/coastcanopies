const API_URL = import.meta.env.VITE_API_URL || "";

export const buildUrl = (path) => `${API_URL}${path}`;

export const request = async (path, options = {}) => {
  const { token, headers, ...rest } = options;

  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...rest
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
