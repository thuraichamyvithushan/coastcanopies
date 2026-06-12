import { Suspense, lazy } from "react";

const ThreeDPreview = lazy(() => import("./ThreeDPreview.jsx"));

export const PreviewPanel = ({ vehicle, canopy, modules, accessories }) => {
  if (!vehicle) {
    return (
      <div className="panel w-full rounded-[1.4rem] p-3 shadow-glow md:max-w-[620px] md:rounded-[2rem] md:p-4 lg:max-w-[680px] xl:max-w-none">
        <div className="md:px-2 lg:px-0">
          <div className="mx-auto w-full overflow-hidden rounded-[1.2rem] border border-white/10 md:max-w-[520px] lg:max-w-[560px] xl:max-w-[620px] md:rounded-[1.6rem]">
            <div className="relative min-h-[220px] overflow-hidden md:min-h-[360px] lg:min-h-[400px] 2xl:min-h-[440px]">
              <img
                src="/assets/generated/configurator-showroom-hero.png"
                alt="Premium canopy build showroom concept"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,8,6,0.88),rgba(9,8,6,0.38),rgba(9,8,6,0.82))]" />
              <div className="relative flex min-h-[220px] items-center justify-center p-5 md:min-h-[360px] md:p-8 lg:min-h-[400px] 2xl:min-h-[440px]">
                <div className="max-w-sm text-center">
                  <p className="font-display text-[11px] uppercase tracking-[0.38em] text-[#f9bf1a] md:text-xs">
                    3D Builder Preview
                  </p>
                  <h3 className="mt-2 font-display text-xl uppercase tracking-[0.05em] text-white md:mt-3 md:text-[1.9rem]">
                    Select a vehicle to start.
                  </h3>
                  <p className="mt-2 text-xs text-white/62 md:mt-3 md:text-sm">
                    The live preview will load here once you choose a vehicle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel w-full rounded-[1.4rem] p-3 shadow-glow md:max-w-[620px] md:rounded-[2rem] md:p-4 lg:max-w-[680px] xl:max-w-none">
      <div className="mb-3 flex items-center justify-between gap-3 px-1 md:mb-4 md:px-2">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.45em] text-[#f9bf1a]">Live Preview</p>
          <h3 className="mt-1 font-display text-xl uppercase tracking-[0.06em] text-white md:mt-2 md:text-[1.7rem]">
            {vehicle.name}
          </h3>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/65 md:px-3 md:text-xs md:tracking-[0.3em]">
          Live 3D
        </span>
      </div>

      <div className="md:px-2 lg:px-0">
        <div className="mx-auto w-full overflow-hidden rounded-[1.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,214,138,0.16),_rgba(12,11,9,0.96)_58%)] md:max-w-[520px] lg:max-w-[560px] xl:max-w-[620px] md:rounded-[1.6rem]">
          <div className="relative aspect-[16/10] min-h-[220px] md:aspect-[16/8.6] md:min-h-[0] lg:min-h-[0] 2xl:min-h-[0]">
            <Suspense
              fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-full border border-white/10 border-t-[#f9bf1a] animate-spin" />
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45 md:text-sm md:tracking-[0.28em]">
                    Loading 3D View
                  </p>
                </div>
              </div>
            }
          >
            <ThreeDPreview vehicle={vehicle} canopy={canopy} modules={modules} accessories={accessories} />
          </Suspense>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 px-1 md:mt-4">
        <span className="rounded-full border border-[#f9bf1a]/25 bg-[#f9bf1a]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f9bf1a] md:px-3 md:text-xs md:tracking-[0.28em]">
          Rotate to Inspect
        </span>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55 md:px-3 md:text-xs md:tracking-[0.28em]">
          Zoom Enabled
        </span>
      </div>
    </div>
  );
};
