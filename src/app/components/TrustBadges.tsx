import styles from './TrustBadges.module.css';

export default function TrustBadges() {
    return (
        <section className={styles.trustBadges}>
            <div className={`container ${styles.container}`}>
                <h2 className={styles.heading}>The UK's trusted estate planning specialists</h2>
                <p className={styles.subtext}>
                    Nearly two decades of experience. Fully qualified, insured & accredited.
                </p>

                <div className={styles.badges}>
                    <div className={styles.badge}>
                        <div className={styles.rating}>★★★★★</div>
                        <div className={styles.badgeText}>5-star rated</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.icon}>✓</div>
                        <div className={styles.badgeText}>Fully insured</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.icon}>✓</div>
                        <div className={styles.badgeText}>No ongoing fees</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.icon}>🏠</div>
                        <div className={styles.badgeText}>Home visits available</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
