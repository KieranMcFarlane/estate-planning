import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function ExtendedServicesPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Extended Services</h1>
                        <p className={styles.subtitle}>Practical support beyond estate planning</p>
                    </header>

                    <section className={styles.intro}>
                        <p>
                            Estate planning can involve more than legal documents — especially when property, finances, or probate come into the picture.
                        </p>
                        <p>
                            That’s why we work alongside trusted, regulated professionals so our clients can access the extra support they may need, all in one place.
                        </p>
                    </section>

                    <div className={styles.servicesList}>
                        <div className={styles.serviceItem}>
                            <h2>Probate</h2>
                            <p>Managing the estate of someone who has passed away can feel complicated and emotionally draining.</p>
                            <p>Our trusted probate partners can help with the legal and administrative process, including:</p>
                            <ul>
                                <li>obtaining the Grant of Probate</li>
                                <li>collecting and valuing assets</li>
                                <li>dealing with paperwork and deadlines</li>
                                <li>distributing the estate correctly</li>
                            </ul>
                            <p>Everything is handled with care and sensitivity, so you can focus on what matters most.</p>
                        </div>

                        <div className={styles.serviceItem}>
                            <h2>Financial Advice</h2>
                            <p>Sound financial planning can strengthen estate planning. We work with regulated financial advisers who can support with:</p>
                            <ul>
                                <li>pensions and retirement planning</li>
                                <li>investment strategies</li>
                                <li>tax-efficient planning</li>
                                <li>long-term wealth management</li>
                            </ul>
                        </div>

                        <div className={styles.serviceItem}>
                            <h2>Conveyancing</h2>
                            <p>Property is often one of the most valuable parts of an estate. Our conveyancing partners can help with:</p>
                            <ul>
                                <li>property sales</li>
                                <li>transfers of ownership</li>
                                <li>gifting property</li>
                                <li>legal requirements and documentation</li>
                            </ul>
                        </div>

                        <div className={styles.serviceItem}>
                            <h2>Equity Release</h2>
                            <p>Equity release can provide financial flexibility in later life — but it’s important to understand the long-term implications. We can introduce you to qualified specialists who will guide you through:</p>
                            <ul>
                                <li>whether equity release is suitable</li>
                                <li>the benefits and risks</li>
                                <li>how it may affect inheritance</li>
                                <li>alternative options</li>
                            </ul>
                        </div>

                        <div className={styles.serviceItem}>
                            <h2>Mortgages</h2>
                            <p>Whether you’re buying, remortgaging, investing, or supporting a family member, our trusted mortgage advisers can help you explore suitable mortgage options and provide tailored advice.</p>
                        </div>
                    </div>

                    <section className={styles.cta}>
                        <h2>Need support?</h2>
                        <p>If you’re unsure which service is right for you, simply get in touch — we’ll guide you.</p>
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
