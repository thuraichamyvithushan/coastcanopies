import { preloadModel } from "../../utils/preloadModel.js";

export const ProductCard = ({ item, selected, onClick, priceLabel, description, badge, inlineMeta = false }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={() => preloadModel(item.modelUrl || item.model)}
    onFocus={() => preloadModel(item.modelUrl || item.model)}
    aria-pressed={selected}
    className={`w-full px-1 py-3 text-left transition lg:border lg:p-4 lg:rounded-[1.5rem] xl:p-3.5 2xl:p-4 ${
      selected
        ? "lg:border-[#f9bf1a] lg:bg-[#f9bf1a]/10 lg:shadow-glow"
        : "hover:text-[#f9bf1a] lg:border-white/10 lg:bg-white/[0.03] lg:hover:border-white/30 lg:hover:bg-white/[0.05]"
    }`}
  >
    <div className={`flex justify-between gap-3 ${inlineMeta ? "items-center" : "items-start"}`}>
      <div className="min-w-0">
        <h4 className="font-display text-sm font-semibold leading-[1.25] text-white lg:text-xl lg:font-normal lg:uppercase lg:tracking-[0.05em] xl:text-[1.2rem] 2xl:text-[1.3rem]">
          {item.name}
        </h4>
        {!inlineMeta ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-white/55 lg:mt-1.5 lg:text-sm lg:leading-6 xl:text-[0.9rem] xl:leading-6 2xl:text-sm 2xl:leading-6">
            {description || item.description}
          </p>
        ) : null}
      </div>
      <span className="max-w-[38%] shrink-0 text-right text-[11px] leading-tight text-[#f9bf1a] lg:max-w-none lg:rounded-full lg:border lg:border-white/10 lg:px-3 lg:py-1 lg:text-[10px] lg:uppercase lg:tracking-[0.2em]">
        {priceLabel}
      </span>
    </div>
    {badge ? (
      <div className="mt-2 hidden flex-wrap gap-2 lg:flex">
        <span className="rounded-full border border-[#f9bf1a]/20 bg-[#f9bf1a]/8 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f9bf1a]">
          {badge}
        </span>
      </div>
    ) : null}
    <span aria-hidden="true" className={`mt-2 block h-px w-6 lg:hidden ${selected ? "bg-[#f9bf1a]" : "bg-white/25"}`} />
  </button>
);
