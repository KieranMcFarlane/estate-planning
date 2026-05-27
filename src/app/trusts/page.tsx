import SubpageTemplate from "../components/SubpageTemplate";

export default function TrustsPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Trusts"
      subtitle="Extra protection and control, explained in plain English."
      heroImage="/generated/document-signing.jpg"
      heroAlt="Estate planning documents being reviewed"
      intro={[
        "Trusts can be a powerful part of estate planning, but they are often misunderstood.",
        "A Trust can help protect assets for your loved ones, add structure to how inheritance is passed on, and provide reassurance when family situations are more complex.",
        "We explain everything clearly, without jargon, and help you decide whether a Trust is right for you.",
      ]}
      blocks={[
        {
          heading: "Why people choose Trust planning",
          variant: "cream",
          paragraphs: [
            "Trust planning is not for everyone, and we will always be honest about what is and is not suitable for your situation.",
          ],
          items: [
            "Protect inheritance for children or grandchildren",
            "Support vulnerable beneficiaries",
            "Reduce risk of family disputes",
            "Add structure to how assets are managed",
            "Plan ahead for future uncertainty",
            "Explore tax planning options where appropriate",
          ],
        },
        {
          heading: "A simple explanation",
          cards: [
            {
              title: "What a Trust is",
              body: "We explain the structure, who is involved, and how it works in real life.",
            },
            {
              title: "Why you might need one",
              body: "We look at your family, assets and aims before recommending anything.",
            },
            {
              title: "Responsibilities involved",
              body: "Trustees have important duties, and we make sure those are understood from the start.",
            },
            {
              title: "What happens next",
              body: "If a Trust is right for you, we guide you through the setup clearly and carefully.",
            },
          ],
        },
      ]}
      cta={{
        title: "Unsure whether a Trust applies to you?",
        body: "We can help you understand the options clearly before you make any decision.",
      }}
    />
  );
}
