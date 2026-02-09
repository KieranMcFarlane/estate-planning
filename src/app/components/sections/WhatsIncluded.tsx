import styles from './WhatsIncluded.module.css';

export interface IncludedItem {
    text: string;
    included: boolean;
}

export interface WhatsIncludedProps {
    items: IncludedItem[];
    heading?: string;
    subheading?: string;
}

export default function WhatsIncluded({
    items,
    heading = "What's included",
    subheading
}: WhatsIncludedProps) {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.heading}>{heading}</h2>
                {subheading && <p className={styles.subheading}>{subheading}</p>}
                <div className={styles.list}>
                    {items.map((item, index) => (
                        <div key={index} className={`${styles.item} ${item.included ? styles.included : styles.notIncluded}`}>
                            <span className={styles.icon}>{item.included ? '✓' : '✗'}</span>
                            <span className={styles.text}>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
