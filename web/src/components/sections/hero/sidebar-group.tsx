interface SidebarItemProps {
  label: string;
  iconUrl: string;
}

function SidebarItem({ label, iconUrl }: SidebarItemProps) {
  return (
    <div className="flex items-center gap-[6px] py-[6px]">
      <div className="overflow-hidden relative shrink-0 size-[16px]">
        <img
          src={iconUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block max-w-none size-full"
        />
      </div>
      <span className="[font-family:var(--font-inter)] font-normal text-[11px] text-[#786B67] leading-[12.991px] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

export interface SidebarGroupItem {
  label: string;
  iconUrl: string;
}

interface SidebarGroupProps {
  label: string;
  items: SidebarGroupItem[];
  isFirst?: boolean;
}

export function SidebarGroup({ label, items, isFirst }: SidebarGroupProps) {
  return (
    <div className="flex flex-col gap-[3.5px] items-start w-[172.89px]">
      <div className={`w-full ${isFirst ? "" : "pt-[14.29px]"}`}>
        <span className="[font-family:var(--font-geist-mono)] font-semibold text-[10px] text-[#1C1917] uppercase leading-[10px]">
          {label}
        </span>
      </div>
      {items.map((item) => (
        <SidebarItem key={item.label} label={item.label} iconUrl={item.iconUrl} />
      ))}
    </div>
  );
}
