import SubpageTemplate from "../components/SubpageTemplate";

export default function ComplaintsPage() {
  return (
    <SubpageTemplate
      eyebrow="Client care"
      title="Complaints"
      subtitle="How to raise a concern if something has not felt right."
      heroImage="/generated/estate-consultation-hero.jpg"
      heroAlt="Estate planning adviser talking through documents"
      intro={[
        "We aim to provide clear, careful and supportive service. If something has not met your expectations, we want to understand it and respond properly.",
        "Please contact us with the details of your concern so we can review what happened and come back to you.",
      ]}
      blocks={[
        {
          heading: "How to raise a concern",
          items: [
            "Tell us what happened",
            "Include any relevant dates or documents",
            "Let us know the best way to contact you",
            "Explain what outcome you are hoping for",
          ],
        },
        {
          heading: "What happens next",
          variant: "cream",
          paragraphs: [
            "We will acknowledge your concern, look into it carefully, and respond as clearly as possible.",
            "If we need more information, we will let you know.",
          ],
        },
      ]}
      showHeroActions={false}
      cta={{
        eyebrow: "Client care",
        title: "Need to raise a concern?",
        body: "Please contact us and we will take it seriously.",
        linkText: "Contact us",
      }}
    />
  );
}
