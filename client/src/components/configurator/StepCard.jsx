export const StepCard = ({ index, title, active, complete, children }) => (
  <section
    className={`panel rounded-[1.5rem] p-4 transition duration-300 md:rounded-3xl md:p-6 xl:p-5 2xl:p-6 ${
      active ? "gold-ring shadow-glow" : complete ? "border-[#f9bf1a]/20" : ""
    }`}
  >
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-5">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.35em] text-[#f9bf1a] md:text-sm md:tracking-[0.45em]">
          Step {index}
        </p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-[1.05] tracking-[0.06em] text-white md:text-3xl md:tracking-[0.08em] xl:text-[2rem] 2xl:text-3xl">
          {title}
        </h3>
      </div>
      <span
        className={`self-start rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] md:px-4 md:text-xs md:tracking-[0.3em] ${
          complete
            ? "bg-[#f9bf1a] text-black"
            : active
              ? "bg-white/10 text-white"
              : "bg-white/5 text-white/40"
        }`}
      >
        {complete ? "Ready" : active ? "Current" : "Pending"}
      </span>
    </div>
    {children}
  </section>
);
