'use client';

import { useEffect, useRef, useState } from 'react';
import Headroom from "headroom.js";
import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Icon from "./base/Icon";
import styles from "./Navbar.module.css";
import type { CmsGlobalContent, CmsNavigationItem } from "../cms/types";

type NavbarProps = {
    cms?: CmsGlobalContent;
};

function itemsFor(navigation: CmsNavigationItem[] | undefined, menu: CmsNavigationItem["menu"]) {
    return (navigation ?? []).filter((item) => item.menu === menu).sort((a, b) => a.sort - b.sort);
}

function isDownloadLink(href: string) {
    return href.endsWith(".pdf");
}

function withGlossaryDownload<T extends { href: string; label: string; body?: string }>(items: T[]) {
    return items.map((item) => (
        item.href === "/glossary" || item.label.toLowerCase().includes("glossary")
            ? {
                ...item,
                href: "/downloads/glossary-of-terms.pdf",
                label: "Glossary of Terms",
                body: item.body ?? "Downloadable plain-English legal explanations.",
            }
            : item
    ));
}

export default function Navbar({ cms }: NavbarProps) {
    const navRef = useRef<HTMLElement | null>(null);
    const headroomRef = useRef<Headroom | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<"services" | "resources" | null>(null);

    const fallbackServices = [
        { href: "/wills", label: "Wills", body: "Clear wishes, properly recorded." },
        { href: "/trusts", label: "Trusts", body: "Protect assets for the right people." },
        { href: "/lpa", label: "Lasting Powers of Attorney", body: "Choose who can act for you." },
        { href: "/inheritance-tax-planning", label: "Inheritance Tax Planning", body: "Support with mitigating tax." },
        { href: "/care-planning", label: "Care Planning", body: "Plan ahead for later-life decisions." },
        { href: "/business-protection", label: "Business Protection", body: "Keep your business protected." },
        { href: "/agricultural-land", label: "Agricultural Land", body: "Planning for farms and land." },
    ];

    const fallbackResources = [
        { href: "/estate-planning", label: "All Services", body: "A full overview of estate planning." },
        { href: "/extended-services", label: "Extended Services", body: "Probate, advice and related support." },
        { href: "/helpful-info", label: "Helpful Information", body: "A practical planning checklist." },
        { href: "/downloads/glossary-of-terms.pdf", label: "Glossary of Terms", body: "Downloadable plain-English legal explanations." },
        { href: "/faq", label: "FAQ", body: "Answers to common questions." },
    ];
    const primary = itemsFor(cms?.navigation, "primary");
    const services = itemsFor(cms?.navigation, "services").length ? itemsFor(cms?.navigation, "services") : fallbackServices;
    const rawResources = itemsFor(cms?.navigation, "resources");
    const resourcesBase: Array<{ href: string; label: string; body?: string }> = rawResources.length ? rawResources : fallbackResources;
    const resources = withGlossaryDownload(resourcesBase);
    const phone = cms?.tenant.phone ?? "07902 863999";
    const logo = cms?.tenant.logo ?? { src: "/pathway-logo_1.png", alt: "Pathway Estate Planning Specialists" };

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
                <Link href="/" className={styles.logo} aria-label={`${cms?.tenant.name ?? "Pathway Estate Planning"}, home`}>
                    <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={2680}
                        height={880}
                        className={styles.logoImage}
                        style={{ maxWidth: "188px" }}
                        priority
                        unoptimized
                    />
                </Link>

                <div className={styles.links}>
                    {(primary.length ? primary : [{ href: "/", label: "Home", sort: 10 }]).map((item) => (
                        <Link href={item.href} onClick={close} key={item.href}>{item.label}</Link>
                    ))}

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
                                    download={isDownloadLink(resource.href) ? "" : undefined}
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

                </div>

                <div className={styles.desktopCta}>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className={styles.phoneLink}>
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
                            <Image src={logo.src} alt="" width={2680} height={880} className={styles.mobileSheetLogo} unoptimized />
                        </SheetHeader>
                        <div className={styles.mobileSheetLinks}>
                            {(primary.length ? primary : [{ href: "/", label: "Home", sort: 10 }]).map((item) => (
                                <Link href={item.href} onClick={close} key={item.href} className={styles.mobilePrimaryLink}>{item.label}</Link>
                            ))}
                            <Accordion type="multiple" className={styles.mobileAccordion}>
                                <AccordionItem value="services" className={styles.mobileAccordionItem}>
                                    <AccordionTrigger className={styles.mobileAccordionTrigger}>
                                        Services
                                    </AccordionTrigger>
                                    <AccordionContent className={styles.mobileAccordionContent}>
                                        <div className={styles.mobileNestedList}>
                                            {services.map((service) => (
                                                <Link
                                                    key={service.href}
                                                    href={service.href}
                                                    onClick={close}
                                                    className={styles.mobileResourceLink}
                                                >
                                                    <span>{service.label}</span>
                                                    {service.body ? <small>{service.body}</small> : null}
                                                </Link>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="resources" className={styles.mobileAccordionItem}>
                                    <AccordionTrigger className={styles.mobileAccordionTrigger}>
                                        Resources
                                    </AccordionTrigger>
                                    <AccordionContent className={styles.mobileAccordionContent}>
                                        <div className={styles.mobileNestedList}>
                                            {resources.map((resource) => (
                                                <Link
                                                    key={resource.href}
                                                    href={resource.href}
                                                    download={isDownloadLink(resource.href) ? "" : undefined}
                                                    onClick={close}
                                                    className={styles.mobileResourceLink}
                                                >
                                                    <span>{resource.label}</span>
                                                    {resource.body ? <small>{resource.body}</small> : null}
                                                </Link>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <div className={styles.mobileSheetActions}>
                            <a href={`tel:${phone.replace(/\s+/g, "")}`} className={styles.mobileSheetPhone} onClick={close}>
                                <Icon name="phone" size="sm" />
                                {phone}
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
