import { useState } from "react";
import { formatNzd } from "../../utils/pricing.js";
import { AccessoryCard } from "./AccessoryCard.jsx";
import { BuildSummary } from "./BuildSummary.jsx";
import { ProductCard } from "./ProductCard.jsx";

const steps = ["Vehicle", "Tray", "Canopy", "Accessories", "Summary"];

export const ConfiguratorSidebar = ({ configurator, summaryProps, loading }) => {
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const accessories = configurator.accessories.filter(
    (item) => item.adminProduct?.type !== "canopy" && item.adminProduct?.type !== "tray"
  );
  const stepIndex = steps.indexOf(configurator.activeCategory);
  const nextStep = steps[stepIndex + 1];

  return (
    <aside className="flex min-h-0 flex-col bg-[#131313] text-white lg:h-[calc(100vh-86px)]">
      <div className={`${drawerCollapsed ? "hidden lg:block" : "block"} border-b border-white/10 px-4 py-3 md:px-5`}>
        <nav aria-label="Build steps" className="flex gap-1 overflow-x-auto pb-1 lg:flex-wrap">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              disabled={!configurator.canAccessCategory(step)}
              aria-current={configurator.activeCategory === step ? "step" : undefined}
              onClick={() => configurator.setActiveCategory(step)}
              className={`shrink-0 border px-2.5 py-2 text-[9px] uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-30 ${
                configurator.activeCategory === step
                  ? "border-[#efc400] bg-[#efc400] text-black"
                  : "border-white/10 text-white/65 hover:border-white/30 hover:text-white"
              }`}
            >
              {index + 1}. {step}
            </button>
          ))}
        </nav>
      </div>

      <div className={`${drawerCollapsed ? "hidden lg:block" : "block"} configurator-steps-scroll min-h-0 flex-1 overflow-y-auto p-4 md:p-5`}>
        {loading ? <p role="status" className="text-sm text-white/60">Loading vehicles and products...</p> : null}

        {configurator.activeCategory === "Vehicle" ? (
          <section>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#efc400]">Step 1</p>
            <h2 className="mt-2 text-xl font-semibold">Choose your vehicle</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">Select your vehicle, then choose a tray, canopy, and accessories.</p>
            <div className="mt-5 space-y-3">
              {configurator.vehicles.map((vehicle) => (
                <ProductCard
                  key={vehicle._id}
                  item={vehicle}
                  selected={configurator.selectedVehicle?._id === vehicle._id}
                  onClick={() => configurator.selectVehicle(vehicle)}
                  description={vehicle.brand}
                  priceLabel={configurator.selectedVehicle?._id === vehicle._id ? "Selected" : "Select vehicle"}
                />
              ))}
              {!loading && !configurator.vehicles.length ? <p className="text-sm text-white/55">No vehicles are available yet.</p> : null}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Tray" ? (
          <section>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#efc400]">Step 2</p>
            <h2 className="mt-2 text-xl font-semibold">Choose your tray</h2>
            <p className="mt-2 text-sm text-white/55">Vehicle: {configurator.selectedVehicle?.name}</p>
            <div className="mt-5 space-y-3">
              {configurator.trays.map((tray) => (
                <ProductCard
                  key={tray.id}
                  item={tray}
                  selected={configurator.selectedTray?.id === tray.id}
                  onClick={() => configurator.selectTray(tray)}
                  description={tray.adminProduct.description}
                  priceLabel={`+ ${formatNzd(tray.price)}`}
                  badge={configurator.selectedTray?.id === tray.id ? "Selected" : undefined}
                />
              ))}
              {!loading && !configurator.trays.length ? <p className="text-sm text-white/55">No trays are available yet.</p> : null}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Canopy" ? (
          <section>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#efc400]">Step 3</p>
            <h2 className="mt-2 text-xl font-semibold">Choose your canopy</h2>
            <p className="mt-2 text-sm text-white/55">Tray: {configurator.selectedTray?.name}</p>
            <div className="mt-5 space-y-3">
              {configurator.canopies.map((canopy) => (
                <ProductCard
                  key={canopy.id}
                  item={canopy}
                  selected={configurator.selectedCanopy?.id === canopy.id}
                  onClick={() => configurator.selectCanopy(canopy)}
                  description={canopy.adminProduct.description}
                  priceLabel={`+ ${formatNzd(canopy.price)}`}
                  badge={configurator.selectedCanopy?.id === canopy.id ? "Selected" : undefined}
                />
              ))}
              {!loading && !configurator.canopies.length ? <p className="text-sm text-white/55">No canopies are available yet.</p> : null}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Accessories" ? (
          <section>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#efc400]">Step 4</p>
            <h2 className="mt-2 text-xl font-semibold">Add accessories</h2>
            <p className="mt-2 text-sm text-white/55">Canopy: {configurator.selectedCanopy?.name}. Accessories are optional.</p>
            <div className="mt-5 space-y-3">
              {accessories.map((accessory) => (
                <AccessoryCard
                  key={accessory.id}
                  accessory={accessory}
                  selected={configurator.selectedIds.includes(accessory.id)}
                  state={accessory.transformId === "rooftop-tent" ? configurator.rooftopTentState : accessory.transformId === "awning" ? configurator.awningState : undefined}
                  onStateChange={(stateName) => {
                    if (accessory.transformId === "rooftop-tent") configurator.setRooftopTentState(stateName);
                    else configurator.setAwningState(stateName);
                  }}
                  onToggle={configurator.toggleAccessory}
                  onFocus={configurator.setFocusedAccessoryId}
                />
              ))}
              {!accessories.length ? <p className="text-sm text-white/55">No accessories are available. Continue to review your build.</p> : null}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Summary" ? <BuildSummary {...summaryProps} /> : null}

        <div className="mt-6 flex gap-2">
          {stepIndex > 0 ? (
            <button type="button" onClick={() => configurator.setActiveCategory(steps[stepIndex - 1])} className="border border-white/20 px-4 py-3 text-xs text-white/70">
              Back
            </button>
          ) : null}
          {nextStep ? (
            <button
              type="button"
              disabled={!configurator.canAccessCategory(nextStep)}
              onClick={() => configurator.setActiveCategory(nextStep)}
              className="flex-1 bg-[#efc400] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              {nextStep === "Summary" ? "Review build" : `Continue to ${nextStep}`}
            </button>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#0d0d0d] px-4 py-3 md:px-5 lg:static">
        <button type="button" onClick={() => setDrawerCollapsed((current) => !current)} className="mb-3 w-full border border-white/20 px-3 py-2 text-xs text-white/70 lg:hidden">
          {drawerCollapsed ? "Open configurator" : "Hide configurator"}
        </button>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">Current Total</span>
          <span className="text-lg font-semibold text-[#efc400]">{formatNzd(configurator.grandTotal)}</span>
        </div>
      </div>
    </aside>
  );
};
