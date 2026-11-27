import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

let customEaseReady = false;
if (typeof window !== "undefined") {
  try {
    gsap.registerPlugin(CustomEase);
    if (!gsap.parseEase("knMain")) {
      CustomEase.create("knMain", "0.65, 0.01, 0.05, 0.99");
    }
    customEaseReady = true;
  } catch {
    customEaseReady = false;
  }
}

const MAIN_EASE = customEaseReady ? "knMain" : "power3.out";
const INTRO_EVENT = "travelmind:intro-change";

interface MenuItemConfig {
  label: string;
  href: string;
  action?: "logout";
}

function getMenuItems(isLoggedIn: boolean): MenuItemConfig[] {
  return [
    { label: "Home", href: "/" },
    { label: "How it works", href: "#how-it-works" },
    isLoggedIn
      ? { label: "Log out", href: "#logout", action: "logout" }
      : { label: "Log in / Sign up", href: "/auth" },
    { label: "Make the Trip", href: "/plan" },
    { label: "Contact", href: "#contact" },
  ];
}

function computeIntroDoneFromDom(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (document.documentElement.dataset.intro === "done") return true;
  const trackEl = document.querySelector<HTMLElement>(".scroll-intro-track");
  if (!trackEl) return true;
  const rect = trackEl.getBoundingClientRect();
  const scrollable = Math.max(1, trackEl.offsetHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
  return progress >= 0.95;
}

export interface KineticNavbarProps {
  user?: { name: string } | null;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
  /** Set true on Landing where Scene 0 ScrollIntroFlythrough controls navbar reveal */
  hasIntro?: boolean;
}

export function Component({
  user = null,
  onLogout,
  onNavigate,
  hasIntro = false,
}: KineticNavbarProps) {
  const menuItems = getMenuItems(Boolean(user));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navbarWrapRef = useRef<HTMLDivElement | null>(null);
  const panelWrapRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState<boolean>(() => {
    if (!hasIntro || typeof window === "undefined") return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    return false;
  });

  const hasInteractedRef = useRef(false);
  const shouldRestoreFocusRef = useRef(false);
  const prevOverflowRef = useRef<{ html: string; body: string } | null>(null);
  const menuTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Compute intro state synchronously before paint on mount + listen to Scene 0 updates
  useLayoutEffect(() => {
    if (!hasIntro || typeof window === "undefined") {
      setIntroDone(true);
      return;
    }

    const syncIntro = () => {
      const done = computeIntroDoneFromDom();
      setIntroDone(done);
    };

    syncIntro();

    const handleIntroEvent = (event: Event) => {
      const custom = event as CustomEvent<{ done?: boolean }>;
      if (typeof custom.detail?.done === "boolean") {
        setIntroDone(custom.detail.done);
      } else {
        syncIntro();
      }
    };

    const observer = new MutationObserver(() => {
      const attr = document.documentElement.dataset.intro;
      if (attr === "done") setIntroDone(true);
      else if (attr === "playing") setIntroDone(false);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-intro"],
    });

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMq = () => syncIntro();

    window.addEventListener(INTRO_EVENT, handleIntroEvent);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleMq);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener(INTRO_EVENT, handleIntroEvent);
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handleMq);
      }
    };
  }, [hasIntro]);

  // If the user scrolls back up into the intro while the menu is open, close it first
  useEffect(() => {
    if (!introDone && isMenuOpen) {
      shouldRestoreFocusRef.current = false;
      setIsMenuOpen(false);
    }
  }, [introDone, isMenuOpen]);

  // Manage inert attributes on hidden navbar and closed sidebar panel so Tab cannot enter
  useEffect(() => {
    const navWrap = navbarWrapRef.current as (HTMLDivElement & { inert: boolean }) | null;
    if (navWrap) {
      navWrap.inert = !introDone;
    }
  }, [introDone]);

  useEffect(() => {
    const panelWrap = panelWrapRef.current as (HTMLDivElement & { inert: boolean }) | null;
    if (panelWrap) {
      panelWrap.inert = !isMenuOpen;
    }
  }, [isMenuOpen]);

  // Lock page scroll while menu is open (without layout jump via scrollbar-gutter: stable)
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (isMenuOpen) {
      prevOverflowRef.current = {
        html: document.documentElement.style.overflow,
        body: document.body.style.overflow,
      };
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        if (prevOverflowRef.current) {
          document.documentElement.style.overflow = prevOverflowRef.current.html;
          document.body.style.overflow = prevOverflowRef.current.body;
          prevOverflowRef.current = null;
        }
      };
    }
    if (prevOverflowRef.current) {
      document.documentElement.style.overflow = prevOverflowRef.current.html;
      document.body.style.overflow = prevOverflowRef.current.body;
      prevOverflowRef.current = null;
    }
    return undefined;
  }, [isMenuOpen]);



  // Kill any in-flight timeline on unmount
  useEffect(() => {
    return () => {
      menuTimelineRef.current?.kill();
      menuTimelineRef.current = null;
    };
  }, []);

  // Sidebar Open / Close GSAP timeline (useLayoutEffect prevents any 1-frame flash before GSAP hides items)
  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (!hasInteractedRef.current) {
      if (!isMenuOpen) return;
      hasInteractedRef.current = true;
    }

    menuTimelineRef.current?.kill();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0.01 : 0.6;

    const navWrap = root.querySelector<HTMLElement>(".kn-overlay-wrapper");
    const menu = root.querySelector<HTMLElement>(".kn-menu");
    const overlay = root.querySelector<HTMLElement>(".kn-overlay");
    const bgPanels = root.querySelectorAll<HTMLElement>(".kn-backdrop-layer");
    const menuList = root.querySelector<HTMLElement>(".kn-menu-list");
    const menuLinks = root.querySelectorAll<HTMLElement>(".kn-nav-link");
    const fadeTargets = root.querySelectorAll<HTMLElement>("[data-menu-fade]");
    const menuButton = root.querySelector<HTMLElement>(".kn-menu-btn");
    const menuButtonTexts = menuButton
      ? Array.from(menuButton.querySelectorAll<HTMLElement>("p"))
      : [];
    const menuButtonIcon =
      menuButton?.querySelector<SVGSVGElement>(".kn-menu-button-icon") ?? null;

    if (!navWrap || !menu || !overlay) return;

    const tl = gsap.timeline({ defaults: { ease: MAIN_EASE, duration: dur } });
    menuTimelineRef.current = tl;

    if (isMenuOpen) {
      // Prepare all initial offscreen / hidden states synchronously BEFORE making overlay visible
      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(menu, { xPercent: 0 });
      gsap.set(bgPanels, { xPercent: 101 });
      if (menuList) gsap.set(menuList, { autoAlpha: 0 });
      gsap.set(menuLinks, {
        yPercent: reduced ? 0 : 115,
        rotate: reduced ? 0 : 6,
        autoAlpha: 0,
      });
      if (fadeTargets.length) {
        gsap.set(fadeTargets, { autoAlpha: 0, yPercent: reduced ? 0 : 35 });
      }
      gsap.set(navWrap, { display: "block" });
      navWrap.setAttribute("data-nav", "open");

      tl.to(
        menuButtonTexts,
        { yPercent: -100, stagger: reduced ? 0 : 0.14, duration: reduced ? 0.01 : 0.5 },
        0,
      );

      if (menuButtonIcon) {
        tl.to(menuButtonIcon, { rotate: 315, duration: reduced ? 0.01 : 0.5 }, 0);
      }

      tl.to(overlay, { autoAlpha: 1, duration: reduced ? 0.01 : 0.45 }, 0)
        .to(
          bgPanels,
          { xPercent: 0, stagger: reduced ? 0 : 0.1, duration: reduced ? 0.01 : 0.52 },
          0,
        );

      if (menuList) {
        tl.to(menuList, { autoAlpha: 1, duration: reduced ? 0.01 : 0.25 }, reduced ? 0 : 0.34);
      }

      tl.to(
        menuLinks,
        {
          yPercent: 0,
          rotate: 0,
          autoAlpha: 1,
          stagger: reduced ? 0 : 0.055,
          duration: reduced ? 0.01 : 0.52,
        },
        reduced ? 0 : 0.36,
      );

      if (fadeTargets.length) {
        tl.to(
          fadeTargets,
          {
            autoAlpha: 1,
            yPercent: 0,
            stagger: reduced ? 0 : 0.04,
            duration: reduced ? 0.01 : 0.42,
          },
          reduced ? 0 : 0.54,
        );
      }

      // Move focus into the menu on open
      window.requestAnimationFrame(() => {
        firstLinkRef.current?.focus({ preventScroll: true });
      });
    } else {
      navWrap.setAttribute("data-nav", "closed");

      if (menuList) {
        tl.to(menuList, { autoAlpha: 0, duration: reduced ? 0.01 : 0.18 }, 0);
      }
      tl.to(menuLinks, { autoAlpha: 0, duration: reduced ? 0.01 : 0.18 }, 0);
      if (fadeTargets.length) {
        tl.to(fadeTargets, { autoAlpha: 0, duration: reduced ? 0.01 : 0.15 }, 0);
      }
      tl.to(overlay, { autoAlpha: 0, duration: reduced ? 0.01 : 0.45 }, 0)
        .to(menu, { xPercent: 120, duration: reduced ? 0.01 : 0.5 }, 0)
        .to(menuButtonTexts, { yPercent: 0, duration: reduced ? 0.01 : 0.45 }, 0);

      if (menuButtonIcon) {
        tl.to(menuButtonIcon, { rotate: 0, duration: reduced ? 0.01 : 0.45 }, 0);
      }

      tl.set(navWrap, { display: "none" });

      if (shouldRestoreFocusRef.current) {
        shouldRestoreFocusRef.current = false;
        window.requestAnimationFrame(() => {
          menuButtonRef.current?.focus({ preventScroll: true });
        });
      }
    }
  }, [isMenuOpen]);

  // Escape key closes the menu and restores focus to the Menu button
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        shouldRestoreFocusRef.current = true;
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    hasInteractedRef.current = true;
    if (isMenuOpen) {
      shouldRestoreFocusRef.current = true;
    }
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = (restoreFocus = true) => {
    shouldRestoreFocusRef.current = restoreFocus;
    setIsMenuOpen(false);
  };

  const navigateOrScroll = (href: string) => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (href.startsWith("#")) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
      return;
    }

    if (href === "/") {
      const hero = document.getElementById("home");
      if (hero) {
        hero.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }
      return;
    }

    if (onNavigate) {
      onNavigate(href);
    } else {
      window.location.assign(href);
    }
  };

  const handleMenuLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: MenuItemConfig,
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();

    // Release scroll lock immediately before navigating/scrolling
    if (prevOverflowRef.current) {
      document.documentElement.style.overflow = prevOverflowRef.current.html;
      document.body.style.overflow = prevOverflowRef.current.body;
      prevOverflowRef.current = null;
    }

    closeMenu(false);

    if (item.action === "logout") {
      onLogout?.();
      return;
    }

    window.requestAnimationFrame(() => {
      navigateOrScroll(item.href);
    });
  };

  return (
    <div ref={containerRef} className="kn-root">
      {/* Top-Right Corner Menu Button Only (stays above overlay; fades in after intro) */}
      <div
        ref={navbarWrapRef}
        data-intro-visible={introDone ? "true" : "false"}
        aria-hidden={!introDone}
        className="kn-navbar-wrap fixed top-4 right-4 sm:top-5 sm:right-6 z-[60] pointer-events-none"
      >
        <div className="kn-navbar-pill inline-flex items-center justify-end">
          <button
            ref={menuButtonRef}
            type="button"
            className="kn-menu-btn"
            aria-expanded={isMenuOpen}
            aria-controls="kn-sidebar-nav"
            onClick={toggleMenu}
          >
            <span className="kn-menu-button-text" aria-hidden="true">
              <p className="kn-btn-label">Menu</p>
              <p className="kn-btn-label">Close</p>
            </span>
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            <span className="kn-icon-wrap" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 16 16"
                fill="none"
                className="kn-menu-button-icon"
              >
                <path
                  d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
                  fill="currentColor"
                />
                <path
                  d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
                  fill="currentColor"
                />
                <path
                  d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z"
                  fill="currentColor"
                />
                <path
                  d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z"
                  fill="currentColor"
                />
                <path
                  d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z"
                  fill="currentColor"
                />
                <path
                  d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Right-Hand Kinetic Sidebar Overlay (sibling of navbar wrap — never inside a transformed ancestor) */}
      <div
        ref={panelWrapRef}
        id="kn-sidebar-nav"
        aria-hidden={!isMenuOpen}
        className="kn-overlay-wrapper"
      >
        <div
          className="kn-overlay"
          aria-hidden="true"
          onClick={() => closeMenu(true)}
        />
        <nav className="kn-menu" aria-label="Site navigation">
          <div className="kn-menu-bg" aria-hidden="true">
            <div className="kn-backdrop-layer kn-first" />
            <div className="kn-backdrop-layer kn-second" />
            <div className="kn-backdrop-layer kn-third" />
          </div>

          <div className="kn-menu-content-wrapper">
            <ul className="kn-menu-list">
              {menuItems.map((item, idx) => (
                <li key={item.label} className="kn-menu-list-item">
                  <a
                    ref={idx === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    className="kn-nav-link"
                    onClick={(e) => handleMenuLinkClick(e, item)}
                  >
                    <span className="kn-nav-link-text">{item.label}</span>
                    <span className="kn-nav-link-hover-bg" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <p className="kn-tagline" data-menu-fade>
              your trip, thought through
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
}

export const SterlingGateKineticNavigation = Component;
export default Component;
