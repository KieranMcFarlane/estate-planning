import styles from './ServicePricing.module.css';

export interface PricingTier {
    name: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
    ctaLink: string;
}

export interface ServicePricingProps {
    tiers: PricingTier[];
    heading?: string;
    subheading?: string;
    note?: string;
}

export default function ServicePricing({
    tiers,
    heading = "Simple, transparent pricing",
    subheading = "No hidden fees. No surprises. Just fair, clear pricing.",
    note
}: ServicePricingProps) {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.heading}>{heading}</h2>
                <p className={styles.subheading}>{subheading}</p>
                <div className={styles.grid}>
                    {tiers.map((tier, index) => (
                        <div key={index} className={`${styles.card} ${tier.popular ? styles.popular : ''}`}>
                            {tier.popular && <span className={styles.badge}>Most Popular</span>}
                            <h3 className={styles.name}>{tier.name}</h3>
                            <div className={styles.price}>{tier.price}</div>
                            <p className={styles.description}>{tier.description}</p>
                            <ul className={styles.features}>
                                {tier.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className={styles.feature}>
                                        <span className={styles.check}>✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <a href={tier.ctaLink} className={styles.cta}>
                                Get Started
                            </a>
                        </div>
                    ))}
                </div>
                {note && <p className={styles.note}>{note}</p>}
            </div>
        </section>
    );
}
