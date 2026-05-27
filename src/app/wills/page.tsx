import SubpageTemplate from "../components/SubpageTemplate";

export default function WillsPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Wills"
      subtitle="A calm, clear way to protect the people you love."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      intro={[
        "Writing a Will is one of the most important things you can do, and it is often much easier than people expect.",
        "A clear, professionally prepared Will helps make sure your wishes are followed, the right people are looked after, and your estate is handled properly when the time comes.",
        "At Pathway Estate Planning, we guide you through the process calmly and step by step, with clear advice in plain English.",
      ]}
      blocks={[
        {
          heading: "Who a Will can help",
          variant: "grid",
          cards: [
            {
              title: "Parents with young children",
              body: "Appoint guardians and make sure your children are cared for by the people you choose.",
            },
            {
              title: "Homeowners",
              body: "Property is often your largest asset. A Will helps make sure it passes to the right people.",
            },
            {
              title: "Married couples",
              body: "A Will makes your wishes clear, instead of relying on assumptions about what happens automatically.",
            },
            {
              title: "Blended families",
              body: "Protect children from previous relationships while providing for your current family.",
            },
            {
              title: "Unmarried partners",
              body: "Without a Will, your partner may receive nothing under the Rules of Intestacy.",
            },
            {
              title: "Anyone with assets",
              body: "If you have savings, investments, property or personal possessions, a Will helps avoid confusion and conflict.",
            },
          ],
        },
        {
          heading: "Why having a Will matters",
          variant: "cream",
          paragraphs: [
            "A Will allows you to decide what should happen, who should manage your estate, and who should care for your children if they are under 18.",
            "Without a valid Will, your estate may be distributed under the Rules of Intestacy, which may not reflect what you would have wanted.",
          ],
          items: [
            "Choose who should inherit your assets",
            "Appoint the right Executors",
            "Name guardians for children",
            "Record sentimental items and personal wishes",
          ],
        },
        {
          heading: "How we help",
          cards: [
            {
              title: "A clear first conversation",
              body: "We talk through your situation, answer your questions, and explain your options without pressure.",
            },
            {
              title: "Professional drafting",
              body: "We prepare your Will around your wishes and send it to you for careful review.",
            },
            {
              title: "Review and signing",
              body: "We guide you through any adjustments and the correct signing process so your Will is valid.",
            },
            {
              title: "Ongoing peace of mind",
              body: "Your Will can be stored securely, and you can update it as your life changes.",
            },
          ],
        },
      ]}
      cta={{
        title: "Ready to protect your family's future?",
        body: "Start with an initial chat and we will help you understand what matters for your situation.",
      }}
    />
  );
}
