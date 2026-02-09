import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function WillsPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Wills</h1>
                        <p className={styles.subtitle}>A simple way to protect the people you love</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            Writing a Will is one of the most important things you can do — and it’s often much easier than people expect.
                        </p>
                        <p>
                            A clear, professionally prepared Will helps make sure your wishes are followed, the right people are looked after, and your estate is handled properly when the time comes.
                        </p>
                        <p>
                            At <strong>Pathway Estate Planning</strong>, we guide you through the process calmly and step by step, with clear advice in plain English.
                        </p>
                    </section>

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

                    <section className={styles.section}>
                        <h2>We can help you with</h2>
                        <ul className={styles.list}>
                            <li>Writing a new Will</li>
                            <li>Updating an existing Will</li>
                            <li>Mirror Wills for couples</li>
                            <li>Advice for blended families / second marriages</li>
                            <li>Protecting children and loved ones</li>
                            <li>Ensuring your Will is signed and witnessed correctly</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>A calm, supportive process</h2>
                        <p>Many people worry it will feel uncomfortable to talk about. We understand.</p>
                        <p>Our job is to make it feel simple, respectful, and manageable — so you feel confident your Will is done properly.</p>
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
