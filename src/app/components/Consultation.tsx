import Link from 'next/link';
import styles from './Consultation.module.css';

export default function Consultation() {
    return (
        <section className={`section ${styles.consultation}`}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.heading}>Clear, supportive consultations</h2>
                    <p>
                        At Pathway Estate Planning, our consultations are designed to feel simple, calm and personal.
                    </p>
                    <p>
                        We’ll take the time to understand your circumstances, explain your options clearly, and help you make decisions you feel confident about. We can also offer conversational translations into our known languages if that helps you feel more comfortable.
                    </p>
                    <p>
                        Whether you’re planning ahead, updating your documents, or going through a difficult time — we’re here to guide you.
                    </p>
                    <div className={styles.note}>
                        <strong>Please contact us and speak with a friendly member of our team.</strong>
                    </div>
                </div>
            </div>
        </section>
    );
}
