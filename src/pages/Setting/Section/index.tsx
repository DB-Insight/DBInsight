import { PropsWithChildren } from "react";
import styles from "./index.module.css";

interface SectionProps extends PropsWithChildren {
  title: string;
}

export default ({ title, children }: SectionProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
};
