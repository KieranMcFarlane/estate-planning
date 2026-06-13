import styles from './SecurityBadge.module.css';
import Icon from '../base/Icon';

export interface SecurityItem {
    icon: string;
    title: string;
    description: string;
}

interface SecurityBadgeProps {
    items?: SecurityItem[];
    heading?: string;
    description?: string;
}

const defaultItems: SecurityItem[] = [
    {
        icon: 'shield',
        title: 'Fully Insured',
        description: 'Professional indemnity insurance means you\'re protected — we stand behind our work.'
    },
    {
        icon: 'document',
        title: 'Secure Document Storage',
        description: 'Your important documents are stored safely and can be accessed by your family when needed.'
    },
    {
        icon: 'users',
        title: 'Professional Body Members',
        description: 'STEP qualified and adhering to the highest professional standards in estate planning.'
    },
    {
        icon: 'check-circle',
        title: 'Data Protection Compliant',
        description: 'Your personal information is handled securely and in accordance with data protection regulations.'
    },
    {
        icon: 'home',
        title: 'Established Local Practice',
        description: 'Serving Royal Leamington Spa and the Midlands since 2006 — we\'re not going anywhere.'
    },
    {
        icon: 'check',
        title: 'Transparent Pricing',
        description: 'No hidden fees, no surprises. You\'ll know exactly what you\'re paying before we start.'
    }
];

export default function SecurityBadge({
    items = defaultItems,
    heading = "Your security and peace of matter",
    description = "We take our responsibilities seriously. Here's how we protect you and your family."
}: SecurityBadgeProps) {
    return (
        <section className={`section ${styles.securitySection}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{heading}</h2>
                    <p className={styles.description}>{description}</p>
                </div>
                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.item}>
                            <div className={styles.iconWrapper}>
                                <Icon name={item.icon} size="lg" className={styles.icon} />
                            </div>
                            <h3 className={styles.title}>{item.title}</h3>
                            <p className={styles.itemDescription}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
