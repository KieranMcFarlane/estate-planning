import styles from './WhoThisIsFor.module.css';

export interface Scenario {
    title: string;
    description: string;
}

export interface WhoThisIsForProps {
    scenarios: Scenario[];
    heading?: string;
}

export default function WhoThisIsFor({
    scenarios,
    heading = "Who this is for"
}: WhoThisIsForProps) {
    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>{heading}</h2>
            <div className={styles.grid}>
                {scenarios.map((scenario, index) => (
                    <div key={index} className={styles.card}>
                        <span className={styles.number}>{index + 1}</span>
                        <h3 className={styles.title}>{scenario.title}</h3>
                        <p className={styles.description}>{scenario.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
