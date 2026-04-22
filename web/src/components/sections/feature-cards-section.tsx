export function FeatureCardsSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-10">
          <h2
            className="font-sans font-medium text-[#1C1917] tracking-[-0.02em] leading-[1.02] mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.93rem)" }}
          >
            Docs that are an extension
            <br />
            of your product
          </h2>
          <p
            className="font-sans font-medium text-[#57534D] max-w-md"
            style={{
              fontSize: "clamp(0.9rem, 1vw + 0.3rem, 1.08rem)",
              lineHeight: "1.67",
              letterSpacing: "-0.02em",
            }}
          >
            Create product experiences that help your users understand and use
            your product — without ever leaving your docs.
          </p>
        </div>

        {/* Two large feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              tag: "LLMS.TXT & MCP",
              title: "Built for humans, optimized for AI",
              body: "Make sure your product gets mentioned by AI tools like ChatGPT, Claude and Google Overview with built-in llms.txt and MCP support.",
              cta: "GitBook AI",
            },
            {
              tag: "LLMS.TXT & MCP",
              title: "Built for humans, optimized for AI",
              body: "Make sure your product gets mentioned by AI tools like ChatGPT, Claude and Google Overview with built-in llms.txt and MCP support.",
              cta: "GitBook AI",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-[#FAFAF9] border border-[#EFEEED] rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Image placeholder */}
              <div className="h-80 bg-[#F0EFEE] flex items-center justify-center border-b border-[#EFEEED]">
                <div className="w-16 h-16 rounded-2xl bg-[#E7E5E4]" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <span
                  className="font-mono font-semibold text-[#FE551B] text-[13px] uppercase tracking-[-0.017em]"
                >
                  {card.tag}
                </span>
                <h3
                  className="font-sans font-medium text-[#1C1917] text-[19px] leading-[1.37] tracking-[-0.021em]"
                >
                  {card.title}
                </h3>
                <p
                  className="font-sans font-medium text-[#57534D] text-[15px] leading-6 tracking-[-0.021em] flex-1"
                >
                  {card.body}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    className="bg-black/[0.04] text-[#1C1917] font-sans font-medium text-[15px] tracking-[-0.03em] rounded-full px-[14px] py-[10px] hover:bg-black/[0.08] transition-colors"
                  >
                    {card.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
