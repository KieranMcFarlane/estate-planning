import styles from './TrustStats.module.css';

export interface TrustStatsProps {
    className?: string;
}

export default function TrustStats({ className = '' }: TrustStatsProps) {
    const stats = [
        { number: "1,000+", label: "Families Protected", icon: "shield" },
        { number: "18+", label: "Years Experience", icon: "award" },
        { number: "5.0", label: "Star Rating", icon: "star", subtitle: "Google Reviews" },
        { number: "98%", label: "Client Satisfaction", icon: "heart" }
    ];

    // SVG icon paths
    const icons: Record<string, JSX.Element> = {
        shield: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
        ),
        award: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
        ),
        star: (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        ),
        heart: (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        )
    };

    return (
        <section className={`${styles.trustStats} ${className}`}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={styles.statCard}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={styles.iconWrapper}>
                                {icons[stat.icon]}
                            </div>
                            <div className={styles.statNumber}>{stat.number}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                            {stat.subtitle && (
                                <div className={styles.statSubtitle}>{stat.subtitle}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
