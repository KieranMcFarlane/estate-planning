import Image from "next/image";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCmsGlobalContent, getCmsPage } from "../cms/directus";
import { metadataForCmsRoute } from "../cms/metadata";
import type { CmsPage } from "../cms/types";
import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, businessJsonLd } from "../seo";
import styles from "./page.module.css";

const officeAddress = {
  lines: ["83 Warwick Street", "Royal Leamington Spa", "Warwickshire", "CV32 4RR"],
};
const officeAddressText = officeAddress.lines.join(", ");
const officeMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(officeAddressText)}&output=embed`;

export async function generateMetadata() {
  return metadataForCmsRoute("/contact");
}

type ContactPageProps = {
  searchParams?: Promise<{
    enquiry?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const enquiryStatus = params?.enquiry;
  const fallbackPage: CmsPage = {
    path: "/contact",
    pageType: "contact",
    status: "published",
    eyebrow: "Contact",
    title: "Start with a calm conversation",
    subtitle: "We are here to help in a way that feels simple, supportive and clear.",
    description: "Contact Pathway Estate Planning for a calm initial conversation.",
    heroImage: "/generated/clear-path-hero.jpg",
    heroAlt: "Warm garden path leading to a welcoming front door",
    intro: [
      "You do not need to know exactly what you need before reaching out. Tell us what is on your mind and we will guide you from there.",
    ],
    blocks: [
      {
        eyebrow: "Consultations",
        heading: "Flexible ways to talk",
        paragraphs: ["We can arrange appointments at our office in Royal Leamington Spa, in the comfort of your own home, or by video call."],
        items: ["Home visits available across Warwickshire", "Plain-English guidance from the first chat", "No pressure and no jargon"],
      },
      {
        eyebrow: "Enquiry form",
        heading: "Send us a message",
        paragraphs: ["If you would like to speak with one of our advisers, send a few details and we will respond promptly."],
      },
      {
        heading: "Estate planning can feel like a big step.",
        paragraphs: ["We will listen carefully, explain things clearly, and help you move forward with confidence."],
      },
    ],
    canonicalPath: "/contact",
    seoTitle: "Contact Pathway Estate Planning",
    priority: 0.9,
  };
  const [page, { tenant }] = await Promise.all([getCmsPage("/contact", fallbackPage), getCmsGlobalContent()]);
  const contactPage = page ?? fallbackPage;
  const consultation = contactPage.blocks[0] ?? fallbackPage.blocks[0];
  const formCopy = contactPage.blocks[1] ?? fallbackPage.blocks[1];
  const note = contactPage.blocks[2] ?? fallbackPage.blocks[2];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pathways-export/styles.css" />
      <main>
        <section className={styles.hero}>
          <Image
            src={contactPage.heroImage}
            alt={contactPage.heroAlt}
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>{contactPage.eyebrow}</p>
            <h1>{contactPage.title}</h1>
            <p>{contactPage.subtitle}</p>
          </div>
        </section>

        <section className={styles.contactSection}>
          <div className={styles.intro}>
            {contactPage.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          <div className={styles.grid}>
            <div className={styles.info}>
              <section className={styles.panel} id="contact-consultations" data-semantic-id="contact-consultations">
                <p className={styles.panelEyebrow}>{consultation.eyebrow ?? "Consultations"}</p>
                <h2>{consultation.heading}</h2>
                {consultation.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <ul>
                  {consultation.items?.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section className={styles.panel} id="contact-details" data-semantic-id="contact-details">
                <p className={styles.panelEyebrow}>Get in touch</p>
                <h2>Contact details</h2>
                <p><strong>Phone:</strong> <a href={`tel:${tenant.phone.replace(/\s+/g, "")}`}>{tenant.phone}</a></p>
                <p><strong>Email:</strong> <a href={`mailto:${tenant.email}`}>{tenant.email}</a></p>
                <div className={styles.addressBlock}>
                  <strong>Office address:</strong>
                  <address>
                    {officeAddress.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </address>
                </div>
              </section>
            </div>

            <section className={styles.formWrapper} id="contact-enquiry-form" data-semantic-id="contact-enquiry-form">
              <p className={styles.panelEyebrow}>{formCopy.eyebrow ?? "Enquiry form"}</p>
              <h2>{formCopy.heading}</h2>
              {formCopy.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {enquiryStatus === "sent" && (
                <p className={styles.formNotice}>Thank you. Your enquiry has been sent to Pathway.</p>
              )}
              {enquiryStatus === "saved" && (
                <p className={styles.formNotice}>Thank you. Your enquiry has been safely recorded for Pathway.</p>
              )}

              <form className={styles.form} action="/api/contact" method="post">
                <Field className={styles.field}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" type="text" placeholder="Your full name" />
                </Field>
                <Field className={styles.field}>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input id="phone" name="phone" type="tel" placeholder="Best number to reach you" />
                </Field>
                <Field className={styles.field}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" placeholder="Your email address" />
                </Field>
                <Field className={styles.field}>
                  <FieldLabel htmlFor="company">Company optional</FieldLabel>
                  <Input id="company" name="company" type="text" placeholder="Company name" />
                </Field>
                <Field className={styles.field}>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea id="message" name="message" rows={5} placeholder="How can we help?" />
                </Field>
                <button className={styles.submitBtn} type="submit">Send your enquiry</button>
              </form>
            </section>
          </div>

          <section className={styles.mapPanel} id="contact-map" data-semantic-id="contact-map">
            <div>
              <p className={styles.panelEyebrow}>Find us</p>
              <h2>Pathway Estate Planning office</h2>
              <p>{officeAddressText}</p>
            </div>
            <iframe
              title="Map showing Pathway Estate Planning office in Royal Leamington Spa"
              src={officeMapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </section>

          <div className={styles.note}>
            <h2>{note.heading}</h2>
            {note.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      </main>
      <JsonLd data={[businessJsonLd(), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]} />
    </>
  );
}
