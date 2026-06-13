import styles from './Testimonials.module.css';

export default function Testimonials() {
    const reviews = [
        {
            problem: "We kept putting our Will off because we did not know where to start.",
            solution: "Pathway explained each decision clearly and kept the process calm.",
            result: "Everything was sorted in two meetings, and we finally felt reassured.",
            author: "Sarah & James, Royal Leamington Spa",
            featured: true
        },
        {
            problem: "The paperwork felt daunting, so I avoided it for years.",
            solution: "They made the steps simple, straightforward, and easy to understand.",
            result: "I stopped worrying and got a proper plan in place.",
            author: "Michael, Warwick"
        },
        {
            problem: "Inheritance tax felt impossible to understand.",
            solution: "Everything was explained in plain English, with practical options.",
            result: "We protected more for our children and felt a real sense of relief.",
            author: "The Patel Family, Sydenham"
        },
        {
            problem: "My elderly parents were anxious about travelling and formal meetings.",
            solution: "Pathway visited at home and handled the LPA process with care.",
            result: "They felt comfortable, heard, and protected.",
            author: "Rebecca, Kenilworth"
        }
    ];

    return (
        <section className={`section ${styles.testimonials}`}>
            <div className="container">
                <h2 className={`text-center mb-lg ${styles.heading}`}>What our clients say</h2>
                <div className={styles.grid}>
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className={`${styles.card} ${review.featured ? styles.featured : ''}`}
                        >
                            <div className={styles.stars}>★★★★★</div>
                            <div className={`${styles.text} ${review.featured ? styles.featuredText : ''}`}>
                                <p><strong>Problem</strong>{review.problem}</p>
                                <p><strong>Our solution</strong>{review.solution}</p>
                                <p><strong>Real result</strong>{review.result}</p>
                            </div>
                            <p className={`${styles.author} ${review.featured ? styles.featuredAuthor : ''}`}>
                                — {review.author}
                            </p>
                        </div>
                    ))}
                </div>
                <div className={`text-center ${styles.trust}`}>
                    <p>Rated <strong>5 Stars</strong> by over 1,000 families across the Midlands</p>
                </div>
                <div className={styles.trustBadges}>
                    <div className={styles.badge}>
                        <span className={styles.badgeNumber}>1,000+</span>
                        <span className={styles.badgeLabel}>Families Protected</span>
                    </div>
                    <div className={styles.badge}>
                        <span className={styles.badgeNumber}>18+</span>
                        <span className={styles.badgeLabel}>Years Experience</span>
                    </div>
                    <div className={styles.badge}>
                        <span className={styles.badgeNumber}>5.0</span>
                        <span className={styles.badgeLabel}>Star Rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
