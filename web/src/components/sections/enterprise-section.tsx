/* Enterprise section icon image URLs (from Figma assets, valid ~7 days) */
const MIGRATION_ICON_URL =
  "https://www.figma.com/api/mcp/asset/113b9ab3-60b3-40e8-9b53-b560279cd823";
const SECURITY_ICON_URL =
  "https://www.figma.com/api/mcp/asset/7535ed98-eb34-4539-b1be-e34c88a16777";
const AUTH_ICON_URL =
  "https://www.figma.com/api/mcp/asset/bedd8149-6161-425b-b17a-83a0635cb29d";

function AccessControlIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1C1917" strokeWidth="1.5" />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke="#1C1917"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="#1C1917" />
    </svg>
  );
}

const LEFT_FEATURES = [
  {
    iconUrl: MIGRATION_ICON_URL,
    iconAlt: "Migration",
    title: "Migration and support",
    body: "White-glove migration, 1:1 support & training, and custom integrations ensure you get up, running and ready to scale fast.",
  },
  {
    iconEl: <AccessControlIcon />,
    title: "Access control",
    body: "Tiered role and permissions settings let you precisely choose who can view and edit your content.",
  },
];

const RIGHT_FEATURES = [
  {
    iconUrl: SECURITY_ICON_URL,
    iconAlt: "Security",
    title: "Security and compliance",
    body: "SOC 2 Type II certified, GDPR-ready, and built with enterprise security requirements in mind.",
  },
  {
    iconUrl: AUTH_ICON_URL,
    iconAlt: "Auth",
    title: "Auth-protected content",
    body: "Control access with SSO, SAML, and visitor authentication — so only the right people see the right content.",
  },
];

function FeatureItem({
  iconUrl,
  iconAlt,
  iconEl,
  title,
  body,
}: {
  iconUrl?: string;
  iconAlt?: string;
  iconEl?: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#FAFAF9] border border-[#EFEEED] rounded-lg p-2.5 w-11 h-11 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
        {iconUrl ? (
          <img src={iconUrl} alt={iconAlt ?? ""} className="w-6 h-6 object-contain" />
        ) : (
          iconEl
        )}
      </div>
      <div>
        <h4 className="font-sans font-medium text-[#1C1917] text-[19px] leading-[1.34] tracking-[-0.021em] mb-1">
          {title}
        </h4>
        <p className="font-sans font-medium text-[#57534D] text-[15px] leading-6 tracking-[-0.021em]">
          {body}
        </p>
      </div>
    </div>
  );
}

export function EnterpriseSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        {/* Centered header */}
        <div className="text-center mb-12">
          <h2
            className="font-sans font-medium text-[#1C1917] tracking-[-0.021em] leading-[1.04] mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.88rem)" }}
          >
            Enterprise-grade docs intelligence
          </h2>
          <p
            className="font-sans font-medium text-[#57534D] mx-auto mb-6"
            style={{
              fontSize: "clamp(0.875rem, 0.8vw + 0.4rem, 0.945rem)",
              lineHeight: "1.67",
              letterSpacing: "-0.021em",
              maxWidth: "28rem",
            }}
          >
            GitBook scales with your team — offering the security, control and
            flexibility that modern organizations need
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 bg-black/[0.04] text-[#1C1917] font-sans font-medium rounded-full px-[14px] py-[10px] text-[15px] tracking-[-0.03em] hover:bg-black/[0.08] transition-colors"
          >
            Learn more
          </a>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center">
          {/* Left features */}
          <div className="flex flex-col gap-10">
            {LEFT_FEATURES.map((feat) => (
              <FeatureItem key={feat.title} {...feat} />
            ))}
          </div>

          {/* Center: product screenshot placeholder */}
          <div
            className="hidden lg:flex items-center justify-center bg-[#F0EFEE] border border-[#EFEEED] rounded-2xl overflow-hidden"
            style={{ width: "480px", height: "480px" }}
          >
            {/* Simplified docs UI preview */}
            <div className="w-full h-full bg-[#FAFAF9] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ED6A5E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F6BE4F]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#62C554]" />
              </div>
              <div className="flex gap-2 flex-1 min-h-0">
                <div className="w-28 bg-white border border-[#EFEEED] rounded-lg p-2 flex flex-col gap-1">
                  {["Overview", "Pages", "Settings", "Members", "Integrations"].map((item) => (
                    <div key={item} className={`text-[9px] px-1.5 py-0.5 rounded ${item === "Settings" ? "bg-[#1C1917] text-white" : "text-[#79716B]"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-white border border-[#EFEEED] rounded-lg p-3 flex flex-col gap-2">
                  <div className="h-2.5 w-20 bg-[#E7E5E4] rounded" />
                  <div className="h-2 w-32 bg-[#F0EFEE] rounded" />
                  <div className="h-2 w-24 bg-[#F0EFEE] rounded" />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="h-16 bg-[#FAFAF9] border border-[#EFEEED] rounded-lg" />
                    <div className="h-16 bg-[#FAFAF9] border border-[#EFEEED] rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right features */}
          <div className="flex flex-col gap-10">
            {RIGHT_FEATURES.map((feat) => (
              <FeatureItem key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
