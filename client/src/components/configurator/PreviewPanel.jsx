import TwoDPreview from "./TwoDPreview.jsx";

export const PreviewPanel = ({ vehicle, canopy, modules, accessories }) => {
  if (!vehicle) {
    return (
      <div className="w-full rounded-[1.35rem] border border-[#d6c5a6] bg-[linear-gradient(180deg,#1f1c19,#121313)] p-1 shadow-[0_18px_36px_rgba(40,30,18,0.16)] md:rounded-[1.8rem] md:p-1.5 lg:p-2">
        <div>
          <div className="mx-auto w-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#0b0b0b] md:rounded-[1.6rem]">
            <div className="relative min-h-[260px] overflow-hidden sm:min-h-[320px] md:min-h-[420px] lg:min-h-[640px] xl:min-h-[720px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,191,26,0.18),transparent_32%),linear-gradient(180deg,#171412,#0d0e10)]" />
              <div className="absolute inset-x-3 bottom-3 top-3 rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] sm:inset-x-5 sm:bottom-5 sm:top-5 sm:rounded-[1.2rem] lg:inset-x-6 lg:bottom-6 lg:top-6" />
              <div className="absolute left-3 right-3 top-1/2 h-px bg-white/10 sm:left-5 sm:right-5 lg:left-6 lg:right-6" />
              <div className="absolute left-[16%] right-[16%] top-[44%] h-9 rounded-full border border-[#f9bf1a]/40 bg-[#f9bf1a]/8 lg:h-10" />
              <div className="absolute left-[20%] top-[51%] h-16 w-[18%] rounded-[1.2rem] border border-white/10 bg-white/5 lg:h-20" />
              <div className="absolute right-[20%] top-[50%] h-16 w-[29%] rounded-[1.2rem] border border-white/10 bg-white/5 lg:h-20" />
              <div className="absolute left-[23%] top-[68%] h-12 w-12 rounded-full border-[6px] border-[#272a2d] bg-[#c6cbcf] sm:h-14 sm:w-14 sm:border-8 lg:h-16 lg:w-16" />
              <div className="absolute right-[22%] top-[68%] h-12 w-12 rounded-full border-[6px] border-[#272a2d] bg-[#c6cbcf] sm:h-14 sm:w-14 sm:border-8 lg:h-16 lg:w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[1.35rem] border border-[#d6c5a6] bg-[linear-gradient(180deg,#1f1c19,#121313)] p-1 shadow-[0_18px_36px_rgba(40,30,18,0.16)] md:rounded-[1.8rem] md:p-1.5 lg:p-2">
      <div>
        <div className="mx-auto w-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#0d0d0d] md:rounded-[1.6rem]">
          <div className="relative min-h-[300px] sm:min-h-[360px] md:min-h-[500px] lg:min-h-[700px] xl:min-h-[760px]">
            <TwoDPreview vehicle={vehicle} canopy={canopy} modules={modules} accessories={accessories} />
          </div>
        </div>
      </div>
    </div>
  );
};
