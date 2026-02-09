import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function IHTPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Inheritance Tax Planning</h1>
                        <p className={styles.subtitle}>Protect more of what you’ve built — for the people you love</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            Inheritance Tax can feel confusing, frustrating, or even unfair — and many families don’t realise how much it can affect an estate until it’s too late.
                        </p>
                        <p>
                            With calm planning and the right guidance, it may be possible to reduce unnecessary inheritance tax and ensure more of your estate passes to the people and causes that matter to you.
                        </p>
                        <p>
                            We’ll explain your options clearly, without pressure or overwhelm.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>What is inheritance tax?</h2>
                        <p>Inheritance Tax may apply depending on the value of an estate.</p>
                        <p>
                            In many cases, UK inheritance tax relates to the <strong>Nil Rate Band</strong> (currently <strong>£325,000</strong>) and can be charged at <strong>40%</strong> above that threshold (depending on exemptions and reliefs).
                        </p>
                        <p>
                            There may also be allowances available depending on your circumstances, such as gifts to spouses, charitable giving, or specific property-related reliefs.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>How we support you</h2>
                        <p>Inheritance tax planning isn’t about “tricks” or risky schemes — it’s about putting sensible, lawful strategies in place early enough to make a difference.</p>
                        <p>We can help you understand:</p>
                        <ul className={styles.list}>
                            <li>whether inheritance tax may apply to your estate</li>
                            <li>what allowances may be available</li>
                            <li>what planning options may be appropriate</li>
                            <li>how to structure your wishes clearly and safely</li>
                        </ul>
                    </section>

                    <section className={styles.cta}>
                        <h2>Talk to us</h2>
                        <p>If you’d like clarity on your inheritance tax position — we’re here to help.</p>
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
