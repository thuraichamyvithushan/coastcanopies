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

  const contentType = response.headers.get("content-type") || "";
  const isJsonResponse = contentType.includes("application/json");
  const data = isJsonResponse ? await response.json().catch(() => ({})) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  if (!isJsonResponse) {
    throw new Error(
      `Expected JSON from ${buildUrl(path)}. Check VITE_API_URL and Vercel routing.`
    );
  }

  return data;
};
