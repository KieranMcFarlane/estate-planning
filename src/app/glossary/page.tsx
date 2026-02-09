import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default function GlossaryPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Glossary of Terms</h1>
                        <p className={styles.subtitle}>Understand estate planning terms with confidence</p>
                    </header>

                    <section className={styles.intro}>
                        <p>
                            Estate planning can involve language that feels unfamiliar — but understanding the basics makes the whole process easier.
                        </p>
                        <p>Our glossary explains common terms related to Wills, Trusts, Lasting Powers of Attorney, Probate, and Inheritance Tax Planning.</p>
                        <p>If you ever want to ask us what something means, please feel free — we’re happy to explain everything clearly.</p>
                    </section>

                    {/* 
            Ideally lists terms here, but the copy just mentions 'Download our Glossary PDF'.
            I will add the CTA for the PDF.
          */}

                    <div className={styles.download}>
                        <div className={styles.downloadCard}>
                            <h2>Download our full Glossary</h2>
                            <p>Get a handy PDF guide to keep.</p>
                            <Button asChild variant="secondary">
                                <Link href="/glossary.pdf">Download PDF</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
