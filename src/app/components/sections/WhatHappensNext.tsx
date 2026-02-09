import styles from './WhatHappensNext.module.css';
import Button from '../base/Button';

export interface NextStep {
    title: string;
    description: string;
    cta?: {
        text: string;
        link: string;
    };
}

export interface WhatHappensNextProps {
    steps: NextStep[];
    heading?: string;
    finalCTA?: {
        text: string;
        link: string;
    };
}

export default function WhatHappensNext({
    steps,
    heading = "What happens next",
    finalCTA
}: WhatHappensNextProps) {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.heading}>{heading}</h2>
                <div className={styles.timeline}>
                    {steps.map((step, index) => (
                        <div key={index} className={styles.step}>
                            <div className={styles.stepConnector}>
                                <div className={styles.stepDot}></div>
                                {index < steps.length - 1 && <div className={styles.stepLine}></div>}
                            </div>
                            <div className={styles.stepContent}>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDescription}>{step.description}</p>
                                {step.cta && (
                                    <a href={step.cta.link} className={styles.stepCta}>
                                        {step.cta.text} →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {finalCTA && (
                    <div className={styles.finalCta}>
                        <p className={styles.finalCtaText}>{finalCTA.text}</p>
                        <Button href={finalCTA.link} variant="primary" size="lg">
                            Get Started Today
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
