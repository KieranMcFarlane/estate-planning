import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AboutUs from "../components/AboutUs";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import SecurityBadge from "../components/sections/SecurityBadge";
import ServiceBenefits from "../components/sections/ServiceBenefits";
import Button from "../components/base/Button";
import styles from "./page.module.css";

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className="container">
                        <span className={styles.eyebrow}>About Us</span>
                        <h1 className={styles.title}>Trusted estate planning experts serving the Midlands</h1>
                        <p className={styles.subtitle}>
                            Since 2006, we've helped over 1,000 families across Leamington Spa, Warwick, and the surrounding areas
                            protect what matters most with calm, step-by-step guidance.
                        </p>
                    </div>
                </section>

                {/* Stats Banner */}
                <section className={styles.statsBanner}>
                    <div className="container">
                        <div className={styles.statsGrid}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>18+</span>
                                <span className={styles.statLabel}>Years of Experience</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>1,000+</span>
                                <span className={styles.statLabel}>Families Helped</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>5★</span>
                                <span className={styles.statLabel}>Google Rating</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>STEP</span>
                                <span className={styles.statLabel}>Qualified</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <AboutUs />

                {/* Why Choose Us */}
                <WhyChooseUs />

                {/* What Makes Us Different */}
                <ServiceBenefits
                    benefits={[
                        {
                            icon: "home",
                            title: "Home Visits Available",
                            description: "We come to you across Leamington Spa, Warwick, and surrounding areas. Particularly helpful for elderly clients or those with mobility issues.",
                            highlight: true
                        },
                        {
                            icon: "calendar",
                            title: "Evening & Weekend Appointments",
                            description: "We understand life is busy. Schedule meetings outside work hours at a time that suits you.",
                            highlight: true
                        },
                        {
                            icon: "folder",
                            title: "Secure Document Storage",
                            description: "We store your important documents safely and provide copies to you and your attorneys as needed.",
                        },
                        {
                            icon: "check-circle",
                            title: "Annual Review Reminders",
                            description: "Life changes — marriages, divorces, births, deaths. We'll remind you to review your estate plan when it matters.",
                        },
                        {
                            icon: "users",
                            title: "Family Meeting Coordination",
                            description: "We can facilitate family meetings to ensure everyone understands your wishes and avoids future conflicts.",
                            highlight: true
                        },
                        {
                            icon: "check",
                            title: "Unlimited Amendments During Process",
                            description: "Your situation is unique. We'll work with you until every detail reflects your wishes exactly.",
                        },
                        {
                            icon: "clock",
                            title: "Responsive Communication",
                            description: "Questions between meetings? We're available by phone, email, or video call. No waiting weeks for a response.",
                        },
                        {
                            icon: "trending-up",
                            title: "Fixed Pricing, No Surprises",
                            description: "Know exactly what you'll pay before we start. No hourly billing, no hidden costs, no ongoing subscriptions.",
                            highlight: true
                        }
                    ]}
                    heading="What makes Pathway different?"
                    description="We offer the personal touch that DIY services can't match, with expertise that gives you peace of mind."
                    vsHeading="Why choose professional over DIY?"
                    ctaText="Experience the Pathway difference"
                    ctaLink="/contact"
                />

                {/* Security & Credentials */}
                <SecurityBadge
                    heading="Your security and peace of mind"
                    description="We take our responsibilities seriously. Here's how we protect you and your family."
                />

                {/* Testimonials */}
                <Testimonials />

                {/* CTA Section */}
                <section className={styles.ctaSection}>
                    <div className="container">
                        <div className={styles.ctaContent}>
                            <h2>Ready to get started?</h2>
                            <p>
                                Whether you need a simple Will or comprehensive estate planning, we're here to help.
                                Book a free, no-obligation consultation to discuss your situation.
                            </p>
                            <div className={styles.ctaButtons}>
                                <Button href="/contact" variant="primary" size="lg">
                                    Book a Free Call
                                </Button>
                                <Button href="tel:07902863999" variant="outline" size="lg">
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
