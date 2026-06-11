import { request } from "./http.js";

export const loginAdmin = (payload) =>
  request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const fetchVehicles = () => request("/api/vehicles");
export const fetchProducts = () => request("/api/products");
export const fetchQuotes = (token) =>
  request("/api/admin/quotes", {
    token
  });

export const uploadVehicleAsset = (token, payload) =>
  request("/api/admin/uploads/vehicle-assets", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

export const createVehicle = (token, payload) =>
  request("/api/admin/vehicles", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

export const updateVehicle = (token, id, payload) =>
  request(`/api/admin/vehicles/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });

export const deleteVehicle = (token, id) =>
  request(`/api/admin/vehicles/${id}`, {
    method: "DELETE",
    token
  });

export const createProduct = (token, payload) =>
  request("/api/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

export const updateProduct = (token, id, payload) =>
  request(`/api/admin/products/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });

export const deleteProduct = (token, id) =>
  request(`/api/admin/products/${id}`, {
    method: "DELETE",
    token
  });

export const updateQuoteStatus = (token, id, status) =>
  request(`/api/admin/quotes/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status })
  });

export const submitQuote = (payload) =>
  request("/api/quotes", {
    method: "POST",
    body: JSON.stringify(payload)
  });
