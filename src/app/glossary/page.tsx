import SubpageTemplate from "../components/SubpageTemplate";

export default function GlossaryPage() {
  return (
    <SubpageTemplate
      eyebrow="Plain-English glossary"
      title="Glossary of Terms"
      subtitle="Understand common estate planning words with confidence."
      heroImage="/generated/estate-consultation-hero.jpg"
      heroAlt="Estate planning documents on a table"
      intro={[
        "Estate planning can involve language that feels unfamiliar, but understanding the basics makes the whole process easier.",
        "This glossary explains common terms related to Wills, Trusts, Lasting Powers of Attorney, Probate and Inheritance Tax Planning.",
      ]}
      blocks={[
        {
          heading: "Common terms",
          variant: "grid",
          cards: [
            {
              title: "Will",
              body: "A legal document that sets out who should receive your estate and who should manage it after you die.",
            },
            {
              title: "Executor",
              body: "The person or people you appoint in your Will to carry out your wishes and administer your estate.",
            },
            {
              title: "Beneficiary",
              body: "A person, charity or organisation who receives something from your estate.",
            },
            {
              title: "Trust",
              body: "A legal arrangement where assets are held and managed by Trustees for the benefit of others.",
            },
            {
              title: "Trustee",
              body: "A person or professional appointed to manage Trust assets responsibly and in line with the Trust terms.",
            },
            {
              title: "Lasting Power of Attorney",
              body: "A document that lets you appoint trusted people to make decisions for you if you cannot make them yourself.",
            },
            {
              title: "Probate",
              body: "The legal and administrative process of dealing with someone's estate after they have died.",
            },
            {
              title: "Inheritance Tax",
              body: "A tax that may apply to an estate depending on its value, available allowances, reliefs and exemptions.",
            },
            {
              title: "Rules of Intestacy",
              body: "The legal rules that decide who inherits if someone dies without a valid Will.",
            },
          ],
        },
        {
          heading: "We explain things properly",
          variant: "cream",
          paragraphs: [
            "You do not need to know the right legal words before you speak to us.",
            "If something is unclear, please ask. We are happy to explain everything in plain English and at your pace.",
          ],
        },
      ]}
      cta={{
        title: "Want us to talk through a term?",
        body: "Bring your questions to an initial chat and we will explain what matters for your situation.",
      }}
    />
  );
}
