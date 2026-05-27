import Link from "next/link";
import Image from "next/image";
import Icon from "./base/Icon";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.column}>
                    <Link href="/" className={styles.logo} aria-label="Pathway Estate Planning, home">
                        <Image src="/pathway-white.png" alt="Pathway Estate Planning Specialists" width={2680} height={880} className={styles.logoImage} />
                    </Link>
                    <p className={styles.tagline}>Clear, practical estate planning for individuals and families across Warwickshire. Handled with care.</p>

                    {/* Trust Indicators */}
                    <div className={styles.trustBadges}>
                        <div className={styles.trustBadge}>
                            <span className={styles.trustIcon}>★★★★★</span>
                            <span className={styles.trustText}>5-star rated</span>
                        </div>
                        <div className={styles.trustBadge}>
                            <span className={styles.trustIcon}>✓</span>
                            <span className={styles.trustText}>STEP qualified</span>
                        </div>
                        <div className={styles.trustBadge}>
                            <span className={styles.trustIcon}>£</span>
                            <span className={styles.trustText}>No hidden fees</span>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className={styles.contact}>
                        <a href="tel:07902863999" className={styles.contactLink}>
                            <Icon name="phone" size="sm" />
                            <div>
                                <span className={styles.contactLabel}>Call us</span>
                                <span className={styles.contactNumber}>07902 863999</span>
                            </div>
                        </a>
                        <a href="mailto:info@pathwayestateplanning.co.uk" className={styles.contactLink}>
                            <Icon name="mail" size="sm" />
                            <span>info@pathwayestateplanning.co.uk</span>
                        </a>
                    </div>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Estate Planning</h4>
                    <ul className={styles.list}>
                        <li><Link href="/wills">Wills</Link></li>
                        <li><Link href="/trusts">Trusts</Link></li>
                        <li><Link href="/lpa">Lasting Powers of Attorney</Link></li>
                        <li><Link href="/inheritance-tax-planning">Inheritance Tax Planning</Link></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.subheading}>Specialist Services</h4>
                    <ul className={styles.list}>
                        <li><Link href="/asset-protection">Asset Protection</Link></li>
                        <li><Link href="/business-protection">Business Protection</Link></li>
                        <li><Link href="/care-planning">Care Planning</Link></li>
                        <li><Link href="/agricultural-land">Agricultural Land</Link></li>
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
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/how-it-works">How It Works</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                    </ul>
                </div>
            </div>

            {/* Trust & Credentials Bar */}
            <div className={styles.credentials}>
                <div className="container">
                    <div className={styles.credentialsGrid}>
                        <div className={styles.credential}>
                            <strong>Established 2006</strong>
                            <span>Serving Leamington Spa & the Midlands</span>
                        </div>
                        <div className={styles.credential}>
                            <strong>Fully Insured</strong>
                            <span>Professional indemnity coverage</span>
                        </div>
                        <div className={styles.credential}>
                            <strong>1,000+ Families</strong>
                            <span>Helped across the Midlands</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.copyright}>
                <div className="container">
                    <div className={styles.copyrightContent}>
                        <p>&copy; {new Date().getFullYear()} Pathway Estate Planning. All rights reserved.</p>
                        <div className={styles.legalLinks}>
                            <Link href="/privacy">Privacy Policy</Link>
                            <Link href="/terms">Terms of Service</Link>
                            <Link href="/cookies">Cookies</Link>
                            <Link href="/complaints">Complaints</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
