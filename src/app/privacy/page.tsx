import SubpageTemplate from "../components/SubpageTemplate";

export default function PrivacyPage() {
  return (
    <SubpageTemplate
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How Pathway Estate Planning handles personal information."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      intro={[
        "We only ask for personal information when it helps us respond to your enquiry, provide estate planning services, or meet our professional obligations.",
        "This page gives a plain-English overview of how we treat your details with care.",
      ]}
      blocks={[
        {
          heading: "Information we may collect",
          items: [
            "Your name and contact details",
            "Information you choose to share about your family or estate planning needs",
            "Appointment and communication history",
            "Documents or details needed to provide our services",
          ],
        },
        {
          heading: "How we use your information",
          variant: "cream",
          paragraphs: [
            "We use your information to respond to enquiries, arrange appointments, prepare documents, provide advice and keep appropriate business records.",
            "We do not sell your personal information.",
          ],
        },
        {
          heading: "Questions about privacy",
          paragraphs: [
            "If you have a question about how your information is handled, please contact us and we will help.",
          ],
        },
      ]}
      showHeroActions={false}
      cta={{
        eyebrow: "Privacy",
        title: "Need to ask us about your information?",
        body: "Contact us and we will respond as clearly as we can.",
        linkText: "Contact us",
      }}
    />
  );
}
