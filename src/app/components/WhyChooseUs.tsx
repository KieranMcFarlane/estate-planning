import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
    const benefits = [
        {
            title: "We've helped hundreds feel confident",
            desc: "From nervous first-timers to complex family situations, we guide everyone with patience and care"
        },
        {
            title: "Plain English, guaranteed",
            desc: "We explain complex legal concepts in everyday language — no jargon, no confusion"
        },
        {
            title: "One fair price, no surprises",
            desc: "No subscriptions, no ongoing fees, no hidden costs. You pay once, it's done forever"
        },
        {
            title: "STEP qualified & fully insured",
            desc: "Professional indemnity insurance for your peace of mind, plus Society of Trust and Estate Practitioners membership"
        },
        {
            title: "Home visits available",
            desc: "Evening and weekend appointments. We come to you if getting out is difficult"
        },
        {
            title: "Most clients complete in 2-3 meetings",
            desc: "We move at your pace, but we're efficient too. From first call to signed documents, typically within 30 days"
        }
    ];

    return (
        <section className={`section ${styles.whyChooseUs}`}>
            <div className="container">
                <h2 className={`text-center mb-md`}>Why families choose Pathway</h2>
                <p className={`text-center mb-lg ${styles.intro}`}>
                    We believe estate planning should feel personal, not intimidating. When you speak with us, you'll never feel rushed or judged — just supported.
                </p>

                <div className={styles.grid}>
                    {benefits.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}>✓</div>
                            <div>
                                <strong>{item.title}</strong>
                                <p className={styles.desc}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`text-center ${styles.highlight}`}>
                    <strong>Most of all:</strong> we'll treat your situation with care and respect — because we know this is a sensitive topic.
                </div>
            </div>
        </section>
    );
}
