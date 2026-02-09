import styles from './Services.module.css';

export default function Services() {
    const servicesList = [
        "Wills & Trusts",
        "Lasting Powers of Attorney (LPAs)",
        "Inheritance Tax Planning",
        "Asset Protection & Gifting",
        "Business Protection",
        "Agricultural Land Planning"
    ];

    const situations = [
        "You want to make sure your children and loved ones are protected",
        "You’ve been meaning to do a Will for years and want it done properly",
        "You want to prevent confusion or conflict later on",
        "You’re worried about care costs affecting your estate",
        "You’re supporting a parent and want to help them get organised",
        "You want to reduce unnecessary inheritance tax where possible"
    ];

    return (
        <section className={`section ${styles.services}`}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.left}>
                        <h2 className={styles.heading}>What we can help with</h2>
                        <p className="mb-md">We specialise in estate planning services, including:</p>
                        <ul className={styles.serviceList}>
                            {servicesList.map((item, idx) => (
                                <li key={idx} className={styles.serviceItem}>
                                    <span className={styles.bullet}>•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.right}>
                        <h3 className={styles.subHeading}>You might be here because…</h3>
                        <ul className={styles.situationList}>
                            {situations.map((item, idx) => (
                                <li key={idx} className={styles.situationItem}>
                                    <span className={styles.check}>✓</span> {item}
                                </li>
                            ))}
                        </ul>
                        <p className={styles.note}>If any of this sounds familiar, we’re here to help.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
