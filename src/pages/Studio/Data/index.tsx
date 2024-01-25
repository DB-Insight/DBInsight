import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dataModel from "@/models/data.model";
import { useReactive } from "ahooks";
import { FilePlus2Icon, RefreshCcwIcon, SearchIcon } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const { folder } = useSnapshot(dataModel.state);
  const state = useReactive<{
    filter: string;
  }>({
    filter: "",
  });
  const dataProvider = new StaticTreeDataProvider(folder, (item, newName) => ({
    ...item,
    data: newName,
  }));
  return (
    <div className={styles.container}>
      <div className="relative py-1 pl-1 pr-[20px]">
        <SearchIcon className="absolute bottom-0 left-3 top-0 my-auto h-5 w-5 text-gray-500" />
        <Input
          className="rounded-md pl-10 pr-4"
          type="text"
          placeholder="Filter"
          value={state.filter}
          onChange={(event) => (state.filter = event.target.value)}
        />
      </div>
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={(item) => item.data}
        viewState={{}}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
        renderTreeContainer={({ children }) => (
          <OverlayScrollbarsComponent
            className={styles.tree}
            defer
            // events={{
            //   initialized: () => activateEvent('initialized'),
            //   destroyed: () => activateEvent('destroyed'),
            //   updated: () => activateEvent('updated'),
            //   scroll: () => activateEvent('scroll'),
            // }}
          >
            {children}
          </OverlayScrollbarsComponent>
        )}
        renderItemArrow={({ item, context }) =>
          item.isFolder ? (
            <span {...context.arrowProps}>
              {context.isExpanded ? "v " : "> "}
            </span>
          ) : null
        }
        renderItem={({ title, item, arrow, depth, context, children }) => {
          if (!item.isFolder) {
            return (
              <OverlayScrollbarsComponent className={styles.node} defer>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
                <div className={styles.item}>11</div>
              </OverlayScrollbarsComponent>
            );
          }
          return (
            <div {...context.itemContainerWithChildrenProps}>
              <div
                className={styles.header}
                {...context.itemContainerWithoutChildrenProps}
                {...context.interactiveElementProps}
              >
                {arrow}
                <div className={styles.name}>Tables</div>
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
              {children}
            </div>
          );
        }}
      >
        <Tree treeId="tree-2" rootItem="root" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </div>
  );
};
