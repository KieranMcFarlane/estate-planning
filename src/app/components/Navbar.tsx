'use client';

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Icon from "./base/Icon";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    Pathway <span className={styles.logoSubtitle}>Estate Planning</span>
                </Link>

                <div className={`${styles.links} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <Link href="/#about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                    <Link href="/estate-planning" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                    <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                    <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                </div>

                <div className={styles.desktopCta}>
                    <Button asChild variant="default" size="sm">
                        <Link href="/contact">Book a free call</Link>
                    </Button>
                    <div className={styles.phone}>
                        <Icon name="phone" size="sm" />
                        <span>07902 863999</span>
                    </div>
                </div>

                <button
                    className={styles.mobileToggle}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <Icon name={mobileMenuOpen ? 'close' : 'menu'} size="md" />
                </button>
            </div>

            {/* Mobile Sticky CTA */}
            <div className={styles.mobileCta}>
                <a href="tel:07902863999" className={styles.phoneBtn}>
                    <Icon name="phone" size="sm" />
                    <span>Call</span>
                </a>
                <Link href="/contact" className={styles.bookBtn}>Book a free call</Link>
            </div>
        </nav>
    );
}
