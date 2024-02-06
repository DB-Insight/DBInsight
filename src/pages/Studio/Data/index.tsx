import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import {
  IPaneviewPanelProps,
  PaneviewReact,
  PaneviewReadyEvent,
} from "dockview";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FilePlus2Icon,
  RefreshCcwIcon,
} from "lucide-react";
import { useEffect } from "react";
import Tables from "./Tables";
import styles from "./index.module.css";
import fileModel from "@/models/file.model";

const components = {
  tablePanel: Tables,
  queryPanel: () => {
    useEffect(() => {
      fileModel.load();

      const onFileChange = (folder: any) => {
        console.log(folder);
      };

      window.API.on("file-change", onFileChange);
      return () => {
        window.API.off("file-change", onFileChange);
      };
    }, []);
    return <div>11</div>;
  },
};

const TableHeaderComponent = (props: IPaneviewPanelProps<any>) => {
  const state = useReactive({
    expanded: props.api.isExpanded,
  });
  useEffect(() => {
    const disposable = props.api.onDidExpansionChange((event) => {
      state.expanded = event.isExpanded;
    });
    return () => {
      disposable.dispose();
    };
  }, []);
  const onClick = () => {
    props.api.setExpanded(!state.expanded);
  };
  return (
    <div className={`${styles.header} group`} onClick={onClick}>
      {state.expanded ? (
        <ChevronDownIcon className="h-4 w-4" />
      ) : (
        <ChevronRightIcon className="h-4 w-4" />
      )}
      <div className={styles.name}>{props.title}</div>
      <div className="flex items-center justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FilePlus2Icon
                className="invisible h-4 w-4 hover:text-gray-200 group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  props.api.updateParameters({
                    open: true,
                  });
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Create a new table</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <RefreshCcwIcon
                className="invisible h-4 w-4 cursor-pointer hover:text-gray-200 group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  connectionModel.getTables();
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Reload tables</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const QueryHeaderComponent = (props: IPaneviewPanelProps<any>) => {
  const state = useReactive({
    expanded: props.api.isExpanded,
  });
  useEffect(() => {
    const disposable = props.api.onDidExpansionChange((event) => {
      state.expanded = event.isExpanded;
    });
    return () => {
      disposable.dispose();
    };
  }, []);
  const onClick = () => {
    props.api.setExpanded(!state.expanded);
  };
  return (
    <div className={`${styles.header} group`} onClick={onClick}>
      {state.expanded ? (
        <ChevronDownIcon className="h-4 w-4" />
      ) : (
        <ChevronRightIcon className="h-4 w-4" />
      )}
      <div className={styles.name}>{props.title}</div>
      <div className="flex items-center justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FilePlus2Icon
                className="invisible h-4 w-4 hover:text-gray-200 group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  props.api.updateParameters({
                    open: true,
                  });
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Create a new table</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <RefreshCcwIcon
                className="invisible h-4 w-4 cursor-pointer hover:text-gray-200 group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  connectionModel.getTables();
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Reload tables</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const headerComponents = {
  tableHeader: TableHeaderComponent,
  queryHeader: QueryHeaderComponent,
};

export default () => {
  const onReady = (event: PaneviewReadyEvent) => {
    const tablePanel = event.api.addPanel({
      id: "tables",
      title: "tables",
      component: "tablePanel",
      headerComponent: "tableHeader",
      params: {
        open: false,
        onOpenChange: (open: boolean) => {
          tablePanel.api.updateParameters({ open });
        },
      },
      isExpanded: true,
    });

    const queryPanel = event.api.addPanel({
      id: "queries",
      title: "queries",
      component: "queryPanel",
      headerComponent: "queryHeader",
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
        components={components}
        headerComponents={headerComponents}
        onReady={onReady}
      />
    </div>
  );
};
