import SubpageTemplate from "../components/SubpageTemplate";

export default function AgriculturalLandPage() {
  return (
    <SubpageTemplate
      eyebrow="Specialist planning"
      title="Agricultural Land"
      subtitle="Specialist planning for farms, land and rural estates."
      heroImage="/leamington_location.jpg"
      heroAlt="Green gardens and historic Leamington Spa architecture"
      intro={[
        "Agricultural and rural estates often require specialist estate planning.",
        "Land, property and long-standing family assets can involve unique considerations, and it is important that planning is handled carefully and correctly.",
        "We offer guidance and support to help you protect what matters most and plan confidently for the future.",
      ]}
      blocks={[
        {
          heading: "How we can help",
          variant: "cream",
          paragraphs: [
            "Where needed, we can work alongside trusted professionals to ensure your estate plan is complete and handled properly.",
          ],
          items: [
            "Family and generational wishes",
            "Ownership structures",
            "Protection of land and property",
            "Inheritance planning",
            "Aligned Wills, Trusts and tax considerations",
          ],
        },
      ]}
      cta={{
        title: "Planning for land or rural assets?",
        body: "We can talk through the considerations and help you move forward clearly.",
      }}
    />
  );
}
