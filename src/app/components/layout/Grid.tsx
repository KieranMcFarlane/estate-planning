import styles from './Grid.module.css';

export interface GridProps {
  children: React.ReactNode;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Grid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}: GridProps) {
  const gridClass = [
    styles.grid,
    styles[`gap-${gap}`],
    cols.mobile && styles[`cols-mobile-${cols.mobile}`],
    cols.tablet && styles[`cols-tablet-${cols.tablet}`],
    cols.desktop && styles[`cols-desktop-${cols.desktop}`],
    className
  ].filter(Boolean).join(' ');

  return <div className={gridClass}>{children}</div>;
}
