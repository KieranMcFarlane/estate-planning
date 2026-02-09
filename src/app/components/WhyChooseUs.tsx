import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
    const benefits = [
        { title: "Kind, patient guidance", desc: "we go at your pace" },
        { title: "Clear advice in plain English", desc: "no confusing legal jargon" },
        { title: "No ongoing fees", desc: "once your plan is complete, you’re not tied into yearly costs" },
        { title: "Fully qualified, insured & accredited", desc: "peace of mind that it’s done properly" },
        { title: "Meet in a way that suits you", desc: "office, home visit or video call" },
    ];

    return (
        <section className={`section ${styles.whyChooseUs}`}>
            <div className="container">
                <h2 className={`text-center mb-md`}>Why families choose Pathway</h2>
                <p className={`text-center mb-lg ${styles.intro}`}>
                    We believe estate planning should feel personal, not intimidating. When you speak with us, you’ll never feel rushed or judged — just supported.
                </p>

                <div className={styles.grid}>
                    {benefits.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}>✓</div>
                            <div>
                                <strong>{item.title}</strong> — {item.desc}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`text-center ${styles.highlight}`}>
                    <strong>Most of all:</strong> we’ll treat your situation with care and respect — because we know this is a sensitive topic.
                </div>
            </div>
        </section>
    );
}
