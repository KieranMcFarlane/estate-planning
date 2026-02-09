import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function EstatePlanningPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Estate Planning</h1>
                        <p className={styles.subtitle}>Protect your wishes. Support your loved ones. Feel prepared.</p>
                    </header>

                    <section className={styles.section}>
                        <p>
                            Many people delay estate planning because it feels daunting — or because they’re not sure where to start.
                            But putting the right plan in place can make a world of difference, for you and for the people you care about.
                        </p>
                        <p>
                            Estate planning is about more than writing a Will. It’s about making sure:
                        </p>
                        <ul className={styles.list}>
                            <li>your wishes are respected</li>
                            <li>your loved ones are supported</li>
                            <li>your estate is handled properly</li>
                            <li>things are easier during a difficult time</li>
                        </ul>
                        <p>
                            At <strong>Pathway Estate Planning</strong>, we offer clear, step-by-step guidance to help you feel confident that everything is in order.
                        </p>
                    </section>

                    <section className={styles.sectionAlt}>
                        <h2>Why it matters</h2>
                        <p>
                            Your Will is one of the most important documents you’ll ever create — but it’s often easier than people expect.
                        </p>
                        <p>
                            Some people assume estate planning is expensive or complicated. Others believe their estate will automatically pass to their spouse or family. In reality, every situation is different, and small misunderstandings can lead to serious consequences later on.
                        </p>
                        <p>
                            Without a valid Will, your estate may be distributed under the <strong>Rules of Intestacy</strong>, which may not reflect your wishes.
                        </p>
                        <p>A clear plan helps avoid:</p>
                        <ul className={styles.list}>
                            <li>delays and confusion</li>
                            <li>unnecessary stress for loved ones</li>
                            <li>family disputes</li>
                            <li>assets passing to the wrong people</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>What are the benefits of estate planning?</h2>
                        <p>
                            Estate planning gives you control — both during your lifetime and after you’re gone. We’ll take time to understand your personal circumstances, your family situation, and your priorities. Then we’ll recommend a plan that fits you.
                        </p>
                        <p>Estate planning can help you:</p>
                        <ul className={styles.list}>
                            <li>protect loved ones and beneficiaries</li>
                            <li>support children or vulnerable family members</li>
                            <li>reduce the risk of conflict</li>
                            <li>plan for the unexpected</li>
                            <li>explore ways to reduce unnecessary inheritance tax where appropriate</li>
                        </ul>
                        <p>
                            Estate planning isn’t only for wealthy families — it’s for anyone who wants clarity and peace of mind.
                        </p>
                    </section>

                    <section className={styles.servicesGrid}>
                        <h2 className={styles.gridTitle}>Our Estate Planning Services</h2>

                        <div className={styles.card}>
                            <h3>Wills</h3>
                            <p>A properly prepared Will helps ensure your estate goes exactly where you want it to. It can also appoint guardians for children and name the right people to manage your estate. We’ll guide you through the process clearly and carefully.</p>
                        </div>

                        <div className={styles.card}>
                            <h3>Trusts</h3>
                            <p>Trusts can help protect assets, control how inheritance is passed on, and support loved ones who may need additional care or structure.</p>
                        </div>

                        <div className={styles.card}>
                            <h3>Lasting Powers of Attorney (LPAs)</h3>
                            <p>LPAs allow you to appoint someone you trust to make decisions for you if you ever cannot. This includes Property & Financial Affairs and Health & Welfare.</p>
                        </div>

                        <div className={styles.card}>
                            <h3>Inheritance Tax Planning</h3>
                            <p>We can help you understand your potential exposure and explore appropriate ways to reduce unnecessary tax where possible.</p>
                        </div>

                        <div className={styles.card}>
                            <h3>Asset Protection & Gifting</h3>
                            <p>Careful planning can protect assets from avoidable risks and help ensure your estate goes to the people you intend.</p>
                        </div>

                        <div className={styles.card}>
                            <h3>Business Protection</h3>
                            <p>We can help you plan for continuity, protect business interests, and reduce disruption.</p>
                        </div>

                        <div className={styles.card}>
                            <h3>Agricultural Land</h3>
                            <p>We can guide you through key considerations and work with trusted professionals if additional support is required.</p>
                        </div>
                    </section>

                    <section className={styles.talkToUs}>
                        <h2>Talk to us</h2>
                        <p>If you’re not sure what you need, that’s okay. Many people feel that way at first.</p>
                        <p>We’ll listen, explain your options clearly, and help you move forward with confidence.</p>
                        <div className={styles.centeredBtn}>
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
