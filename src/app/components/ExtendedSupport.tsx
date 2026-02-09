import styles from './ExtendedSupport.module.css';

export default function ExtendedSupport() {
    const supports = [
        { title: "Probate", desc: "Compassionate support to handle the legal process after losing a loved one." },
        { title: "Financial Advice", desc: "Guidance on pensions, investments, and tax efficiency from regulated advisers." },
        { title: "Conveyancing", desc: "Help with property transfers and sales." },
        { title: "Equity Release", desc: "Qualified specialists to help you understand options and risks." },
        { title: "Mortgages", desc: "Expert advice for buying, remortgaging, or investing." }
    ];

    return (
        <section className={`section ${styles.support}`}>
            <div className="container">
                <div className="text-center mb-lg">
                    <h2 className={styles.heading}>Additional support, when you need it</h2>
                    <p className={styles.intro}>
                        Sometimes estate planning is only one part of the bigger picture. That’s why we work closely with a trusted network of regulated professionals.
                    </p>
                </div>

                <div className={styles.grid}>
                    {supports.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
