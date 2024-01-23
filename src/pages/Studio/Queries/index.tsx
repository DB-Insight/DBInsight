import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import codeModel from "@/models/code.model";
import { useReactive } from "ahooks";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FilePlus2Icon,
  FolderIcon,
  RefreshCcwIcon,
  SearchIcon,
} from "lucide-react";
import TreeView, { INode } from "react-accessible-treeview";
import Highlighter from "react-highlight-words";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const { folder } = useSnapshot(codeModel.state);
  const state = useReactive<{
    filter: string;
  }>({
    filter: "",
  });

  return (
    <div className={styles.container}>
      <div className="relative">
        <SearchIcon className="absolute bottom-0 left-3 top-0 my-auto h-5 w-5 text-gray-500" />
        <Input
          className="rounded-md pl-10 pr-4"
          type="text"
          placeholder="Filter"
          value={state.filter}
          onChange={(event) => (state.filter = event.target.value)}
        />
      </div>
      <div className={styles.header}>
        <div className={styles.name}>Queries</div>
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <FilePlus2Icon className="h-4 w-4 cursor-pointer hover:text-gray-200" />
              </TooltipTrigger>
              <TooltipContent>Create a new table</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RefreshCcwIcon
                  className="h-4 w-4 cursor-pointer hover:text-gray-200"
                  onClick={() => {}}
                />
              </TooltipTrigger>
              <TooltipContent>Reload tables</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className={styles.list}>
        <TreeView
          data={folder as INode[]}
          nodeRenderer={({
            element,
            getNodeProps,
            level,
            isBranch,
            isExpanded,
          }) => (
            <div {...getNodeProps()} style={{ paddingLeft: 20 * (level - 1) }}>
              <div className={styles.item}>
                {isBranch ? (
                  <>
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 min-w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 min-w-4" />
                    )}
                    <FolderIcon className="h-4 w-4 min-w-4" />
                  </>
                ) : (
                  <FileIcon className="ml-5 h-4 w-4 min-w-4" />
                )}
                <div className={styles.name}>
                  <Highlighter
                    searchWords={[state.filter]}
                    autoEscape={true}
                    textToHighlight={element.name}
                  />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};
