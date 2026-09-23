import { useMemo, useState } from "react";
import { productConfig } from "../config/productConfig.js";
import { calculateGrandTotal, calculateOptionalExtras } from "../utils/pricing.js";

export const useConfigurator = (accessories = [], vehicles = []) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeCategory, setCategory] = useState("Vehicle");
  const [rooftopTentState, setRooftopTentState] = useState("closed");
  const [awningState, setAwningState] = useState("closed");
  const [focusedAccessoryId, setFocusedAccessoryId] = useState("");
  const [cameraResetKey, setCameraResetKey] = useState(0);

  const selectedVehicle = vehicles.find((item) => String(item._id) === selectedVehicleId) || null;
  const canopies = accessories.filter((item) => item.adminProduct?.type === "canopy");
  const selectedCanopy = canopies.find((item) => selectedIds.includes(item.id)) || null;
  const canAccessCategory = (category) =>
    category === "Vehicle" ||
    (category === "Canopy" ? Boolean(selectedVehicle) : Boolean(selectedVehicle && selectedCanopy));
  const setActiveCategory = (category) => {
    if (canAccessCategory(category)) setCategory(category);
  };
  const selectVehicle = (vehicle) => {
    if (String(vehicle._id) !== selectedVehicleId) {
      setSelectedVehicleId(String(vehicle._id));
      setSelectedIds([]);
      setFocusedAccessoryId("");
      setRooftopTentState("closed");
      setAwningState("closed");
      setCameraResetKey((value) => value + 1);
    }
    setCategory("Canopy");
  };
  const selectCanopy = (canopy) => {
    if (!selectedVehicle || !canopies.some((item) => item.id === canopy.id)) return;
    if (selectedCanopy?.id !== canopy.id) {
      setSelectedIds([canopy.id]);
      setFocusedAccessoryId("");
      setRooftopTentState("closed");
      setAwningState("closed");
    }
    setCategory("Accessories");
  };

  const optionalExtras = useMemo(
    () => calculateOptionalExtras(accessories, selectedIds),
    [accessories, selectedIds]
  );
  const grandTotal = calculateGrandTotal(productConfig.basePrice, optionalExtras);
  const selectedOptionalExtras = accessories.filter(
    (item) => !item.included && selectedIds.includes(item.id)
  );

  const toggleAccessory = (accessory) => {
    if (!selectedVehicle || !selectedCanopy || accessory.included || accessory.adminProduct?.type === "canopy") return;

    setSelectedIds((current) =>
      current.includes(accessory.id)
        ? current.filter((id) => id !== accessory.id)
        : [...current, accessory.id]
    );
  };

  const resetBuild = () => {
    setSelectedVehicleId("");
    setSelectedIds([]);
    setCategory("Vehicle");
    setRooftopTentState("closed");
    setAwningState("closed");
    setFocusedAccessoryId("");
    setCameraResetKey((value) => value + 1);
  };

  return {
    activeCategory,
    accessories,
    vehicles,
    canopies,
    selectedVehicle,
    selectedCanopy,
    selectVehicle,
    selectCanopy,
    canAccessCategory,
    awningState,
    cameraResetKey,
    focusedAccessoryId,
    grandTotal,
    optionalExtras,
    rooftopTentState,
    selectedIds,
    selectedOptionalExtras,
    resetBuild,
    setActiveCategory,
    setAwningState,
    setFocusedAccessoryId,
    setRooftopTentState,
    toggleAccessory
  };
};
