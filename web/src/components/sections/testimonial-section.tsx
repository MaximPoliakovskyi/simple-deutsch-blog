const GRAVITEE_LOGO_URL =
  "https://www.figma.com/api/mcp/asset/e680d630-56f7-4569-ae1e-de3f13902ac7";

export function TestimonialSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        <div className="bg-[#FAFAF9] border border-[#EFEEED] rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: company card */}
            <div className="md:w-64 lg:w-72 bg-white border-b md:border-b-0 md:border-r border-[#EFEEED] p-8 flex flex-col items-start justify-between gap-6 shrink-0">
              <div className="flex flex-col gap-4">
                <img
                  src={GRAVITEE_LOGO_URL}
                  alt="Gravitee"
                  className="h-7 w-auto object-contain"
                />
                <div>
                  <p className="font-sans font-medium text-[#1C1917] text-[15px] tracking-[-0.021em]">
                    Gareth Brinn
                  </p>
                  <p className="font-sans font-medium text-[#57534D] text-[14px] tracking-[-0.021em]">
                    Documentation Manager, Gravitee
                  </p>
                </div>
              </div>
              {/* Small stats */}
              <div className="flex flex-col gap-3 w-full">
                {[
                  { value: "3x", label: "faster onboarding" },
                  { value: "40%", label: "fewer support tickets" },
                ].map(({ value, label }) => (
                  <div key={label} className="border border-[#E7E5E4] rounded-xl p-3">
                    <p className="font-sans font-semibold text-[#1C1917] text-[22px] tracking-[-0.03em]">
                      {value}
                    </p>
                    <p className="font-sans font-medium text-[#57534D] text-[13px] tracking-[-0.02em]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: quote */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between gap-8">
              <blockquote>
                <p
                  className="font-sans font-medium text-[#1C1917] leading-[1.37] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)" }}
                >
                  &ldquo;GitBook has been a game-changer for our documentation.
                  Our teams can now work together seamlessly — and our users
                  always have access to accurate, up-to-date content.&rdquo;
                </p>
              </blockquote>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#1C1917] text-white font-sans font-medium rounded-full px-[14px] py-[10px] text-[15px] tracking-[-0.03em] hover:bg-[#2c2825] transition-colors"
                >
                  Read case study
                  <svg
                    width="13"
                    height="10"
                    viewBox="0 0 13 10"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      d="M7.5 1L12 5L7.5 9M1 5H12"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-black/[0.04] text-[#1C1917] font-sans font-medium rounded-full px-[14px] py-[10px] text-[15px] tracking-[-0.03em] hover:bg-black/[0.08] transition-colors"
                >
                  View all stories
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
