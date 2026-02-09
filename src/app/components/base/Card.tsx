import styles from './Card.module.css';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'image-header';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  children,
  imageSrc,
  imageAlt = '',
  className = '',
  onClick
}: CardProps) {
  const cardClass = [
    styles.card,
    styles[variant],
    padding !== 'none' && styles[padding],
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} onClick={onClick} role={onClick ? 'button' : undefined}>
      {imageSrc && (
        <div className={styles.imageHeader}>
          <img src={imageSrc} alt={imageAlt} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
