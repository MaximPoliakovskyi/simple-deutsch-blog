interface DocsCardProps {
  imageUrl: string;
  title?: string;
  description?: string;
}

export function DocsCard({ imageUrl, title, description }: DocsCardProps) {
  return (
    <div className="relative flex flex-col bg-white rounded-[4px] shrink-0 w-[310.06px]">
      {/* Image area — 170px tall, image overflows slightly top/bottom */}
      <div className="relative h-[170px] w-full rounded-[4px] overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-[-1.29%] w-full max-w-none h-[102.57%]"
        />
      </div>

      {/* Content area */}
      <div className="flex flex-col items-center justify-center px-[17.786px] py-[15px]">
        <div className="flex flex-col gap-[6px] items-start justify-center w-[280.06px]">
          <div className="pr-[48.56px] w-full">
            {title ? (
              <h6 className="[font-family:var(--font-inter)] font-semibold text-[15px] text-[#1C1917] tracking-[-0.45px] leading-[21px]">
                {title}
              </h6>
            ) : (
              <div className="h-[22.41px]" />
            )}
          </div>
          <div className="pr-[48.56px] w-full">
            {description ? (
              <p className="[font-family:var(--font-inter)] font-normal text-[12px] text-[rgba(121,113,107,0.8)] leading-[19.2px]">
                {description}
              </p>
            ) : (
              <div className="h-[19.2px]" />
            )}
          </div>
        </div>
      </div>

      {/* Border overlay */}
      <div className="absolute inset-0 rounded-[4px] border border-[#EFEEED] pointer-events-none" />
    </div>
  );
}
