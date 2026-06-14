import SubpageTemplate from "../components/SubpageTemplate";

export default function HowItWorksPage() {
  return (
    <SubpageTemplate
      eyebrow="How it works"
      title="Estate planning made simple"
      subtitle="A clear, calm process paced around your needs."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      canonicalPath="/how-it-works"
      intro={[
        "Estate planning can feel like a big subject, so we break it into simple, manageable steps.",
        "Every family is different. We listen first, explain your options clearly, and help you move forward without pressure or jargon.",
      ]}
      blocks={[
        {
          heading: "Your journey to peace of mind",
          variant: "grid",
          columns: 4,
          cards: [
            {
              title: "01. Initial chat",
              body: "We have a friendly, no-pressure conversation about your situation, answer your questions and explain your options.",
            },
            {
              title: "02. Your tailored plan",
              body: "We explain our advice in an invaluable comprehensive estate planning report precisely tailored to you and your circumstances.",
            },
            {
              title: "03. Review together",
              body: "We walk through everything clearly, make any changes needed, and make sure you understand the documents.",
            },
            {
              title: "04. Sign with confidence",
              body: "We guide you through proper signing and witnessing so your documents are valid and ready.",
            },
          ],
        },
        {
          heading: "What to expect",
          variant: "cream",
          items: [
            "No jargon, just clear explanations",
            "A pace that feels comfortable for you",
            "Home visits available across Warwickshire",
            "Clear costs before any work begins",
            "Careful review before anything is finalised",
            "Secure document storage where needed",
          ],
        },
        {
          heading: "Have questions before you start?",
          paragraphs: [
            "That is completely normal. You do not need to know exactly what you need before you speak to us.",
            "Tell us what is on your mind and we will help you understand the sensible next step.",
          ],
        },
      ]}
      cta={{
        title: "Ready to protect your family's future?",
        body: "Start with an initial chat and we will guide you from there.",
      }}
    />
  );
}
