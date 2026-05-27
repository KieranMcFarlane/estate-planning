import SubpageTemplate from "../components/SubpageTemplate";

export default function EstatePlanningPage() {
  return (
    <SubpageTemplate
      eyebrow="Estate planning services"
      title="Estate Planning"
      subtitle="Protect your wishes, support your loved ones, and feel prepared."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      intro={[
        "Many people delay estate planning because it feels daunting, or because they are not sure where to start.",
        "But putting the right plan in place can make a world of difference, for you and for the people you care about.",
      ]}
      blocks={[
        {
          heading: "Estate planning is about more than writing a Will.",
          paragraphs: [
            "It is about making sure your wishes are respected, your loved ones are supported, your estate is handled properly, and things are easier during a difficult time.",
            "At Pathway Estate Planning, we offer clear, step-by-step guidance to help you feel confident that everything is in order.",
          ],
          items: [
            "Your wishes are respected",
            "Your loved ones are supported",
            "Your estate is handled properly",
            "Things are easier during a difficult time",
          ],
        },
        {
          heading: "Why it matters",
          variant: "cream",
          paragraphs: [
            "Your Will is one of the most important documents you will ever create, but it is often easier than people expect.",
            "Some people assume estate planning is expensive or complicated. Others believe their estate will automatically pass to their spouse or family. In reality, every situation is different, and small misunderstandings can lead to serious consequences later on.",
            "Without a valid Will, your estate may be distributed under the Rules of Intestacy, which may not reflect your wishes.",
          ],
          items: [
            "Avoid delays and confusion",
            "Reduce unnecessary stress for loved ones",
            "Lower the risk of family disputes",
            "Help assets pass to the right people",
          ],
        },
        {
          heading: "Our estate planning services",
          variant: "grid",
          cards: [
            {
              title: "Wills",
              body: "A properly prepared Will helps ensure your estate goes where you want it to, appoint guardians for children, and name the right people to manage your estate.",
            },
            {
              title: "Trusts",
              body: "Trusts can help protect assets, control how inheritance is passed on, and support loved ones who may need additional care or structure.",
            },
            {
              title: "Lasting Powers of Attorney",
              body: "LPAs allow you to appoint someone you trust to make decisions for you if you ever cannot.",
            },
            {
              title: "Inheritance Tax Planning",
              body: "We can help you understand your potential exposure and explore appropriate ways of mitigating tax where possible.",
            },
            {
              title: "Asset Protection and Gifting",
              body: "Careful planning can protect assets from avoidable risks and help ensure your estate goes to the people you intend.",
            },
            {
              title: "Business and Agricultural Planning",
              body: "We can help with continuity, business interests, agricultural land and the key considerations that come with them.",
            },
          ],
        },
      ]}
      cta={{
        title: "Not sure what you need?",
        body: "That is okay. We will listen, explain your options clearly, and help you move forward with confidence.",
      }}
    />
  );
}
