import styles from './FAQSection.module.css';
import FAQAccordion from './sections/FAQAccordion';

export default function FAQSection() {
    const faqs = [
        {
            question: "Do I really need a Will?",
            answer: "Yes. Without a Will, your estate is distributed according to strict government rules — not your wishes. This can mean unmarried partners receive nothing, estranged family members inherit, or your children's guardianship is decided by courts. A Will ensures your wishes are followed and your loved ones are protected."
        },
        {
            question: "What's the difference between a Will and a Trust?",
            answer: "A Will takes effect when you die and distributes your assets. A Trust can protect your assets during your lifetime and beyond. Trusts are particularly useful for: protecting your home from care fees, providing for vulnerable family members, reducing inheritance tax, and ensuring children from previous relationships are provided for."
        },
        {
            question: "How much does it cost?",
            answer: "Our Wills start from a fixed fee, with no hidden charges. We're transparent about pricing from the first conversation — no hourly billing, no surprises. More complex situations (Trusts, inheritance tax planning, blended families) require more work, and we'll quote upfront before proceeding."
        },
        {
            question: "Do I need a Lasting Power of Attorney?",
            answer: "Yes — and it's just as important as a Will. A Will protects your family after you die; an LPA protects you while you're alive but unable to make decisions. Without an LPA, your family would need to apply to the Court of Protection — a stressful, expensive process that can take months. Everyone over 18 should consider having one."
        },
        {
            question: "How long does the process take?",
            answer: "Most clients complete their estate plan in 2-3 meetings, typically within 30 days of the first consultation. We never rush you — some clients prefer to move quickly, others take time to consider decisions. We move at your pace."
        },
        {
            question: "Do you offer home visits?",
            answer: "Yes. We can visit you at home across Leamington Spa, Warwick, and surrounding areas. Home visits are particularly helpful for elderly clients, those with mobility issues, or families who prefer to discuss sensitive matters in familiar surroundings. Evening and weekend appointments are also available."
        },
        {
            question: "What if I already have a Will?",
            answer: "If your circumstances have changed — marriage, divorce, children, moving house, or significant changes to your assets — your existing Will may no longer be fit for purpose. We offer free reviews of existing Wills and can update or rewrite them as needed."
        },
        {
            question: "Are you qualified and insured?",
            answer: "Absolutely. We hold professional indemnity insurance and are members of STEP (Society of Trust and Estate Practitioners) — the gold standard for estate planning professionals. This gives you peace of mind that your documents are legally sound and your affairs are in safe hands."
        }
    ];

    return (
        <section className={`section ${styles.faqSection}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>Frequently asked questions</h2>
                    <p className={styles.intro}>
                        Got questions? We've got answers. If you don't see what you're looking for, give us a call — we're happy to help.
                    </p>
                </div>
                <FAQAccordion items={faqs} />
                <div className={styles.cta}>
                    <p>Still have questions?</p>
                    <a href="/contact" className={styles.contactLink}>Book a free call to chat through your situation</a>
                </div>
            </div>
        </section>
    );
}
