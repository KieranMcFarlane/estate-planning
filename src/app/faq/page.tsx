import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function FAQPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Frequently Asked Questions</h1>
                        <p className={styles.subtitle}>Wills, Trusts, Probate & Lasting Powers of Attorney</p>
                    </header>

                    <div className={styles.faqList}>
                        <details className={styles.faqItem}>
                            <summary className={styles.question}>Do I need a Will — and what happens if someone dies without one?</summary>
                            <div className={styles.answer}>
                                <p>A Will is a legal document that sets out what should happen to your assets after you pass away. A properly prepared Will helps ensure:</p>
                                <ul>
                                    <li>your wishes are followed</li>
                                    <li>your beneficiaries are protected</li>
                                    <li>dependants and children can be cared for</li>
                                    <li>confusion and disputes are less likely</li>
                                </ul>
                                <p>If someone dies without a Will, their estate is distributed according to the UK <strong>Rules of Intestacy</strong>, which may not reflect what they would have wanted.</p>
                            </div>
                        </details>

                        <details className={styles.faqItem}>
                            <summary className={styles.question}>Can I change my Will once it has been written?</summary>
                            <div className={styles.answer}>
                                <p>Yes — you can change your Will whenever you need to.</p>
                                <p>We recommend reviewing it regularly, and especially after major life changes such as marriage, divorce, having children, moving house, or the death of someone named in your Will.</p>
                                <p>Some life events (such as marriage) can affect whether your Will remains valid, so it’s always worth getting advice if you’re unsure.</p>
                            </div>
                        </details>

                        <details className={styles.faqItem}>
                            <summary className={styles.question}>What is Probate — and can I avoid it?</summary>
                            <div className={styles.answer}>
                                <p>Probate is the legal process of managing someone’s estate after they pass away. Whether probate is required depends on the size and type of assets involved.</p>
                                <p>In many cases, probate can’t be avoided — but having clear planning in place can make it much simpler for your family.</p>
                            </div>
                        </details>

                        <details className={styles.faqItem}>
                            <summary className={styles.question}>What is a Lasting Power of Attorney (LPA) — and do I need one?</summary>
                            <div className={styles.answer}>
                                <p>A Lasting Power of Attorney lets you appoint someone you trust to make decisions on your behalf if you are unable to.</p>
                                <p>There are two types: <strong>Property & Financial Affairs</strong> and <strong>Health & Welfare</strong>.</p>
                                <p>Having an LPA in place can prevent delays and stress for loved ones at a difficult time. It also ensures the right people can step in quickly if needed.</p>
                            </div>
                        </details>

                        <details className={styles.faqItem}>
                            <summary className={styles.question}>What is a Trust — and do I need one?</summary>
                            <div className={styles.answer}>
                                <p>A Trust is a legal arrangement used to protect or manage assets for someone else.</p>
                                <p>Trusts can help with protecting inheritance, controlling how assets are passed on, and supporting vulnerable beneficiaries.</p>
                                <p>Not everyone needs a Trust — but we can guide you clearly and explain if one may be helpful in your situation.</p>
                            </div>
                        </details>

                        <details className={styles.faqItem}>
                            <summary className={styles.question}>What is Inheritance Tax (IHT) — and can I reduce it?</summary>
                            <div className={styles.answer}>
                                <p>Inheritance Tax may be payable depending on the value of an estate. In the UK, it is commonly linked to the <strong>Nil Rate Band</strong> (£325,000).</p>
                                <p>We can help you understand your position and explore appropriate ways to reduce unnecessary inheritance tax where possible.</p>
                            </div>
                        </details>

                        <details className={styles.faqItem}>
                            <summary className={styles.question}>Why choose Pathway Estate Planning?</summary>
                            <div className={styles.answer}>
                                <p>We’ve specialised in estate planning for nearly two decades, and we’re committed to providing advice that is clear, straightforward, and genuinely supportive.</p>
                            </div>
                        </details>
                    </div>

                    <section className={styles.cta}>
                        <h2>Still have questions?</h2>
                        <p>If you’d like to talk through your situation, please contact us — we’ll be happy to help.</p>
                        <div className={styles.btnWrapper}>
                            <Button asChild variant="default">
                                <Link href="/contact">Contact us</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
