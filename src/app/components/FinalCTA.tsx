import { Button } from '@/components/ui/button';
import Link from 'next/link';
import styles from './FinalCTA.module.css';

export default function FinalCTA() {
    return (
        <section className={`section ${styles.cta}`}>
            <div className="container text-center">
                <h2 className={styles.heading}>Ready when you are</h2>
                <p className={styles.text}>
                    If you’ve been putting estate planning off, you’re not alone — and it doesn’t have to be complicated.
                </p>
                <p className={styles.text}>Let’s take the next step together.</p>
                <div className={styles.action}>
                    <Button asChild variant="default">
                        <Link href="/contact">Book a free call</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
