import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function LPAPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Lasting Powers of Attorney</h1>
                        <p className={styles.subtitle}>Peace of mind for life’s “what if” moments</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            A Lasting Power of Attorney (LPA) is one of the most important documents you can put in place — not because you expect something to go wrong, but because life can be unpredictable.
                        </p>
                        <p>
                            An LPA allows you to choose someone you trust to make decisions on your behalf if you are unable to.
                        </p>
                        <p>
                            It’s a simple step that can make things far easier for your family in the future.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>There are two types of LPA</h2>

                        <h3>Property & Financial Affairs</h3>
                        <p>This allows your chosen person to help manage things like:</p>
                        <ul className={styles.list}>
                            <li>banking and bills</li>
                            <li>pensions and investments</li>
                            <li>property matters</li>
                            <li>everyday finances</li>
                        </ul>

                        <h3>Health & Welfare</h3>
                        <p>This can cover decisions such as:</p>
                        <ul className={styles.list}>
                            <li>care arrangements</li>
                            <li>medical decisions</li>
                            <li>day-to-day welfare</li>
                            <li>life-sustaining treatment preferences (where applicable)</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Why LPAs matter</h2>
                        <p>Without an LPA, your family may face delays and legal barriers when trying to help you — even in urgent situations.</p>
                        <p>LPAs help ensure:</p>
                        <ul className={styles.list}>
                            <li>the right people can act quickly</li>
                            <li>your wishes remain central</li>
                            <li>your loved ones feel supported rather than stuck</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>How we help</h2>
                        <p>We’ll guide you through the process clearly and carefully, and help ensure everything is completed correctly.</p>
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
