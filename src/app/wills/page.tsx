import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/base/Button";
import ServicePageHeader from "../components/sections/ServicePageHeader";
import WhoThisIsFor from "../components/sections/WhoThisIsFor";
import ServiceTimeline from "../components/sections/ServiceTimeline";
import WhatsIncluded from "../components/sections/WhatsIncluded";
import ServicePricing from "../components/sections/ServicePricing";
import WhatHappensNext from "../components/sections/WhatHappensNext";
import styles from "./page.module.css";

export default function WillsPage() {
    const whoScenarios = [
        {
            title: "Parents with young children",
            description: "Appoint guardians and ensure your children are cared for by the people you choose."
        },
        {
            title: "Homeowners",
            description: "Property is often your largest asset. A Will ensures it goes to the right people."
        },
        {
            title: "Married couples",
            description: "Don't assume everything goes to your spouse. A Will ensures your wishes are followed."
        },
        {
            title: "Blended families",
            description: "Protect children from previous relationships while providing for your current family."
        },
        {
            title: "Unmarried partners",
            description: "Without a Will, your partner may receive nothing under the Rules of Intestacy."
        },
        {
            title: "Anyone with assets",
            description: "If you have savings, investments, or property, a Will helps avoid confusion and conflict."
        }
    ];

    const timelineSteps = [
        {
            title: "Free initial consultation",
            description: "We'll discuss your situation, answer your questions, and explain your options. No obligation, no pressure.",
            duration: "~30 minutes"
        },
        {
            title: "Drafting your Will",
            description: "We'll prepare your draft Will based on our discussion and send it for your review.",
            duration: "~1 week"
        },
        {
            title: "Review and adjustments",
            description: "We'll talk through any changes you'd like. Unlimited revisions until you're completely happy.",
            duration: "As needed"
        },
        {
            title: "Signing and witnessing",
            description: "We'll guide you through proper execution to ensure your Will is legally valid.",
            duration: "~30 minutes"
        }
    ];

    const whatsIncluded = [
        { text: "Professional drafting of your Will", included: true },
        { text: "Unlimited revisions until you're satisfied", included: true },
        { text: "Proper execution (signing and witnessing)", included: true },
        { text: "Secure storage of your Will", included: true },
        { text: "Copies for you and your executors", included: true },
        { text: "Advice on guardianship for children", included: true },
        { text: "Executor guidance and support", included: true },
        { text: "Complex trust arrangements", included: false },
        { text: "Inheritance tax planning", included: false }
    ];

    const pricingTiers = [
        {
            name: "Simple Will",
            price: "From £295",
            description: "For individuals with straightforward circumstances",
            features: [
                "Professionally drafted Will",
                "Unlimited revisions",
                "Proper execution included",
                "Secure storage",
                "Digital copies provided"
            ],
            ctaLink: "/contact"
        },
        {
            name: "Mirror Wills",
            price: "From £495",
            description: "For couples with similar wishes",
            features: [
                "Two professionally drafted Wills",
                "Unlimited revisions",
                "Proper execution included",
                "Secure storage for both",
                "Digital copies provided",
                "Popular choice for couples"
            ],
            popular: true,
            ctaLink: "/contact"
        },
        {
            name: "Complex Will",
            price: "From £595",
            description: "For blended families, trusts, or tax planning",
            features: [
                "Tailored to your situation",
                "Trust provisions included",
                "Inheritance tax considerations",
                "Guardianship for children",
                "All Simple Will features"
            ],
            ctaLink: "/contact"
        }
    ];

    const nextSteps = [
        {
            title: "Book your free consultation",
            description: "Call us or fill out our contact form. We'll schedule a convenient time to discuss your situation.",
            cta: { text: "Book a free call", link: "/contact" }
        },
        {
            title: "We'll prepare your draft Will",
            description: "Based on our discussion, we'll create a draft Will tailored to your specific wishes and circumstances."
        },
        {
            title: "Review and sign together",
            description: "We'll meet to go through everything, make any changes, and witness your Will properly."
        },
        {
            title: "Peace of mind",
            description: "Your Will is stored securely, and you can rest easy knowing your loved ones are protected."
        }
    ];

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <ServicePageHeader
                        eyebrow="Estate Planning Services"
                        title="Wills"
                        subtitle="A simple way to protect the people you love"
                        trustBadge="✓ Trusted by over 1,000 families across the Midlands"
                    />

                    <section className={styles.intro}>
                        <p>
                            Writing a Will is one of the most important things you can do — and it's often much easier than people expect.
                        </p>
                        <p>
                            A clear, professionally prepared Will helps make sure your wishes are followed, the right people are looked after, and your estate is handled properly when the time comes.
                        </p>
                        <p>
                            At <strong>Pathway Estate Planning</strong>, we guide you through the process calmly and step by step, with clear advice in plain English.
                        </p>
                    </section>

                    <WhoThisIsFor scenarios={whoScenarios} />

                    <section className={styles.section}>
                        <h2>Why having a Will matters</h2>
                        <p>A Will allows you to decide:</p>
                        <ul className={styles.list}>
                            <li>who should inherit your assets</li>
                            <li>who should manage your estate (your Executors)</li>
                            <li>who should care for your children (guardianship)</li>
                            <li>what happens to sentimental items and personal wishes</li>
                        </ul>
                        <p>
                            Without a Will, your estate may be distributed under the <strong>Rules of Intestacy</strong>, which may not reflect what you would have wanted.
                        </p>
                    </section>

                    <ServiceTimeline steps={timelineSteps} summary="Most clients complete their Will in 2-3 meetings, typically within 30 days." />

                    <WhatsIncluded
                        items={whatsIncluded}
                        subheading="Everything included in our standard Will service. For more complex arrangements, see our Complex Will pricing."
                    />

                    <ServicePricing
                        tiers={pricingTiers}
                        note="All prices are fixed and agreed upfront. No hidden fees, no surprises. Complex estates or additional requirements may affect pricing — we'll always quote before proceeding."
                    />

                    <WhatHappensNext
                        steps={nextSteps}
                        finalCTA={{ text: "Ready to protect your family's future?", link: "/contact" }}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
}
