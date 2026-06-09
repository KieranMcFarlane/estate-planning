import SubpageTemplate from "../components/SubpageTemplate";
import { metadataForRoute } from "../seo";

export const metadata = metadataForRoute("/care-planning");

export default function CarePlanningPage() {
  return (
    <SubpageTemplate
      eyebrow="Later-life planning"
      title="Care Planning"
      subtitle="Practical, calm support for decisions that can feel difficult to face."
      heroImage="/care_planning.jpg"
      heroAlt="Care professional talking with an older person at home"
      canonicalPath="/care-planning"
      aiSummary={{
        answer:
          "Care planning helps families think ahead about later-life decisions, LPAs, care preferences, family roles and funding considerations. Pathway explains options calmly without fear-led promises.",
        questions: [
          "Who should make decisions if care or capacity becomes an issue?",
          "Have care preferences, LPAs and family responsibilities been discussed?",
          "Do funding or property concerns need specialist advice alongside estate planning?",
        ],
        handoffPrompt: "If care planning feels urgent or sensitive, ask Pathway to contact you for a calm initial conversation.",
      }}
      intro={[
        "Planning for later life is not always easy to think about, but having a plan in place can bring real peace of mind.",
        "Care planning helps you understand the practical, financial and legal aspects of long-term care, whether you are planning for yourself or helping a loved one.",
      ]}
      blocks={[
        {
          heading: "What care planning helps with",
          paragraphs: [
            "The cost of long-term care can be significant, and without planning it can affect savings and assets more quickly than people expect.",
            "Care planning is not about fear. It is about preparation, clarity, and making calm decisions before anything becomes urgent.",
          ],
          items: [
            "Your wishes are respected",
            "Important decisions are made by the right people",
            "Your finances are structured as safely as possible",
            "Your family feels supported, not overwhelmed",
          ],
        },
        {
          heading: "We can help you understand",
          variant: "cream",
          cards: [
            {
              title: "Funding options",
              body: "We explain the practical considerations around care funding and where specialist financial advice may be useful.",
            },
            {
              title: "Powers of Attorney",
              body: "We help you understand how LPAs can support future decision-making if you can no longer make decisions yourself.",
            },
            {
              title: "Asset protection",
              body: "We talk through appropriate planning options clearly, without fear-led promises or confusing schemes.",
            },
            {
              title: "Care choices",
              body: "We help you think through how your care preferences can be understood, recorded and respected.",
            },
          ],
        },
        {
          heading: "Support that stays human",
          paragraphs: [
            "We work with trusted financial professionals where needed, and we always explain things clearly in plain English.",
            "Our goal is to help you feel informed and supported, so your family can make decisions with more confidence.",
          ],
        },
      ]}
      cta={{
        title: "Preparing for later life does not have to be overwhelming.",
        body: "Talk to our friendly team today. We are here to listen, support and guide you.",
      }}
    />
  );
}
