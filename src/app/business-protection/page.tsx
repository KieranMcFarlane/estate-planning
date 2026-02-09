import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function BusinessProtectionPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Business Protection</h1>
                        <p className={styles.subtitle}>Protect your business — and the people who rely on it</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            If you own a business, estate planning becomes even more important.
                        </p>
                        <p>
                            Without clear planning, business assets can become tied up in delays, uncertainty, or disputes — which can affect your family, business partners, and employees.
                        </p>
                        <p>
                            We can help you create a plan that protects your business interests and supports the people involved.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>How business protection can help</h2>
                        <p>Business estate planning may include:</p>
                        <ul className={styles.list}>
                            <li>ensuring the right people take control</li>
                            <li>protecting business assets for family or partners</li>
                            <li>reducing disruption and uncertainty</li>
                            <li>supporting continuity planning</li>
                            <li>aligning business planning with your Will and overall estate plan</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Clear advice, without complexity</h2>
                        <p>Business planning doesn’t need to feel overwhelming. We’ll guide you step by step and explain your options clearly.</p>
                    </section>

                    <section className={styles.cta}>
                        <h2>Ready to get started?</h2>
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
