import styles from './JourneyProgress.module.css';

export interface JourneyProgressProps {
    currentStep?: number;
    className?: string;
}

export default function JourneyProgress({ currentStep = 1, className = '' }: JourneyProgressProps) {
    const steps = [
        { number: 1, title: "Free Consultation", description: "No obligation chat" },
        { number: 2, title: "Personal Plan", description: "Tailored to your needs" },
        { number: 3, title: "Documents Ready", description: "We prepare everything" },
        { number: 4, title: "Complete", description: "Your family is protected" }
    ];

    return (
        <section className={`${styles.journeyProgress} ${className}`}>
            <div className="container">
                <div className={styles.stepsContainer}>
                    {steps.map((step, index) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const isUpcoming = step.number > currentStep;

                        return (
                            <div key={step.number} className={styles.stepItem}>
                                <div className={styles.stepHeader}>
                                    <div
                                        className={`${styles.stepCircle} ${
                                            isCompleted ? styles.completed : ''
                                        } ${isCurrent ? styles.current : ''} ${
                                            isUpcoming ? styles.upcoming : ''
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        ) : (
                                            <span>{step.number}</span>
                                        )}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`${styles.stepLine} ${
                                                isCompleted ? styles.lineCompleted : ''
                                            }`}
                                        />
                                    )}
                                </div>
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>{step.title}</h3>
                                    <p className={styles.stepDescription}>{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
