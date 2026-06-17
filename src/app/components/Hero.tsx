import styles from './Hero.module.css';
import Button from './base/Button';
import Image from 'next/image';
import Icon from './base/Icon';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    {/* Urgency Badge */}
                    <div className={styles.badgeUrgency}>
                        <Icon name="clock" size="sm" />
                        <span>Initial, no-obligation chats available</span>
                    </div>

                    <p className={styles.eyebrow}>Trusted by over 1,000 families across the Midlands</p>
                    <h1 className={styles.title}>
                        Estate planning that feels calm, clear, and human
                    </h1>
                    <p className={styles.subtitle}>
                        Wills, trusts and lasting powers of attorney in Royal Leamington Spa,
                        explained simply and shaped around your family.
                    </p>
                    <div className={styles.trustIndicator}>
                        <Icon name="shield-check" size="sm" />
                        <span>Over 15 years of experience • trusted by local families</span>
                    </div>
                    <div className={styles.actions}>
                        <Button href="/contact" variant="action" size="lg">
                            Book an initial chat
                        </Button>
                        <Button href="#how-it-works" variant="secondary" size="lg">
                            See how it works
                        </Button>
                    </div>
                    <div className={styles.phoneCta}>
                        <Icon name="phone" size="sm" />
                        <span>Or call us: <strong>07902 863999</strong></span>
                    </div>
                    <p className={styles.note}>No pressure. No jargon. Just friendly guidance.</p>
                </div>
                <div className={styles.imageWrapper}>
                    <Image
                        src="/generated/clear-path-hero.jpg"
                        alt="Warm garden path leading to a welcoming front door"
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
