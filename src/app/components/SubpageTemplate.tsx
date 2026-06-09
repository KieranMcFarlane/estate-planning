import Image from "next/image";
import Link from "next/link";
import JsonLd from "./JsonLd";
import styles from "./SubpageTemplate.module.css";
import { breadcrumbJsonLd, routeByPath, serviceJsonLd } from "../seo";

type ContentBlock = {
  heading?: string;
  eyebrow?: string;
  paragraphs?: string[];
  items?: string[];
  cards?: Array<{
    title: string;
    body: string;
    items?: string[];
  }>;
  variant?: "plain" | "cream" | "grid";
};

type SubpageTemplateProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroAlt: string;
  intro?: string[];
  aiSummary?: {
    answer: string;
    questions: string[];
    handoffPrompt?: string;
  };
  blocks: ContentBlock[];
  cta?: {
    eyebrow?: string;
    title: string;
    body: string;
    linkText?: string;
  };
  showHeroActions?: boolean;
  canonicalPath?: string;
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

export default function SubpageTemplate({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroAlt,
  intro = [],
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
}: SubpageTemplateProps) {
  const route = canonicalPath ? routeByPath(canonicalPath) : null;
  const structuredData = [
    ...(route?.serviceType ? [serviceJsonLd(route)] : []),
    ...(canonicalPath ? [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path: canonicalPath }])] : []),
  ];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pathways-export/styles.css" />
      <main>
        <section className={styles.hero}>
          <Image src={heroImage} alt={heroAlt} fill priority sizes="100vw" className={styles.heroImage} />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            {showHeroActions && (
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
          {intro.length > 0 && (
            <section className={styles.intro}>
              {intro.map((paragraph, index) => (
                <p
                  id={semanticId(title, "intro", index + 1)}
                  data-semantic-id={semanticId(title, "intro", index + 1)}
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          )}

          {aiSummary && (
            <section
              className={styles.aiSummary}
              id={semanticId(title, "ai-summary")}
              data-semantic-id={semanticId(title, "ai-summary")}
              data-ai-summary="true"
              data-ai-tags={`service question handoff-intent ${slugify(title)}`}
            >
              <div className={styles.aiSummaryInner}>
                <p className={styles.blockEyebrow}>Quick answer</p>
                <h2>{title}: what to know first</h2>
                <p>{aiSummary.answer}</p>
                <ul>
                  {aiSummary.questions.map((question, index) => (
                    <li
                      id={semanticId(title, "ai-question", index + 1, question)}
                      data-semantic-id={semanticId(title, "ai-question", index + 1, question)}
                      data-ai-tags={`question ${slugify(title)}`}
                      key={question}
                    >
                      {question}
                    </li>
                  ))}
                </ul>
                <p className={styles.aiSummaryPrompt}>
                  {aiSummary.handoffPrompt ??
                    "If your circumstances are personal or complex, ask Pathway to contact you so they can understand the details before suggesting next steps."}
                </p>
              </div>
            </section>
          )}

          {blocks.map((block, blockIndex) => {
            const blockId = semanticId(title, "section", block.heading ?? block.eyebrow ?? blockIndex + 1);
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
                    const paragraphId = semanticId(title, "paragraph", block.heading ?? block.eyebrow ?? blockIndex + 1, paragraphIndex + 1);
                    return (
                      <p id={paragraphId} data-semantic-id={paragraphId} key={paragraph}>{paragraph}</p>
                    );
                  })}
                  {block.items && (
                    <ul className={styles.list}>
                      {block.items.map((item, itemIndex) => {
                        const itemId = semanticId(title, "item", itemIndex + 1, item);
                        return (
                          <li id={itemId} data-semantic-id={itemId} key={item}>{item}</li>
                        );
                      })}
                    </ul>
                  )}
                  {block.cards && (
                    <div className={block.variant === "grid" ? styles.cardGridWide : styles.cardGrid}>
                      {block.cards.map((card) => {
                        const cardId = semanticId(title, "card", card.title);
                        return (
                          <article className={styles.card} id={cardId} data-semantic-id={cardId} key={card.title}>
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>
                            {card.items && (
                              <ul>
                                {card.items.map((item, itemIndex) => {
                                  const itemId = semanticId(title, "card", card.title, "item", itemIndex + 1);
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
          })}

          <section
            className={styles.consultation}
            id={semanticId(title, "consultation", cta.title)}
            data-semantic-id={semanticId(title, "consultation", cta.title)}
          >
            <p className={styles.blockEyebrow}>{cta.eyebrow ?? "Consultation"}</p>
            <h2>{cta.title}</h2>
            <p>{cta.body}</p>
            <Link href="/contact" className={styles.ctaButton}>
              {cta.linkText ?? "Book an initial chat"}
            </Link>
          </section>
        </div>
      </main>
      {structuredData.length > 0 && <JsonLd data={structuredData} />}
    </>
  );
}
