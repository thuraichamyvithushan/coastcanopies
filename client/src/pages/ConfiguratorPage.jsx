import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchVehicles, submitQuote } from "../api/admin.js";
import { ProductCard } from "../components/configurator/ProductCard.jsx";
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
              <div className="order-1 xl:self-start">
                <div className="sticky top-2 z-20 md:top-3 xl:top-6">
                  <PreviewPanel
                    vehicle={vehicle}
                    canopy={canopy}
                    modules={selectedModules}
                    accessories={selectedAccessories}
                  />
                </div>
              </div>

              <div className="order-2 space-y-6 xl:max-h-[calc(100vh-1.5rem)] xl:overflow-y-auto xl:pr-2 configurator-steps-scroll">
                <StepCard index="1" title="Vehicle Selection" active={!vehicle} complete={Boolean(vehicle)}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {vehicles.map((item) => (
                      <ProductCard
                        key={item._id}
                        item={item}
                        selected={item._id === selectedVehicleId}
                        onClick={() => setSelectedVehicleId(item._id)}
                        priceLabel={formatCurrency(item.price)}
                        description={`${item.brand} platform with canopy-ready fitment.`}
                        badge="Vehicle platform"
                      />
                    ))}
                  </div>
                </StepCard>

                <StepCard
                  index="2"
                  title="Base System"
                  active={Boolean(vehicle) && !canopy}
                  complete={Boolean(canopy)}
                >
                  {vehicle && !canopies.length ? (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-white/65">
                      No base systems are configured for the selected vehicle yet.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                      {canopies.map((item) => (
                        <ProductCard
                          key={item._id}
                          item={item}
                          selected={item._id === selectedCanopyId}
                          onClick={() => setSelectedCanopyId(item._id)}
                          priceLabel={formatCurrency(item.price)}
                          badge={vehicle ? `Fits ${vehicle.name}` : "Base system"}
                        />
                      ))}
                    </div>
                  )}
                </StepCard>

                <StepCard
                  index="3"
                  title="Modules"
                  active={Boolean(vehicle && canopy)}
                  complete={moduleIds.length > 0}
                >
                  {!vehicle ? (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-white/65">
                      Choose a vehicle first to see compatible modules.
                    </div>
                  ) : modules.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                      {modules.map((item) => (
                        <ProductCard
                          key={item._id}
                          item={item}
                          selected={moduleIds.includes(item._id)}
                          onClick={() => toggleSelection(item._id, moduleIds, setModuleIds)}
                          priceLabel={formatCurrency(item.price)}
                          badge={`Fits ${vehicle.name}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-white/65">
                      No modules are configured for the selected vehicle yet.
                    </div>
                  )}
                </StepCard>

                <StepCard
                  index="4"
                  title="Accessories"
                  active={Boolean(vehicle && canopy)}
                  complete={accessoryIds.length > 0}
                >
                  {!vehicle ? (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-white/65">
                      Choose a vehicle first to see compatible accessories.
                    </div>
                  ) : accessories.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                      {accessories.map((item) => (
                        <ProductCard
                          key={item._id}
                          item={item}
                          selected={accessoryIds.includes(item._id)}
                          onClick={() => toggleSelection(item._id, accessoryIds, setAccessoryIds)}
                          priceLabel={formatCurrency(item.price)}
                          badge={`Fits ${vehicle.name}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-white/65">
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
