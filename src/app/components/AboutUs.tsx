import Section from './layout/Section';
import Grid from './layout/Grid';
import Card from './base/Card';
import styles from './AboutUs.module.css';

export default function AboutUs() {
    const values = [
        {
            title: "Nearly two decades of experience",
            description: "Helping individuals and families protect what matters most"
        },
        {
            title: "Clear, jargon-free guidance",
            description: "We explain everything in plain English"
        },
        {
            title: "A calm, supportive approach",
            description: "We go at your pace, never rushing or judging"
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
                    We bring nearly <strong>two decades of experience</strong> helping individuals and families
                    protect what matters most — with clear advice and a calm, supportive approach.
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

            <Grid cols={{ mobile: 1, tablet: 3 }} gap="md" className={styles.valuesGrid}>
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
