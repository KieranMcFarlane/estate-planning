import Link from 'next/link';
import styles from './Button.module.css';

export interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    className?: string;
    target?: '_blank' | '_self';
    ariaLabel?: string;
}

export default function Button({
    children,
    href,
    variant = 'primary',
    size = 'md',
    onClick,
    className = '',
    target,
    ariaLabel
}: ButtonProps) {
    const sizeClass = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '';
    const buttonClass = `${styles.btn} ${styles[variant]} ${sizeClass} ${className}`.trim();

    const props = {
        className: buttonClass,
        'aria-label': ariaLabel,
    };

    if (href) {
        return (
            <Link href={href} {...props} target={target}>
                {children}
            </Link>
        );
    }

    return (
        <button {...props} onClick={onClick}>
            {children}
        </button>
    );
}
