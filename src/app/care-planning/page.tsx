import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function CarePlanningPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Care Planning</h1>
                        <p className={styles.subtitle}>Support when you need it most</p>
                    </header>

                    <section className={styles.content}>
                        <div className={styles.introBox}>
                            <p>
                                Planning for later life isn’t always easy to think about — but having a plan in place can bring real peace of mind.
                            </p>
                            <p>
                                Care planning helps you understand the practical, financial and legal aspects of long-term care, so that:
                            </p>
                            <ul className={styles.list}>
                                <li>your wishes are respected</li>
                                <li>important decisions are made by the right people</li>
                                <li>your finances are structured as safely as possible</li>
                                <li>your family feels supported, not overwhelmed</li>
                            </ul>
                            <p>
                                Whether you’re planning for yourself or helping a loved one, we’ll guide you through the process with care, patience and clarity.
                            </p>
                        </div>

                        <h2 className={styles.sectionTitle}>Why care planning matters</h2>
                        <p>
                            The cost of long-term care can be significant, and without planning, it can affect savings and assets more quickly than people expect.
                        </p>
                        <p>
                            <strong>Care planning is not about fear — it’s about preparation.</strong>
                        </p>
                        <p>
                            Our goal is to help you feel informed and supported, so you can make calm decisions before anything becomes urgent.
                        </p>

                        <div className={styles.focusArea}>
                            <h3>We can help you understand:</h3>
                            <ul>
                                <li>funding options and financial planning considerations</li>
                                <li>how Powers of Attorney may support future decision-making</li>
                                <li>how to protect assets where appropriate</li>
                                <li>how to ensure care choices match your wishes</li>
                            </ul>
                        </div>

                        <p>
                            We work with trusted financial professionals where needed, and we’ll always explain things clearly in plain English.
                        </p>
                    </section>

                    <section className={styles.cta}>
                        <h2>Talk to us</h2>
                        <p>Preparing for later life doesn’t have to be overwhelming.</p>
                        <p>Talk to our friendly team today — we’re here to listen, support and guide you.</p>
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
