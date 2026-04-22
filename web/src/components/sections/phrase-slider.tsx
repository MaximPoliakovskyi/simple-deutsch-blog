const PHRASES = [
  "Learn faster",
  "Stay consistent",
  "Build confidence",
  "Practice daily",
  "Speak clearly",
  "Start simple",
  "Keep going",
  "Small steps",
  "Real progress",
  "German made simple",
];

// Separator rendered between each phrase
function Separator() {
  return (
    <span aria-hidden="true" className="text-[#C7C3C0] text-[18px] select-none">
      ·
    </span>
  );
}

export function PhraseSlider() {
  return (
    <section className="pt-20 md:pt-24 pb-0" aria-hidden="true">
      {/* Max-width container doubles as the overflow/clip boundary so fades align with the layout grid */}
      <div className="mx-auto max-w-[1160px] relative overflow-hidden">
        {/* Left fade — w-16 = 64px, aligns with container edge */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

        {/* Track — duplicated to create seamless loop */}
        <div
          className="flex items-center whitespace-nowrap"
          style={{
            animation: "phrase-marquee 28s linear infinite",
            willChange: "transform",
          }}
        >
          {[0, 1].map((copy) => (
            <span key={copy} className="flex items-center gap-6 pr-6">
              {PHRASES.map((phrase, i) => (
                <span key={i} className="flex items-center gap-6">
                  <span className="[font-family:var(--font-inter)] font-medium text-[15px] text-[#B1ABA7] tracking-[-0.01em] whitespace-nowrap">
                    {phrase}
                  </span>
                  <Separator />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
