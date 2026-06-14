import SubpageTemplate from "../components/SubpageTemplate";

export default function TermsPage() {
  return (
    <SubpageTemplate
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The basis on which we provide information and estate planning services."
      heroImage="/generated/document-signing.jpg"
      heroAlt="Estate planning documents being reviewed"
      canonicalPath="/terms"
      intro={[
        "The information on this website is provided as a general guide and should not be treated as legal, tax or financial advice for your specific circumstances.",
        "When you become a client, we will explain the scope of work, costs and next steps clearly before work begins.",
      ]}
      blocks={[
        {
          heading: "Using this website",
          paragraphs: [
            "We make reasonable efforts to keep website information clear and useful, but estate planning depends on personal circumstances and current rules.",
            "Please contact us for advice that is specific to your situation.",
          ],
        },
        {
          heading: "Our services",
          variant: "cream",
          items: [
            "We explain the work before starting",
            "We agree costs with you in advance",
            "We ask you to provide accurate information",
            "We may recommend specialist advice where needed",
          ],
        },
      ]}
      showHeroActions={false}
      cta={{
        eyebrow: "Terms",
        title: "Unsure about anything?",
        body: "We are happy to explain how the process works before you decide what to do.",
        linkText: "Contact us",
      }}
    />
  );
}
