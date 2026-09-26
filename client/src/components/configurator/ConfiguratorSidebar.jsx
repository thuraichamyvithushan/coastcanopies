import { useEffect, useRef } from "react";
import { formatNzd } from "../../utils/pricing.js";
import { AccessoryCard } from "./AccessoryCard.jsx";
import { BuildSummary } from "./BuildSummary.jsx";
import { ProductCard } from "./ProductCard.jsx";

const steps = ["Vehicle", "Tray", "Canopy", "Accessories", "Summary"];

const StepIcon = ({ step }) => {
  const paths = {
    Vehicle: <><path d="M3 15V9l3-3h12l3 3v6" /><path d="M3 15h18M6 15v3m12-3v3M7 10h10" /><circle cx="7" cy="16" r="1" /><circle cx="17" cy="16" r="1" /></>,
    Tray: <><path d="M3 8v8h18V8M3 12h18M6 16v2m12-2v2" /><path d="M6 8h12" /></>,
    Canopy: <><path d="M3 17V9l3-3h12l3 3v8H3Z" /><path d="M3 11h18M7 17v-6m10 6v-6" /></>,
    Accessories: <><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" /></>,
    Summary: <><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" /></>
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{paths[step]}</svg>;
};

export const ConfiguratorSidebar = ({ configurator, summaryProps, previewStatuses, loading }) => {
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const previousCategory = useRef(configurator.activeCategory);
  const accessories = configurator.accessories.filter(
    (item) => item.adminProduct?.type !== "canopy" && item.adminProduct?.type !== "tray"
  );
  const stepIndex = steps.indexOf(configurator.activeCategory);
  const nextStep = steps[stepIndex + 1];
  const canOpenStep = (step) => {
    if (step === configurator.activeCategory) return true;
    return configurator.canAccessCategory(step) &&
      steps.slice(0, steps.indexOf(step)).every((previousStep) => previewStatuses[previousStep] === "ready");
  };
  const currentPreviewStatus = previewStatuses[configurator.activeCategory];
  const currentSelectionLabel = configurator.activeCategory === "Accessories"
    ? "accessories" : configurator.activeCategory.toLowerCase();
  const selectedOnCurrentStep = Boolean({
    Vehicle: configurator.selectedVehicle,
    Tray: configurator.selectedTray,
    Canopy: configurator.selectedCanopy,
    Accessories: true
  }[configurator.activeCategory]);
  const nextStepAvailable = nextStep ? canOpenStep(nextStep) : false;

  useEffect(() => {
    if (previousCategory.current === configurator.activeCategory) return;
    previousCategory.current = configurator.activeCategory;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      sidebarRef.current?.scrollIntoView({ block: "start" });
    } else {
      contentRef.current?.scrollTo({ top: 0 });
    }
  }, [configurator.activeCategory]);

  return (
    <aside ref={sidebarRef} className={`mobile-builder-sidebar ${configurator.activeCategory === "Summary" ? "mobile-builder-sidebar-summary" : ""} flex min-h-0 flex-col bg-[#131313] text-white lg:h-[calc(100vh-86px)]`}>
      <div className="border-b border-white/10 px-2 py-1.5 lg:px-5 lg:py-3">
        <nav aria-label="Build steps" className="grid grid-cols-5 lg:flex lg:flex-wrap lg:gap-1">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              disabled={!canOpenStep(step)}
              aria-current={configurator.activeCategory === step ? "step" : undefined}
              aria-label={`${index + 1}. ${step}`}
              title={step}
              onClick={() => configurator.setActiveCategory(step)}
              className={`flex min-h-11 min-w-0 items-center justify-center border-b-2 px-1 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-30 lg:min-h-0 lg:shrink-0 lg:border lg:px-2.5 lg:text-[10px] lg:uppercase lg:tracking-[0.14em] ${
                configurator.activeCategory === step
                  ? "border-[#efc400] text-[#efc400] lg:bg-[#efc400] lg:text-black"
                  : "border-transparent text-white/65 hover:text-white lg:border-white/10 lg:hover:border-white/30"
              }`}
            >
              <span className="lg:hidden"><StepIcon step={step} /></span>
              <span className="hidden lg:inline">{index + 1}. {step}</span>
            </button>
          ))}
        </nav>
      </div>

      <div ref={contentRef} className="configurator-steps-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2.5 sm:px-4 lg:p-5">
        {loading ? <p role="status" className="text-sm text-white/60">Loading vehicles and products...</p> : null}

        {configurator.activeCategory === "Vehicle" ? (
          <section>
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[#efc400] lg:block">Step 1</p>
            <h2 className="text-sm font-semibold lg:mt-2 lg:text-xl"><span className="lg:hidden">Vehicle</span><span className="hidden lg:inline">Choose your vehicle</span></h2>
            <p className="mt-1 text-xs leading-5 text-white/60 lg:mt-2 lg:text-sm lg:leading-6">Select a vehicle to start your build.</p>
            <div className="mt-2 lg:mt-5 lg:space-y-3">
              {configurator.vehicles.map((vehicle) => (
                <ProductCard
                  key={vehicle._id}
                  item={vehicle}
                  selected={configurator.selectedVehicle?._id === vehicle._id}
                  onClick={() => configurator.selectVehicle(vehicle)}
                  inlineMeta
                  priceLabel={vehicle.brand}
                />
              ))}
              {!loading && !configurator.vehicles.length ? <p className="text-sm text-white/55">No vehicles are available yet.</p> : null}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Tray" ? (
          <section>
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[#efc400] lg:block">Step 2</p>
            <h2 className="text-sm font-semibold lg:mt-2 lg:text-xl"><span className="lg:hidden">Tray</span><span className="hidden lg:inline">Choose your tray</span></h2>
            <p className="mt-1 text-xs text-white/60 lg:mt-2 lg:text-sm">{configurator.selectedVehicle?.name}</p>
            <div className="mt-2 lg:mt-5 lg:space-y-3">
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
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[#efc400] lg:block">Step 3</p>
            <h2 className="text-sm font-semibold lg:mt-2 lg:text-xl"><span className="lg:hidden">Canopy</span><span className="hidden lg:inline">Choose your canopy</span></h2>
            <p className="mt-1 text-xs text-white/60 lg:mt-2 lg:text-sm">{configurator.selectedTray?.name}</p>
            <div className="mt-2 lg:mt-5 lg:space-y-3">
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
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[#efc400] lg:block">Step 4</p>
            <h2 className="text-sm font-semibold lg:mt-2 lg:text-xl"><span className="lg:hidden">Accessories</span><span className="hidden lg:inline">Add accessories</span></h2>
            <p className="mt-1 text-xs text-white/60 lg:mt-2 lg:text-sm">Optional extras for {configurator.selectedCanopy?.name}</p>
            <div className="mt-2 lg:mt-5 lg:space-y-3">
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
                />
              ))}
              {!accessories.length ? <p className="text-sm text-white/55">No accessories are available. Continue to review your build.</p> : null}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Summary" ? <BuildSummary {...summaryProps} /> : null}

        {selectedOnCurrentStep && currentPreviewStatus !== "ready" ? (
          <p role="status" className="mt-4 border-l-2 border-[#efc400] py-1 pl-3 text-xs leading-5 text-white/65 lg:mt-5 lg:bg-[#efc400]/[0.06] lg:px-4 lg:py-3">
            {currentPreviewStatus === "missing"
              ? "This selection has no 3D model. Choose an option with a preview to continue."
              : currentPreviewStatus === "error"
                ? "The 3D preview could not load. Retry it in the viewer or choose another option."
                : `Updating your selected ${currentSelectionLabel} before continuing...`}
          </p>
        ) : null}
        {configurator.pendingAdvance?.step === configurator.activeCategory && currentPreviewStatus === "ready" ? (
          <p role="status" className="mt-4 border-l-2 border-[#efc400] py-1 pl-3 text-xs leading-5 text-white/65 lg:mt-5 lg:bg-[#efc400]/[0.06] lg:px-4 lg:py-3">
            3D preview ready. Moving to {nextStep?.toLowerCase()}...
          </p>
        ) : null}

        <div className="mt-3 flex justify-end gap-2 lg:mt-6">
          {stepIndex > 0 ? (
            <button
              type="button"
              aria-label={`Back to ${steps[stepIndex - 1]}`}
              title={`Back to ${steps[stepIndex - 1]}`}
              onClick={() => configurator.setActiveCategory(steps[stepIndex - 1])}
              className="flex h-9 w-9 items-center justify-center text-white/70 lg:h-auto lg:w-auto lg:border lg:border-white/20 lg:px-4 lg:py-3 lg:text-xs"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 lg:hidden"><path d="m14 5-7 7 7 7M7 12h13" /></svg>
              <span className="hidden lg:inline">Back</span>
            </button>
          ) : null}
          {nextStep ? (
            <button
              type="button"
              disabled={!nextStepAvailable}
              aria-label={nextStep === "Summary" ? "Review build" : `Continue to ${nextStep}`}
              title={nextStep === "Summary" ? "Review build" : `Continue to ${nextStep}`}
              onClick={() => configurator.setActiveCategory(nextStep)}
              className="flex h-9 w-9 items-center justify-center bg-[#efc400] text-black disabled:cursor-not-allowed disabled:opacity-30 lg:h-auto lg:w-auto lg:flex-1 lg:px-4 lg:py-3 lg:text-xs lg:font-semibold lg:uppercase lg:tracking-[0.12em]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 lg:hidden"><path d="m10 5 7 7-7 7M4 12h13" /></svg>
              <span className="hidden lg:inline">
                {!nextStepAvailable && selectedOnCurrentStep && currentPreviewStatus === "loading"
                  ? `Updating your selected ${currentSelectionLabel}...`
                  : nextStep === "Summary" ? "Review build" : `Continue to ${nextStep}`}
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="hidden border-t border-white/10 bg-[#0d0d0d] px-5 py-3 lg:block">
        {configurator.selectedVehicle ? (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">Current Total</span>
            <span className="text-base font-semibold text-[#efc400] sm:text-lg">{formatNzd(configurator.grandTotal)}</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
