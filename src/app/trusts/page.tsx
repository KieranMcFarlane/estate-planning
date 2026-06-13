import SubpageTemplate from "../components/SubpageTemplate";
import { metadataForCmsRoute } from "../cms/metadata";

export async function generateMetadata() {
  return metadataForCmsRoute("/trusts");
}

export default function TrustsPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Trusts"
      subtitle="Extra protection and control, explained in plain English."
      heroImage="/generated/document-signing.jpg"
      heroAlt="Estate planning documents being reviewed"
      canonicalPath="/trusts"
      aiSummary={{
        answer:
          "A Trust can add structure to how assets are held or passed on, especially where children, vulnerable beneficiaries, blended families or future protection are involved. Pathway Estate Planning explains whether a Trust is suitable before recommending anything.",
        questions: [
          "Am I trying to protect inheritance for children, grandchildren or a vulnerable person?",
          "Is there a second marriage, blended family or property protection concern?",
          "Who would act as trustees and understand their responsibilities?",
        ],
        handoffPrompt: "Trust planning depends on personal circumstances, so the next best step is to ask Pathway Estate Planning to contact you.",
      }}
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
            "Trust planning is not for everyone and we will always ensure that we provide honest advice for what is deemed suitable or not for you and your situation.",
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
