import styles from './TrustBadges.module.css';

export default function TrustBadges() {
    return (
        <section className={styles.trustBadges}>
            <div className={`container ${styles.container}`}>
                <h2 className={styles.heading}>The UK&apos;s trusted estate planning specialists</h2>
                <p className={styles.subtext}>
                    Helping families across Royal Leamington Spa and the Midlands since 2006.
                </p>

                <div className={styles.badges}>
                    <div className={styles.badge}>
                        <div className={styles.number}>1,000+</div>
                        <div className={styles.badgeText}>Families helped</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.number}>18+</div>
                        <div className={styles.badgeText}>Years experience</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.rating}>★★★★★</div>
                        <div className={styles.badgeText}>5-star Google rating</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.icon}>✓</div>
                        <div className={styles.badgeText}>STEP qualified</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.icon}>🏠</div>
                        <div className={styles.badgeText}>Home visits available</div>
                    </div>
                    <div className={styles.badge}>
                        <div className={styles.icon}>£</div>
                        <div className={styles.badgeText}>No ongoing fees</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
