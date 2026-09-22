import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchVehicles, submitQuote } from "../api/admin.js";
import { ConfiguratorSidebar } from "../components/configurator/ConfiguratorSidebar.jsx";
import { SpecificationsModal } from "../components/configurator/SpecificationsModal.jsx";
import { SiteShell } from "../components/layout/SiteShell.jsx";
import { productConfig } from "../config/productConfig.js";
import { useConfigurator } from "../hooks/useConfigurator.js";
import { formatNzd } from "../utils/pricing.js";

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
  module: "Tray & Storage",
  accessory: "Accessories"
};

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
  const configurator = useConfigurator(adminAccessories);
  const [customer, setCustomer] = useState(initialCustomer);
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modelOverrides, setModelOverrides] = useState({ vehicle: null });

  useEffect(() => {
    let active = true;

    Promise.all([fetchVehicles(), fetchProducts()])
      .then(([vehicles, products]) => {
        if (!active) return;

        const fixedVehicle =
          vehicles.find((item) => item.slug === "base-vehicle" && item.modelUrl) ||
          vehicles.find((item) => item.modelUrl) ||
          null;
        setAdminAccessories(products.map(toAdminAccessory));
        setModelOverrides({ vehicle: fixedVehicle });
      })
      .catch(() => {
        if (active) setError("Admin products could not be loaded. Please refresh and try again.");
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
    setSubmitting(true);

    try {
      const response = await submitQuote({
        packageId: productConfig.id,
        selectedOptionalExtraIds: configurator.selectedOptionalExtras.map((item) => item.referenceId),
        customerInfo: customer
      });

      navigate("/quote-success", {
        state: {
          quoteId: response.quoteId,
          customerName: customer.name,
          totalPrice: configurator.grandTotal
        }
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryProps = {
    optionalExtras: configurator.optionalExtras,
    selectedOptionalExtras: configurator.selectedOptionalExtras,
    grandTotal: configurator.grandTotal,
    customer,
    onCustomerChange: handleCustomerChange,
    onGenerateSpecification: () => setSpecificationsOpen(true),
    onRequestQuote: handleRequestQuote,
    onReset: configurator.resetBuild,
    submitting
  };

  return (
    <SiteShell>
      <div className="min-h-screen bg-[#080808] text-white">
        <header className="border-b border-white/10 bg-[#080808] px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center bg-[#efc400] text-xs font-black text-black">CC</span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#efc400]">Coast Canopies</p>
                  <h1 className="mt-1 text-lg font-semibold leading-none md:text-xl">{productConfig.name}</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Base Price</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatNzd(productConfig.basePrice)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Current Total</p>
                <p className="mt-1 text-lg font-semibold text-[#efc400]">{formatNzd(configurator.grandTotal)}</p>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <main className="mx-auto grid max-w-[1600px] lg:h-[calc(100vh-86px)] lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
          <section className="h-[54vh] min-h-[360px] border-b border-white/10 lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-[#131313] text-xs uppercase tracking-[0.25em] text-white/40">
                  Loading 3D Studio...
                </div>
              }
            >
              <Viewer3D
                selectedIds={configurator.selectedIds}
                rooftopTentState={configurator.rooftopTentState}
                awningState={configurator.awningState}
                focusedAccessoryId={configurator.focusedAccessoryId}
                cameraResetKey={configurator.cameraResetKey}
                modelOverrides={modelOverrides}
                accessories={configurator.accessories}
              />
            </Suspense>
          </section>

          <ConfiguratorSidebar configurator={configurator} summaryProps={summaryProps} />
        </main>
      </div>

      <SpecificationsModal open={specificationsOpen} onClose={() => setSpecificationsOpen(false)} />
    </SiteShell>
  );
}
