const STATS = [
  {
    value: "99.07%",
    label: "uptime over the last 90 days",
    sublabel: "Status page",
  },
  {
    value: "99.07%",
    label: "uptime over the last 90 days",
    sublabel: "Status page",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        {/* Centered header */}
        <div className="text-center mb-12">
          <h2
            className="font-sans font-medium text-[#1C1917] tracking-[-0.02em] leading-[1.04] mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.88rem)" }}
          >
            Built to perform
          </h2>
          <p
            className="font-sans font-medium text-[#57534D] mx-auto mb-6"
            style={{
              fontSize: "clamp(0.9rem, 1vw + 0.3rem, 1rem)",
              lineHeight: "1.67",
              letterSpacing: "-0.02em",
              maxWidth: "30rem",
            }}
          >
            GitBook delivers the speed, reliability, and scalability your docs
            deserve — no trade-offs required.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 bg-black/[0.04] text-[#1C1917] font-sans font-medium rounded-full px-[14px] py-[10px] text-[15px] tracking-[-0.03em] hover:bg-black/[0.08] transition-colors"
          >
            Status page
          </a>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl p-8 flex flex-col gap-2"
            >
              <p
                className="font-sans font-medium text-[#1C1917] tracking-[-0.03em] leading-none"
                style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3rem)" }}
              >
                {stat.value}
              </p>
              <p className="font-sans font-medium text-[#57534D] text-[15px] leading-6 tracking-[-0.021em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
