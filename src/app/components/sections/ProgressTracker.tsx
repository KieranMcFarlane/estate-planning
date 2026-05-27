'use client';

import { useState } from 'react';
import styles from './ProgressTracker.module.css';
import Button from '../base/Button';
import Icon from '../base/Icon';

export interface PlanItem {
    id: string;
    label: string;
    description: string;
    completed: boolean;
}

interface ProgressTrackerProps {
    heading?: string;
    description?: string;
    items?: PlanItem[];
    ctaText?: string;
    ctaLink?: string;
}

const defaultItems: PlanItem[] = [
    {
        id: 'will',
        label: 'Will',
        description: 'A legally valid Will that specifies your wishes',
        completed: false
    },
    {
        id: 'lpa-property',
        label: 'Property & Financial LPA',
        description: 'Trusted people to handle your finances if you cannot',
        completed: false
    },
    {
        id: 'lpa-health',
        label: 'Health & Welfare LPA',
        description: 'Trusted people to make medical decisions for you',
        completed: false
    },
    {
        id: 'trust',
        label: 'Trust',
        description: 'Protect assets and reduce inheritance tax',
        completed: false
    },
    {
        id: 'iht',
        label: 'Inheritance Tax Planning',
        description: 'Minimise tax and maximise what you leave behind',
        completed: false
    }
];

export default function ProgressTracker({
    heading = "How complete is your estate plan?",
    description = "Check off the documents you have in place. The more complete your plan, the more protected your family will be.",
    items = defaultItems,
    ctaText = "Complete your plan - book a initial chat",
    ctaLink = "/contact"
}: ProgressTrackerProps) {
    const [planItems, setPlanItems] = useState<PlanItem[]>(items);
    const completedCount = planItems.filter(item => item.completed).length;
    const progress = Math.round((completedCount / planItems.length) * 100);

    const toggleItem = (id: string) => {
        setPlanItems(items => items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const getPlanStrength = () => {
        if (progress === 0) return { label: "Not Started", color: "#B85C5C", variant: "weak" };
        if (progress < 40) return { label: "Getting Started", color: "#C58B63", variant: "developing" };
        if (progress < 80) return { label: "Good Progress", color: "#E8D44C", variant: "good" };
        return { label: "Strong Plan", color: "#5C7A66", variant: "strong" };
    };

    const strength = getPlanStrength();

    return (
        <section className={`section ${styles.progressTracker}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{heading}</h2>
                    <p className={styles.description}>{description}</p>
                </div>

                <div className={styles.trackerCard}>
                    <div className={styles.strengthHeader}>
                        <div className={styles.strengthInfo}>
                            <p className={styles.strengthLabel}>Your Plan Strength</p>
                            <div className={styles.strengthBadge} style={{ backgroundColor: `${strength.color}15`, color: strength.color }}>
                                {strength.label}
                            </div>
                        </div>
                        <div className={styles.progressPercent}>{progress}%</div>
                    </div>

                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%`, backgroundColor: strength.color }}
                        />
                    </div>

                    <div className={styles.itemsList}>
                        {planItems.map((item) => (
                            <label key={item.id} className={styles.item}>
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleItem(item.id)}
                                    className={styles.checkbox}
                                />
                                <span className={styles.checkmark}>
                                    <Icon name="check" size="sm" />
                                </span>
                                <div className={styles.itemContent}>
                                    <span className={styles.itemLabel}>{item.label}</span>
                                    <span className={styles.itemDescription}>{item.description}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.cta}>
                    <p className={styles.ctaText}>
                        {progress === 0 && "Start protecting your family today."}
                        {progress > 0 && progress < 100 && `You've made a great start. Let's help you finish the rest.`}
                        {progress === 100 && "Excellent! You have a comprehensive plan in place."}
                    </p>
                    {progress < 100 && (
                        <Button href={ctaLink} variant="primary" size="lg">
                            {ctaText}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
