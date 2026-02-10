import styles from './Testimonials.module.css';

export default function Testimonials() {
    const reviews = [
        {
            text: "From the first call, I felt reassured. Everything was explained clearly and calmly, and I never felt rushed. We sorted our Will in just two meetings.",
            author: "Sarah & James, Leamington Spa",
            featured: true
        },
        {
            text: "I'd been putting my Will off for years because it felt daunting. Pathway made the whole process simple, straightforward and surprisingly stress-free.",
            author: "Michael, Warwick"
        },
        {
            text: "Finally understood inheritance tax! They explained everything in plain English and helped us protect our children's inheritance. Such a relief.",
            author: "The Patel Family, Sydenham"
        },
        {
            text: "Home visit was a game-changer for my elderly parents. They felt comfortable and at ease. The LPA process was handled with such care.",
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
                            <p className={`${styles.text} ${review.featured ? styles.featuredText : ''}`}>
                                "{review.text}"
                            </p>
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
