export const ProductCard = ({ item, selected, onClick, priceLabel, description, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-[1.1rem] border p-3 text-left transition duration-300 md:rounded-[1.5rem] md:p-4 xl:p-3.5 2xl:p-4 ${
      selected
        ? "border-[#f9bf1a] bg-[#f9bf1a]/10 shadow-glow"
        : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
    }`}
  >
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between md:gap-3 xl:flex-col">
      <div className="min-w-0">
        <h4 className="font-display text-base uppercase leading-[1.05] tracking-[0.04em] text-white md:text-xl md:tracking-[0.05em] xl:text-[1.2rem] 2xl:text-[1.3rem]">
          {item.name}
        </h4>
        <p className="mt-1.5 text-[13px] leading-5 text-white/60 md:text-sm md:leading-6 xl:text-[0.9rem] xl:leading-6 2xl:text-sm 2xl:leading-6">
          {description || item.description}
        </p>
      </div>
      <span className="self-start shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[#f9bf1a] md:px-3 md:text-[10px] md:tracking-[0.2em] xl:mt-1">
        {priceLabel}
      </span>
    </div>
    {badge ? (
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[#f9bf1a]/20 bg-[#f9bf1a]/8 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[#f9bf1a] md:px-3 md:text-[10px] md:tracking-[0.2em]">
          {badge}
        </span>
      </div>
    ) : null}
  </button>
);
