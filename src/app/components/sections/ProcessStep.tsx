import styles from './ProcessStep.module.css';
import Icon from '../base/Icon';

export interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
}

export default function ProcessStep({ number, title, description }: ProcessStepProps) {
  return (
    <div className={styles.step}>
      <div className={styles.numberWrapper}>
        <span className={styles.number}>{number}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
