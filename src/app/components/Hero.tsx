import styles from './Hero.module.css';
import Button from './base/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <p className={styles.eyebrow}>Trusted by over 1,000 families across the Midlands</p>
                    <h1 className={styles.title}>
                        The simpler way to secure your family's future
                    </h1>
                    <p className={styles.subtitle}>
                        Wills, Trusts and Lasting Powers of Attorney in Royal Leamington Spa.
                        We'll explain everything clearly and guide you through at your pace.
                    </p>
                    <div className={styles.trustIndicator}>
                        <span className={styles.trustIcon}>✓</span>
                        <span>Nearly 20 years of experience • 5-star rated on Google</span>
                    </div>
                    <div className={styles.actions}>
                        <Button href="/contact" variant="primary" size="lg">
                            Book a free call
                        </Button>
                        <Button href="#how-it-works" variant="outline" size="lg">
                            See how it works
                        </Button>
                    </div>
                    <div className={styles.phoneCta}>
                        <span className={styles.phoneIcon}>📞</span>
                        <span>Or call us free: <strong>07902 863999</strong></span>
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
