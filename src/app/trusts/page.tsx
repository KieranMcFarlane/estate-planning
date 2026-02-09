import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function TrustsPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Trusts</h1>
                        <p className={styles.subtitle}>Extra protection and control — when you need it</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            Trusts can be a powerful part of estate planning, but they’re often misunderstood.
                        </p>
                        <p>
                            A Trust can help protect assets for your loved ones, add structure to how inheritance is passed on, and provide additional reassurance when family situations are more complex.
                        </p>
                        <p>
                            At <strong>Pathway Estate Planning</strong>, we’ll explain everything clearly, without jargon — and help you decide whether a Trust is right for you.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Why people choose Trust planning</h2>
                        <p>Trusts may be useful if you want to:</p>
                        <ul className={styles.list}>
                            <li>protect inheritance for children or grandchildren</li>
                            <li>support vulnerable beneficiaries</li>
                            <li>reduce risk of family disputes</li>
                            <li>add structure to how assets are managed</li>
                            <li>plan ahead for future uncertainty</li>
                            <li>explore inheritance tax planning options (where appropriate)</li>
                        </ul>
                        <p>
                            Trust planning isn’t for everyone — and we’ll always be honest about what is (and isn’t) suitable for your situation.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>A simple explanation</h2>
                        <p>Many people find Trusts confusing. That’s normal.</p>
                        <p>We’ll talk you through:</p>
                        <ul className={styles.list}>
                            <li>what a Trust is</li>
                            <li>why you might need one</li>
                            <li>how it works in real life</li>
                            <li>the responsibilities involved</li>
                            <li>what the next step would look like</li>
                        </ul>
                    </section>

                    <section className={styles.cta}>
                        <h2>Talk to us</h2>
                        <p>If you’ve heard the word “Trust” and weren’t sure whether it applied to you — we can help you understand it clearly.</p>
                        <div className={styles.btnWrapper}>
                            <Button asChild variant="default">
                                <Link href="/contact">Book a free call</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
