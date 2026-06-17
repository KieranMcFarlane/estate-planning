import styles from './TestimonialCard.module.css';
import Card from '../base/Card';

export interface TestimonialCardProps {
  quote: string;
  author: string;
  location?: string;
}

export default function TestimonialCard({
  quote,
  author,
  location
}: TestimonialCardProps) {
  return (
    <Card variant="elevated" padding="lg" className={styles.card}>
      <p className={styles.quote}>&quot;{quote}&quot;</p>
      <div className={styles.author}>
        <span className={styles.name}>{author}</span>
        {location && <span className={styles.location}>{location}</span>}
      </div>
    </Card>
  );
}
