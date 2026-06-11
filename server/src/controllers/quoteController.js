import { Product } from "../models/Product.js";
import { Quote } from "../models/Quote.js";
import { Vehicle } from "../models/Vehicle.js";
import { sendQuoteNotification } from "../utils/mailer.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const snapshotItem = (item) => ({
  referenceId: item._id,
  name: item.name,
  slug: item.slug,
  price: item.price,
  svg: item.svg || item.svgBase || ""
});

const validateCustomerInfo = (customerInfo) => {
  const { name, email, phone, address } = customerInfo || {};

  if (!name || !email || !phone || !address) {
    throw new ApiError(400, "Customer info requires name, email, phone, and address");
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    address: address.trim(),
    notes: customerInfo.notes?.trim() || ""
  };
};

const productSupportsVehicle = (product, vehicleSlug) =>
  product?.positions?.some((position) => position.vehicleSlug === vehicleSlug);

export const createQuote = asyncHandler(async (req, res) => {
  const { vehicleId, baseSystemId, moduleIds = [], accessoryIds = [], customerInfo } = req.body;

  if (!vehicleId || !baseSystemId) {
    throw new ApiError(400, "Vehicle and base system are required");
  }

  const [vehicle, baseSystem, modules, accessories] = await Promise.all([
    Vehicle.findById(vehicleId),
    Product.findOne({ _id: baseSystemId, type: "canopy" }),
    Product.find({ _id: { $in: moduleIds }, type: "module" }),
    Product.find({ _id: { $in: accessoryIds }, type: "accessory" })
  ]);

  if (!vehicle) {
    throw new ApiError(404, "Selected vehicle was not found");
  }

  if (!baseSystem) {
    throw new ApiError(404, "Selected base system was not found");
  }

  if (!productSupportsVehicle(baseSystem, vehicle.slug)) {
    throw new ApiError(400, `${baseSystem.name} is not available for the selected vehicle`);
  }

  if (modules.length !== moduleIds.length) {
    throw new ApiError(400, "One or more selected modules are invalid");
  }

  const incompatibleModule = modules.find((item) => !productSupportsVehicle(item, vehicle.slug));

  if (incompatibleModule) {
    throw new ApiError(400, `${incompatibleModule.name} is not available for the selected vehicle`);
  }

  if (accessories.length !== accessoryIds.length) {
    throw new ApiError(400, "One or more selected accessories are invalid");
  }

  const incompatibleAccessory = accessories.find((item) => !productSupportsVehicle(item, vehicle.slug));

  if (incompatibleAccessory) {
    throw new ApiError(400, `${incompatibleAccessory.name} is not available for the selected vehicle`);
  }

  const totalPrice =
    vehicle.price +
    baseSystem.price +
    modules.reduce((sum, item) => sum + item.price, 0) +
    accessories.reduce((sum, item) => sum + item.price, 0);

  const quote = await Quote.create({
    vehicle: snapshotItem(vehicle),
    baseSystem: snapshotItem(baseSystem),
    modules: modules.map(snapshotItem),
    accessories: accessories.map(snapshotItem),
    totalPrice,
    customerInfo: validateCustomerInfo(customerInfo)
  });

  await sendQuoteNotification(quote).catch(() => false);

  res.status(201).json({
    message: "Quote request submitted successfully",
    quoteId: quote._id
  });
});

export const getQuotes = asyncHandler(async (_req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  res.json(quotes);
});

export const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["new", "reviewed", "quoted", "closed"];

  if (!allowed.includes(status)) {
    throw new ApiError(400, "Invalid quote status");
  }

  const quote = await Quote.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  res.json(quote);
});
