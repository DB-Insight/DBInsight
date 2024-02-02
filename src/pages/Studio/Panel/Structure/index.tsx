import { Allotment } from "allotment";
import IndexesGrid from "./IndexesGrid";
import StructureGrid from "./StructureGrid";
import styles from "./index.module.css";

export default () => {
  return (
    <div className={styles.container}>
      <Allotment defaultSizes={[60, 40]} vertical>
        <Allotment.Pane key="structure" snap minSize={100}>
          <StructureGrid />
        </Allotment.Pane>
        <Allotment.Pane key="indexes" snap minSize={100}>
          <IndexesGrid />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
