const LOGOS = [
  { src: "/partnerships_logo/DSI_logo.png", alt: "Deutschlandstiftung Integration" },
  { src: "/partnerships_logo/fast_track_logo.png", alt: "FastTrack" },
  { src: "/partnerships_logo/la-red-logo.webp", alt: "LA RED" },
  { src: "/partnerships_logo/NexKI_logo.png", alt: "Nex.KI" },
];

export function CustomerStoriesSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">

        {/* Header row */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
          <div className="flex flex-col gap-4">
            <span className="[font-family:var(--font-geist-mono)] font-semibold text-[#FE551B] text-[14px] uppercase tracking-[-0.02em] leading-[18.2px]">
              customer stories
            </span>
            <h2 className="[font-family:var(--font-inter)] font-medium text-[#1C1917] text-[46.7px] leading-[48px] tracking-[-0.96px]">
              Trusted by organizations who
              <br />
              support German learning
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2.5 bg-[#1C1917] text-white [font-family:var(--font-inter)] font-medium rounded-full px-[14px] pb-[12px] pt-[10px] text-[15px] tracking-[-0.48px] leading-[16px] whitespace-nowrap shrink-0 hover:bg-[#2a2420] transition-colors"
          >
            View all
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">
              <path
                d="M1 5H12M8 1L12 5L8 9"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Logo cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
          {LOGOS.map((logo) => (
            <div
              key={logo.alt}
              className="group bg-[#FAFAF9] border border-[#EFEEED] rounded-2xl aspect-square flex items-center justify-center overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-w-[60%] max-h-[38%] w-auto h-auto object-contain opacity-90 grayscale group-hover:grayscale-0 transition-[filter] duration-300 ease-in-out"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

