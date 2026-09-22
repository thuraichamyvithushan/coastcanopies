export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD"
  }).format(value || 0);
