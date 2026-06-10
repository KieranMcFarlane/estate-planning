'use client';

import { useEffect, useRef, useState } from 'react';
import Headroom from "headroom.js";
import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Icon from "./base/Icon";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const navRef = useRef<HTMLElement | null>(null);
    const headroomRef = useRef<Headroom | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<"services" | "resources" | null>(null);

    const services = [
        { href: "/wills", label: "Wills", body: "Clear wishes, properly recorded." },
        { href: "/trusts", label: "Trusts", body: "Protect assets for the right people." },
        { href: "/lpa", label: "Lasting Powers of Attorney", body: "Choose who can act for you." },
        { href: "/inheritance-tax-planning", label: "Inheritance Tax Planning", body: "Support with mitigating tax." },
        { href: "/care-planning", label: "Care Planning", body: "Plan ahead for later-life decisions." },
        { href: "/business-protection", label: "Business Protection", body: "Keep your business protected." },
        { href: "/agricultural-land", label: "Agricultural Land", body: "Planning for farms and land." },
    ];

    const resources = [
        { href: "/estate-planning", label: "All Services", body: "A full overview of estate planning." },
        { href: "/extended-services", label: "Extended Services", body: "Probate, advice and related support." },
        { href: "/helpful-info", label: "Helpful Information", body: "A practical planning checklist." },
        { href: "/glossary", label: "Glossary of Terms", body: "Plain-English legal explanations." },
        { href: "/faq", label: "FAQ", body: "Answers to common questions." },
    ];

    const close = () => {
        setMobileMenuOpen(false);
        setOpenMenu(null);
    };

    useEffect(() => {
        if (!navRef.current || !Headroom.cutsTheMustard) return;

        const headroom = new Headroom(navRef.current, {
            offset: {
                up: 40,
                down: 96,
            },
            tolerance: {
                up: 8,
                down: 4,
            },
            classes: {
                initial: styles.headroom,
                pinned: styles.headroomPinned,
                unpinned: styles.headroomUnpinned,
                top: styles.headroomTop,
                notTop: styles.headroomNotTop,
                frozen: styles.headroomFrozen,
            },
        });

        headroom.init();
        headroomRef.current = headroom;

        return () => {
            headroom.destroy();
            headroomRef.current = null;
        };
    }, []);

    useEffect(() => {
        const headroom = headroomRef.current;
        if (!headroom) return;

        if (mobileMenuOpen || openMenu) {
            headroom.pin();
            headroom.freeze();
        } else {
            headroom.unfreeze();
        }
    }, [mobileMenuOpen, openMenu]);

    return (
        <nav ref={navRef} className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo} aria-label="Pathway Estate Planning, home">
                    <Image src="/pathway-logo.png" alt="Pathway Estate Planning Specialists" width={2680} height={880} className={styles.logoImage} priority unoptimized />
                </Link>

                <div className={styles.links}>
                    <Link href="/" onClick={close}>Home</Link>

                    <div className={`${styles.navItem} ${styles.desktopOnly}`}>
                        <button
                            className={`${styles.dropdownTrigger} ${openMenu === "services" ? styles.open : ""}`}
                            onClick={() => setOpenMenu(openMenu === "services" ? null : "services")}
                            aria-haspopup="true"
                            aria-expanded={openMenu === "services"}
                            type="button"
                        >
                            Services
                            <Icon name="chevron-down" size="sm" className={styles.dropdownIcon} />
                        </button>
                        <div className={`${styles.dropdown} ${openMenu === "services" ? styles.dropdownOpen : ""}`} role="menu">
                            {services.map((service) => (
                                <Link
                                    href={service.href}
                                    onClick={close}
                                    className={styles.dropdownItem}
                                    key={service.href}
                                >
                                    {service.label}
                                    <small>{service.body}</small>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.navItem} ${styles.desktopOnly}`}>
                        <button
                            className={`${styles.dropdownTrigger} ${openMenu === "resources" ? styles.open : ""}`}
                            onClick={() => setOpenMenu(openMenu === "resources" ? null : "resources")}
                            aria-haspopup="true"
                            aria-expanded={openMenu === "resources"}
                            type="button"
                        >
                            Resources
                            <Icon name="chevron-down" size="sm" className={styles.dropdownIcon} />
                        </button>
                        <div className={`${styles.dropdown} ${openMenu === "resources" ? styles.dropdownOpen : ""}`} role="menu">
                            {resources.map((resource) => (
                                <Link
                                    href={resource.href}
                                    onClick={close}
                                    className={styles.dropdownItem}
                                    key={resource.href}
                                >
                                    {resource.label}
                                    <small>{resource.body}</small>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link href="/how-it-works" onClick={close}>How It Works</Link>
                    <Link href="/about" onClick={close}>About</Link>
                    <Link href="/contact" onClick={close}>Contact</Link>
                </div>

                <div className={styles.desktopCta}>
                    <a href="tel:07902863999" className={styles.phoneLink}>
                        <Icon name="phone" size="sm" />
                        <span>Call us</span>
                    </a>
                    <Link href="/contact" className={styles.ctaButton}>
                        <Icon name="calendar" size="sm" />
                        Book initial chat
                    </Link>
                </div>

                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button className={styles.mobileToggle} aria-label="Open menu" type="button">
                            <Icon name="menu" size="md" />
                        </button>
                    </SheetTrigger>
                    <SheetContent className={styles.mobileSheet}>
                        <SheetHeader className={styles.mobileSheetHeader}>
                            <SheetTitle className={styles.mobileSheetTitle}>Menu</SheetTitle>
                            <Image src="/pathway-logo.png" alt="" width={2680} height={880} className={styles.mobileSheetLogo} unoptimized />
                        </SheetHeader>
                        <div className={styles.mobileSheetLinks}>
                            <Link href="/" onClick={close}>Home</Link>
                            <p className={styles.mobileGroupTitle}>Services</p>
                            {services.map((service) => (
                                <Link
                                    key={service.href}
                                    href={service.href}
                                    onClick={close}
                                    className={styles.mobileResourceLink}
                                >
                                    {service.label}
                                    <small>{service.body}</small>
                                </Link>
                            ))}
                            <p className={styles.mobileGroupTitle}>Resources</p>
                            {resources.map((resource) => (
                                <Link
                                    key={resource.href}
                                    href={resource.href}
                                    onClick={close}
                                    className={styles.mobileResourceLink}
                                >
                                    {resource.label}
                                    <small>{resource.body}</small>
                                </Link>
                            ))}
                            <Link href="/how-it-works" onClick={close}>How It Works</Link>
                            <Link href="/about" onClick={close}>About</Link>
                            <Link href="/contact" onClick={close}>Contact</Link>
                        </div>
                        <div className={styles.mobileSheetActions}>
                            <a href="tel:07902863999" className={styles.mobileSheetPhone} onClick={close}>
                                <Icon name="phone" size="sm" />
                                07902 863999
                            </a>
                            <Link href="/contact" className={styles.mobileSheetButton} onClick={close}>
                                <Icon name="calendar" size="sm" />
                                Book initial chat
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
