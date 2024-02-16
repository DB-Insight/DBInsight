import { PaneviewReact, PaneviewReadyEvent } from "dockview";
import Queries from "./Queries";
import QueryHeader from "./Queries/Header";
import Tables from "./Tables";
import TableHeader from "./Tables/Header";
import styles from "./index.module.css";

export default () => {
  const onReady = (event: PaneviewReadyEvent) => {
    const queryPanel = event.api.addPanel({
      id: "queries",
      title: "queries",
      component: "Queries",
      headerComponent: "QueryHeader",
      params: {
        open: false,
        onOpenChange: (open: boolean) => {
          queryPanel.api.updateParameters({ open });
        },
      },
      isExpanded: true,
    });

    const tablePanel = event.api.addPanel({
      id: "tables",
      title: "tables",
      component: "Tables",
      headerComponent: "TableHeader",
      params: {
        open: false,
        onOpenChange: (open: boolean) => {
          tablePanel.api.updateParameters({ open });
        },
      },
      isExpanded: true,
    });
  };
  return (
    <div className={styles.container}>
      <PaneviewReact
        className={"dockview-theme-abyss"}
        onReady={onReady}
        components={{
          Queries,
          Tables,
        }}
        headerComponents={{
          QueryHeader,
          TableHeader,
        }}
      />
    </div>
  );
};
