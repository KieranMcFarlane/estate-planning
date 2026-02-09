'use client';

import { useState } from 'react';
import styles from './FAQAccordion.module.css';
import Icon from '../base/Icon';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export default function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`${styles.accordion} ${className}`.trim()}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.item} ${openIndex === index ? styles.open : ''}`}
        >
          <button
            className={styles.question}
            onClick={() => toggle(index)}
            aria-expanded={openIndex === index}
          >
            <span className={styles.questionText}>{item.question}</span>
            <Icon
              name={openIndex === index ? 'chevron-up' : 'chevron-down'}
              size="md"
              className={styles.icon}
            />
          </button>
          <div className={styles.answerWrapper}>
            <div className={styles.answer}>
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
