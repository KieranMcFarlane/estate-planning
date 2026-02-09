import Link from "next/link";
import Icon from "./base/Icon";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.column}>
                    <h3 className={styles.heading}>Pathway Estate Planning</h3>
                    <p className={styles.tagline}>Wills, Trusts & Lasting Powers of Attorney in Royal Leamington Spa.</p>
                    <div className={styles.contact}>
                        <a href="tel:07902863999" className={styles.contactLink}>
                            <Icon name="phone" size="sm" />
                            <span>07902 863999</span>
                        </a>
                        <a href="mailto:info@pathwayestateplanning.co.uk" className={styles.contactLink}>
                            <Icon name="mail" size="sm" />
                            <span>info@pathwayestateplanning.co.uk</span>
                        </a>
                    </div>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Services</h4>
                    <ul className={styles.list}>
                        <li><Link href="/wills">Wills</Link></li>
                        <li><Link href="/trusts">Trusts</Link></li>
                        <li><Link href="/lpa">Lasting Powers of Attorney</Link></li>
                        <li><Link href="/inheritance-tax-planning">Inheritance Tax Planning</Link></li>
                        <li><Link href="/asset-protection">Asset Protection</Link></li>
                        <li><Link href="/probate">Probate Support</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Information</h4>
                    <ul className={styles.list}>
                        <li><Link href="/estate-planning">All Services</Link></li>
                        <li><Link href="/extended-services">Extended Services</Link></li>
                        <li><Link href="/faq">FAQ</Link></li>
                        <li><Link href="/glossary">Glossary</Link></li>
                        <li><Link href="/helpful-info">Helpful Information</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Company</h4>
                    <ul className={styles.list}>
                        <li><Link href="/#about">About Us</Link></li>
                        <li><Link href="/#how-it-works">How It Works</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                    </ul>
                </div>
            </div>
            <div className={styles.copyright}>
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Pathway Estate Planning. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
