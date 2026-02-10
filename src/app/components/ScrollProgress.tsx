'use client';

import { useEffect, useState } from 'react';
import styles from './ScrollProgress.module.css';

export default function ScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrolled = window.scrollY;
            const maxScroll = documentHeight - windowHeight;
            const progress = (scrolled / maxScroll) * 100;

            setScrollProgress(Math.min(progress, 100));
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial calculation
        handleScroll();

        // Cleanup
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={styles.scrollProgress}>
            <div
                className={styles.scrollProgressBar}
                style={{
                    width: `${scrollProgress}%`,
                    background: `linear-gradient(90deg, var(--color-tertiary) 0%, var(--color-action) 100%)`
                }}
            />
        </div>
    );
}
