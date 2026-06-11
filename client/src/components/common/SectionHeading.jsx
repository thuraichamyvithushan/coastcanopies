export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "dark"
}) => (
  <div className={align === "center" ? "text-center" : ""}>
    {eyebrow ? (
      <p className="font-display text-sm uppercase tracking-[0.5em] text-[#f9bf1a]">{eyebrow}</p>
    ) : null}
    <h2
      className={`mt-3 font-display text-4xl tracking-[-0.04em] md:text-5xl ${
        theme === "light" ? "text-[#17120d]" : "text-white"
      }`}
    >
      {title}
    </h2>
    {description ? (
      <p className={`mt-4 max-w-2xl ${theme === "light" ? "text-[#4a4032]" : "text-white/65"}`}>
        {description}
      </p>
    ) : null}
  </div>
);
