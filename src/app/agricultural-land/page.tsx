import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function AgriculturalLandPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Agricultural Land</h1>
                        <p className={styles.subtitle}>Specialist planning for farms, land and rural estates</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            Agricultural and rural estates often require specialist estate planning.
                        </p>
                        <p>
                            Land, property, and long-standing family assets can involve unique considerations — and it’s important that planning is handled carefully and correctly.
                        </p>
                        <p>
                            At Pathway Estate Planning, we offer guidance and support to help you protect what matters most and plan confidently for the future.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>How we can help</h2>
                        <p>We can support you with planning that considers:</p>
                        <ul className={styles.list}>
                            <li>family and generational wishes</li>
                            <li>ownership structures</li>
                            <li>protection of land and property</li>
                            <li>inheritance planning</li>
                            <li>aligned Wills, Trusts and tax considerations</li>
                        </ul>
                        <p>Where needed, we can also work alongside trusted professionals to ensure your estate plan is complete and handled properly.</p>
                    </section>

                    <section className={styles.cta}>
                        <h2>Talk to us</h2>
                        <p>If you’d like to discuss agricultural land planning, we’re here to help.</p>
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
