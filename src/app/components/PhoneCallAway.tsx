import styles from './PhoneCallAway.module.css';

export default function PhoneCallAway() {
    return (
        <section className={styles.phoneSection}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <h2 className={styles.heading}>We're only a phone call away</h2>
                    <p className={styles.text}>
                        Any questions? Our friendly specialists are here to help, from 9am to 5pm, Monday to Friday.
                    </p>
                    <div className={styles.phoneGroup}>
                        <span className={styles.phoneIcon}>📞</span>
                        <a href="tel:07902863999" className={styles.phoneNumber}>07902 863999</a>
                    </div>
                    <div className={styles.availability}>
                        <span className={styles.dot}></span> Open today — give us a call
                    </div>
                </div>
                <div className={styles.illustration}>
                    {/* Could add an illustration here */}
                    <div className={styles.iconLarge}>💬</div>
                </div>
            </div>
        </section>
    );
}
