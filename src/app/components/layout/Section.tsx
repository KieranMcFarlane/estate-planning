import styles from './Section.module.css';

export interface SectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'alt' | 'primary' | 'dark' | 'warm' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  id?: string;
  containerClassName?: string;
}

export default function Section({
  children,
  variant = 'default',
  size = 'lg',
  className = '',
  id,
  containerClassName = ''
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${styles[variant]} ${styles[size]} ${className}`.trim()}
    >
      <div className={`container ${containerClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}
