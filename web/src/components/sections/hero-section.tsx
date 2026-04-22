"use client";

import { DocsInterface } from "./hero/docs-interface";

const HERO_SWIRL_URL =
  "https://www.figma.com/api/mcp/asset/7fb71bbe-d174-473d-a3a9-941bc9479e2f";
const ARROW_RIGHT_URL =
  "https://www.figma.com/api/mcp/asset/ce5cebe8-92db-4b98-8204-8dea7014625f";

export function HeroSection() {
  return (
    <>
      <section className="relative flex flex-col items-center gap-[60px] pt-[50px] overflow-x-clip">
        <img
          src={HERO_SWIRL_URL}
          alt=""
          aria-hidden="true"
          className="absolute bottom-[-12px] w-[2126px] h-[940px] pointer-events-none z-0 left-[calc(50%-1041px)]"
        />
        <div className="relative z-10 flex flex-col items-center gap-[24px] w-[980px] shrink-0">
          <h1 className="[font-family:var(--font-inter)] font-medium text-[69px] text-[#1C1917] leading-[70px] tracking-[-1.4px] text-center w-full">
            {"Learn German from Zero to C1 — "}
            <br />
            {"as a structured system for"}
            <br />
            {"travel|"}
          </h1>
          <p className="[font-family:var(--font-inter)] font-medium text-[17.3px] text-[#57534D] leading-[28.8px] tracking-[-0.36px] text-center w-[564px] max-w-full">
            A clear, step-by-step learning path with real-life German for
            living in Germany.
          </p>
          <div className="flex items-end overflow-hidden">
            <a
              href="#"
              className="flex items-center gap-[10px] bg-[#1C1917] text-white rounded-[99px] pt-[10px] pb-[12px] px-[14px] overflow-hidden"
            >
              <span className="[font-family:var(--font-inter)] font-medium text-[15.6px] text-white leading-[16px] tracking-[-0.48px] whitespace-nowrap">
                Start for free
              </span>
              <div className="flex items-center justify-center overflow-hidden pt-[2px] size-[16px] shrink-0">
                <div className="flex items-start justify-center h-[10px] w-[13px] overflow-hidden">
                  <img
                    src={ARROW_RIGHT_URL}
                    alt=""
                    aria-hidden="true"
                    className="block max-w-none size-full"
                  />
                </div>
              </div>
            </a>
          </div>
        </div>
        {/* DocsInterface is the full Figma node 13:32296: glass wrapper, browser
            chrome, inner white panel, sidebar, center content, assistant sliver,
            and tabs overlay positioned absolute at top-[-19px] left-[326px].
            pt-[19px] provides visual space for the tabs overhang. */}
        <div className="relative z-10 w-[1160px] shrink-0 pt-[19px]">
          <DocsInterface />
        </div>
      </section>
    </>
  );
}
