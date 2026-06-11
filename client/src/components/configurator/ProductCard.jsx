export const ProductCard = ({ item, selected, onClick, priceLabel, description, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-[1.3rem] border p-4 text-left transition duration-300 md:rounded-3xl md:p-5 xl:p-4 2xl:p-5 ${
      selected
        ? "border-[#f9bf1a] bg-[#f9bf1a]/10 shadow-glow"
        : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
    }`}
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:gap-4 xl:flex-col">
      <div className="min-w-0">
        <h4 className="font-display text-lg uppercase leading-[1.05] tracking-[0.05em] text-white md:text-2xl md:tracking-[0.06em] xl:text-[1.4rem] 2xl:text-[1.5rem]">
          {item.name}
        </h4>
        <p className="mt-2 text-sm leading-6 text-white/60 md:text-[15px] md:leading-7 xl:text-[0.95rem] xl:leading-7 2xl:text-[15px] 2xl:leading-7">
          {description || item.description}
        </p>
      </div>
      <span className="self-start shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f9bf1a] md:px-3 md:text-xs md:tracking-[0.25em] xl:mt-1">
        {priceLabel}
      </span>
    </div>
    {badge ? (
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[#f9bf1a]/20 bg-[#f9bf1a]/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f9bf1a] md:px-3 md:text-[11px] md:tracking-[0.24em]">
          {badge}
        </span>
      </div>
    ) : null}
  </button>
);
