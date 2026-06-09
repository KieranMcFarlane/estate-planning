import SubpageTemplate from "../components/SubpageTemplate";
import { metadataForRoute } from "../seo";

export const metadata = metadataForRoute("/lpa");

export default function LPAPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Lasting Powers of Attorney"
      subtitle="Peace of mind for life's what-if moments."
      heroImage="/generated/estate-consultation-hero.jpg"
      heroAlt="Estate planning adviser talking through documents"
      canonicalPath="/lpa"
      aiSummary={{
        answer:
          "A Lasting Power of Attorney lets you choose trusted people to help with financial, property, health or welfare decisions if you cannot make decisions yourself. Pathway guides the forms and choices clearly.",
        questions: [
          "Who would I trust to make decisions if I lost capacity?",
          "Do I need Property and Financial Affairs, Health and Welfare, or both types of LPA?",
          "Are there family circumstances that need careful wording or discussion?",
        ],
        handoffPrompt: "If you are planning for yourself or a parent, ask Pathway to contact you and explain the LPA options.",
      }}
      intro={[
        "A Lasting Power of Attorney is one of the most important documents you can put in place, not because you expect something to go wrong, but because life can be unpredictable.",
        "An LPA allows you to choose someone you trust to make decisions on your behalf if you are unable to.",
        "It is a simple step that can make things far easier for your family in the future.",
      ]}
      blocks={[
        {
          heading: "There are two types of LPA",
          cards: [
            {
              title: "Property and Financial Affairs",
              body: "This allows your chosen person to help manage banking, bills, pensions, investments, property matters and everyday finances.",
            },
            {
              title: "Health and Welfare",
              body: "This can cover care arrangements, medical decisions, day-to-day welfare and treatment preferences where applicable.",
            },
          ],
        },
        {
          heading: "Why LPAs matter",
          variant: "cream",
          paragraphs: [
            "Without an LPA, your family may face delays and legal barriers when trying to help you, even in urgent situations.",
          ],
          items: [
            "The right people can act quickly",
            "Your wishes remain central",
            "Loved ones feel supported rather than stuck",
            "Important decisions are easier to manage",
          ],
        },
        {
          heading: "How we help",
          paragraphs: [
            "We guide you through the process clearly and carefully, helping ensure everything is completed correctly and explained properly.",
          ],
        },
      ]}
      cta={{
        title: "Ready to put the right support in place?",
        body: "Start with an initial chat and we will explain the LPA options clearly.",
      }}
    />
  );
}
