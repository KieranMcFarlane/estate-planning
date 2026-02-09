import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function HelpfulInfoPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Helpful Information</h1>
                        <p className={styles.subtitle}>Your estate planning checklist: have you covered everything?</p>
                    </header>

                    <section className={styles.intro}>
                        <p>
                            Estate planning isn’t just one document — it’s a set of important pieces that work together.
                            That’s why we’ve created this checklist, to help you understand whether anything may be missing.
                        </p>
                        <p>If you’re unsure about any part of your planning, our team is here to help.</p>
                    </section>

                    <div className={styles.checklist}>
                        <div className={styles.section}>
                            <h2>Will</h2>
                            <ul>
                                <li>Is your Will up to date and reflective of your wishes?</li>
                                <li>Have you included guardians for minor children where needed?</li>
                                <li>Has it been signed and witnessed correctly by two independent witnesses?</li>
                                <li>Have you reviewed it after any major life changes?</li>
                            </ul>
                        </div>

                        <div className={styles.section}>
                            <h2>Trusts</h2>
                            <ul>
                                <li>Have you explored whether Trust planning might be right for you?</li>
                                <li>If you already have a Trust, is it set up correctly and still appropriate?</li>
                                <li>Are your Trustees still able to act, and are they still the right choice?</li>
                            </ul>
                        </div>

                        <div className={styles.section}>
                            <h2>Lasting Powers of Attorney (LPAs)</h2>
                            <ul>
                                <li>Do you have the right LPAs in place for financial and health decisions?</li>
                                <li>Have they been registered with the Office of the Public Guardian?</li>
                                <li>Are your Attorneys still suitable and available?</li>
                            </ul>
                        </div>

                        <div className={styles.section}>
                            <h2>Inheritance Tax (IHT) Planning</h2>
                            <ul>
                                <li>Do you understand whether inheritance tax may apply to your estate?</li>
                                <li>Have you explored allowances and reliefs that may be available?</li>
                                <li>Have you received advice on appropriate planning options?</li>
                            </ul>
                        </div>

                        <div className={styles.section}>
                            <h2>Financial Planning</h2>
                            <ul>
                                <li>Are your pensions and investments reviewed and aligned with your plans?</li>
                                <li>Do you understand your current financial position clearly?</li>
                                <li>Have you considered long-term planning for yourself and your family?</li>
                            </ul>
                        </div>
                    </div>

                    <section className={styles.result}>
                        <h2>How did you do?</h2>
                        <p>
                            If you answered a mixture of <em>yes and no</em> — or mostly <em>no</em> — there may be gaps in your estate planning that could create stress later on.
                        </p>
                        <p>This can lead to delays, confusion, avoidable tax exposure, and unintended outcomes.</p>
                        <p><strong>The good news is: it’s fixable — and we can guide you through it step by step.</strong></p>
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
