import styles from './ServiceTimeline.module.css';

export interface TimelineStep {
    title: string;
    description: string;
    duration?: string;
}

export interface ServiceTimelineProps {
    steps: TimelineStep[];
    heading?: string;
    summary?: string;
}

export default function ServiceTimeline({
    steps,
    heading = "How it works",
    summary
}: ServiceTimelineProps) {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.heading}>{heading}</h2>
                {summary && <p className={styles.summary}>{summary}</p>}
                <div className={styles.timeline}>
                    {steps.map((step, index) => (
                        <div key={index} className={styles.step}>
                            <div className={styles.stepNumber}>{index + 1}</div>
                            <div className={styles.stepContent}>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDescription}>{step.description}</p>
                                {step.duration && <span className={styles.duration}>{step.duration}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
