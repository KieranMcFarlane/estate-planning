import styles from './FreeGuides.module.css';
import Icon from '../base/Icon';
import Button from '../base/Button';

export interface Guide {
    title: string;
    description: string;
    icon: string;
    category: string;
}

interface FreeGuidesProps {
    guides?: Guide[];
    heading?: string;
    description?: string;
    ctaText?: string;
}

const defaultGuides: Guide[] = [
    {
        title: "Estate Planning Checklist",
        description: "10 things every parent should have in place to protect their family's future.",
        icon: "document",
        category: "Essential"
    },
    {
        title: "Understanding Inheritance Tax",
        description: "A simple guide to what you might owe and legitimate ways to reduce it.",
        icon: "pie-chart",
        category: "Tax Planning"
    },
    {
        title: "LPAs Explained",
        description: "Why everyone over 18 should consider a Lasting Power of Attorney.",
        icon: "shield",
        category: "Protection"
    },
    {
        title: "Blended Families",
        description: "Protecting all your children when yours isn't a traditional family setup.",
        icon: "users",
        category: "Family"
    }
];

export default function FreeGuides({
    guides = defaultGuides,
    heading = "Helpful guides to help you get started",
    description = "Download our comprehensive guides to understand estate planning better. No obligation, just helpful information.",
    ctaText = "Download your guides"
}: FreeGuidesProps) {
    return (
        <section className={`section ${styles.freeGuides}`}>
            <div className="container">
                <div className={styles.header}>
                    <p className={styles.eyebrow}>Helpful Resources</p>
                    <h2>{heading}</h2>
                    <p className={styles.description}>{description}</p>
                </div>
                <div className={styles.grid}>
                    {guides.map((guide, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.category}>{guide.category}</div>
                            <div className={styles.iconWrapper}>
                                <Icon name={guide.icon} size="lg" className={styles.icon} />
                            </div>
                            <h3 className={styles.title}>{guide.title}</h3>
                            <p className={styles.guideDescription}>{guide.description}</p>
                            <button className={styles.downloadBtn} aria-label={`Download ${guide.title}`}>
                                <Icon name="download" size="sm" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    ))}
                </div>
                <div className={styles.cta}>
                    <p className={styles.ctaText}>Need more specific advice?</p>
                    <Button href="/contact" variant="primary" size="md">
                        Book an initial consultation
                    </Button>
                </div>
            </div>
        </section>
    );
}
