import Section from './layout/Section';
import ServiceCard from './sections/ServiceCard';
import styles from './ServiceCards.module.css';

export default function ServiceCards() {
    const services = [
        {
            title: "Wills",
            description: "Protect your loved ones and ensure your wishes are followed.",
            href: "/wills",
            iconName: "will"
        },
        {
            title: "Trusts",
            description: "Add extra protection and control how your assets are passed on.",
            href: "/trusts",
            iconName: "shield"
        },
        {
            title: "Lasting Powers of Attorney",
            description: "Choose who can make decisions for you if you are unable to.",
            href: "/lpa",
            iconName: "users"
        }
    ];

    return (
        <Section variant="default" size="lg">
            <div className={styles.header}>
                <h2>Our core services</h2>
                <p className={styles.intro}>
                    Everything you need to protect your family&apos;s future
                </p>
            </div>
            <div className={styles.grid}>
                {services.map((service, index) => (
                    <ServiceCard
                        key={index}
                        title={service.title}
                        description={service.description}
                        href={service.href}
                        iconName={service.iconName}
                    />
                ))}
            </div>
        </Section>
    );
}
