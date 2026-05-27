import Link from 'next/link';
import styles from './ComparisonCards.module.css';

export interface ComparisonOption {
    title: string;
    description: string;
    features: string[];
    bestFor?: string;
}

export interface Comparison {
    title: string;
    description: string;
    options: ComparisonOption[];
}

interface ComparisonCardsProps {
    comparisons: Comparison[];
    heading?: string;
}

const defaultComparisons: Comparison[] = [
    {
        title: "Will vs Trust",
        description: "Understanding the difference can help you decide what's right for your situation.",
        options: [
            {
                title: "Will",
                description: "A Will takes effect when you die and specifies how your assets should be distributed.",
                features: [
                    "Takes effect only after death",
                    "Goes through probate",
                    "Public document once probated",
                    "Can be challenged more easily",
                    "Essential for everyone"
                ],
                bestFor: "Everyone needs a Will"
            },
            {
                title: "Trust",
                description: "A Trust protects your assets during your lifetime and beyond, offering greater control and protection.",
                features: [
                    "Active during your lifetime",
                    "Avoids probate for trust assets",
                    "Remains private",
                    "Harder to challenge",
                    "Protects against care fees"
                ],
                bestFor: "Homeowners, families with inheritance tax concerns, blended families"
            }
        ]
    },
    {
        title: "Property & Financial LPA vs Health & Welfare LPA",
        description: "There are two types of Lasting Power of Attorney — you may need both.",
        options: [
            {
                title: "Property & Financial LPA",
                description: "Allows your attorneys to manage your money, property, and financial affairs.",
                features: [
                    "Pays bills and manages bank accounts",
                    "Sells or buys property",
                    "Collects benefits or pensions",
                    "Can be used while you still have capacity",
                    "Essential for business owners"
                ],
                bestFor: "Everyone, especially those with savings, property, or businesses"
            },
            {
                title: "Health & Welfare LPA",
                description: "Allows your attorneys to make decisions about your health and personal welfare.",
                features: [
                    "Decides on medical treatment",
                    "Choose care homes or care at home",
                    "Makes daily routine decisions",
                    "Only used if you lose mental capacity",
                    "Includes life-sustaining treatment decisions"
                ],
                bestFor: "Everyone, especially those with specific medical wishes"
            }
        ]
    },
    {
        title: "DIY Will vs Professional Will",
        description: "DIY Wills can work for simple situations, but many people underestimate their complexity.",
        options: [
            {
                title: "DIY Will",
                description: "Templates you complete yourself, often available online or from stationers.",
                features: [
                    "Low upfront cost",
                    "No expert advice",
                    "High risk of errors",
                    "Not suitable for complex families",
                    "May not reflect latest law"
                ],
                bestFor: "Single people with no assets, no children, and very simple situations"
            },
            {
                title: "Professional Will",
                description: "Drafted by a qualified estate planner who understands your specific situation.",
                features: [
                    "Tailored to your exact circumstances",
                    "Expert tax planning advice",
                    "Proper execution witnessed",
                    "Regular updates available",
                    "Peace of mind it's legally sound"
                ],
                bestFor: "Homeowners, parents, anyone with assets, blended families, business owners"
            }
        ]
    }
];

export default function ComparisonCards({
    comparisons = defaultComparisons,
    heading = "Understanding your options"
}: ComparisonCardsProps) {
    return (
        <section className={`section ${styles.comparisonSection}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{heading}</h2>
                    <p className={styles.description}>
                        Estate planning involves important choices. Here are clear comparisons to help you understand what&apos;s right for you.
                    </p>
                </div>

                {comparisons.map((comparison, compIndex) => (
                    <div key={compIndex} className={styles.comparison}>
                        <h3 className={styles.comparisonTitle}>{comparison.title}</h3>
                        <p className={styles.comparisonDesc}>{comparison.description}</p>
                        <div className={styles.optionsGrid}>
                            {comparison.options.map((option, optIndex) => (
                                <div key={optIndex} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <h4 className={styles.cardTitle}>{option.title}</h4>
                                        <p className={styles.cardDesc}>{option.description}</p>
                                    </div>
                                    <ul className={styles.features}>
                                        {option.features.map((feature, featIndex) => (
                                            <li key={featIndex} className={styles.feature}>
                                                <span className={styles.bullet}>✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {option.bestFor && (
                                        <div className={styles.bestFor}>
                                            <strong>Best for:</strong> {option.bestFor}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className={styles.cta}>
                    <p className={styles.ctaText}>Still unsure which option is right for you?</p>
                    <Link href="/contact" className={styles.ctaLink}>Book an initial chat to discuss your situation</Link>
                </div>
            </div>
        </section>
    );
}
