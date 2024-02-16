import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import folderModel from "@/models/folder.model";
import { useReactive } from "ahooks";
import { IPaneviewPanelProps } from "dockview";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FilePlus2Icon,
  FolderPlusIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { useEffect } from "react";
import styles from "./index.module.css";

export default (props: IPaneviewPanelProps<any>) => {
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
                    isFolder: false,
                  });
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Create a new file</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FolderPlusIcon
                className="invisible h-4 w-4 hover:text-gray-200 group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  props.api.updateParameters({
                    open: true,
                    isFolder: true,
                  });
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Create a new folder</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <RefreshCcwIcon
                className="invisible h-4 w-4 cursor-pointer hover:text-gray-200 group-hover:visible"
                onClick={(e) => {
                  e.stopPropagation();
                  folderModel.load();
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Reload folders</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
