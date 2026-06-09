import SubpageTemplate from "../components/SubpageTemplate";
import { metadataForRoute } from "../seo";

export const metadata = metadataForRoute("/inheritance-tax-planning");

export default function IHTPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Inheritance Tax Planning"
      subtitle="Protect more of what you have built for the people you love."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      canonicalPath="/inheritance-tax-planning"
      aiSummary={{
        answer:
          "Inheritance Tax may depend on estate value, allowances, reliefs, gifts and family circumstances. Pathway can help you understand the general position and explore sensible planning as part of a wider estate plan.",
        questions: [
          "Could my estate be exposed to inheritance tax based on property, savings or business assets?",
          "Which allowances, exemptions or reliefs might need checking?",
          "How should tax planning fit with my Will, Trusts and family wishes?",
        ],
        handoffPrompt: "Tax planning is personal, so ask Pathway to contact you before relying on any next step.",
      }}
      intro={[
        "Inheritance Tax can feel confusing, frustrating, or even unfair, and many families do not realise how much it can affect an estate until it is too late.",
        "With calm planning and the right guidance, it may be possible to support mitigating tax and ensure more of your estate passes to the people and causes that matter to you.",
        "We explain your options clearly, without pressure or overwhelm.",
      ]}
      blocks={[
        {
          heading: "What is inheritance tax?",
          paragraphs: [
            "Inheritance Tax may apply depending on the value of an estate, available allowances, reliefs and exemptions.",
            "There may also be allowances available depending on your circumstances, such as gifts to spouses, charitable giving, or specific property-related reliefs.",
          ],
        },
        {
          heading: "How we support you",
          variant: "cream",
          paragraphs: [
            "Inheritance tax planning is not about tricks or risky schemes. It is about putting sensible, lawful strategies in place so mitigating tax is part of a clear wider plan.",
          ],
          items: [
            "Understand whether inheritance tax may apply",
            "Identify allowances that may be available",
            "Explore appropriate planning options",
            "Structure your wishes clearly and safely",
          ],
        },
      ]}
      cta={{
        title: "Want clarity on your tax position?",
        body: "We are here to explain your options and help you make confident decisions.",
      }}
    />
  );
}
