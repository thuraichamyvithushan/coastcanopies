import { useMemo } from "react";
import { resolveAssetUrl } from "../../utils/assetUrl.js";
import { getProductPosition } from "../../utils/productHelpers.js";

const DEFAULT_CANVAS_SIZE = { width: 1000, height: 600 };

export default function TwoDPreview({ vehicle, canopy, modules = [], accessories = [] }) {
  const vehicleSvgUrl = useMemo(() => {
    if (!vehicle) return "/assets/vehicles/toyota-hilux-base.svg";
    if (vehicle.svgBase) return resolveAssetUrl(vehicle.svgBase);
    return resolveAssetUrl(`/assets/vehicles/${vehicle.slug}-base.svg`);
  }, [vehicle]);

  const canvasWidth = vehicle?.canvasSize?.width || DEFAULT_CANVAS_SIZE.width;
  const canvasHeight = vehicle?.canvasSize?.height || DEFAULT_CANVAS_SIZE.height;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.4rem] bg-[#111111] p-0.5 shadow-inner md:rounded-[1.6rem] md:p-1 lg:p-1.5">
      <div className="relative flex min-h-[260px] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(249,191,26,0.08)_0%,rgba(10,10,10,0.95)_75%)] sm:min-h-[320px] md:min-h-[460px] lg:min-h-[640px] xl:min-h-[720px]">
        <div className="relative w-full scale-[1.08] transition-transform duration-300 ease-out sm:scale-[1.1] md:scale-[1.12] lg:scale-[1.14]">
          <svg
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="h-auto w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          >
            <g className="transition-all duration-300">
              <image
                href={vehicleSvgUrl}
                x="0"
                y="0"
                width={canvasWidth}
                height={canvasHeight}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            {canopy && (() => {
              const pos = getProductPosition(canopy, vehicle?.slug);
              const svgUrl = canopy.svg ? resolveAssetUrl(canopy.svg) : "/assets/products/trade-canopy.svg";

              return (
                <g key={canopy._id} className="transition-all duration-300">
                  <image
                    href={svgUrl}
                    x={pos.x}
                    y={pos.y}
                    width={pos.width}
                    height={pos.height}
                    preserveAspectRatio="none"
                  />
                </g>
              );
            })()}

            {modules.map((moduleItem) => {
              const pos = getProductPosition(moduleItem, vehicle?.slug);
              const svgUrl = moduleItem.svg
                ? resolveAssetUrl(moduleItem.svg)
                : `/assets/products/${moduleItem.slug}.svg`;

              return (
                <g key={moduleItem._id} className="transition-all duration-300">
                  <image
                    href={svgUrl}
                    x={pos.x}
                    y={pos.y}
                    width={pos.width}
                    height={pos.height}
                    preserveAspectRatio="none"
                  />
                </g>
              );
            })}

            {accessories.map((accessoryItem) => {
              const pos = getProductPosition(accessoryItem, vehicle?.slug);
              const svgUrl = accessoryItem.svg
                ? resolveAssetUrl(accessoryItem.svg)
                : `/assets/products/${accessoryItem.slug}.svg`;

              return (
                <g key={accessoryItem._id} className="transition-all duration-300">
                  <image
                    href={svgUrl}
                    x={pos.x}
                    y={pos.y}
                    width={pos.width}
                    height={pos.height}
                    preserveAspectRatio="none"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
