import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    className?: string;
}

export default function Button({ children, href, variant = 'primary', onClick, className = '' }: ButtonProps) {
    const buttonClass = `${styles.btn} ${variant === 'primary' ? styles.primary : styles.secondary} ${className}`;

    if (href) {
        return (
            <Link href={href} className={buttonClass}>
                {children}
            </Link>
        );
    }

    return (
        <button className={buttonClass} onClick={onClick}>
            {children}
        </button>
    );
}
