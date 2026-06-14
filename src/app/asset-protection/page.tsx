import SubpageTemplate from "../components/SubpageTemplate";

export default function AssetProtectionPage() {
  return (
    <SubpageTemplate
      eyebrow="Specialist planning"
      title="Asset Protection and Gifting"
      subtitle="A thoughtful way to protect your estate and your family's future."
      heroImage="/generated/estate-consultation-hero.jpg"
      heroAlt="Estate planning adviser talking through documents"
      canonicalPath="/asset-protection"
      intro={[
        "Asset protection planning is about ensuring your estate goes where you want it to, and helping reduce the chance of it being lost through avoidable risks, delays or poor planning.",
        "Gifting can also play a role in estate planning, but it needs to be handled carefully and with the right advice.",
        "We guide you through your options clearly and responsibly.",
      ]}
      blocks={[
        {
          heading: "When asset protection planning can help",
          variant: "cream",
          items: [
            "Protecting the family home",
            "Planning for later life and care costs",
            "Passing wealth down safely",
            "Supporting children or grandchildren",
            "Preventing disputes or complications later",
          ],
        },
        {
          heading: "Gifting, done with care",
          paragraphs: [
            "Gifting can be a helpful part of estate planning, but it is important to understand the rules and long-term impact.",
          ],
          items: [
            "Whether gifting is right for you",
            "Timing and practical implications",
            "How to protect your own financial security",
            "How gifts may affect inheritance tax planning",
          ],
        },
      ]}
      cta={{
        title: "Want to protect your estate confidently?",
        body: "We can help you explore your options without pressure or confusing jargon.",
      }}
    />
  );
}
