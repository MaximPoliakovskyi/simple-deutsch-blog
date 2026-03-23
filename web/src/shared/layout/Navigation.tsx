"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMainNavHeightVar } from "@/shared/hooks/useMainNavHeightVar";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import NavigationDesktop from "@/shared/layout/NavigationDesktop";
import { NavigationMobileControls, NavigationMobileDrawer } from "@/shared/layout/NavigationMobile";
import {
  applyTheme,
  runThemeTransition,
  subscribeRootTheme,
  type Theme,
} from "@/shared/theme/client";
import {
  isUnmodifiedLeftClick,
  normalizeRoutePathname,
  useTransitionNav,
} from "@/shared/transition/useTransitionNav";
import Container from "@/shared/ui/Container";

type ReadingProgressState = {
  progress: number;
  visible: boolean;
};

const INITIAL_READING_PROGRESS: ReadingProgressState = {
  progress: 0,
  visible: false,
};

function scrollToTopWithMotionPreference() {
  if (typeof window === "undefined") return;

  let behavior: ScrollBehavior = "smooth";

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      behavior = "auto";
    }
  } catch {}

  window.scrollTo({ top: 0, left: 0, behavior });
}

function isPostDetailRoute(pathname: string) {
  return /^\/(?:(en|ru|uk)\/)?posts\/[^/]+$/i.test(pathname);
}

function useReadingProgress(routeKey: string | null, navRef: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<ReadingProgressState>(INITIAL_READING_PROGRESS);

  useEffect(() => {
    if (!routeKey) {
      setState(INITIAL_READING_PROGRESS);
      return;
    }

    let frameId = 0;

    const update = () => {
      const article = document.querySelector<HTMLElement>('[data-reading-target="post"]');
      if (!article) {
        setState(INITIAL_READING_PROGRESS);
        return;
      }

      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const navHeight = navRef.current?.offsetHeight ?? 0;
      const viewportHeight = window.innerHeight;
      const start = Math.max(0, articleTop - navHeight);
      const end = Math.max(start + 1, articleTop + article.offsetHeight - viewportHeight);
      const scrollY = window.scrollY;

      const progress =
        scrollY <= start
          ? 0
          : scrollY >= end
            ? 100
            : Math.min(100, Math.max(0, ((scrollY - start) / (end - start)) * 100));

      setState({
        progress: Number(progress.toFixed(2)),
        visible: true,
      });
    };

    const scheduleUpdate = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [navRef, routeKey]);

  return state;
}

function NavigationReadingProgress({
  active,
  progress,
  visible,
}: {
  active: boolean;
  progress: number;
  visible: boolean;
}) {
  if (!active) return null;

  return (
    <div
      data-progress-bar="reading"
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-progress)] w-screen transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="h-1 w-full overflow-hidden rounded bg-[var(--sd-border-subtle)]">
        <div
          className="h-full bg-[var(--sd-accent)] transition-transform duration-300 ease-out"
          style={{
            transform: `scaleX(${progress / 100})`,
            transformOrigin: "left",
            willChange: "transform",
          }}
        />
      </div>
    </div>
  );
}

export default function Navigation() {
  const { locale: currentLocale, t } = useI18n();
  const pathname = normalizeRoutePathname(usePathname());
  const transition = useTransitionNav();
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mobileTheme, setMobileTheme] = useState<Theme>("light");
  const shouldEnableProgressBar = isPostDetailRoute(pathname);
  const { progress, visible } = useReadingProgress(
    shouldEnableProgressBar ? pathname : null,
    navRef,
  );
  const logoHref = buildLocalizedHref(currentLocale, "/");

  useEffect(() => subscribeRootTheme(setMobileTheme), []);
  useMainNavHeightVar(navRef);

  const closeMenu = () => {
    setOpen(false);
  };

  const handleLogoClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    closeMenu();
    if (!isUnmodifiedLeftClick(event)) return;

    if (pathname === normalizeRoutePathname(logoHref)) {
      event.preventDefault();
      scrollToTopWithMotionPreference();
      return;
    }

    event.preventDefault();
    transition.startNavigation(logoHref);
  };

  return (
    <>
      <nav
        ref={navRef}
        data-main-nav="true"
        className="sticky top-0 z-[var(--z-nav)] bg-[hsl(var(--bg))]/90 text-[var(--sd-text)] backdrop-blur"
        aria-label={t("nav.main")}
      >
        <Container className="flex items-center justify-between px-4 py-4 md:py-5">
          <Link
            href={logoHref}
            onClick={handleLogoClick}
            className="text-xl font-semibold tracking-tight text-[#171717]"
            aria-label={t("nav.home")}
          >
            simple-deutsch.de
          </Link>
          <NavigationDesktop />
          <NavigationMobileControls
            open={open}
            toggleRef={toggleRef}
            onToggleMenu={() => setOpen((value) => !value)}
          />
        </Container>
      </nav>

      <NavigationReadingProgress
        active={shouldEnableProgressBar}
        progress={progress}
        visible={visible}
      />

      <NavigationMobileDrawer
        open={open}
        toggleRef={toggleRef}
        isDarkMobile={mobileTheme === "dark"}
        onCloseMenu={closeMenu}
        onLogoClick={handleLogoClick}
        onToggleTheme={() => {
          runThemeTransition(() => applyTheme(mobileTheme === "dark" ? "light" : "dark"));
        }}
      />
    </>
  );
}
