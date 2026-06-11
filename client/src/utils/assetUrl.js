import { buildUrl } from "../api/http.js";

const absoluteUrlPattern = /^(?:[a-z]+:)?\/\//i;

export const resolveAssetUrl = (value) => {
  if (!value) {
    return "";
  }

  if (absoluteUrlPattern.test(value) || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return buildUrl(value);
  }

  return value;
};
