import Image from "next/image";
import SectionText from "@/components/about/SectionText";

type PartnershipsClientProps = {
  contactEmail: string;
};

const TELEGRAM_LINK = "https://t.me/simpledeutsch";

export default function PartnershipsClient({
  contactEmail,
}: PartnershipsClientProps) {
  return (
    <main className="min-h-[70vh] bg-[var(--sd-page-bg)] text-[var(--sd-text)]">
      <section className="mx-auto max-w-7xl px-4 pt-24 text-center">
        <SectionText
          title={
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-[var(--sd-text)] text-center">
              Partnerships
            </h1>
          }
        >
          <div className="text-center">
            <p className="text-[20px] leading-[1.8] text-[var(--sd-text-muted)]">
              Simple Deutsch partners with companies, universities, and non-profits to support
              migrant integration in Germany through language learning, digital skills, and
              AI-assisted education.
            </p>
          </div>
        </SectionText>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-8 md:pt-10 mb-28">
        <SectionText>
          <div className="mx-auto w-full max-w-[72ch] space-y-4 text-left text-[20px] leading-[1.8] text-[var(--sd-text-muted)]">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </div>
        </SectionText>
      </section>

      <section className="relative w-full bg-[#0B0D16] py-32">
        <div className="absolute inset-x-0 top-0">
          <div className="mx-auto max-w-7xl px-4 pt-[40px] text-white">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Partners of the Simple Deutsch
            </h2>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center justify-items-center gap-16 pt-6 sm:gap-24">
            <a
              href="https://la-red.eu/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit La Red"
              className="group block cursor-pointer"
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <Image
                  src="/partnerships_logo/la-red-logo.webp"
                  alt="La Red"
                  width={900}
                  height={300}
                  className="max-h-28 md:max-h-32 w-auto max-w-[380px] object-contain opacity-90 transition duration-300 group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none"
                />
              </div>
            </a>

            <a
              href="https://www.deutschlandstiftung.net/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Deutschlandstiftung Integration"
              className="group block cursor-pointer"
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <Image
                  src="/partnerships_logo/DSI_white_logo.png"
                  alt="Deutschlandstiftung Integration (DSI)"
                  width={1100}
                  height={600}
                  className="max-h-32 md:max-h-36 w-auto max-w-[480px] object-contain opacity-90 transition duration-300 group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none"
                />
              </div>
            </a>

            <a
              href="https://www.deutschlandstiftung.net/projekte/fast-track"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Fast Track"
              className="group block cursor-pointer"
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <Image
                  src="/partnerships_logo/fast_track_white_logo.png"
                  alt="Fast Track"
                  width={900}
                  height={400}
                  className="max-h-28 md:max-h-32 w-auto object-contain opacity-90 transition duration-300 group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none"
                />
              </div>
            </a>

            <a
              href="https://la-red.eu/projekt/nex-ki"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit NexKI"
              className="group block cursor-pointer"
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <Image
                  src="/partnerships_logo/NexKI_logo.png"
                  alt="NexKI"
                  width={900}
                  height={400}
                  className="max-h-28 md:max-h-32 w-auto object-contain opacity-90 transition duration-300 group-hover:opacity-100 group-hover:brightness-125 motion-reduce:transition-none"
                />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 mt-28 pb-20 md:pb-24">
        <SectionText>
          <div className="mx-auto w-full max-w-[72ch] space-y-5 text-left text-[20px] leading-[1.8] text-[var(--sd-text-muted)]">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
            <p>
              Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, vitae tincidunt erat
              pharetra non. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.
            </p>
            <p>
              Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
              Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
            </p>
          </div>
        </SectionText>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-28 md:pb-32">
        <SectionText
          className="[&>div>div]:space-y-3 md:[&>div>div]:space-y-3"
          title={
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--sd-text)] text-center">
              Let&apos;s collaborate
            </h2>
          }
        >
          <div className="text-center">
            <p className="text-[20px] leading-[1.8] text-[var(--sd-text-muted)]">
              Tell us what kind of partnership you have in mind - we&apos;ll suggest a simple pilot
              and next steps.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-5 py-2 text-sm font-medium transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Contact us via Telegram"
            >
              Contact us via Telegram
            </a>

            <a
              href={`mailto:${contactEmail}`}
              className="rounded-full px-5 py-2 text-sm font-medium transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Contact us via Email"
            >
              Contact us via Email
            </a>
          </div>
        </SectionText>
      </section>
    </main>
  );
}
