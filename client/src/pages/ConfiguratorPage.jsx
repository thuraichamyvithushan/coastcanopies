import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchVehicles, submitQuote } from "../api/admin.js";
import { PreviewPanel } from "../components/configurator/PreviewPanel.jsx";
import { PriceSummary } from "../components/configurator/PriceSummary.jsx";
import { QuoteForm } from "../components/configurator/QuoteForm.jsx";
import { StepCard } from "../components/configurator/StepCard.jsx";
import { SiteShell } from "../components/layout/SiteShell.jsx";
import { formatCurrency } from "../utils/currency.js";
import { hasProductPositionForVehicle } from "../utils/productHelpers.js";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: ""
};

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);
  const [openStep, setOpenStep] = useState("1");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedCanopyId, setSelectedCanopyId] = useState("");
  const [moduleIds, setModuleIds] = useState([]);
  const [accessoryIds, setAccessoryIds] = useState([]);
  const [quoteForm, setQuoteForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [vehicleData, productData] = await Promise.all([fetchVehicles(), fetchProducts()]);
        setVehicles(vehicleData);
        setProducts(productData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const vehicle = vehicles.find((item) => item._id === selectedVehicleId) || null;
  const compatibleProducts = (type) =>
    products.filter(
      (item) =>
        item.type === type &&
        (!vehicle || hasProductPositionForVehicle(item, vehicle.slug))
    );

  const canopies = compatibleProducts("canopy");
  const modules = compatibleProducts("module");
  const accessories = compatibleProducts("accessory");
  const canopy = canopies.find((item) => item._id === selectedCanopyId) || null;
  const selectedModules = modules.filter((item) => moduleIds.includes(item._id));
  const selectedAccessories = accessories.filter((item) => accessoryIds.includes(item._id));
  const buildComplete = Boolean(vehicle && canopy && moduleIds.length > 0 && accessoryIds.length > 0);

  const builderHighlights = [
    { value: "3D", label: "Interactive live concept" },
    { value: String(vehicles.length), label: "Vehicle platforms" },
    { value: String(products.length), label: "Build options" }
  ];

  useEffect(() => {
    if (!vehicle) {
      setOpenStep("1");
      return;
    }

    if (!canopy) {
      setOpenStep((current) => (current === "3" || current === "4" ? "2" : current));
    }
  }, [vehicle, canopy]);

  useEffect(() => {
    if (!vehicle) {
      setSelectedCanopyId("");
      setModuleIds([]);
      setAccessoryIds([]);
      return;
    }

    const compatibleCanopyIds = new Set(
      products
        .filter((item) => item.type === "canopy" && hasProductPositionForVehicle(item, vehicle.slug))
        .map((item) => item._id)
    );
    const compatibleModuleIds = new Set(
      products
        .filter((item) => item.type === "module" && hasProductPositionForVehicle(item, vehicle.slug))
        .map((item) => item._id)
    );
    const compatibleAccessoryIds = new Set(
      products
        .filter((item) => item.type === "accessory" && hasProductPositionForVehicle(item, vehicle.slug))
        .map((item) => item._id)
    );

    setSelectedCanopyId((current) => (current && compatibleCanopyIds.has(current) ? current : ""));
    setModuleIds((current) => current.filter((id) => compatibleModuleIds.has(id)));
    setAccessoryIds((current) => current.filter((id) => compatibleAccessoryIds.has(id)));
  }, [vehicle, products]);

  const totalPrice =
    (vehicle?.price || 0) +
    (canopy?.price || 0) +
    selectedModules.reduce((sum, item) => sum + item.price, 0) +
    selectedAccessories.reduce((sum, item) => sum + item.price, 0);

  const toggleSelection = (id, selectedIds, setSelectedIds) => {
    setSelectedIds(
      selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]
    );
  };

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    if (vehicleId) {
      setOpenStep("2");
    }
  };

  const handleCanopySelect = (canopyId) => {
    setSelectedCanopyId(canopyId);
    if (canopyId) {
      setOpenStep("3");
    }
  };

  const toggleStep = (step) => {
    setOpenStep((current) => (current === step ? "" : step));
  };

  const vehicleSummary = vehicle
    ? `${vehicle.name} • ${formatCurrency(vehicle.price)}`
    : "Choose a vehicle platform to unlock the rest of the build.";
  const canopySummary = canopy
    ? `${canopy.name} • ${formatCurrency(canopy.price)}`
    : vehicle
      ? "Choose one base system for the selected vehicle."
      : "Pick a vehicle first to see matching base systems.";
  const modulesSummary = selectedModules.length
    ? `${selectedModules.length} module${selectedModules.length > 1 ? "s" : ""} selected`
    : vehicle && canopy
      ? "Add one or more modules to shape the build."
      : "Available after vehicle and base system selection.";
  const accessoriesSummary = selectedAccessories.length
    ? `${selectedAccessories.length} accessorie${selectedAccessories.length > 1 ? "s" : "y"} selected`
    : vehicle && canopy
      ? "Add finishing accessories for the final setup."
      : "Available after vehicle and base system selection.";

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setQuoteForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!vehicle || !canopy) {
      setError("Please choose a vehicle and a base system before submitting a quote.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await submitQuote({
        vehicleId: vehicle._id,
        baseSystemId: canopy._id,
        moduleIds,
        accessoryIds,
        customerInfo: quoteForm
      });

      navigate("/quote-success", {
        state: {
          quoteId: response.quoteId,
          customerName: quoteForm.name,
          totalPrice
        }
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="px-4 pb-12 pt-3 md:px-6 md:pb-16 md:pt-6">
        <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
          <div className="gold-surface gold-outline relative overflow-hidden rounded-[1.4rem] p-4 md:rounded-[2rem] md:p-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(249,191,26,0.18),transparent_70%)] md:h-32" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f9bf1a]">Configurator</p>
              <h1 className="mt-2 font-display text-2xl uppercase tracking-[0.06em] text-white md:text-4xl">
                Build your canopy system in 3D
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-white/68 md:text-base">
                Choose the vehicle, fitment, modules, and accessories in one builder flow.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {builderHighlights.map((item) => (
                  <div key={item.label} className="rounded-[1rem] border border-white/10 bg-black/20 p-3 last:col-span-2 sm:last:col-span-1 md:rounded-[1.2rem] md:p-4">
                    <p className="font-display text-2xl uppercase tracking-[0.08em] text-[#f9bf1a] md:text-3xl">{item.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/58 md:mt-2 md:text-sm md:tracking-[0.22em]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="panel rounded-[2rem] p-10 text-center text-white/65">Loading configurator data...</div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              {error}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-start xl:gap-8">
              <div className="order-1 sticky top-2 z-20 self-start md:top-3 xl:top-6">
                <PreviewPanel
                  vehicle={vehicle}
                  canopy={canopy}
                  modules={selectedModules}
                  accessories={selectedAccessories}
                />
              </div>

              <div className="order-2 space-y-4 xl:max-h-[calc(100vh-1.5rem)] xl:overflow-y-auto xl:pr-2 configurator-steps-scroll">
                <StepCard
                  index="1"
                  title="Vehicle Selection"
                  summary={vehicleSummary}
                  active={!vehicle}
                  complete={Boolean(vehicle)}
                  open={openStep === "1"}
                  onToggle={() => toggleStep("1")}
                >
                  <div className="space-y-2.5">
                    <div className="grid gap-2.5">
                      {vehicles.map((item) => (
                        <CompactOptionRow
                          key={item._id}
                          title={item.name}
                          priceLabel={formatCurrency(item.price)}
                          selected={item._id === selectedVehicleId}
                          onClick={() => handleVehicleSelect(item._id)}
                        />
                      ))}
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  index="2"
                  title="Base System"
                  summary={canopySummary}
                  active={Boolean(vehicle) && !canopy}
                  complete={Boolean(canopy)}
                  open={openStep === "2"}
                  onToggle={() => toggleStep("2")}
                >
                  {vehicle && !canopies.length ? (
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                      No base systems are configured for the selected vehicle yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="grid gap-2.5">
                        {canopies.map((item) => (
                          <CompactOptionRow
                            key={item._id}
                            title={item.name}
                            priceLabel={formatCurrency(item.price)}
                            selected={item._id === selectedCanopyId}
                            onClick={() => handleCanopySelect(item._id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </StepCard>

                <StepCard
                  index="3"
                  title="Modules"
                  summary={modulesSummary}
                  active={Boolean(vehicle && canopy)}
                  complete={moduleIds.length > 0}
                  open={openStep === "3"}
                  onToggle={() => toggleStep("3")}
                >
                  {!vehicle ? (
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                      Choose a vehicle first to see compatible modules.
                    </div>
                  ) : modules.length ? (
                    <div className="space-y-2.5">
                      <div className="space-y-2.5">
                        {modules.map((item) => (
                          <CompactCheckboxRow
                            key={item._id}
                            title={item.name}
                            checked={moduleIds.includes(item._id)}
                            onToggle={() => toggleSelection(item._id, moduleIds, setModuleIds)}
                            priceLabel={formatCurrency(item.price)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                      No modules are configured for the selected vehicle yet.
                    </div>
                  )}
                </StepCard>

                <StepCard
                  index="4"
                  title="Accessories"
                  summary={accessoriesSummary}
                  active={Boolean(vehicle && canopy)}
                  complete={accessoryIds.length > 0}
                  open={openStep === "4"}
                  onToggle={() => toggleStep("4")}
                >
                  {!vehicle ? (
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                      Choose a vehicle first to see compatible accessories.
                    </div>
                  ) : accessories.length ? (
                    <div className="space-y-2.5">
                      <div className="space-y-2.5">
                        {accessories.map((item) => (
                          <CompactCheckboxRow
                            key={item._id}
                            title={item.name}
                            checked={accessoryIds.includes(item._id)}
                            onToggle={() => toggleSelection(item._id, accessoryIds, setAccessoryIds)}
                            priceLabel={formatCurrency(item.price)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                      No accessories are configured for the selected vehicle yet.
                    </div>
                  )}
                </StepCard>

                {buildComplete ? (
                  <PriceSummary
                    vehicle={vehicle}
                    canopy={canopy}
                    modules={selectedModules}
                    accessories={selectedAccessories}
                    totalPrice={totalPrice}
                  />
                ) : null}

                {buildComplete ? (
                  <QuoteForm
                    form={quoteForm}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                  />
                ) : (
                  <div className="panel rounded-[2rem] p-6 text-white/65">
                    Complete all four steps to show pricing and unlock the quote form.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

const CompactOptionRow = ({ title, priceLabel, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 text-left transition ${
      selected
        ? "border-[#f9bf1a]/40 bg-[#f9bf1a]/8"
        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
    }`}
  >
    <span className="min-w-0 font-display text-sm uppercase tracking-[0.04em] text-white md:text-base">
      {title}
    </span>
    <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#f9bf1a]">
      {priceLabel}
    </span>
  </button>
);

const CompactCheckboxRow = ({ title, checked, onToggle, priceLabel }) => (
  <label
    className={`flex cursor-pointer items-start gap-3 rounded-[1rem] border p-3 transition ${
      checked
        ? "border-[#f9bf1a]/40 bg-[#f9bf1a]/8"
        : "border-white/10 bg-white/[0.03]"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="mt-1 h-4 w-4 shrink-0 accent-[#f9bf1a]"
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-display text-sm uppercase tracking-[0.04em] text-white md:text-base">
          {title}
        </p>
        <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#f9bf1a]">
          {priceLabel}
        </span>
      </div>
    </div>
  </label>
);
