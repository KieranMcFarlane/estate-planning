import styles from './TestimonialCard.module.css';
import Card from '../base/Card';
import Icon from '../base/Icon';

export interface TestimonialCardProps {
  quote: string;
  author: string;
  location?: string;
  rating?: number;
}

export default function TestimonialCard({
  quote,
  author,
  location,
  rating = 5
}: TestimonialCardProps) {
  return (
    <Card variant="elevated" padding="lg" className={styles.card}>
      <div className={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size="sm"
            className={styles.star}
          />
        ))}
      </div>
      <p className={styles.quote}>&quot;{quote}&quot;</p>
      <div className={styles.author}>
        <span className={styles.name}>{author}</span>
        {location && <span className={styles.location}>{location}</span>}
      </div>
    </Card>
  );
}
