import ccLogo from "../../assets/cclogo.png";

export const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#171717] px-4 text-white" role="status">
    <div className="space-y-2 text-center sm:space-y-3">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#f9bf1a] sm:h-10 sm:w-10 lg:h-14 lg:w-14" />
      <img src={ccLogo} alt="Coast Canopies" className="mx-auto w-16 sm:w-20 lg:w-24" />
    </div>
  </div>
);
