import Link from 'next/link';
import Button from './base/Button';
import styles from './HowItWorks.module.css';

export default function HowItWorks() {
    const steps = [
        {
            num: "1",
            title: "A relaxed conversation",
            desc: "We start by listening. You can tell us about your family, your wishes, and what matters most. We'll answer your questions and explain your options clearly."
        },
        {
            num: "2",
            title: "Your personalised estate plan",
            desc: "We'll recommend the right documents for your situation — whether that's a Will, Trusts, LPAs, or inheritance tax planning."
        },
        {
            num: "3",
            title: "We handle the details",
            desc: "We prepare everything carefully and professionally, and guide you through signing and completing your plan with confidence."
        }
    ];

    return (
        <section id="how-it-works" className={`section ${styles.howItWorks}`}>
            <div className="container">
                <div className="text-center mb-lg">
                    <h2 className={styles.heading}>A simple process, at your pace</h2>
                    <p className={styles.intro}>
                        You don't need to know exactly what you need before you speak to us. We'll guide you step by step.
                    </p>
                </div>

                <div className={styles.steps}>
                    {steps.map((step, index) => (
                        <div key={index} className={styles.step}>
                            <div className={styles.stepNum}>{step.num}</div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className={`text-center ${styles.actions}`}>
                    <Button href="/contact" variant="primary" size="lg">
                        Book an initial chat
                    </Button>
                    <Button href="/how-it-works" variant="outline" size="lg">
                        See the full process
                    </Button>
                </div>
            </div>
        </section>
    );
}
