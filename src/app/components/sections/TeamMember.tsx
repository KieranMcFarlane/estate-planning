import Image from 'next/image';
import styles from './TeamMember.module.css';

export interface TeamMemberProps {
    name: string;
    role: string;
    bio: string;
    imageSrc: string;
    imageAlt: string;
    qualifications?: string[];
}

interface TeamSectionProps {
    members: TeamMemberProps[];
    heading?: string;
    description?: string;
}

export default function TeamMember({
    members,
    heading = "Meet your estate planning team",
    description = "Experienced, qualified professionals who understand that estate planning is personal."
}: TeamSectionProps) {
    return (
        <section className={`section ${styles.teamSection}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{heading}</h2>
                    <p className={styles.description}>{description}</p>
                </div>
                <div className={styles.grid}>
                    {members.map((member, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={member.imageSrc}
                                    alt={member.imageAlt}
                                    width={300}
                                    height={300}
                                    className={styles.image}
                                />
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.name}>{member.name}</h3>
                                <p className={styles.role}>{member.role}</p>
                                <p className={styles.bio}>{member.bio}</p>
                                {member.qualifications && member.qualifications.length > 0 && (
                                    <div className={styles.qualifications}>
                                        {member.qualifications.map((qual, qualIndex) => (
                                            <span key={qualIndex} className={styles.qualification}>
                                                {qual}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
