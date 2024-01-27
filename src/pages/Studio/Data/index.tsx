import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const components = {
  default: (props: IPaneviewPanelProps<{ title: string }>) => {
    return <Tables />;
  },
};

const HeaderComponent = (props: IPaneviewPanelProps<{ title: string }>) => {
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
    <div className={styles.header} onClick={onClick}>
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
                className="h-4 w-4 hover:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
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
                className="h-4 w-4 cursor-pointer hover:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
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

export default () => {
  const onReady = (event: PaneviewReadyEvent) => {
    event.api.addPanel({
      id: "tables",
      title: "tables",
      headerComponent: "header",
      component: "default",
    });

    event.api.addPanel({
      id: "queries",
      title: "queries",
      headerComponent: "header",
      component: "default",
    });

    event.api.addPanel({
      id: "views",
      title: "views",
      headerComponent: "header",
      component: "default",
    });
  };
  return (
    <div className={styles.container}>
      <PaneviewReact
        className={"dockview-theme-abyss"}
        components={components}
        headerComponents={{
          header: HeaderComponent,
        }}
        onReady={onReady}
      />
    </div>
  );
};
