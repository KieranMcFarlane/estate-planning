import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function AssetProtectionPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Asset Protection & Gifting</h1>
                        <p className={styles.subtitle}>A thoughtful way to protect your estate and your family’s future</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            Asset protection planning is about ensuring your estate goes where you want it to — and helping reduce the chance of it being lost through avoidable risks, delays, or poor planning.
                        </p>
                        <p>
                            Gifting can also play a role in estate planning, but it needs to be handled carefully and with the right advice.
                        </p>
                        <p>
                            We’ll guide you through your options clearly and responsibly.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>When asset protection planning can help</h2>
                        <p>You may want to explore asset protection if you’re thinking about:</p>
                        <ul className={styles.list}>
                            <li>protecting the family home</li>
                            <li>planning for later life and care costs</li>
                            <li>passing wealth down safely</li>
                            <li>supporting children or grandchildren</li>
                            <li>preventing disputes or complications later</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Gifting — done with care</h2>
                        <p>Gifting can be a helpful part of estate planning, but it’s important to understand the rules and long-term impact.</p>
                        <p>We’ll help you consider:</p>
                        <ul className={styles.list}>
                            <li>whether gifting is right for you</li>
                            <li>timing and practical implications</li>
                            <li>how to protect your own financial security</li>
                            <li>how gifts may affect inheritance tax planning</li>
                        </ul>
                    </section>

                    <section className={styles.cta}>
                        <h2>Talk to us</h2>
                        <p>If you want to explore ways to protect your estate and plan confidently, we’re here to help.</p>
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
