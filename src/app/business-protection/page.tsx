import SubpageTemplate from "../components/SubpageTemplate";

export default function BusinessProtectionPage() {
  return (
    <SubpageTemplate
      eyebrow="Specialist planning"
      title="Business Protection"
      subtitle="Protect your business and the people who rely on it."
      heroImage="/generated/document-signing.jpg"
      heroAlt="Business and estate planning documents being signed"
      intro={[
        "If you own a business, estate planning becomes even more important.",
        "Without clear planning, business assets can become tied up in delays, uncertainty or disputes, which can affect your family, business partners and employees.",
        "We can help you create a plan that protects your business interests and supports the people involved.",
      ]}
      blocks={[
        {
          heading: "How business protection can help",
          variant: "cream",
          items: [
            "Ensure the right people take control",
            "Protect business assets for family or partners",
            "Reduce disruption and uncertainty",
            "Support continuity planning",
            "Align business planning with your Will and estate plan",
          ],
        },
        {
          heading: "Clear advice, without complexity",
          paragraphs: [
            "Business planning does not need to feel overwhelming. We guide you step by step and explain your options clearly.",
          ],
        },
      ]}
      cta={{
        title: "Want to protect your business properly?",
        body: "Talk to us and we will help you understand the practical next steps.",
      }}
    />
  );
}
