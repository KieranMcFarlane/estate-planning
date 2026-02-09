import Link from 'next/link';
import styles from './ServiceCard.module.css';
import Card from '../base/Card';
import Icon from '../base/Icon';

export interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  iconName?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}

export default function ServiceCard({
  title,
  description,
  href,
  iconName = 'document',
  variant = 'elevated'
}: ServiceCardProps) {
  return (
    <Link href={href} className={styles.link}>
      <Card variant={variant} padding="lg" className={styles.card}>
        {iconName && (
          <div className={styles.iconWrapper}>
            <Icon name={iconName} size="lg" />
          </div>
        )}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.arrow}>
          <Icon name="arrow-right" size="sm" />
        </div>
      </Card>
    </Link>
  );
}
