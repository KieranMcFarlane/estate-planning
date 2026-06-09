import SubpageTemplate from "../components/SubpageTemplate";
import JsonLd from "../components/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, metadataForRoute } from "../seo";

export const metadata = metadataForRoute("/faq");

export default function FAQPage() {
  const faqItems = [
    ["Do I need a Will?", "A properly prepared Will helps ensure your wishes are followed, your beneficiaries are protected, children or dependants can be cared for, and confusion or disputes are less likely."],
    ["What happens without a Will?", "If someone dies without a valid Will, their estate is distributed according to the Rules of Intestacy, which may not reflect what they would have wanted."],
    ["What is a Lasting Power of Attorney?", "An LPA lets you appoint someone you trust to make decisions on your behalf if you are unable to."],
    ["What is a Trust?", "A Trust is a legal arrangement used to protect or manage assets for someone else."],
    ["What is Inheritance Tax?", "Inheritance Tax may be payable depending on the value of an estate, allowances, reliefs and exemptions."],
  ];

  return (
    <>
    <SubpageTemplate
      eyebrow="Helpful answers"
      title="Frequently Asked Questions"
      subtitle="Clear answers to the questions families often ask first."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      intro={[
        "Estate planning can feel full of unfamiliar words and decisions, but most questions have straightforward answers once they are explained properly.",
        "Here are some of the things families often ask us about Wills, Trusts, Probate, LPAs and tax planning.",
      ]}
      blocks={[
        {
          heading: "Wills and Probate",
          variant: "cream",
          cards: [
            {
              title: "Do I need a Will?",
              body: "A properly prepared Will helps ensure your wishes are followed, your beneficiaries are protected, children or dependants can be cared for, and confusion or disputes are less likely.",
            },
            {
              title: "What happens without a Will?",
              body: "If someone dies without a valid Will, their estate is distributed according to the Rules of Intestacy, which may not reflect what they would have wanted.",
            },
            {
              title: "Can I change my Will?",
              body: "Yes. You can update your Will when you need to, especially after major life changes such as marriage, divorce, children, moving house or bereavement.",
            },
            {
              title: "What is Probate?",
              body: "Probate is the legal process of managing someone's estate after they pass away. Whether it is required depends on the size and type of assets involved.",
            },
          ],
        },
        {
          heading: "LPAs, Trusts and tax planning",
          variant: "grid",
          cards: [
            {
              title: "What is a Lasting Power of Attorney?",
              body: "An LPA lets you appoint someone you trust to make decisions on your behalf if you are unable to. There are two types: Property and Financial Affairs, and Health and Welfare.",
            },
            {
              title: "Do I need an LPA?",
              body: "Having an LPA in place can prevent delays and stress for loved ones, and helps ensure the right people can step in quickly if needed.",
            },
            {
              title: "What is a Trust?",
              body: "A Trust is a legal arrangement used to protect or manage assets for someone else. It can help with inheritance, asset protection and vulnerable beneficiaries.",
            },
            {
              title: "Do I need a Trust?",
              body: "Not everyone needs a Trust. We can explain clearly whether one may be helpful for your circumstances.",
            },
            {
              title: "What is Inheritance Tax?",
              body: "Inheritance Tax may be payable depending on the value of an estate, allowances, reliefs and exemptions.",
            },
            {
              title: "Can I reduce inheritance tax?",
              body: "We can help you understand your position and explore appropriate ways of mitigating tax where possible.",
            },
          ],
        },
        {
          heading: "Why choose Pathway Estate Planning?",
          paragraphs: [
            "We specialise in estate planning and focus on advice that is clear, straightforward and genuinely supportive.",
            "Our role is to help you understand your options, make confident decisions, and put the right documents in place without pressure or jargon.",
          ],
        },
      ]}
      cta={{
        title: "Still have questions?",
        body: "If you would like to talk through your situation, we will be happy to help.",
        linkText: "Contact us",
      }}
    />
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${absoluteUrl("/faq")}#faq`,
          mainEntity: faqItems.map(([name, text]) => ({
            "@type": "Question",
            name,
            acceptedAnswer: {
              "@type": "Answer",
              text,
            },
          })),
        },
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Frequently Asked Questions", path: "/faq" }]),
      ]}
    />
    </>
  );
}
