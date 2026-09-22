import { useEffect, useMemo, useState } from "react";
import { productConfig } from "../config/productConfig.js";
import { calculateGrandTotal, calculateOptionalExtras } from "../utils/pricing.js";

export const useConfigurator = (accessories = []) => {
  const defaultSelections = useMemo(
    () => accessories.filter((item) => item.defaultVisible).map((item) => item.id),
    [accessories]
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Package");
  const [rooftopTentState, setRooftopTentState] = useState("closed");
  const [awningState, setAwningState] = useState("closed");
  const [focusedAccessoryId, setFocusedAccessoryId] = useState("");
  const [cameraResetKey, setCameraResetKey] = useState(0);

  useEffect(() => {
    setSelectedIds(defaultSelections);
  }, [defaultSelections]);

  const optionalExtras = useMemo(
    () => calculateOptionalExtras(accessories, selectedIds),
    [accessories, selectedIds]
  );
  const grandTotal = calculateGrandTotal(productConfig.basePrice, optionalExtras);
  const selectedOptionalExtras = accessories.filter(
    (item) => !item.included && selectedIds.includes(item.id)
  );

  const toggleAccessory = (accessory) => {
    if (accessory.included) return;

    setSelectedIds((current) =>
      current.includes(accessory.id)
        ? current.filter((id) => id !== accessory.id)
        : [...current, accessory.id]
    );
  };

  const resetBuild = () => {
    setSelectedIds(defaultSelections);
    setActiveCategory("Package");
    setRooftopTentState("closed");
    setAwningState("closed");
    setFocusedAccessoryId("");
    setCameraResetKey((value) => value + 1);
  };

  return {
    activeCategory,
    accessories,
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
