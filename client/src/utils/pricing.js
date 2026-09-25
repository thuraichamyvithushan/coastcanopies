export const formatNzd = (value) =>
  new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD"
  }).format(Number(value) || 0);

export const calculateOptionalExtras = (accessories, selectedIds) =>
  accessories
    .filter((item) => !item.included && selectedIds.includes(item.id))
    .reduce((total, item) => total + Number(item.price || 0), 0);

export const calculateGrandTotal = (vehiclePrice, selectedProductsTotal) =>
  Number(vehiclePrice || 0) + Number(selectedProductsTotal || 0);
