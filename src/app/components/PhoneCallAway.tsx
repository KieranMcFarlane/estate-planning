import styles from './PhoneCallAway.module.css';

export default function PhoneCallAway() {
    return (
        <section className={styles.phoneSection}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <h2 className={styles.heading}>We're only a phone call away</h2>
                    <p className={styles.text}>
                        Questions about Wills, Trusts, or LPAs? Our friendly specialists are here to help.
                        We've helped over <strong>1,000 families</strong> across the Midlands —
                        and we're happy to talk through your situation, no obligation.
                    </p>
                    <div className={styles.phoneGroup}>
                        <span className={styles.phoneIcon}>📞</span>
                        <a href="tel:07902863999" className={styles.phoneNumber}>07902 863999</a>
                    </div>
                    <div className={styles.availability}>
                        <span className={styles.dot}></span> Open today — give us a call
                    </div>
                    <div className={styles.responseTime}>
                        <strong>Most calls returned within 2 hours</strong>
                        <span>Mon-Fri 9am-5pm</span>
                    </div>
                </div>
                <div className={styles.illustration}>
                    <div className={styles.iconLarge}>💬</div>
                    <div className={styles.trustBadges}>
                        <span>5-star rated</span>
                        <span>STEP qualified</span>
                        <span>Since 2006</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
