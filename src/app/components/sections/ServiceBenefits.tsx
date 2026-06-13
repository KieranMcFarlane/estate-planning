import styles from './ServiceBenefits.module.css';
import Icon from '../base/Icon';
import Button from '../base/Button';

export interface Benefit {
    icon: string;
    title: string;
    description: string;
    highlight?: boolean;
}

interface ServiceBenefitsProps {
    benefits?: Benefit[];
    heading?: string;
    description?: string;
    vsHeading?: string;
    ctaText?: string;
    ctaLink?: string;
}

const defaultBenefits: Benefit[] = [
    {
        icon: 'home',
        title: 'Home Visits Available',
        description: 'We come to you across Royal Leamington Spa, Warwick, and surrounding areas. Particularly helpful for elderly clients or those with mobility issues.',
        highlight: true
    },
    {
        icon: 'calendar',
        title: 'Evening & Weekend Appointments',
        description: 'We understand life is busy. Schedule meetings outside work hours at a time that suits you.',
        highlight: true
    },
    {
        icon: 'folder',
        title: 'Secure Document Storage',
        description: 'We store your important documents safely and provide copies to you and your attorneys as needed.',
    },
    {
        icon: 'check-circle',
        title: 'Annual Review Reminders',
        description: 'Life changes — marriages, divorces, births, deaths. We\'ll remind you to review your estate plan when it matters.',
    },
    {
        icon: 'users',
        title: 'Family Meeting Coordination',
        description: 'We can facilitate family meetings to ensure everyone understands your wishes and avoids future conflicts.',
        highlight: true
    },
    {
        icon: 'check',
        title: 'Unlimited Amendments During Process',
        description: 'Your situation is unique. We\'ll work with you until every detail reflects your wishes exactly.',
    },
    {
        icon: 'clock',
        title: 'Responsive Communication',
        description: 'Questions between meetings? We\'re available by phone, email, or video call. No long waits for a response.',
    },
    {
        icon: 'trending-up',
        title: 'Clear Costs, No Surprises',
        description: 'We explain costs before work begins, with no hourly billing or unexpected extras.',
        highlight: true
    }
];

export default function ServiceBenefits({
    benefits = defaultBenefits,
    heading = "What makes Pathway different?",
    description = "DIY options and online services can't match the personal touch and expertise of working directly with a qualified professional.",
    vsHeading = "Why choose professional over DIY?",
    ctaText = "Experience the Pathway difference",
    ctaLink = "/contact"
}: ServiceBenefitsProps) {
    return (
        <section className={`section ${styles.serviceBenefits}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{heading}</h2>
                    <p className={styles.description}>{description}</p>
                </div>

                <div className={styles.benefitsGrid}>
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className={`${styles.benefit} ${benefit.highlight ? styles.highlight : ''}`}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon name={benefit.icon} size="md" className={styles.icon} />
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>{benefit.title}</h3>
                                <p className={styles.benefitDescription}>{benefit.description}</p>
                            </div>
                            {benefit.highlight && (
                                <span className={styles.badge}>Popular</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.comparisonBox}>
                    <h3 className={styles.comparisonTitle}>{vsHeading}</h3>
                    <div className={styles.comparisonGrid}>
                        <div className={styles.diyColumn}>
                            <h4 className={styles.columnHeader}>DIY / Online Services</h4>
                            <ul className={styles.list}>
                                <li className={styles.negative}>Generic templates, not tailored to you</li>
                                <li className={styles.negative}>No expert advice when questions arise</li>
                                <li className={styles.negative}>Higher risk of errors or invalid documents</li>
                                <li className={styles.negative}>No support for complex family situations</li>
                                <li className={styles.negative}>No inheritance tax planning expertise</li>
                            </ul>
                        </div>
                        <div className={styles.proColumn}>
                            <h4 className={styles.columnHeader}>Pathway Estate Planning</h4>
                            <ul className={styles.list}>
                                <li className={styles.positive}>Documents tailored to your exact situation</li>
                                <li className={styles.positive}>Expert guidance through every decision</li>
                                <li className={styles.positive}>Proper execution, legally sound documents</li>
                                <li className={styles.positive}>Experienced with blended families & complex situations</li>
                                <li className={styles.positive}>Tax planning to minimise inheritance tax</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.cta}>
                    <Button href={ctaLink} variant="primary" size="lg">
                        {ctaText}
                    </Button>
                </div>
            </div>
        </section>
    );
}
