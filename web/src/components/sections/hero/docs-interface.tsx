"use client";

import { useState } from "react";

const TABS = [
  "Ask your docs",
  "AI insights",
  "Embed and connect",
  "Proactive updates",
] as const;
type Tab = (typeof TABS)[number];

const TAB_NUMBERS: Record<Tab, number> = {
  "Ask your docs": 1,
  "AI insights": 2,
  "Embed and connect": 3,
  "Proactive updates": 4,
};

export function DocsInterface() {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);

  return (
    // Outer glass wrapper — pb-[8px] px-[8px], no top padding so chrome sits in glass layer
    <div className="relative backdrop-blur-[2.5px] bg-[rgba(28,25,23,0.06)] flex flex-col items-start justify-center pb-[8px] px-[8px] rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">

      {/* Browser chrome row — transparent, glass bg shows through (Figma node 13:32297) */}
      <div className="flex items-center px-[16px] py-[16px] shrink-0 self-stretch">
        {/* Dots group — w-[52px] h-[12px], opacity-30 per Figma node 13:32301 */}
        <div className="flex items-center gap-[8px] opacity-30">
          <div className="w-[12px] h-[12px] rounded-full bg-[#ED6A5E]" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#F6BE4F]" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#62C554]" />
        </div>
      </div>

      {/* White inner panel — h-[595px] (Figma node 13:32311) */}
      <div className="bg-white flex items-center justify-center h-[595px] rounded-[16px] shrink-0 w-full">
        <span className="[font-family:var(--font-inter)] font-semibold text-[120px] leading-none text-[#FE551B] select-none">
          {TAB_NUMBERS[activeTab]}
        </span>
      </div>

      {/* Outer border overlay */}
      <div className="absolute inset-0 rounded-[16px] border border-[#EFEEED] pointer-events-none" />

      {/* Tabs — absolute top-[-19px] left-[326px] */}
      <div className="absolute bg-[#FAFAF9] flex items-center justify-center left-[326px] p-[4px] rounded-full border border-[#EFEEED] shadow-[0px_1px_5px_0px_rgba(0,0,0,0.05)] top-[-19px]">
        <div className="flex gap-[4px] items-center justify-center overflow-clip relative shrink-0">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "flex items-center justify-center py-[4px] px-[10px] rounded-[28px] shrink-0 cursor-pointer",
                  isActive ? "bg-[#FE551B]" : "bg-transparent",
                ].join(" ")}
              >
                <span
                  className={[
                    "[font-family:var(--font-inter)] font-medium text-[13.5px] leading-[22.4px] whitespace-nowrap",
                    isActive ? "text-white" : "text-[#57534D]",
                  ].join(" ")}
                >
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
