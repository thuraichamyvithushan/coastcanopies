import { useMemo, useState } from "react";
import { calculateGrandTotal, calculateOptionalExtras } from "../utils/pricing.js";

export const useConfigurator = (accessories = [], vehicles = []) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeCategory, setCategory] = useState("Vehicle");
  const [rooftopTentState, setRooftopTentState] = useState("closed");
  const [awningState, setAwningState] = useState("closed");
  const [focusedAccessoryId, setFocusedAccessoryId] = useState("");
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [pendingAdvance, setPendingAdvance] = useState(null);

  const selectedVehicle = vehicles.find((item) => String(item._id) === selectedVehicleId) || null;
  const canopies = accessories.filter((item) => item.adminProduct?.type === "canopy");
  const trays = accessories.filter((item) => item.adminProduct?.type === "tray");
  
  const selectedCanopy = canopies.find((item) => selectedIds.includes(item.id)) || null;
  const selectedTray = trays.find((item) => selectedIds.includes(item.id)) || null;

  const canAccessCategory = (category) => {
    if (category === "Vehicle") return true;
    if (category === "Tray") return Boolean(selectedVehicle);
    if (category === "Canopy") return Boolean(selectedVehicle && selectedTray);
    return Boolean(selectedVehicle && selectedTray && selectedCanopy);
  };

  const setActiveCategory = (category) => {
    if (canAccessCategory(category)) {
      setCategory(category);
      setPendingAdvance(null);
    }
  };

  const selectVehicle = (vehicle) => {
    if (String(vehicle._id) !== selectedVehicleId) {
      setSelectedVehicleId(String(vehicle._id));
      setSelectedIds([]);
      setFocusedAccessoryId("");
      setRooftopTentState("closed");
      setAwningState("closed");
      setCameraResetKey((value) => value + 1);
      setPreviewVersion((value) => value + 1);
    }
    setCategory("Vehicle");
    setPendingAdvance({ step: "Vehicle" });
  };

  const selectTray = (tray) => {
    if (!selectedVehicle || !trays.some((item) => item.id === tray.id)) return;
    if (selectedTray?.id !== tray.id) {
      setSelectedIds([tray.id]); // Clear canopy and accessories
      setFocusedAccessoryId("");
      setRooftopTentState("closed");
      setAwningState("closed");
      setPreviewVersion((value) => value + 1);
    }
    setCategory("Tray");
    setPendingAdvance({ step: "Tray" });
  };

  const selectCanopy = (canopy) => {
    if (!selectedVehicle || !selectedTray || !canopies.some((item) => item.id === canopy.id)) return;
    if (selectedCanopy?.id !== canopy.id) {
      // Keep the selected tray, clear accessories, add canopy
      setSelectedIds([selectedTray.id, canopy.id]);
      setFocusedAccessoryId("");
      setRooftopTentState("closed");
      setAwningState("closed");
      setPreviewVersion((value) => value + 1);
    }
    setCategory("Canopy");
    setPendingAdvance({ step: "Canopy" });
  };

  const optionalExtras = useMemo(
    () => calculateOptionalExtras(accessories, selectedIds),
    [accessories, selectedIds]
  );
  const grandTotal = selectedVehicle
    ? calculateGrandTotal(selectedVehicle.price, optionalExtras)
    : null;
  const selectedOptionalExtras = accessories.filter(
    (item) => !item.included && selectedIds.includes(item.id)
  );

  const toggleAccessory = (accessory) => {
    const isBaseProduct = accessory.adminProduct?.type === "canopy" || accessory.adminProduct?.type === "tray";
    if (!selectedVehicle || !selectedTray || !selectedCanopy || accessory.included || isBaseProduct) return;

    setPendingAdvance(null);

    setSelectedIds((current) =>
      current.includes(accessory.id)
        ? current.filter((id) => id !== accessory.id)
        : [...current, accessory.id]
    );
    setPreviewVersion((value) => value + 1);
  };

  const resetBuild = () => {
    setSelectedVehicleId("");
    setSelectedIds([]);
    setCategory("Vehicle");
    setRooftopTentState("closed");
    setAwningState("closed");
    setFocusedAccessoryId("");
    setCameraResetKey((value) => value + 1);
    setPreviewVersion((value) => value + 1);
    setPendingAdvance(null);
  };

  return {
    activeCategory,
    accessories,
    vehicles,
    canopies,
    trays,
    selectedVehicle,
    selectedCanopy,
    selectedTray,
    selectVehicle,
    selectCanopy,
    selectTray,
    canAccessCategory,
    awningState,
    cameraResetKey,
    focusedAccessoryId,
    grandTotal,
    previewVersion,
    pendingAdvance,
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
