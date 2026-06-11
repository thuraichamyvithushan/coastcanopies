import { Link } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading.jsx";
import { SiteShell } from "../components/layout/SiteShell.jsx";

const steps = [
  "Pick the ute platform that matches your build.",
  "Choose the canopy architecture and tray package.",
  "Layer premium touring modules and hardware.",
  "Review the live visual and send the workshop brief."
];

const metrics = [
  { value: "4", label: "Vehicle platforms" },
  { value: "12", label: "Factory-ready options" },
  { value: "1", label: "Luxury builder flow" }
];

const featureCards = [
  {
    title: "Live SVG Visuals",
    copy: "A clean layered side-profile view lets customers understand proportion, fitment, and upgrade placement immediately."
  },
  {
    title: "Instant Price Engine",
    copy: "Every canopy, module, and accessory updates the running estimate in real time for a clear premium-buying experience."
  },
  {
    title: "Workshop-Ready Data",
    copy: "Each submission lands with full configuration detail so your team can move from enquiry to quote with less back-and-forth."
  }
];

const pillars = [
  {
    eyebrow: "Material Language",
    title: "Industrial surfaces, luxury pacing",
    copy: "The interface now blends deep graphite panels, brushed light sections, and gold illumination to feel more like a premium vehicle brand than a plain builder."
  },
  {
    eyebrow: "Conversion Flow",
    title: "Designed to move customers forward",
    copy: "Every section builds confidence first, then invites action, making the configurator feel aspirational instead of purely functional."
  }
];

const showcasePoints = [
  "Premium black and gold visual language",
  "Champagne detail surfaces for contrast",
  "Faster path from discovery to quote"
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#1d1d1d_0%,#181818_100%)] px-6 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="absolute inset-0 bg-grid bg-[size:24px_24px] opacity-[0.12]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#f9bf1a]/12 blur-3xl" />
        <div className="absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="relative z-10">
            <p className="font-display text-sm uppercase tracking-[0.6em] text-[#f9bf1a]">Premium Fit-Out Builder</p>
            <h1 className="mt-6 max-w-5xl font-display text-6xl leading-[0.88] tracking-[-0.05em] text-[#fff9ee] md:text-8xl">
              Golden premium presence for modern canopy builds.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f7f0df]/80">
              Coast Canopies now leads with polished contrast, metallic warmth, and a more cinematic landing
              experience that sells the quality of the build before a customer even opens the configurator.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/configurator"
                className="rounded-full bg-[#f9bf1a] px-7 py-3 font-medium text-black shadow-[0_16px_48px_rgba(249,191,26,0.36)] transition hover:-translate-y-0.5 hover:opacity-90"
              >
                Start Configuring
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="gold-outline rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-5 backdrop-blur-xl"
                >
                  <p className="font-display text-4xl tracking-[-0.05em] text-[#f9bf1a]">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_top,_rgba(249,191,26,0.34),_transparent_58%)] blur-2xl" />
            <div className="gold-surface gold-outline relative overflow-hidden rounded-[2.8rem] p-8">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#fff1cb]/75 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.45em] text-[#f9bf1a]">Configurator Flow</p>
                  <h2 className="mt-3 font-display text-4xl tracking-[-0.05em] text-white">From platform to quote</h2>
                </div>
                <div className="rounded-full border border-[#f9bf1a]/18 bg-[#fff4cf]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#f3e7c2]">
                  Signature Spec
                </div>
              </div>
              <div className="mt-8 grid gap-4 rounded-[2rem] border border-[#f9bf1a]/14 bg-[linear-gradient(180deg,rgba(255,248,229,0.12),rgba(255,255,255,0.02))] p-5 sm:grid-cols-3">
                {showcasePoints.map((item) => (
                  <div key={item} className="rounded-[1.3rem] border border-white/8 bg-black/14 p-4">
                    <div className="h-1.5 w-12 rounded-full bg-[#f9bf1a]" />
                    <p className="mt-4 text-sm leading-6 text-[#f5ecd4]/82">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {steps.map((item, index) => (
                  <div
                    key={item}
                    className="group flex gap-4 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-4 transition hover:border-[#f9bf1a]/30 hover:bg-[linear-gradient(180deg,rgba(249,191,26,0.14),rgba(255,255,255,0.04))]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f9bf1a] font-display text-lg text-black shadow-[0_12px_24px_rgba(249,191,26,0.28)]">
                      0{index + 1}
                    </span>
                    <p className="pt-2 text-white/78 transition group-hover:text-white">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.8rem] border border-[#f9bf1a]/18 bg-[linear-gradient(145deg,rgba(249,191,26,0.18),rgba(255,255,255,0.03))] p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-[#f9bf1a]">Signature Finish</p>
                <p className="mt-3 max-w-md text-white/72">
                  Gold edge-lighting and brushed neutral surfaces keep the page elevated while the darker base
                  still anchors it in the Coast Canopies workshop world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#181818_0%,#151515_100%)] px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why It Works"
            title="Builder-first experience with a premium showroom tone"
            description="The page now balances aspiration and practicality, presenting the configurator like a higher-end automotive product instead of a flat utility form."
            theme="dark"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featureCards.map((item) => (
              <article
                key={item.title}
                className="panel rounded-[2rem] p-6"
              >
                <div className="mb-5 h-1.5 w-16 rounded-full bg-[#f9bf1a]" />
                <h3 className="font-display text-3xl tracking-[-0.04em] text-white">{item.title}</h3>
                <p className="mt-4 text-white/72">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#171717_0%,#141414_100%)] px-6 py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f9bf1a]/40 to-transparent" />
        <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-[#f9bf1a]/8 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="gold-surface gold-outline rounded-[2.6rem] p-8">
            <p className="font-display text-sm uppercase tracking-[0.5em] text-[#f9bf1a]">Visual Direction</p>
            <h2 className="mt-4 max-w-lg font-display text-5xl leading-[0.95] tracking-[-0.05em] text-white">
              More premium glow, less generic dark UI.
            </h2>
            <p className="mt-5 max-w-xl text-white/68">
              The new page leans into a black, champagne, and gold palette with warmer depth and cleaner composition,
              giving Coast Canopies a sharper luxury identity.
            </p>
            <Link
              to="/configurator"
              className="mt-8 inline-flex rounded-full border border-[#f9bf1a]/35 px-6 py-3 text-white transition hover:bg-[#f9bf1a] hover:text-black"
            >
              Explore the Builder
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((item) => (
              <article
                key={item.title}
                className="gold-outline rounded-[2.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6"
              >
                <p className="text-sm uppercase tracking-[0.28em] text-[#f9bf1a]">{item.eyebrow}</p>
                <h3 className="mt-4 font-display text-3xl leading-tight tracking-[-0.04em] text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-white/64">{item.copy}</p>
              </article>
            ))}
            <article className="rounded-[2.3rem] border border-[#f9bf1a]/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(249,191,26,0.12))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:col-span-2">
              <p className="text-sm uppercase tracking-[0.28em] text-[#f9bf1a]">Ready To Build</p>
              <h3 className="mt-4 max-w-2xl font-display text-4xl leading-tight tracking-[-0.05em] text-white">
                Launch a richer customer journey with a builder that already feels premium.
              </h3>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/configurator"
                  className="rounded-full bg-[#222222] px-6 py-3 text-white transition hover:bg-[#2a2a2a]"
                >
                  Launch Configurator
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
