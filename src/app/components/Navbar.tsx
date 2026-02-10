'use client';

import { useState } from 'react';
import Link from "next/link";
import Button from "./base/Button";
import Icon from "./base/Icon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const resources = [
        { href: "/helpful-info", label: "Helpful Info" },
        { href: "/faq", label: "FAQ" },
        { href: "/glossary", label: "Glossary" },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    Pathway <span className={styles.logoSubtitle}>Estate Planning</span>
                </Link>

                <div className={`${styles.links} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
                    <Link href="/estate-planning" onClick={() => setMobileMenuOpen(false)}>Services</Link>

                    {/* Resources Dropdown - Desktop Only */}
                    <div className={styles.desktopOnly}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={styles.dropdownTrigger}>
                                    Resources
                                    <Icon name="chevron-down" size="sm" className={styles.dropdownIcon} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className={styles.shadcnDropdown}>
                                {resources.map((resource) => (
                                    <DropdownMenuItem key={resource.href} asChild>
                                        <Link
                                            href={resource.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={styles.dropdownItem}
                                        >
                                            {resource.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Resources Links - Mobile Only */}
                    <div className={styles.mobileOnly}>
                        {resources.map((resource) => (
                            <Link
                                key={resource.href}
                                href={resource.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={styles.mobileResourceLink}
                            >
                                {resource.label}
                            </Link>
                        ))}
                    </div>

                    <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                </div>

                <div className={styles.desktopCta}>
                    <a href="tel:07902863999" className={styles.phoneLink}>
                        <Icon name="phone" size="sm" />
                        <div className={styles.phoneInfo}>
                            <span className={styles.phoneLabel}>Free consultation</span>
                            <span className={styles.phoneNumber}>07902 863999</span>
                        </div>
                    </a>
                    <Button href="/contact" variant="primary" size="sm" className={styles.ctaButton}>
                        <Icon name="calendar" size="sm" />
                        Book a Call
                    </Button>
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
                    <div>
                        <span className={styles.phoneBtnLabel}>Free</span>
                        <span className={styles.phoneBtnNumber}>07902 863999</span>
                    </div>
                </a>
                <Link href="/contact" className={styles.bookBtn}>
                    <Icon name="calendar" size="sm" />
                    Book a Call
                </Link>
            </div>

            {/* Floating Desktop CTA */}
            <div className={styles.floatingCtaDesktop}>
                <a href="tel:07902863999" className={styles.floatingPhone}>
                    <Icon name="phone" size="sm" />
                    <span>07902 863999</span>
                </a>
                <Button href="/contact" variant="action" size="sm">
                    Book Free Call
                </Button>
            </div>
        </nav>
    );
}
