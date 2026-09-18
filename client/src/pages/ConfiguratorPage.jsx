import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchVehicles, submitQuote } from "../api/admin.js";
import { PreviewPanel } from "../components/configurator/PreviewPanel.jsx";
import { SiteShell } from "../components/layout/SiteShell.jsx";
import { resolveAssetUrl } from "../utils/assetUrl.js";
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
  const [selectedBrand, setSelectedBrand] = useState("");
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

  const brands = useMemo(
    () => Array.from(new Set(vehicles.map((item) => item.brand).filter(Boolean))).sort(),
    [vehicles]
  );

  const filteredVehicles = useMemo(
    () => vehicles.filter((item) => !selectedBrand || item.brand === selectedBrand),
    [selectedBrand, vehicles]
  );

  const vehicle = vehicles.find((item) => item._id === selectedVehicleId) || null;

  useEffect(() => {
    if (vehicle?.brand && vehicle.brand !== selectedBrand) {
      setSelectedBrand(vehicle.brand);
    }
  }, [selectedBrand, vehicle]);

  useEffect(() => {
    if (!selectedVehicleId) {
      return;
    }

    const matchesBrand = filteredVehicles.some((item) => item._id === selectedVehicleId);

    if (!matchesBrand) {
      setSelectedVehicleId("");
      setSelectedCanopyId("");
      setModuleIds([]);
      setAccessoryIds([]);
    }
  }, [filteredVehicles, selectedVehicleId]);

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
  const buildReady = Boolean(vehicle && canopy);

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

  const handleBrandChange = (event) => {
    setSelectedBrand(event.target.value);
  };

  const handleVehicleSelect = (event) => {
    setSelectedVehicleId(event.target.value);
  };

  const handleCanopySelect = (id) => {
    setSelectedCanopyId(id);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setQuoteForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!vehicle || !canopy) {
      setError("Please choose a vehicle and canopy system before requesting a quote.");
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
      <section className="min-h-screen bg-[linear-gradient(180deg,#f5efe5_0%,#efe3cf_18%,#f7f1e7_18%,#f7f1e7_100%)] px-3 pb-28 pt-2 md:px-5 md:pb-20 md:pt-5">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="rounded-[1.75rem] border border-[#dbc9ab] bg-white p-10 text-center text-[#433b2d] shadow-[0_18px_35px_rgba(72,54,29,0.08)]">
              Loading configurator data...
            </div>
          ) : (
            <>
              <div className="sticky top-2 z-20 -mx-1 bg-[linear-gradient(180deg,rgba(247,241,231,0.96)_0%,rgba(247,241,231,0.92)_78%,rgba(247,241,231,0)_100%)] px-1 pb-3 pt-1 backdrop-blur lg:hidden">
                <PreviewPanel
                  vehicle={vehicle}
                  canopy={canopy}
                  modules={selectedModules}
                  accessories={selectedAccessories}
                />
              </div>

              <div className="grid gap-4 lg:mt-2 lg:gap-6 lg:grid-cols-[minmax(0,5.75fr)_minmax(380px,4.25fr)] lg:items-start xl:grid-cols-[minmax(0,6fr)_minmax(420px,4fr)]">
                <aside className="order-1 -mx-1 hidden sm:mx-0 lg:sticky lg:top-4 lg:block lg:self-start">
                  <PreviewPanel
                    vehicle={vehicle}
                    canopy={canopy}
                    modules={selectedModules}
                    accessories={selectedAccessories}
                  />
                </aside>

                <div className="order-2 space-y-4 md:space-y-5">
                  {error ? (
                    <div className="rounded-[1.4rem] border border-red-300/60 bg-red-50 p-5 text-sm text-red-800">
                      {error}
                    </div>
                  ) : null}

                  <BuilderSection
                    step="01"
                    eyebrow="Your Vehicle Details"
                    title="Choose the base vehicle"
                    description="This drives the compatible canopy, module, and accessory options shown below."
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                      <SelectField
                        label="Vehicle brand"
                        value={selectedBrand}
                        onChange={handleBrandChange}
                        options={brands.map((brand) => ({ value: brand, label: brand }))}
                        placeholder="All brands"
                      />
                      <SelectField
                        label="Vehicle platform"
                        value={selectedVehicleId}
                        onChange={handleVehicleSelect}
                        options={filteredVehicles.map((item) => ({
                          value: item._id,
                          label: `${item.name} (${formatCurrency(item.price)})`
                        }))}
                        placeholder={selectedBrand ? "Choose vehicle" : "Choose a brand or vehicle"}
                      />
                    </div>
                    {vehicle ? (
                      <div className="mt-5 overflow-hidden rounded-[1.3rem] border border-[#ead9bc] bg-[#fbf6ed] text-sm text-[#564b3e]">
                        <div className="flex min-h-[190px] items-center justify-center border-b border-[#ead9bc] bg-[linear-gradient(180deg,#fffaf3_0%,#f6efe3_100%)] p-4 sm:min-h-[220px] md:min-h-[250px]">
                          <img
                            src={resolveAssetUrl(vehicle.svgBase || `/assets/vehicles/${vehicle.slug}-base.svg`)}
                            alt={vehicle.name}
                            className="max-h-[160px] w-full max-w-[440px] object-contain sm:max-h-[190px] md:max-h-[220px]"
                          />
                        </div>
                        <div className="p-4">
                          <span className="font-display uppercase tracking-[0.16em] text-[#946d15]">{vehicle.brand}</span>
                          <p className="mt-2 text-lg text-[#1f1b15]">{vehicle.name}</p>
                          <p className="mt-2 text-[#6a5f51]">
                            Base platform estimate: {formatCurrency(vehicle.price)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <EmptyState copy="Choose a brand and platform to unlock compatible canopy systems and add-ons." />
                    )}
                  </BuilderSection>

                  <BuilderSection
                    step="02"
                    eyebrow="Canopy Package"
                    title="Choose your tray canopy system"
                    description="Select one primary canopy package for the currently selected vehicle platform."
                  >
                    {!vehicle ? (
                      <EmptyState copy="Vehicle selection comes first so we can show only canopy systems that actually fit." />
                    ) : !canopies.length ? (
                      <EmptyState copy="No canopy systems are configured for this vehicle yet." />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                        {canopies.map((item) => (
                          <OptionTile
                            key={item._id}
                            title={item.name}
                            price={item.price}
                            selected={item._id === selectedCanopyId}
                            onClick={() => handleCanopySelect(item._id)}
                          />
                        ))}
                      </div>
                    )}
                  </BuilderSection>

                  <BuilderSection
                    step="03"
                    eyebrow="Add Modules"
                    title="Configure storage and utility upgrades"
                    description="Layer in compatible modules to shape the tray and canopy around how the vehicle will actually be used."
                  >
                    {!vehicle || !canopy ? (
                      <EmptyState copy="Choose the vehicle and canopy package first to reveal compatible module upgrades." />
                    ) : !modules.length ? (
                      <EmptyState copy="No modules are configured for this vehicle yet." />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                        {modules.map((item) => (
                          <OptionTile
                            key={item._id}
                            title={item.name}
                            price={item.price}
                            selected={moduleIds.includes(item._id)}
                            onClick={() => toggleSelection(item._id, moduleIds, setModuleIds)}
                          />
                        ))}
                      </div>
                    )}
                  </BuilderSection>

                  <BuilderSection
                    step="04"
                    eyebrow="Accessories"
                    title="Finish the build with external accessories"
                    description="Choose the optional finishing items that complete the touring, trade, or service setup."
                  >
                    {!vehicle || !canopy ? (
                      <EmptyState copy="Choose the vehicle and canopy package first to reveal compatible accessories." />
                    ) : !accessories.length ? (
                      <EmptyState copy="No accessories are configured for this vehicle yet." />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                        {accessories.map((item) => (
                          <OptionTile
                            key={item._id}
                            title={item.name}
                            price={item.price}
                            selected={accessoryIds.includes(item._id)}
                            onClick={() => toggleSelection(item._id, accessoryIds, setAccessoryIds)}
                          />
                        ))}
                      </div>
                    )}
                  </BuilderSection>

                  <BuilderSection
                    step="05"
                    eyebrow="Get A Detailed Quote"
                    title="Send the build through to your team"
                    description="Capture the customer details and configuration on one page, similar to the reference builder flow."
                  >
                    {buildReady ? (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                          <TextField
                            label="Full name"
                            name="name"
                            value={quoteForm.name}
                            onChange={handleFormChange}
                            required
                          />
                          <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={quoteForm.email}
                            onChange={handleFormChange}
                            required
                          />
                          <TextField
                            label="Phone"
                            name="phone"
                            value={quoteForm.phone}
                            onChange={handleFormChange}
                            required
                          />
                          <TextField
                            label="Town / address"
                            name="address"
                            value={quoteForm.address}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#8a765a]">Comments</span>
                          <textarea
                            name="notes"
                            rows="5"
                            value={quoteForm.notes}
                            onChange={handleFormChange}
                            className="w-full rounded-[1.1rem] border border-[#e2d2b9] bg-[#fffdf9] px-4 py-3 text-[#1c1812] outline-none transition focus:border-[#c89d35]"
                            placeholder="Tell us about intended use, fitting needs, special requirements, or anything else the team should know."
                          />
                        </label>
                        <div className="flex flex-col gap-4 rounded-[1.4rem] border border-[#e2d2b9] bg-[#fbf7ef] p-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-[#8a765a]">Current estimate</p>
                            <p className="mt-2 font-display text-3xl uppercase tracking-[0.04em] text-[#1c1812]">
                              {formatCurrency(totalPrice)}
                            </p>
                          </div>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-full bg-[#f9bf1a] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.18em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                          >
                            {submitting ? "Sending quote..." : "Get detailed quote"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <EmptyState copy="Choose a vehicle platform and canopy package first, then the quote form will be ready." />
                    )}
                  </BuilderSection>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

const BuilderSection = ({ step, eyebrow, title, description, children }) => (
  <section className="rounded-[1.35rem] border border-[#dbc9ab] bg-white p-4 shadow-[0_16px_28px_rgba(72,54,29,0.06)] md:p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#946d15]">{eyebrow}</p>
        <h2 className="mt-2 font-display text-[1.3rem] uppercase tracking-[-0.02em] text-[#1c1812] md:text-[1.55rem]">
          {title}
        </h2>
      </div>
      <span className="rounded-full border border-[#ead9bc] bg-[#fbf6ed] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#8a765a]">
        Step {step}
      </span>
    </div>
    <p className="mt-2 text-sm leading-6 text-[#605344]">{description}</p>
    <div className="mt-4">{children}</div>
  </section>
);

const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <label className="block">
    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#8a765a]">{label}</span>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-[1rem] border border-[#e2d2b9] bg-[#fffdf9] px-4 py-3 text-sm text-[#1c1812] outline-none transition focus:border-[#c89d35] focus:bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const OptionTile = ({ title, price, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group overflow-hidden rounded-[1.1rem] border text-left transition ${
      selected
        ? "border-[#d4a332] bg-[linear-gradient(135deg,#fff8ea,#fffdf8)] shadow-[0_10px_24px_rgba(72,54,29,0.08)]"
        : "border-[#e3d5bf] bg-[#fffdfa] hover:border-[#d4a332]/45 hover:bg-white"
    }`}
  >
    <div className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[1rem] uppercase tracking-[0.03em] text-[#1c1812] sm:text-[1.05rem]">
            {title}
          </h3>
          <span className="mt-2 inline-flex w-fit rounded-full border border-[#eadcc6] bg-[#fbf6ed] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#946d15]">
            {formatCurrency(price)}
          </span>
        </div>
        <SelectionDot selected={selected} />
      </div>
    </div>
  </button>
);

const TextField = ({ label, name, type = "text", value, onChange, required }) => (
  <label className="block">
    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-[#8a765a]">{label}</span>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full rounded-[1rem] border border-[#e2d2b9] bg-[#fffdf9] px-4 py-3 text-sm text-[#1c1812] outline-none transition focus:border-[#c89d35] focus:bg-white"
    />
  </label>
);

const EmptyState = ({ copy }) => (
  <div className="rounded-[1.1rem] border border-dashed border-[#d8cab5] bg-[#fbf7f1] p-4 text-sm leading-6 text-[#6b5f51]">
    {copy}
  </div>
);

const SelectionDot = ({ selected }) => (
  <span
    className={`h-5 w-5 shrink-0 rounded-full border ${
      selected ? "border-[#d4a332] bg-[#d4a332]" : "border-[#ccbca4] bg-white"
    }`}
  />
);
