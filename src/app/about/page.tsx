import SubpageTemplate from "../components/SubpageTemplate";

export default function AboutPage() {
  return (
    <SubpageTemplate
      eyebrow="About Pathway Estate Planning"
      title="Estate planning that feels calm, clear and human"
      subtitle="Trusted support for families across Royal Leamington Spa, Warwickshire and the Midlands."
      heroImage="/leamington_location.jpg"
      heroAlt="Green gardens and historic Royal Leamington Spa architecture"
      canonicalPath="/about"
      intro={[
        "Pathway Estate Planning helps individuals and families put clear, practical plans in place for the people and assets they care about most.",
        "Our work is built around careful listening, plain-English guidance and a process that feels manageable from the first conversation to the final document.",
      ]}
      blocks={[
        {
          heading: "Why families choose us",
          variant: "grid",
          cards: [
            {
              title: "Genuinely personal",
              body: "You are guided by people who take the time to understand your family, your wishes and your concerns.",
            },
            {
              title: "Clear and practical",
              body: "We explain things plainly, avoid unnecessary jargon and help you make confident decisions.",
            },
            {
              title: "Local and approachable",
              body: "We support families in Royal Leamington Spa, Warwickshire and surrounding areas, with home visits available where helpful.",
            },
            {
              title: "Proficiently experienced",
              body: "We bring years of estate planning experience across Wills, Trusts, LPAs, care planning and tax considerations.",
            },
            {
              title: "No pressure",
              body: "We will tell you what is suitable, what is not, and what can wait.",
            },
            {
              title: "Handled with care",
              body: "Estate planning can be sensitive. We keep the process calm, respectful and steady.",
            },
          ],
        },
        {
          heading: "What makes Pathway different?",
          variant: "cream",
          items: [
            "Home visits available",
            "Appointments shaped around your needs",
            "Secure document storage where needed",
            "Family conversations handled carefully",
            "Clear costs before work begins",
            "Plain-English guidance from start to finish",
          ],
        },
        {
          heading: "Our role",
          paragraphs: [
            "We are here to help you understand your options, put the right documents in place, and make things easier for the people you love.",
            "Whether you need a simple Will or more joined-up estate planning, we will help you move forward clearly.",
          ],
        },
      ]}
      cta={{
        title: "Ready to talk it through?",
        body: "Start with an initial conversation and we will help you understand what matters for your situation.",
      }}
    />
  );
}
