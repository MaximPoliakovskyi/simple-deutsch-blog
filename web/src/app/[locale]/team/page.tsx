import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { assertLocale, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { buildI18nAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

type TeamMember = {
  name: string;
  role: string;
  image: string;
};

type TeamCopy = {
  title: string;
  description: string;
  members: TeamMember[];
};

const TEAM_COPY: Record<Locale, TeamCopy> = {
  en: {
    title: "Our Team",
    description:
      "Meet the people behind Simple Deutsch, building thoughtful tools and learning support to make German more approachable every day.",
    members: [
      {
        name: "Maksym Poliakovskyi",
        role: "Founder & Developer",
        image: "/team/maksym.jpg",
      },
      {
        name: "Justus Reber",
        role: "Content & Support",
        image: "/team/member.jpg",
      },
      {
        name: "Vitalii Simich",
        role: "Design & Content Adviser",
        image: "/team/member.jpg",
      },
    ],
  },
  uk: {
    title: "Наша команда",
    description:
      "Познайомтеся з людьми, які створюють Simple Deutsch, розробляють корисні інструменти та підтримують навчання, щоб німецька ставала доступнішою щодня.",
    members: [
      {
        name: "Максим Полуаковський",
        role: "Засновник і розробник",
        image: "/team/maksym.jpg",
      },
      {
        name: "Юстус Ребер",
        role: "Контент і підтримка",
        image: "/team/member.jpg",
      },
      {
        name: "Віталій Сіміч",
        role: "Радник із дизайну та контенту",
        image: "/team/member.jpg",
      },
    ],
  },
  ru: {
    title: "Наша команда",
    description:
      "Познакомьтесь с людьми, которые создают Simple Deutsch, разрабатывают полезные инструменты и поддерживают обучение, чтобы немецкий становился доступнее каждый день.",
    members: [
      {
        name: "Максим Полуаковский",
        role: "Основатель и разработчик",
        image: "/team/maksym.jpg",
      },
      {
        name: "Юстус Ребер",
        role: "Контент и поддержка",
        image: "/team/member.jpg",
      },
      {
        name: "Виталий Симич",
        role: "Консультант по дизайну и контенту",
        image: "/team/member.jpg",
      },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  try {
    const validated = assertLocale(locale);
    const copy = TEAM_COPY[validated];

    return {
      title: `${copy.title} | ${TRANSLATIONS[validated].siteTitle}`,
      description: copy.description,
      alternates: buildI18nAlternates("/team", validated),
    };
  } catch {
    return {};
  }
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;

  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  const copy = TEAM_COPY[validated];

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl translate-y-4 text-center opacity-0 motion-safe:animate-[team-fade-in_500ms_ease-out_forwards]">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 sm:text-lg">
            {copy.description}
          </p>
        </div>

        <div
          className="mt-20 translate-y-4 opacity-0 motion-safe:animate-[team-fade-in_500ms_ease-out_forwards] sm:mt-24"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mx-auto grid max-w-5xl grid-cols-1 justify-items-center gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
            {copy.members.map((member) => (
              <article key={`${validated}-${member.name}`} className="w-full max-w-sm text-center">
                <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-full border border-black/10 bg-neutral-100 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:h-48 sm:w-48">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <h2 className="mt-7 text-xl font-semibold tracking-tight sm:mt-8">{member.name}</h2>
                <p className="mt-3 text-sm uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  {member.role}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes team-fade-in {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
