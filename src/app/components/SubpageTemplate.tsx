import Image from "next/image";
import Link from "next/link";
import JsonLd from "./JsonLd";
import styles from "./SubpageTemplate.module.css";
import { getCmsPage } from "../cms/directus";
import type { CmsAiSummary, CmsContentBlock, CmsCta, CmsPage } from "../cms/types";
import { breadcrumbJsonLd, routeByPath, serviceJsonLd } from "../seo";

type SubpageTemplateProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroAlt: string;
  intro?: string[];
  downloads?: Array<{
    href: string;
    label: string;
    body?: string;
  }>;
  aiSummary?: CmsAiSummary;
  blocks: CmsContentBlock[];
  cta?: CmsCta;
  showHeroActions?: boolean;
  canonicalPath?: string;
  blocksBeforeSummary?: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

function semanticId(...parts: Array<string | number | undefined>) {
  return slugify(parts.filter((part) => part !== undefined && part !== "").join(" "));
}

export default async function SubpageTemplate({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroAlt,
  intro = [],
  downloads = [],
  aiSummary,
  blocks,
  cta = {
    eyebrow: "Consultation",
    title: "Talk to us",
    body: "We will listen, explain your options clearly, and help you move forward with confidence.",
    linkText: "Book an initial chat",
  },
  showHeroActions = true,
  canonicalPath,
  blocksBeforeSummary = false,
}: SubpageTemplateProps) {
  const fallbackPage: CmsPage = {
    path: canonicalPath ?? "",
    pageType: "subpage",
    status: "published",
    eyebrow,
    title,
    subtitle,
    description: subtitle,
    heroImage,
    heroAlt,
    intro,
    aiSummary,
    blocks,
    cta,
    showHeroActions,
    canonicalPath: canonicalPath ?? "",
    seoTitle: title,
    priority: 0.5,
  };
  const page = (canonicalPath ? await getCmsPage(canonicalPath, fallbackPage) : fallbackPage) ?? fallbackPage;
  const route = page.canonicalPath ? routeByPath(page.canonicalPath) : null;
  const structuredData = [
    ...(route?.serviceType ? [serviceJsonLd(route)] : []),
    ...(page.canonicalPath ? [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: page.title, path: page.canonicalPath }])] : []),
  ];
  const blockSections = page.blocks.map((block, blockIndex) => {
    const blockId = semanticId(page.title, "section", block.heading ?? block.eyebrow ?? blockIndex + 1);
    return (
      <section
        className={`${styles.block} ${block.variant === "cream" ? styles.cream : ""}`}
        id={blockId}
        data-semantic-id={blockId}
        key={block.heading ?? block.eyebrow}
      >
        <div className={styles.blockInner}>
          {block.eyebrow && <p className={styles.blockEyebrow}>{block.eyebrow}</p>}
          {block.heading && <h2>{block.heading}</h2>}
          {block.paragraphs?.map((paragraph, paragraphIndex) => {
            const paragraphId = semanticId(page.title, "paragraph", block.heading ?? block.eyebrow ?? blockIndex + 1, paragraphIndex + 1);
            return (
              <p id={paragraphId} data-semantic-id={paragraphId} key={paragraph}>{paragraph}</p>
            );
          })}
          {block.items && (
            <ul className={styles.list}>
              {block.items.map((item, itemIndex) => {
                const itemId = semanticId(page.title, "item", itemIndex + 1, item);
                return (
                  <li id={itemId} data-semantic-id={itemId} key={item}>{item}</li>
                );
              })}
            </ul>
          )}
          {block.cards && (
            <div className={block.columns === 4 ? styles.cardGridFour : block.variant === "grid" ? styles.cardGridWide : styles.cardGrid}>
              {block.cards.map((card) => {
                const cardId = semanticId(page.title, "card", card.title);
                return (
                  <article className={styles.card} id={cardId} data-semantic-id={cardId} key={card.title}>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                    {card.items && (
                      <ul>
                        {card.items.map((item, itemIndex) => {
                          const itemId = semanticId(page.title, "card", card.title, "item", itemIndex + 1);
                          return (
                            <li id={itemId} data-semantic-id={itemId} key={item}>{item}</li>
                          );
                        })}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  });

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pathways-export/styles.css" />
      <main>
        <section className={styles.hero}>
          <Image src={page.heroImage} alt={page.heroAlt} fill priority sizes="100vw" className={styles.heroImage} />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.subtitle}</p>
            {page.showHeroActions && (
              <div className={styles.heroActions}>
                <Link href="/contact" className={styles.primaryButton}>
                  Book initial chat
                </Link>
                <a href="tel:07902863999" className={styles.secondaryButton}>
                  Call 07902 863999
                </a>
              </div>
            )}
          </div>
        </section>

        <div className={styles.content}>
          {page.intro.length > 0 && (
            <section className={styles.intro}>
              {page.intro.map((paragraph, index) => (
                <p
                  id={semanticId(page.title, "intro", index + 1)}
                  data-semantic-id={semanticId(page.title, "intro", index + 1)}
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          )}

          {downloads.length > 0 && (
            <section className={styles.downloads}>
              <p className={styles.blockEyebrow}>Download</p>
              <div className={styles.downloadList}>
                {downloads.map((download) => (
                  <a href={download.href} download className={styles.downloadCard} key={download.href}>
                    <span>{download.label}</span>
                    {download.body && <small>{download.body}</small>}
                  </a>
                ))}
              </div>
            </section>
          )}

          {blocksBeforeSummary && blockSections}

          {page.aiSummary && (
            <section
              className={styles.aiSummary}
              id={semanticId(page.title, "ai-summary")}
              data-semantic-id={semanticId(page.title, "ai-summary")}
              data-ai-summary="true"
              data-ai-tags={`service question handoff-intent ${slugify(page.title)}`}
            >
              <div className={styles.aiSummaryInner}>
                <p className={styles.blockEyebrow}>Quick answer</p>
                <h2>{page.title}: what to know first</h2>
                <p>{page.aiSummary.answer}</p>
                <ul>
                  {page.aiSummary.questions.map((question, index) => (
                    <li
                      id={semanticId(page.title, "ai-question", index + 1, question)}
                      data-semantic-id={semanticId(page.title, "ai-question", index + 1, question)}
                      data-ai-tags={`question ${slugify(page.title)}`}
                      key={question}
                    >
                      {question}
                    </li>
                  ))}
                </ul>
                <p className={styles.aiSummaryPrompt}>
                  {page.aiSummary.handoffPrompt ??
                    "If your circumstances are personal or complex, ask Pathway Estate Planning to contact you so they can understand the details before suggesting next steps."}
                </p>
              </div>
            </section>
          )}

          {!blocksBeforeSummary && blockSections}

          <section
            className={styles.consultation}
            id={semanticId(page.title, "consultation", page.cta?.title)}
            data-semantic-id={semanticId(page.title, "consultation", page.cta?.title)}
          >
            <p className={styles.blockEyebrow}>{page.cta?.eyebrow ?? "Consultation"}</p>
            <h2>{page.cta?.title}</h2>
            <p>{page.cta?.body}</p>
            <Link href="/contact" className={styles.ctaButton}>
              {page.cta?.linkText ?? "Book an initial chat"}
            </Link>
          </section>
        </div>
      </main>
      {structuredData.length > 0 && <JsonLd data={structuredData} />}
    </>
  );
}
