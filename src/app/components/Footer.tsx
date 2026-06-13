import Link from "next/link";
import Image from "next/image";
import Icon from "./base/Icon";
import styles from "./Footer.module.css";
import type { CmsGlobalContent, CmsNavigationItem } from "../cms/types";

type FooterProps = {
    cms?: CmsGlobalContent;
};

function itemsFor(navigation: CmsNavigationItem[] | undefined, menu: CmsNavigationItem["menu"]) {
    return (navigation ?? []).filter((item) => item.menu === menu).sort((a, b) => a.sort - b.sort);
}

function isDownloadLink(href: string) {
    return href.endsWith(".pdf");
}

function withGlossaryDownload<T extends { href: string; label: string }>(items: T[]) {
    return items.map((item) => (
        item.href === "/glossary" || item.label.toLowerCase().includes("glossary")
            ? {
                ...item,
                href: "/downloads/glossary-of-terms.pdf",
                label: "Glossary of Terms",
            }
            : item
    ));
}

function LinkList({ items }: { items: Array<{ href: string; label: string }> }) {
    return (
        <ul className={styles.list}>
            {items.map((item) => (
                <li key={item.href}>
                    <Link href={item.href} download={isDownloadLink(item.href) ? "" : undefined}>
                        {item.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default function Footer({ cms }: FooterProps) {
    const tenant = cms?.tenant;
    const logo = tenant?.footerLogo ?? { src: "/pathway-logo_1.png", alt: "Pathway Estate Planning Specialists" };
    const phone = tenant?.phone ?? "07902 863999";
    const email = tenant?.email ?? "info@pathwayestateplanning.co.uk";
    const estateItems = itemsFor(cms?.navigation, "footer_estate");
    const specialistItems = itemsFor(cms?.navigation, "footer_specialist");
    const informationItems = withGlossaryDownload(itemsFor(cms?.navigation, "footer_information"));
    const companyItems = itemsFor(cms?.navigation, "footer_company");
    const legalItems = itemsFor(cms?.navigation, "legal");

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={`${styles.column} ${styles.brandColumn}`}>
                    <Link href="/" className={styles.logo} aria-label={`${tenant?.name ?? "Pathway Estate Planning"}, home`}>
                        <Image src={logo.src} alt={logo.alt} width={2680} height={880} className={styles.logoImage} />
                    </Link>
                    <p className={styles.tagline}>{tenant?.footerTagline ?? "Clear, practical estate planning for individuals and families across Warwickshire. Handled with care."}</p>

                    {/* Contact */}
                    <div className={styles.contact}>
                        <a href={`tel:${phone.replace(/\s+/g, "")}`} className={styles.contactLink}>
                            <Icon name="phone" size="sm" />
                            <div>
                                <span className={styles.contactLabel}>Call us</span>
                                <span className={styles.contactNumber}>{phone}</span>
                            </div>
                        </a>
                        <a href={`mailto:${email}`} className={styles.contactLink}>
                            <Icon name="mail" size="sm" />
                            <span>{email}</span>
                        </a>
                    </div>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Estate Planning</h4>
                    <LinkList items={estateItems.length ? estateItems : [
                        { href: "/wills", label: "Wills" },
                        { href: "/trusts", label: "Trusts" },
                        { href: "/lpa", label: "Lasting Powers of Attorney" },
                        { href: "/inheritance-tax-planning", label: "Inheritance Tax Planning" },
                    ]} />
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Specialist Services</h4>
                    <LinkList items={specialistItems.length ? specialistItems : [
                        { href: "/asset-protection", label: "Asset Protection" },
                        { href: "/business-protection", label: "Business Protection" },
                        { href: "/care-planning", label: "Care Planning" },
                        { href: "/agricultural-land", label: "Agricultural Land" },
                    ]} />
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Information</h4>
                    <LinkList items={informationItems.length ? informationItems : [
                        { href: "/estate-planning", label: "All Services" },
                        { href: "/extended-services", label: "Extended Services" },
                        { href: "/faq", label: "FAQ" },
                        { href: "/downloads/glossary-of-terms.pdf", label: "Glossary of Terms" },
                        { href: "/helpful-info", label: "Helpful Information" },
                    ]} />
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Company</h4>
                    <LinkList items={companyItems.length ? companyItems : [
                        { href: "/about", label: "About Us" },
                        { href: "/how-it-works", label: "How It Works" },
                        { href: "/contact", label: "Contact" },
                    ]} />
                </div>
            </div>

            <div className={styles.copyright}>
                <div className="container">
                    <div className={styles.copyrightContent}>
                        <p>&copy; {new Date().getFullYear()} {tenant?.name ?? "Pathway Estate Planning"}. All rights reserved.</p>
                        <div className={styles.legalLinks}>
                            {(legalItems.length ? legalItems : [
                                { href: "/privacy", label: "Privacy Policy" },
                                { href: "/terms", label: "Terms of Service" },
                                { href: "/cookies", label: "Cookies" },
                                { href: "/complaints", label: "Complaints" },
                            ]).map((item) => (
                                <Link href={item.href} key={item.href}>{item.label}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
