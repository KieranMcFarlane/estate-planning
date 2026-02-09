import styles from './ServicePageHeader.module.css';

export interface ServicePageHeaderProps {
    title: string;
    subtitle: string;
    eyebrow?: string;
    trustBadge?: string;
}

export default function ServicePageHeader({
    title,
    subtitle,
    eyebrow,
    trustBadge
}: ServicePageHeaderProps) {
    return (
        <header className={styles.header}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            {trustBadge && <div className={styles.trustBadge}>{trustBadge}</div>}
        </header>
    );
}
