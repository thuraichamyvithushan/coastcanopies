import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchVehicles, submitQuote } from "../api/admin.js";
import { ConfiguratorSidebar } from "../components/configurator/ConfiguratorSidebar.jsx";
import { SiteShell } from "../components/layout/SiteShell.jsx";
import { productConfig } from "../config/productConfig.js";
import { useConfigurator } from "../hooks/useConfigurator.js";
import { formatNzd } from "../utils/pricing.js";
import { preloadModel } from "../utils/preloadModel.js";
import { previewKey } from "../utils/previewKey.js";

const Viewer3D = lazy(() =>
  import("../components/configurator/Viewer3D.jsx").then((module) => ({ default: module.Viewer3D }))
);

const initialCustomer = {
  name: "",
  email: "",
  phone: "",
  reference: "",
  notes: ""
};

const productTypeCategory = {
  canopy: "Canopy",
  tray: "Tray",
  accessory: "Accessories"
};

const buildSteps = ["Vehicle", "Tray", "Canopy", "Accessories", "Summary"];
const previewDisplayDelayMs = 900;

const toAdminAccessory = (product) => {
  const template = productConfig.accessories.find((accessory) => {
    const slugs = new Set([accessory.id, ...(accessory.adminSlugs || [])]);
    return slugs.has(product.slug);
  });

  return {
    id: String(product._id),
    referenceId: String(product._id),
    slug: product.slug,
    name: product.name,
    category: template?.category || productTypeCategory[product.type] || "Accessories",
    model: product.modelUrl || "",
    states: template?.states,
    transformId: template?.id || product.slug,
    included: false,
    price: Number(product.price) || 0,
    visible: false,
    defaultVisible: false,
    adminProduct: product
  };
};

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const [adminAccessories, setAdminAccessories] = useState([]);
  const [adminVehicles, setAdminVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const configurator = useConfigurator(adminAccessories, adminVehicles);
  const [customer, setCustomer] = useState(initialCustomer);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modelStatuses, setModelStatuses] = useState({});

  const handleModelStatusChange = useCallback((key, status) => {
    setModelStatuses((current) => current[key] === status ? current : { ...current, [key]: status });
  }, []);

  const modelStatus = (type, id) => modelStatuses[previewKey(configurator.previewVersion, type, id)] || "loading";
  const selectedAccessories = configurator.selectedOptionalExtras.filter(
    (item) => item.adminProduct?.type !== "tray" && item.adminProduct?.type !== "canopy"
  );
  const accessoryStatuses = selectedAccessories.map((item) =>
    modelStatus(item.adminProduct?.type || "accessory", item.id)
  );
  const accessoriesPreviewStatus = !accessoryStatuses.length ? "ready"
    : accessoryStatuses.includes("error") ? "error"
      : accessoryStatuses.includes("missing") ? "missing"
        : accessoryStatuses.every((status) => status === "ready") ? "ready" : "loading";
  const previewStatuses = {
    Vehicle: configurator.selectedVehicle ? modelStatus("vehicle", configurator.selectedVehicle._id) : "unselected",
    Tray: configurator.selectedTray ? modelStatus("tray", configurator.selectedTray.id) : "unselected",
    Canopy: configurator.selectedCanopy ? modelStatus("canopy", configurator.selectedCanopy.id) : "unselected",
    Accessories: accessoriesPreviewStatus
  };
  const pendingStep = configurator.pendingAdvance?.step;
  const nextStepIndex = buildSteps.indexOf(pendingStep) + 1;
  const previewsReadyToAdvance = nextStepIndex > 0 &&
    buildSteps.slice(0, nextStepIndex).every((step) => previewStatuses[step] === "ready");

  useEffect(() => {
    if (!pendingStep || configurator.activeCategory !== pendingStep || !previewsReadyToAdvance) return;
    const timeout = window.setTimeout(() => {
      configurator.setActiveCategory(buildSteps[nextStepIndex]);
    }, previewDisplayDelayMs);
    return () => window.clearTimeout(timeout);
  }, [configurator.pendingAdvance, configurator.activeCategory, pendingStep, nextStepIndex, previewsReadyToAdvance]);

  useEffect(() => {
    let active = true;

    Promise.all([fetchVehicles(), fetchProducts()])
      .then(([vehicles, products]) => {
        if (!active) return;

        setAdminAccessories(products.map(toAdminAccessory));
        setAdminVehicles(vehicles);

        // Preload vehicle and canopy 3D models in background
        const urlsToPreload = [
          ...vehicles.map((v) => v.modelUrl),
          ...products.map((p) => p.modelUrl)
        ].filter(Boolean);

        urlsToPreload.forEach((url, i) => {
          setTimeout(() => preloadModel(url), i * 150);
        });
      })
      .catch(() => {
        if (active) setError("Admin products could not be loaded. Please refresh and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);


  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
  };

  const handleRequestQuote = async (event) => {
    event.preventDefault();
    setError("");
    if (!configurator.selectedVehicle || !configurator.selectedTray || !configurator.selectedCanopy) {
      setError("Please select your vehicle, tray, and canopy before requesting a quote.");
      return;
    }
    setSubmitting(true);

    try {
      const response = await submitQuote({
        vehicleId: configurator.selectedVehicle._id,
        selectedOptionalExtraIds: configurator.selectedOptionalExtras.map((item) => item.referenceId),
        customerInfo: customer
      });

      const confirmation = {
        quoteId: response.quoteId,
        customerName: customer.name,
        totalPrice: response.totalPrice
      };
      try {
        window.sessionStorage.setItem("coast-quote-confirmation", JSON.stringify(confirmation));
      } catch {
        // The confirmation is still available through navigation state.
      }
      navigate("/quote-success", { state: confirmation });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryProps = {
    selectedVehicle: configurator.selectedVehicle,
    selectedTray: configurator.selectedTray,
    selectedCanopy: configurator.selectedCanopy,
    optionalExtras: configurator.optionalExtras,
    selectedOptionalExtras: configurator.selectedOptionalExtras,
    grandTotal: configurator.grandTotal,
    customer,
    onCustomerChange: handleCustomerChange,
    onRequestQuote: handleRequestQuote,
    onReset: configurator.resetBuild,
    submitting
  };

  return (
    <SiteShell>
      <div className="min-h-screen bg-[#080808] text-white">
        <header className="border-b border-white/10 bg-[#080808] px-3 py-2.5 sm:px-4 sm:py-4 md:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#efc400] text-[10px] font-black text-black sm:h-9 sm:w-9 sm:text-xs">CC</span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#efc400] sm:text-[10px] sm:tracking-[0.3em]">Coast Canopies</p>
                  <h1 className="mt-0.5 text-xs font-semibold leading-tight sm:mt-1 sm:text-lg md:text-xl">{productConfig.name}</h1>
                </div>
              </div>
            </div>
            {configurator.selectedVehicle ? (
              <div className="flex shrink-0 items-center gap-3 border-l border-white/10 pl-3 sm:gap-6 sm:pl-6">
                <div className="hidden sm:block">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Vehicle Price</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatNzd(configurator.selectedVehicle.price)}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-white/45 sm:text-[9px] sm:tracking-[0.2em]">Current Total</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#efc400] sm:mt-1 sm:text-lg">{formatNzd(configurator.grandTotal)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        {error ? (
          <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <main className="mx-auto grid max-w-[1600px] lg:h-[calc(100vh-86px)] lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
          <section className={`builder-preview ${configurator.activeCategory === "Summary" ? "builder-preview-summary" : ""} overflow-hidden border-b border-white/10 lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r`}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-[#fdf8e7] text-xs uppercase tracking-[0.25em] text-slate-500">
                  Preparing your 3D preview...
                </div>
              }
            >
              <Viewer3D
                selectedIds={configurator.selectedIds}
                rooftopTentState={configurator.rooftopTentState}
                awningState={configurator.awningState}
                focusedAccessoryId={configurator.focusedAccessoryId}
                cameraResetKey={configurator.cameraResetKey}
                modelOverrides={{ vehicle: configurator.selectedVehicle }}
                accessories={configurator.accessories}
                previewVersion={configurator.previewVersion}
                onModelStatusChange={handleModelStatusChange}
              />
            </Suspense>
          </section>

          <ConfiguratorSidebar configurator={configurator} summaryProps={summaryProps} previewStatuses={previewStatuses} loading={loading} />
        </main>
      </div>

    </SiteShell>
  );
}
