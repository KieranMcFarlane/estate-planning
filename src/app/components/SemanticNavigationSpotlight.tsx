"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Compass, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT,
  SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY,
  type SemanticNavigationSpotlightPayload,
  type NavigationTarget,
} from "../types/estate-chat";
import styles from "./SemanticNavigationSpotlight.module.css";

type SpotlightState = {
  payload: SemanticNavigationSpotlightPayload;
  target: HTMLElement;
  display: {
    title: string;
    summary: string;
    note: string;
  };
  style: {
    top: number;
    left: number;
    arrowLeft: number;
    placement: "above" | "below";
  };
};

type GuideState = {
  display: SpotlightState["display"];
};

const CARD_WIDTH = 420;
const CARD_GAP = 22;
const CARD_BELOW_GAP = 200;
const ESTIMATED_CARD_HEIGHT = 390;
const NAV_OFFSET = 92;
const TARGET_VIEWPORT_TOP = 210;
const TARGET_SCROLL_DELAY_MS = 260;
const LOCAL_TARGET_SCROLL_DELAY_MS = 360;

function selectorForHighlight(highlight: string) {
  if (highlight === "main") return "main";
  const escaped = CSS.escape(highlight);
  return `#${escaped}, [data-semantic-id="${escaped}"]`;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sentenceCase(value: string) {
  const cleaned = cleanText(value).replace(/[.!?]+$/g, "");
  if (!cleaned) return "";
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function truncate(value: string, maxLength = 210) {
  const cleaned = cleanText(value);
  if (cleaned.length <= maxLength) return cleaned;
  const sentence = cleaned.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${sentence || cleaned.slice(0, maxLength - 1).trim()}...`;
}

function stripRepeatedHeading(value: string, heading: string) {
  const cleaned = cleanText(value);
  const cleanHeading = cleanText(heading);
  if (!cleaned || !cleanHeading) return cleaned;
  if (cleaned.toLowerCase() === cleanHeading.toLowerCase()) return "";
  if (!cleaned.toLowerCase().startsWith(cleanHeading.toLowerCase())) return cleaned;
  return cleaned.slice(cleanHeading.length).replace(/^[:.,\s-]+/, "").trim();
}

function lowerFirst(value: string) {
  const cleaned = cleanText(value).replace(/[.!?]+$/g, "");
  return cleaned ? cleaned.charAt(0).toLowerCase() + cleaned.slice(1) : cleaned;
}

function listPhrase(value: string) {
  const lowered = lowerFirst(value);
  if (/^your\b/.test(lowered)) return `making sure ${lowered}`;
  if (/^the\b/.test(lowered)) return `explaining ${lowered}`;
  const replacements: Array<[RegExp, string]> = [
    [/^ensure\b/, "ensuring"],
    [/^protect\b/, "protecting"],
    [/^reduce\b/, "reducing"],
    [/^support\b/, "supporting"],
    [/^align\b/, "aligning"],
    [/^choose\b/, "choosing"],
    [/^appoint\b/, "appointing"],
    [/^make\b/, "making"],
    [/^set\b/, "setting"],
  ];
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(lowered)) return lowered.replace(pattern, replacement);
  }
  return lowered;
}

function conciseSummary(value: string, heading: string, fallback: string) {
  const cleanHeading = cleanText(heading);
  const lines = value
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .filter((line) => line.toLowerCase() !== cleanHeading.toLowerCase())
    .filter((line) => line.length >= 8 && line.length <= 86);

  if (lines.length >= 3) {
    const [first, second, third] = lines.slice(0, 3).map(listPhrase);
    return `This section covers ${first}, ${second}, and ${third}.`;
  }

  const withoutHeading = stripRepeatedHeading(value, heading);
  const candidate = withoutHeading || stripRepeatedHeading(fallback, heading) || fallback;
  const sentence = candidate.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (sentence && sentence.length >= 38) return truncate(sentence, 145);

  const words = cleanText(candidate).split(" ").filter(Boolean);
  return truncate(words.slice(0, 18).join(" "), 125);
}

function conciseTargetSummary(target: NavigationTarget) {
  const heading = cleanText(target.title);
  const summary = cleanText(target.summary);
  const withoutHeading = stripRepeatedHeading(summary, heading) || summary;
  const sentence = withoutHeading.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (sentence && sentence.length >= 34) return truncate(sentence, 118);

  const words = withoutHeading.split(" ").filter(Boolean);
  return truncate(words.slice(0, 15).join(" "), 105);
}

function shortQuery(value?: string) {
  if (!value) return "";
  const cleaned = cleanText(value)
    .replace(/^where\s+(?:on the site\s+)?/i, "")
    .replace(/^(?:show|take|bring|go|open)\s+(?:me\s+)?(?:to\s+)?/i, "");
  if (/^(?:yes|yeah|yep|please|ok|okay|sure|go there|take me there|show me there|that one)$/i.test(cleaned)) return "";
  return truncate(cleaned, 92);
}

function topicFromQuery(value?: string) {
  const query = shortQuery(value);
  if (!query) return "";

  const cleaned = query
    .replace(/^(?:me|user|visitor|assistant|pathway)\s*:\s*/i, "")
    .replace(/^(?:do you|does pathway|have you|have you got)\s+(?:cover|covers|covered|mention|mentions|talk about|explain|explains)\s+/i, "")
    .replace(/^(?:can i|could i|can we|could we)\s+(?:read|see|look at|look through|find|learn more|read more)\s+(?:more\s+)?(?:about|on|for|around)?\s*/i, "")
    .replace(/^(?:is there|are there)\s+(?:anything|a page|a section|information|info|details|guidance)\s+(?:on|about|for|around)\s+/i, "")
    .replace(/^(?:i'?m|i am|we'?re|we are)\s+(?:looking for|trying to find|trying to read|trying to see)\s+/i, "")
    .replace(/^(?:tell me|talk me|walk me)\s+(?:through|more about|around|about)\s+/i, "")
    .replace(/\?+$/g, "")
    .trim();

  return truncate(cleaned || query, 78);
}

function noteForTarget({
  title,
  summary,
  topic,
  isPageStart,
  isContactTarget,
}: {
  title: string;
  summary: string;
  topic: string;
  isPageStart: boolean;
  isContactTarget: boolean;
}) {
  if (isPageStart) {
    if (isContactTarget) {
      return "I opened this page because it gathers the practical ways to contact Pathway in one place.";
    }
    return `I opened the start of this page because it introduces ${sentenceCase(title)} before moving into the detail.`;
  }

  const summaryText = sentenceCase(summary);
  if (summaryText) {
    return `I highlighted this section because it explains ${summaryText}.`;
  }

  const topicText = sentenceCase(topic);
  if (topicText) {
    return `I highlighted this section because it is the closest match for ${topicText}.`;
  }

  return "I highlighted this section because it is the closest match for what you asked about.";
}

function firstContentTarget(main: HTMLElement) {
  return (
    main.querySelector<HTMLElement>('[data-semantic-id$="intro-1"]') ??
    main.querySelector<HTMLElement>('.intro [data-semantic-id]') ??
    main.querySelector<HTMLElement>('[data-semantic-id*="-intro-1"]') ??
    main.querySelector<HTMLElement>('section:not(:first-child) [data-semantic-id]') ??
    main.querySelector<HTMLElement>('[data-semantic-id]') ??
    main.querySelector<HTMLElement>("h1") ??
    main
  );
}

function resolveTarget(highlight: string) {
  const selected = document.querySelector(selectorForHighlight(highlight));
  if (!(selected instanceof HTMLElement)) return null;
  if (highlight !== "main" || selected.tagName.toLowerCase() !== "main") return selected;
  return firstContentTarget(selected);
}

function displayForTarget(payload: SemanticNavigationSpotlightPayload, target: HTMLElement) {
  const rawTargetText = target.innerText || target.textContent || "";
  const pageHeading = cleanText(document.querySelector("main h1")?.textContent ?? "");
  const targetHeading = cleanText(
    target.matches("h1, h2, h3, h4")
      ? target.textContent ?? ""
      : target.querySelector("h1, h2, h3, h4")?.textContent ??
          target.closest("section")?.querySelector("h1, h2, h3, h4")?.textContent ??
          "",
  );
  const isPageStart = payload.highlight === "main";
  const title = isPageStart && /closest place/i.test(payload.title) ? pageHeading || payload.title : isPageStart ? payload.title : targetHeading || payload.title;
  const summary = conciseSummary(rawTargetText, title, payload.summary);
  const topic = topicFromQuery(payload.query);
  const isContactTarget = /contact|phone|email|call|appointment/i.test(`${title} ${payload.url} ${payload.summary}`);
  const note = noteForTarget({ title, summary, topic, isPageStart, isContactTarget });

  return {
    title,
    summary,
    note,
  };
}

function defaultPayload(highlight: string): SemanticNavigationSpotlightPayload {
  return {
    title: highlight === "main" ? "Closest place on the site" : "Found on the site",
    summary: "I found the place on the site that best matches what you asked for.",
    url: typeof window === "undefined" ? "/" : window.location.pathname + window.location.search + window.location.hash,
    auto: true,
    highlight,
  };
}

function highlightForUrl(url: string) {
  const destination = new URL(url, window.location.origin);
  return destination.hash ? destination.hash.slice(1) : "main";
}

function payloadForTarget(
  target: NavigationTarget,
  previous: SemanticNavigationSpotlightPayload,
  targets = previous.targets?.length ? previous.targets : [target],
  currentIndex = Math.max(0, targets.findIndex((item) => item.url === target.url)),
): SemanticNavigationSpotlightPayload {
  return {
    ...previous,
    title: target.title,
    summary: target.summary,
    url: target.url,
    highlight: highlightForUrl(target.url),
    targets,
    currentIndex,
  };
}

function readStoredPayload(highlight: string) {
  const raw = window.sessionStorage.getItem(SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY);
  if (!raw) return defaultPayload(highlight);

  window.sessionStorage.removeItem(SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY);

  try {
    const payload = JSON.parse(raw) as SemanticNavigationSpotlightPayload;
    return {
      ...defaultPayload(highlight),
      ...payload,
      highlight,
    };
  } catch {
    return defaultPayload(highlight);
  }
}

function calculatePosition(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(CARD_WIDTH, viewportWidth - 32);
  const centeredLeft = rect.left + rect.width / 2 - cardWidth / 2;
  const left = Math.max(16, Math.min(centeredLeft, viewportWidth - cardWidth - 16));
  const roomBelow = viewportHeight - rect.bottom;
  const roomAbove = rect.top - NAV_OFFSET;
  const placement: "above" | "below" = roomBelow >= ESTIMATED_CARD_HEIGHT || roomBelow >= roomAbove ? "below" : "above";
  const top = placement === "below"
    ? Math.min(rect.bottom + CARD_BELOW_GAP, viewportHeight - ESTIMATED_CARD_HEIGHT - 16)
    : Math.max(NAV_OFFSET + 12, rect.top - ESTIMATED_CARD_HEIGHT - CARD_GAP);
  const arrowLeft = Math.max(28, Math.min(rect.left + rect.width / 2 - left, cardWidth - 28));

  return {
    top: Math.max(16, top),
    left,
    arrowLeft,
    placement,
  };
}

function scrollFromTopToTarget(target: HTMLElement, highlight: string) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.scrollTo({ top: 0, behavior: "auto" });

  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const desiredTop = highlight === "main" ? NAV_OFFSET : TARGET_VIEWPORT_TOP;
  const scrollDistance = Math.max(0, targetTop - desiredTop);
  const arrivalDelay = prefersReducedMotion
    ? 160
    : Math.min(1500, Math.max(720, scrollDistance * 0.42));

  window.setTimeout(() => {
    window.scrollTo({
      top: Math.max(0, targetTop - desiredTop),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, TARGET_SCROLL_DELAY_MS);

  return TARGET_SCROLL_DELAY_MS + arrivalDelay;
}

function scrollWithinPageToTarget(target: HTMLElement, highlight: string) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const desiredTop = highlight === "main" ? NAV_OFFSET : TARGET_VIEWPORT_TOP;
  window.scrollTo({
    top: Math.max(0, targetTop - desiredTop),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
  return prefersReducedMotion ? 80 : LOCAL_TARGET_SCROLL_DELAY_MS;
}

export default function SemanticNavigationSpotlight() {
  const pathname = usePathname();
  const router = useRouter();
  const [spotlight, setSpotlight] = useState<SpotlightState | null>(null);
  const [guide, setGuide] = useState<GuideState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setSpotlight((current) => {
      current?.target.classList.remove("semantic-target-highlight");
      targetRef.current = null;
      return null;
    });
    setGuide(null);
    setIsTransitioning(false);
    setMatchesOpen(false);
  }, []);

  const openSpotlight = useCallback((payload: SemanticNavigationSpotlightPayload, options: { fromTop?: boolean } = {}) => {
    const target = resolveTarget(payload.highlight);
    if (!target) return;

    const display = displayForTarget(payload, target);
    const fromTop = options.fromTop ?? true;
    const revealDelay = fromTop
      ? scrollFromTopToTarget(target, payload.highlight)
      : scrollWithinPageToTarget(target, payload.highlight);

    if (fromTop) {
      setSpotlight(null);
      setGuide({ display });
    } else {
      setGuide(null);
      setIsTransitioning(true);
    }

    targetRef.current?.classList.remove("semantic-target-highlight");

    window.setTimeout(() => {
      target.classList.remove("semantic-target-highlight");
      window.setTimeout(() => target.classList.add("semantic-target-highlight"), 20);
      targetRef.current = target;
      setSpotlight({
        payload,
        target,
        display,
        style: calculatePosition(target),
      });
      setGuide(null);
      setIsTransitioning(false);
    }, revealDelay);
  }, []);

  const goToSpotlightPayload = useCallback((payload: SemanticNavigationSpotlightPayload) => {
    const destination = new URL(payload.url, window.location.origin);
    destination.searchParams.set("highlight", payload.highlight);

    if (destination.pathname === window.location.pathname) {
      window.history.pushState(null, "", `${destination.pathname}${destination.search}${destination.hash}`);
      openSpotlight(payload, { fromTop: !spotlight });
      return;
    }

    window.sessionStorage.setItem(SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY, JSON.stringify(payload));
    router.push(`${destination.pathname}${destination.search}${destination.hash}`);
  }, [openSpotlight, router, spotlight]);

  const cycleTarget = useCallback((direction: 1 | -1) => {
    if (!spotlight?.payload.targets?.length || spotlight.payload.targets.length < 2) return;
    const targets = spotlight.payload.targets;
    const currentIndex = typeof spotlight.payload.currentIndex === "number"
      ? spotlight.payload.currentIndex
      : Math.max(0, targets.findIndex((item) => item.url === spotlight.payload.url));
    const nextIndex = (currentIndex + direction + targets.length) % targets.length;
    goToSpotlightPayload(payloadForTarget(targets[nextIndex], spotlight.payload, targets, nextIndex));
  }, [goToSpotlightPayload, spotlight]);

  const selectMatch = useCallback((index: number) => {
    if (!spotlight?.payload.targets?.[index]) return;
    setMatchesOpen(false);
    goToSpotlightPayload(payloadForTarget(spotlight.payload.targets[index], spotlight.payload, spotlight.payload.targets, index));
  }, [goToSpotlightPayload, spotlight]);

  useEffect(() => {
    const onCustomSpotlight = (event: Event) => {
      const detail = (event as CustomEvent<SemanticNavigationSpotlightPayload>).detail;
      if (!detail?.highlight) return;
      openSpotlight(detail);
    };

    window.addEventListener(SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT, onCustomSpotlight);
    return () => window.removeEventListener(SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT, onCustomSpotlight);
  }, [openSpotlight]);

  useEffect(() => {
    const highlight = new URLSearchParams(window.location.search).get("highlight");
    if (!highlight) return;
    const timer = window.setTimeout(() => openSpotlight(readStoredPayload(highlight)), 0);
    return () => window.clearTimeout(timer);
  }, [openSpotlight, pathname]);

  useEffect(() => {
    if (!spotlight) return;

    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") {
        event.preventDefault();
        cycleTarget(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        cycleTarget(-1);
      }
    };
    const onResize = () => {
      setSpotlight((current) => current ? { ...current, style: calculatePosition(current.target) } : current);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [close, cycleTarget, spotlight]);

  useEffect(() => {
    return () => {
      targetRef.current?.classList.remove("semantic-target-highlight");
    };
  }, []);

  if (!spotlight && !guide) return null;

  if (guide && !spotlight) {
    return (
      <div className={styles.guide} role="status" aria-live="polite">
        <div className={styles.guideMeter} aria-hidden="true" />
        <span className={styles.badge}>Opening the right place</span>
        <strong>Taking you to {guide.display.title}</strong>
        <p>I’ll start from the top, then scroll to the part that best answers what you asked.</p>
      </div>
    );
  }

  if (!spotlight) return null;

  const isContactTarget = /contact|book|call|appointment/i.test(
    `${spotlight.payload.title} ${spotlight.payload.summary} ${spotlight.payload.url}`,
  );
  const resultCount = spotlight.payload.targets?.length ?? 0;
  const currentResult = Math.min((spotlight.payload.currentIndex ?? 0) + 1, Math.max(1, resultCount));
  const canCycle = resultCount > 1;
  const matchLabel = canCycle ? (currentResult === 1 ? "Best match" : "Related match") : "Found on the site";

  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="Dismiss highlighted site section"
        onClick={close}
      />
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="semantic-navigation-spotlight-title"
        aria-describedby="semantic-navigation-spotlight-description"
        tabIndex={-1}
        className={styles.card}
        data-placement={spotlight.style.placement}
        data-transitioning={isTransitioning ? "true" : "false"}
        style={{
          top: spotlight.style.top,
          left: spotlight.style.left,
          "--spotlight-arrow-left": `${spotlight.style.arrowLeft}px`,
        } as CSSProperties}
      >
        <CardHeader className={styles.header}>
          <Badge variant="outline" className={styles.badge}>
            <Compass size={13} aria-hidden="true" />
            {matchLabel}
          </Badge>
          <CardTitle id="semantic-navigation-spotlight-title" className={styles.title}>
            {spotlight.display.title}
          </CardTitle>
          <CardDescription id="semantic-navigation-spotlight-description" className={styles.description}>
            {spotlight.display.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.context}>
          {spotlight.display.note}
        </CardContent>
        <CardFooter className={styles.actions}>
          <div className={styles.secondaryActions}>
            {canCycle && (
              <div className={styles.cycleControls} aria-label="Cycle through matching site results">
                <Button type="button" variant="outline" className={styles.arrowButton} onClick={() => cycleTarget(-1)} aria-label="Previous matching result">
                  <ChevronLeft size={16} aria-hidden="true" />
                </Button>
                <Popover open={matchesOpen} onOpenChange={setMatchesOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className={styles.matchesButton} aria-label="View matching site results">
                      <ListChecks size={14} aria-hidden="true" />
                      Match {currentResult} of {resultCount}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={styles.matchesPopover}
                    align="center"
                    side="top"
                    sideOffset={10}
                    style={{ zIndex: 1200 }}
                  >
                    <Command className={styles.matchesCommand}>
                      <CommandInput placeholder="Search matches..." className={styles.matchesInput} />
                      <CommandList>
                        <CommandEmpty>No matching sections found.</CommandEmpty>
                        <CommandGroup>
                          {spotlight.payload.targets?.map((target, index) => {
                            const isActive = index === currentResult - 1;
                            return (
                              <CommandItem
                                key={`${target.url}-${index}`}
                                value={`${target.title} ${target.summary} ${target.url}`}
                                className={styles.matchItem}
                                onSelect={() => selectMatch(index)}
                                onClick={() => selectMatch(index)}
                              >
                                <span className={styles.matchMeta}>
                                  {index === 0 ? "Best match" : "Related match"}
                                  {isActive ? " · current" : ""}
                                </span>
                                <span className={styles.matchTitle}>{target.title}</span>
                                <span className={styles.matchSummary}>{conciseTargetSummary(target)}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button type="button" variant="outline" className={styles.arrowButton} onClick={() => cycleTarget(1)} aria-label="Next matching result">
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>
            )}
            {isContactTarget && (
              <Link className={styles.contact} href="/contact" onClick={close}>
                Contact Pathway
              </Link>
            )}
          </div>
          <Button type="button" className={styles.skip} onClick={close}>
            Got it
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
