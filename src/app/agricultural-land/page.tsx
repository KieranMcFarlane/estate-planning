import SubpageTemplate from "../components/SubpageTemplate";
import { metadataForCmsRoute } from "../cms/metadata";

export async function generateMetadata() {
  return metadataForCmsRoute("/agricultural-land");
}

export default function AgriculturalLandPage() {
  return (
    <SubpageTemplate
      eyebrow="Specialist planning"
      title="Agricultural Land"
      subtitle="Specialist planning for farms, land and rural estates."
      heroImage="/leamington_location.jpg"
      heroAlt="Green gardens and historic Royal Leamington Spa architecture"
      canonicalPath="/agricultural-land"
      aiSummary={{
        answer:
          "Agricultural land and rural estates often need careful estate planning because family wishes, ownership structures, land, tax and succession can overlap. Pathway Estate Planning helps coordinate the estate planning conversation.",
        questions: [
          "Who should inherit or manage land, farming assets or rural property?",
          "Are ownership structures, family expectations or succession plans already documented?",
          "Should Wills, Trusts and tax considerations be reviewed together?",
        ],
        handoffPrompt: "If land or farm assets are involved, ask Pathway Estate Planning to contact you so the details can be understood properly.",
      }}
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
