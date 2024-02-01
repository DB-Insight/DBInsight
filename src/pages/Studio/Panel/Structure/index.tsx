import { Allotment } from "allotment";
import IndexGrid from "./IndexGrid";
import styles from "./index.module.css";

export default () => {
  return (
    <div className={styles.container}>
      <Allotment defaultSizes={[60, 40]} vertical>
        <Allotment.Pane key="structure" snap minSize={100}>
          1
        </Allotment.Pane>
        <Allotment.Pane key="indexes" snap minSize={100}>
          <IndexGrid />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
