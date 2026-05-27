import SubpageTemplate from "../components/SubpageTemplate";

export default function LPAPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Lasting Powers of Attorney"
      subtitle="Peace of mind for life's what-if moments."
      heroImage="/generated/estate-consultation-hero.jpg"
      heroAlt="Estate planning adviser talking through documents"
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
