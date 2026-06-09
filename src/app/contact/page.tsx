import Image from "next/image";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, businessJsonLd, metadataForRoute } from "../seo";
import styles from "./page.module.css";

export const metadata = metadataForRoute("/contact");

type ContactPageProps = {
  searchParams?: Promise<{
    enquiry?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const enquiryStatus = params?.enquiry;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pathways-export/styles.css" />
      <main>
        <section className={styles.hero}>
          <Image
            src="/generated/clear-path-hero.jpg"
            alt="Warm garden path leading to a welcoming front door"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Contact</p>
            <h1>Start with a calm conversation</h1>
            <p>We are here to help in a way that feels simple, supportive and clear.</p>
          </div>
        </section>

        <section className={styles.contactSection}>
          <div className={styles.intro}>
            <p>
              You do not need to know exactly what you need before reaching out. Tell us what is on your mind and we will guide you from there.
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.info}>
              <section className={styles.panel} id="contact-consultations" data-semantic-id="contact-consultations">
                <p className={styles.panelEyebrow}>Consultations</p>
                <h2>Flexible ways to talk</h2>
                <p>We can arrange appointments at our office in Royal Leamington Spa, in the comfort of your own home, or by video call.</p>
                <ul>
                  <li>Home visits available across Warwickshire</li>
                  <li>Plain-English guidance from the first chat</li>
                  <li>No pressure and no jargon</li>
                </ul>
              </section>

              <section className={styles.panel} id="contact-details" data-semantic-id="contact-details">
                <p className={styles.panelEyebrow}>Get in touch</p>
                <h2>Contact details</h2>
                <p><strong>Phone:</strong> <a href="tel:07902863999">07902 863999</a></p>
                <p><strong>Email:</strong> <a href="mailto:info@pathwayestateplanning.co.uk">info@pathwayestateplanning.co.uk</a></p>
              </section>
            </div>

            <section className={styles.formWrapper} id="contact-enquiry-form" data-semantic-id="contact-enquiry-form">
              <p className={styles.panelEyebrow}>Enquiry form</p>
              <h2>Send us a message</h2>
              <p>If you would like to speak with one of our advisers, send a few details and we will respond promptly.</p>
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

          <div className={styles.note}>
            <h2>Estate planning can feel like a big step.</h2>
            <p>We will listen carefully, explain things clearly, and help you move forward with confidence.</p>
          </div>
        </section>
      </main>
      <JsonLd data={[businessJsonLd(), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]} />
    </>
  );
}
