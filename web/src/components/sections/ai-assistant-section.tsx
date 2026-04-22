const AI_BG_TEXTURE_URL =
  "https://www.figma.com/api/mcp/asset/f582bf0a-b3da-492f-b1ac-88965285434c";

export function AiAssistantSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        <div className="bg-[#FAFAF9] border border-[#EFEEED] rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: image / texture */}
            <div
              className="relative lg:w-[52%] min-h-[320px] lg:min-h-[480px] bg-[#EFEEED] overflow-hidden shrink-0"
            >
              <img
                src={AI_BG_TEXTURE_URL}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
              />
              {/* Layered UI mockup cards */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full max-w-sm">
                  {/* Chat card */}
                  <div className="bg-white rounded-2xl border border-[#EFEEED] shadow-sm p-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#FE551B] shrink-0 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <circle cx="6" cy="6" r="4" fill="white" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold text-[#1C1917] mb-1">GitBook AI</p>
                        <p className="text-[11px] text-[#57534D] leading-relaxed">
                          I found 3 relevant sections in your docs that answer this question…
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Reference cards */}
                  {["Getting started guide", "Security overview"].map((title) => (
                    <div
                      key={title}
                      className="bg-white rounded-xl border border-[#EFEEED] shadow-sm p-3 mb-2 flex items-center gap-2"
                    >
                      <div className="w-4 h-4 bg-[#FAFAF9] rounded border border-[#EFEEED] shrink-0" />
                      <span className="text-[11px] font-medium text-[#1C1917]">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: text content */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-6">
              <div>
                <span className="font-mono font-semibold text-[#FE551B] text-[13px] uppercase tracking-[-0.017em] block mb-3">
                  AI ASSISTANT
                </span>
                <h2
                  className="font-sans font-medium text-[#1C1917] tracking-[-0.02em] leading-[1.05] mb-4"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem)" }}
                >
                  A connected, personalized AI assistant
                </h2>
                <p
                  className="font-sans font-medium text-[#57534D] leading-[1.67] tracking-[-0.021em]"
                  style={{ fontSize: "clamp(0.875rem, 0.8vw + 0.4rem, 1rem)" }}
                >
                  Give your users an AI that actually knows your product — trained
                  on your docs, your APIs, and your support history. No hallucinations,
                  just accurate answers from your content.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#1C1917] text-white font-sans font-medium rounded-full px-[14px] py-[10px] text-[15px] tracking-[-0.03em] hover:bg-[#2c2825] transition-colors"
                >
                  GitBook AI
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
              </div>

              {/* Feature list */}
              <ul className="flex flex-col gap-3">
                {[
                  "Answers grounded in your actual documentation",
                  "Understands context from previous questions",
                  "Surfaces the right page with every response",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <span
                      className="mt-[3px] w-4 h-4 rounded-full bg-[#FE551B]/10 flex items-center justify-center shrink-0"
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                        <path d="M1 3L3 5L7 1" stroke="#FE551B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="font-sans font-medium text-[#57534D] text-[14px] leading-[1.57] tracking-[-0.02em]">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
