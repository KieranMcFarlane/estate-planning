import SubpageTemplate from "../components/SubpageTemplate";

export default function ExtendedServicesPage() {
  return (
    <SubpageTemplate
      eyebrow="Connected advice"
      title="Extended Services"
      subtitle="Practical support beyond estate planning, brought in carefully when you need it."
      heroImage="/generated/document-signing.jpg"
      heroAlt="Important documents being reviewed and signed"
      intro={[
        "Estate planning can involve more than legal documents, especially when property, finances, or probate come into the picture.",
        "That is why we work alongside trusted, regulated professionals so clients can access extra support in one place.",
      ]}
      blocks={[
        {
          heading: "Specialist support, coordinated clearly",
          paragraphs: [
            "You will always know who is helping, what they are helping with, and why their input may be useful.",
            "Where extra advice is needed, we make introductions carefully and keep the wider plan easy to understand.",
          ],
        },
        {
          heading: "What we can help connect",
          variant: "grid",
          cards: [
            {
              title: "Probate",
              body: "Managing the estate of someone who has passed away can feel complicated and emotionally draining.",
              items: [
                "Obtaining the Grant of Probate",
                "Collecting and valuing assets",
                "Dealing with paperwork",
                "Distributing the estate correctly",
              ],
            },
            {
              title: "Financial advice",
              body: "Sound financial planning can strengthen estate planning and support better long-term decisions.",
              items: [
                "Pensions and retirement planning",
                "Investment strategies",
                "Tax-efficient planning",
                "Long-term wealth management",
              ],
            },
            {
              title: "Conveyancing",
              body: "Property is often one of the most valuable parts of an estate, and transfers need to be handled properly.",
              items: [
                "Property sales",
                "Transfers of ownership",
                "Gifting property",
                "Legal requirements and documentation",
              ],
            },
            {
              title: "Equity release",
              body: "Equity release can offer flexibility in later life, but the long-term implications need careful explanation.",
              items: [
                "Suitability",
                "Benefits and risks",
                "Impact on inheritance",
                "Alternative options",
              ],
            },
            {
              title: "Mortgages",
              body: "Trusted mortgage advisers can help with buying, remortgaging, investing, or supporting a family member.",
            },
          ],
        },
      ]}
      cta={{
        title: "Need support beyond estate planning?",
        body: "If you are unsure which service is right for you, get in touch and we will guide you.",
        linkText: "Contact us",
      }}
    />
  );
}
