import SubpageTemplate from "../components/SubpageTemplate";

export default function CookiesPage() {
  return (
    <SubpageTemplate
      eyebrow="Legal"
      title="Cookies"
      subtitle="A simple note about cookies and similar technologies."
      heroImage="/generated/clear-path-hero.jpg"
      heroAlt="Warm garden path leading to a welcoming front door"
      intro={[
        "Cookies are small files that websites can use to remember information or understand how a site is being used.",
        "This website is designed to be simple and informational. If analytics or similar tools are used, they should help us improve the experience rather than identify you unnecessarily.",
      ]}
      blocks={[
        {
          heading: "How cookies may be used",
          items: [
            "To keep the website working properly",
            "To understand general website performance",
            "To improve content and navigation",
            "To support security and reliability",
          ],
        },
        {
          heading: "Your choices",
          variant: "cream",
          paragraphs: [
            "You can usually control or delete cookies through your browser settings.",
            "Blocking some cookies may affect how certain websites behave, though this site should remain usable for basic information.",
          ],
        },
      ]}
      showHeroActions={false}
      cta={{
        eyebrow: "Cookies",
        title: "Have a question about cookies?",
        body: "Contact us and we will help where we can.",
        linkText: "Contact us",
      }}
    />
  );
}
