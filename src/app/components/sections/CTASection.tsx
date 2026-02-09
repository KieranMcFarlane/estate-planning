import styles from './CTASection.module.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface CTASectionProps {
  title: string;
  description?: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  variant?: 'default' | 'alt' | 'primary';
}

export default function CTASection({
  title,
  description,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  variant = 'alt'
}: CTASectionProps) {
  return (
    <section className={`${styles.cta} ${styles[variant]}`}>
      <div className="container">
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
          <div className={styles.buttons}>
            <Button asChild variant="default" size="lg">
              <Link href={primaryHref}>
                {primaryText}
              </Link>
            </Button>
            {secondaryText && secondaryHref && (
              <Button asChild variant="outline" size="lg">
                <Link href={secondaryHref}>
                  {secondaryText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
