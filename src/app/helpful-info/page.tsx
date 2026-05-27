import SubpageTemplate from "../components/SubpageTemplate";

export default function HelpfulInfoPage() {
  return (
    <SubpageTemplate
      eyebrow="Helpful information"
      title="Estate Planning Checklist"
      subtitle="A simple way to see whether the important pieces are in place."
      heroImage="/pathway-source/mission-compass.jpg"
      heroAlt="Compass representing clear direction"
      intro={[
        "Estate planning is not just one document. It is a set of important pieces that work together.",
        "Use this checklist to understand whether anything may be missing, and where a conversation could help.",
      ]}
      blocks={[
        {
          heading: "Have you covered the essentials?",
          variant: "grid",
          cards: [
            {
              title: "Will",
              body: "Your Will should be up to date, clearly reflect your wishes, and be signed and witnessed correctly.",
              items: [
                "Is your Will up to date?",
                "Have you included guardians where needed?",
                "Has it been signed correctly?",
                "Have you reviewed it after major life changes?",
              ],
            },
            {
              title: "Trusts",
              body: "Trust planning can help protect assets and structure how inheritance is passed on.",
              items: [
                "Have you explored whether Trust planning may help?",
                "Is any existing Trust still appropriate?",
                "Are your Trustees still the right choice?",
              ],
            },
            {
              title: "Lasting Powers of Attorney",
              body: "LPAs help make sure trusted people can make decisions if you cannot.",
              items: [
                "Do you have financial and health LPAs?",
                "Have they been registered?",
                "Are your Attorneys still suitable and available?",
              ],
            },
            {
              title: "Inheritance Tax Planning",
              body: "Understanding your position early can help identify allowances, reliefs and appropriate planning options.",
              items: [
                "Do you understand whether tax may apply?",
                "Have you explored allowances and reliefs?",
                "Have you received advice on appropriate options?",
              ],
            },
            {
              title: "Financial Planning",
              body: "Pensions, investments and long-term plans should sit alongside your wider estate planning.",
              items: [
                "Are pensions and investments reviewed?",
                "Do you understand your current position?",
                "Have you considered long-term planning?",
              ],
            },
          ],
        },
        {
          heading: "How did you do?",
          variant: "cream",
          paragraphs: [
            "If you answered a mixture of yes and no, or mostly no, there may be gaps in your estate planning that could create stress later on.",
            "This can lead to delays, confusion, avoidable tax exposure, and unintended outcomes. The good news is that it is fixable, and we can guide you through it step by step.",
          ],
        },
      ]}
      cta={{
        title: "Unsure about any part of your planning?",
        body: "Our team is here to help you understand what is missing and what to do next.",
      }}
    />
  );
}
