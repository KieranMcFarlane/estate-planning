import Section from './layout/Section';
import Grid from './layout/Grid';
import Card from './base/Card';
import styles from './AboutUs.module.css';

export default function AboutUs() {
    const values = [
        {
            title: "Established 2006",
            description: "Nearly 20 years serving families across Leamington Spa and the Midlands"
        },
        {
            title: "1,000+ families helped",
            description: "From first-time Will writers to complex estate planning"
        },
        {
            title: "5-star rated",
            description: "Consistently excellent reviews on Google from satisfied clients"
        },
        {
            title: "Clear, jargon-free guidance",
            description: "We explain everything in plain English — guaranteed"
        },
        {
            title: "STEP qualified",
            description: "Members of the Society of Trust and Estate Practitioners"
        },
        {
            title: "Home visits available",
            description: "Evening and weekend appointments across the region"
        }
    ];

    return (
        <Section variant="alt" size="lg" id="about">
            <div className={styles.header}>
                <h2>A friendly team you can trust</h2>
                <p className={styles.intro}>
                    Estate planning is one of those things many people <em>mean</em> to do — but it's easy to put off.
                    It can feel emotional, complicated, or simply difficult to start.
                </p>
                <p className={styles.emphasis}>That's completely normal.</p>
            </div>

            <div className={styles.content}>
                <p>
                    At <strong>Pathway Estate Planning</strong>, we're here to make it easier.
                    Since <strong>2006</strong>, we've helped <strong>over 1,000 families</strong> across
                    Leamington Spa, Warwick, and the Midlands protect what matters most —
                    with clear advice and a calm, supportive approach.
                </p>
                <p>
                    We take the time to listen properly, understand your situation, and guide you through
                    the right next steps in plain English. Whether you need a straightforward Will or more
                    detailed planning, we'll help you feel confident in every decision.
                </p>
                <div className={styles.highlight}>
                    <p>
                        <strong>Because this isn't just paperwork.</strong><br />
                        It's about protecting the people you love — and making sure your wishes are followed.
                    </p>
                </div>
            </div>

            <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md" className={styles.valuesGrid}>
                {values.map((value, index) => (
                    <Card key={index} variant="elevated" padding="md">
                        <h3 className={styles.valueTitle}>{value.title}</h3>
                        <p className={styles.valueDesc}>{value.description}</p>
                    </Card>
                ))}
            </Grid>
        </Section>
    );
}
