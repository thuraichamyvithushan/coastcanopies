import { useState } from "react";
import { categoryOrder, productConfig } from "../../config/productConfig.js";
import { formatNzd } from "../../utils/pricing.js";
import { AccessoryCard } from "./AccessoryCard.jsx";
import { BuildSummary } from "./BuildSummary.jsx";

export const ConfiguratorSidebar = ({ configurator, summaryProps }) => {
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const collapseOnMobile = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setDrawerCollapsed(true);
    }
  };
  const visibleCategories = categoryOrder.filter(
    (category) =>
      category === "Package" ||
      category === "Summary" ||
      configurator.accessories.some((item) => item.category === category)
  );
  const accessories = configurator.accessories.filter(
    (item) => item.category === configurator.activeCategory
  );

  return (
    <aside className="flex min-h-0 flex-col bg-[#131313] text-white lg:h-[calc(100vh-86px)]">
      <div className={`${drawerCollapsed ? "hidden lg:block" : "block"} border-b border-white/10 px-4 py-3 md:px-5`}>
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">Configurator</span>
          <button
            type="button"
            onClick={() => setDrawerCollapsed(true)}
            className="border border-white/15 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white/60"
          >
            Collapse
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-wrap">
          {visibleCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => configurator.setActiveCategory(category)}
              className={`shrink-0 border px-2.5 py-2 text-[9px] uppercase tracking-[0.14em] transition ${
                configurator.activeCategory === category
                  ? "border-[#efc400] bg-[#efc400] text-black"
                  : "border-white/10 text-white/45 hover:border-white/30 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={`${drawerCollapsed ? "hidden lg:block" : "block"} configurator-steps-scroll min-h-0 flex-1 overflow-y-auto p-4 md:p-5`}>
        {configurator.activeCategory === "Package" ? (
          <section>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#efc400]">Included in Base Package</p>
            <h2 className="mt-3 text-2xl font-semibold">{productConfig.name}</h2>
            <p className="mt-2 text-3xl font-semibold text-[#efc400]">{formatNzd(productConfig.basePrice)}</p>
            <span className="mt-4 inline-flex border border-[#efc400]/40 bg-[#efc400]/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#efc400]">
              {productConfig.standardInclusionCount} Standard Inclusions
            </span>
            <p className="mt-5 text-sm leading-6 text-white/55">{productConfig.description}</p>
            <button
              type="button"
              onClick={() => configurator.setActiveCategory("Tray & Storage")}
              className="mt-6 w-full bg-[#efc400] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-[#d9ad00]"
            >
              Explore Package
            </button>
          </section>
        ) : null}

        {accessories.length ? (
          <section>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#efc400]">Configure</p>
              <h2 className="mt-2 text-xl font-semibold">{configurator.activeCategory}</h2>
              <p className="mt-1 text-xs leading-5 text-white/40">Standard items are locked into the package.</p>
            </div>
            <div className="space-y-3">
              {accessories.map((accessory) => (
                <AccessoryCard
                  key={accessory.id}
                  accessory={accessory}
                  selected={configurator.selectedIds.includes(accessory.id)}
                  state={
                    accessory.id === "rooftop-tent"
                      ? configurator.rooftopTentState
                      : accessory.id === "awning"
                        ? configurator.awningState
                        : undefined
                  }
                  onStateChange={(stateName) => {
                    if (accessory.id === "rooftop-tent") {
                      configurator.setRooftopTentState(stateName);
                    } else {
                      configurator.setAwningState(stateName);
                    }
                    collapseOnMobile();
                  }}
                  onToggle={(item) => {
                    configurator.toggleAccessory(item);
                    collapseOnMobile();
                  }}
                  onFocus={(id) => {
                    configurator.setFocusedAccessoryId(id);
                    collapseOnMobile();
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {configurator.activeCategory === "Summary" ? <BuildSummary {...summaryProps} /> : null}
      </div>

      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#0d0d0d] px-4 py-3 md:px-5 lg:static">
        <button
          type="button"
          onClick={() => {
            if (drawerCollapsed) {
              setDrawerCollapsed(false);
            } else {
              configurator.setActiveCategory("Summary");
            }
          }}
          className="flex w-full items-center justify-between gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            {drawerCollapsed ? "Open Configurator" : "Current Total"}
          </span>
          <span className="text-lg font-semibold text-[#efc400]">
            {drawerCollapsed ? "Configure ↑" : formatNzd(configurator.grandTotal)}
          </span>
        </button>
      </div>
    </aside>
  );
};
