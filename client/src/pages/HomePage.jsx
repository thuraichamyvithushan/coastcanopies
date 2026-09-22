import { Link } from "react-router-dom";
import { SiteShell } from "../components/layout/SiteShell.jsx";

const benefits = [
  { number: "01", title: "Engineered fit", copy: "Vehicle-specific systems designed around the way you tour, work and carry." },
  { number: "02", title: "Premium finish", copy: "Powder-coated aluminium, precise hardware and a clean, durable visual language." },
  { number: "03", title: "Built your way", copy: "Choose your platform, canopy and accessories in one guided online builder." }
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-[#111] text-white">
        <img
          src="/assets/generated/coastal-canopy-hero.png"
          alt="Premium canopy-equipped touring vehicle overlooking the coast"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(8,8,8,0.76)_37%,rgba(8,8,8,0.18)_72%,rgba(8,8,8,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,8,8,0.82)_0%,transparent_40%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.45em] text-[#f9bf1a]">Australian touring systems</p>
            <h1 className="mt-6 font-display text-5xl uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-[6.5rem]">
              Carry more.<br />Go further.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
              Premium canopy systems built for hard work, long weekends and the roads that begin where the bitumen ends.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/configurator"
                className="rounded-full bg-[#f9bf1a] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-black transition hover:-translate-y-0.5 hover:bg-[#ffd04a]"
              >
                Build your canopy
              </Link>
              <a
                href="#systems"
                className="rounded-full border border-white/30 bg-black/20 px-7 py-3.5 text-sm uppercase tracking-[0.16em] text-white backdrop-blur transition hover:border-white"
              >
                Explore systems
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eee5] px-6 py-20 text-[#1d1a15] md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.number} className="border-t border-[#cdbd9f] pt-5">
                <p className="text-xs tracking-[0.3em] text-[#98711b]">{benefit.number}</p>
                <h2 className="mt-5 font-display text-3xl uppercase tracking-[-0.02em]">{benefit.title}</h2>
                <p className="mt-3 max-w-sm leading-7 text-[#62594d]">{benefit.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="systems" className="overflow-hidden bg-[#151515] px-6 py-20 text-white md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-[#f9bf1a]/10 blur-2xl" />
            <img
              src="/assets/generated/canopy-storage-detail.png"
              alt="Open canopy with organized drawer and touring storage system"
              loading="lazy"
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl"
            />
          </div>
          <div className="lg:pl-8">
            <p className="text-xs uppercase tracking-[0.42em] text-[#f9bf1a]">Inside the system</p>
            <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-[-0.035em] sm:text-6xl">
              Every millimetre earns its place.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/62">
              Drawer storage, fridge slides, water systems and touring modules combine into one considered setup. Configure only what you need and see the estimate update as you build.
            </p>
            <Link to="/configurator" className="mt-8 inline-flex items-center gap-3 text-sm uppercase tracking-[0.22em] text-[#f9bf1a]">
              Open the builder <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eee5] px-6 py-20 text-[#1d1a15] md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-[#98711b]">Made for escape</p>
              <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.96] tracking-[-0.035em] sm:text-6xl">
                From workshop precision to open-country freedom.
              </h2>
            </div>
            <p className="max-w-sm leading-7 text-[#62594d]">A durable setup should disappear into the journey—simple to use, secure on the road and ready when camp goes up.</p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src="/assets/generated/coastal-camp-lifestyle.png"
              alt="Canopy-equipped touring vehicle at a quiet coastal campsite"
              loading="lazy"
              className="aspect-[16/8] min-h-[420px] w-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-7 pt-24 text-white md:p-10 md:pt-32">
              <p className="max-w-xl font-display text-2xl uppercase tracking-[0.04em] md:text-4xl">Your next setup starts here.</p>
              <Link to="/configurator" className="mt-5 inline-flex rounded-full bg-[#f9bf1a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black">
                Configure now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
