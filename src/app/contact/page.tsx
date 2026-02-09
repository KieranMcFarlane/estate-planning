import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function ContactPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Contact Us</h1>
                        <p className={styles.subtitle}>We’re here to help — in a way that feels simple and supportive</p>
                    </header>

                    <div className={styles.grid}>
                        <div className={styles.info}>
                            <section className={styles.section}>
                                <h2>Flexible consultations</h2>
                                <p>We can arrange appointments:</p>
                                <ul>
                                    <li>at our office in <strong>Royal Leamington Spa</strong></li>
                                    <li>in the comfort of your own home</li>
                                    <li>via video call</li>
                                </ul>
                                <p>You don’t need to know exactly what you need before reaching out. Just tell us what’s on your mind, and we’ll guide you from there.</p>
                            </section>

                            <section className={styles.section}>
                                <h2>Get in touch</h2>
                                <p><strong>Phone:</strong> 07902 863999</p>
                                <p><strong>Email:</strong> info@pathwayestateplanning.co.uk</p>
                            </section>
                        </div>

                        <div className={styles.formWrapper}>
                            <h2>Enquiries Form</h2>
                            <p>If you’d like to speak with one of our advisers, please contact us using the form below and we’ll respond promptly.</p>

                            <form className={styles.form}>
                                <div className={styles.field}>
                                    <label>Name</label>
                                    <input type="text" placeholder="Your full name" />
                                </div>
                                <div className={styles.field}>
                                    <label>Phone</label>
                                    <input type="tel" placeholder="Best number to reach you" />
                                </div>
                                <div className={styles.field}>
                                    <label>Email</label>
                                    <input type="email" placeholder="Your email address" />
                                </div>
                                <div className={styles.field}>
                                    <label>Company (optional)</label>
                                    <input type="text" placeholder="Company name" />
                                </div>
                                <div className={styles.field}>
                                    <label>Message</label>
                                    <textarea rows={5} placeholder="How can we help?"></textarea>
                                </div>
                                <Button variant="default" className={styles.submitBtn}>Send your enquiry</Button>
                            </form>
                        </div>
                    </div>

                    <div className={styles.note}>
                        <h3>A quick note</h3>
                        <p>Estate planning can feel like a big step — but we’ll make it feel manageable.</p>
                        <p>We’ll listen carefully, explain things clearly, and help you move forward with confidence.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
