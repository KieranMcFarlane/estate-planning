import styles from './Hero.module.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Estate planning, made simple
                    </h1>
                    <p className={styles.subtitle}>
                        Wills, Trusts and Lasting Powers of Attorney in Royal Leamington Spa.
                        We'll explain everything clearly and guide you through at your pace.
                    </p>
                    <div className={styles.actions}>
                        <Button asChild variant="default" size="lg">
                            <Link href="/contact">Book a free call</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="#how-it-works">See how it works</Link>
                        </Button>
                    </div>
                    <p className={styles.note}>No pressure. No jargon. Just friendly guidance.</p>
                </div>
                <div className={styles.imageWrapper}>
                    <Image
                        src="https://images.unsplash.com/photo-1758687126914-79766e86df15?auto=format&fit=crop&w=1600&q=80"
                        alt="Couple reading together on a couch"
                        width={1600}
                        height={1067}
                        className={styles.heroImage}
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
