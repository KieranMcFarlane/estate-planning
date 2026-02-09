import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceTimeline from "../components/sections/ServiceTimeline";
import WhatHappensNext from "../components/sections/WhatHappensNext";
import Button from "../components/base/Button";
import styles from "./page.module.css";

export default function HowItWorksPage() {
    const overviewSteps = [
        {
            title: "Free Initial Consultation",
            description: "We'll have a friendly, no-pressure chat about your situation. We'll answer your questions and explain your options in plain English.",
            duration: "~30 minutes, free"
        },
        {
            title: "We Prepare Your Plan",
            description: "Based on our discussion, we'll draft your Will, Trust, or LPA tailored to your specific circumstances and wishes.",
            duration: "~1 week"
        },
        {
            title: "Review Together",
            description: "We'll walk through everything with you, make any changes you need, and ensure you completely understand your documents.",
            duration: "As needed"
        },
        {
            title: "Sign with Confidence",
            description: "We'll guide you through proper execution (signing and witnessing) so your documents are legally valid and ready.",
            duration: "~30 minutes"
        }
    ];

    const whatToExpect = [
        {
            title: "No jargon, just clear explanations",
            description: "We explain everything in plain English. If you don't understand something, we'll find another way to explain it."
        },
        {
            title: "We go at your pace",
            description: "No pressure, no rushing. We'll take as much time as you need to feel comfortable and confident."
        },
        {
            title: "Home visits available",
            description: "We can come to you across Leamington Spa, Warwick, and surrounding areas. Evening and weekend appointments available."
        },
        {
            title: "Transparent pricing",
            description: "You'll know exactly what you'll pay before we start. No hidden fees, no surprises, no hourly billing."
        },
        {
            title: "Unlimited revisions",
            description: "We'll work with you until every detail reflects your wishes exactly. Your satisfaction matters most."
        },
        {
            title: "Secure document storage",
            description: "We store your documents safely and provide copies to you and your executors/attorneys."
        }
    ];

    const nextSteps = [
        {
            title: "Book your free consultation",
            description: "Call us or fill out our contact form. We'll schedule a convenient time to discuss your situation.",
            cta: { text: "Book a free call", link: "/contact" }
        },
        {
            title: "We'll listen and advise",
            description: "We'll understand your family situation, assets, and concerns. Then we'll explain your options clearly."
        },
        {
            title: "We'll prepare your documents",
            description: "Based on what's right for you, we'll draft professionally prepared Wills, Trusts, or LPAs."
        },
        {
            title: "You'll have peace of mind",
            description: "Your estate plan is complete, properly signed, and stored safely. Your family is protected."
        }
    ];

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className="container">
                        <span className={styles.eyebrow}>How It Works</span>
                        <h1 className={styles.title}>Estate planning made simple</h1>
                        <p className={styles.subtitle}>
                            We've broken down the process into clear, manageable steps.
                            Most clients complete their estate plan in just 2-3 meetings, typically within 30 days.
                        </p>
                    </div>
                </section>

                {/* Timeline */}
                <ServiceTimeline
                    steps={overviewSteps}
                    heading="Your journey to peace of mind"
                    summary="We've helped over 1,000 families complete their estate planning. Here's what your journey will look like."
                />

                {/* What to Expect */}
                <section className={styles.expectSection}>
                    <div className="container">
                        <h2 className={styles.sectionHeading}>What to expect</h2>
                        <p className={styles.sectionIntro}>
                            We believe estate planning should feel calm and supported, not stressful or rushed.
                            Here's what sets us apart:
                        </p>
                        <div className={styles.expectGrid}>
                            {whatToExpect.map((item, index) => (
                                <div key={index} className={styles.expectCard}>
                                    <span className={styles.expectNumber}>{index + 1}</span>
                                    <h3 className={styles.expectTitle}>{item.title}</h3>
                                    <p className={styles.expectDescription}>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className={styles.timelineSection}>
                    <div className="container">
                        <h2 className={styles.sectionHeading}>Typical timeline</h2>
                        <p className={styles.sectionIntro}>
                            Every situation is unique, but here's what most clients experience:
                        </p>
                        <div className={styles.timeline}>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <div className={styles.timelineContent}>
                                    <span className={styles.timelineDuration}>Day 1</span>
                                    <h3>Free consultation</h3>
                                    <p>We discuss your situation, answer questions, and explain options.</p>
                                </div>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <div className={styles.timelineContent}>
                                    <span className={styles.timelineDuration}>Week 1-2</span>
                                    <h3>Document preparation</h3>
                                    <p>We prepare your draft documents and send them for your review.</p>
                                </div>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <div className={styles.timelineContent}>
                                    <span className={styles.timelineDuration}>Week 2-3</span>
                                    <h3>Review and finalize</h3>
                                    <p>We meet to discuss, make changes, and ensure you're happy.</p>
                                </div>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <div className={styles.timelineContent}>
                                    <span className={styles.timelineDuration}>Week 3-4</span>
                                    <h3>Signing and completion</h3>
                                    <p>We guide you through proper execution. Your plan is complete!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Next Steps */}
                <WhatHappensNext
                    steps={nextSteps}
                    heading="Your next steps"
                    finalCTA={{ text: "Ready to protect your family's future? Let's talk.", link: "/contact" }}
                />

                {/* FAQ CTA */}
                <section className={styles.faqSection}>
                    <div className="container">
                        <div className={styles.faqContent}>
                            <h2>Have questions?</h2>
                            <p>
                                We've answered the most common questions in our FAQ.
                                Or feel free to call us directly — we're happy to help.
                            </p>
                            <div className={styles.faqButtons}>
                                <Button href="/faq" variant="outline" size="lg">
                                    View FAQ
                                </Button>
                                <Button href="tel:07902863999" variant="primary" size="lg">
                                    Call 07902 863999
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
