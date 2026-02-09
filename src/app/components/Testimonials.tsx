import styles from './Testimonials.module.css';

export default function Testimonials() {
    const reviews = [
        {
            text: "From the first call, I felt reassured. Everything was explained clearly and calmly, and I never felt rushed. I’m so glad we finally got everything sorted.",
            author: "Satisfied Client"
        },
        {
            text: "I’d been putting my Will off for years because it felt daunting. Pathway made the whole process simple, straightforward and surprisingly stress-free.",
            author: "Local Family"
        },
        {
            text: "The best thing was how clear everything felt. No jargon, no confusion — just step-by-step guidance and real peace of mind.",
            author: "Happy Customer"
        },
        {
            text: "This is such a sensitive subject, but they handled it with real care. We felt supported the whole way through.",
            author: "Trust Client"
        }
    ];

    return (
        <section className={`section ${styles.testimonials}`}>
            <div className="container">
                <h2 className={`text-center mb-lg ${styles.heading}`}>What our clients say</h2>
                <div className={styles.grid}>
                    {reviews.map((review, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.stars}>★★★★★</div>
                            <p className={styles.text}>"{review.text}"</p>
                            <p className={styles.author}>— {review.author}</p>
                        </div>
                    ))}
                </div>
                <div className={`text-center ${styles.trust}`}>
                    <p>Rated <strong>5 Stars</strong> by families in Royal Leamington Spa</p>
                </div>
            </div>
        </section>
    );
}
