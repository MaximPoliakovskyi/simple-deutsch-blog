const CARDS = [
  {
    tag: "GIT SYNC",
    title: "A workflow your entire team will love",
    body: "Edit in the visual editor, your IDE, or both — with everything perfectly in sync with GitHub or GitLab. Why compromise on a workflow that doesn't work for everyone?",
    cta: "Git Sync",
    badge: null,
  },
  {
    tag: "VISUAL EDITOR",
    title: "A best-in-class editing experience",
    body: "Meet the visual editor that is so good even technical users prefer it. With reviews, merge rules and built-in AI linting tools to correct and polish your content.",
    cta: "GitBook Editor",
    badge: null,
  },
  {
    tag: "GITBOOK AGENT",
    title: "Team up with a proactive partner",
    body: "GitBook Agent learns from support tickets, changelogs and repos automatically — then proactively suggests and generates improvements ready for your team to review.",
    cta: "GitBook Agent",
    badge: "Early access",
  },
];

export function DocsToolsSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-10 max-w-xl">
          <h2
            className="font-sans font-medium text-[#1C1917] tracking-[-0.02em] leading-[1.02] mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.93rem)" }}
          >
            Docs tools for teams who care about quality
          </h2>
          <p
            className="font-sans font-medium text-[#57534D]"
            style={{
              fontSize: "clamp(0.9rem, 1vw + 0.3rem, 1.08rem)",
              lineHeight: "1.67",
              letterSpacing: "-0.02em",
            }}
          >
            Streamline your docs processes with a better collaboration workflow
            and proactive, relevant AI suggestions
          </p>
        </div>

        {/* Three feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.tag}
              className="bg-[#FAFAF9] border border-[#EFEEED] rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Image placeholder area */}
              <div className="relative h-[320px] bg-[#F0EFEE] border-b border-[#EFEEED] flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E7E5E4]" />
                {card.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-block bg-[#FE551B]/10 text-[#FE551B] font-sans font-semibold text-[11px] rounded-full px-2.5 py-1 tracking-tight">
                      {card.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <span className="font-mono font-semibold text-[#FE551B] text-[13px] uppercase tracking-[-0.017em]">
                  {card.tag}
                </span>
                <h3 className="font-sans font-medium text-[#1C1917] text-[19px] leading-[1.37] tracking-[-0.021em]">
                  {card.title}
                </h3>
                <p className="font-sans font-medium text-[#57534D] text-[15px] leading-6 tracking-[-0.021em] flex-1">
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
