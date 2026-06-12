export const StepCard = ({ index, title, summary, active, complete, open, onToggle, children }) => (
  <section
    className={`panel rounded-[1.25rem] p-3 transition duration-300 md:rounded-[1.7rem] md:p-4 xl:p-4 2xl:p-5 ${
      active ? "gold-ring shadow-glow" : complete ? "border-[#f9bf1a]/20" : ""
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-3 text-left"
    >
      <div className="min-w-0">
        <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[#f9bf1a] md:text-xs md:tracking-[0.38em]">
          Step {index}
        </p>
        <h3 className="mt-1.5 font-display text-xl uppercase leading-[1.05] tracking-[0.05em] text-white md:text-[1.65rem] md:tracking-[0.06em] xl:text-[1.75rem] 2xl:text-[1.9rem]">
          {title}
        </h3>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-white/58 md:text-sm">
          {summary}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] md:px-3 md:text-[10px] md:tracking-[0.22em] ${
            complete
              ? "bg-[#f9bf1a] text-black"
              : active
                ? "bg-white/10 text-white"
                : "bg-white/5 text-white/40"
          }`}
        >
          {complete ? "Ready" : active ? "Current" : "Pending"}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-display text-lg text-white/80">
          {open ? "-" : "+"}
        </span>
      </div>
    </button>

    {open ? <div className="mt-3 border-t border-white/8 pt-3 md:mt-4 md:pt-4">{children}</div> : null}
  </section>
);
