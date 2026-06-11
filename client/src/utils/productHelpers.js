const fallbackPosition = { x: 470, y: 170, width: 310, height: 170 };

export const hasProductPositionForVehicle = (product, vehicleSlug) =>
  Boolean(vehicleSlug && product?.positions?.some((position) => position.vehicleSlug === vehicleSlug));

export const getProductPosition = (product, vehicleSlug) =>
  product?.positions?.find((position) => position.vehicleSlug === vehicleSlug) || fallbackPosition;
