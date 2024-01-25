import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReactive } from "ahooks";
import { FilePlus2Icon, RefreshCcwIcon, SearchIcon } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import Tables from "./Tables";
import styles from "./index.module.css";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default () => {
  const state = useReactive<{
    filter: string;
  }>({
    filter: "",
  });
  const dataProvider = new StaticTreeDataProvider(
    {
      root: {
        index: "root",
        isFolder: true,
        children: ["tables", "queries"],
        data: "root",
      },
      tables: {
        index: "tables",
        isFolder: true,
        children: ["tablesPanel"],
        data: "Tables",
      },
      tablesPanel: {
        index: "tablesPanel",
        data: "tablesPanel",
      },
      queries: {
        index: "queries",
        isFolder: true,
        children: ["queriesPanel"],
        data: "Queries",
      },
      queriesPanel: {
        index: "queriesPanel",
        data: "queriesPanel",
      },
    },
    (item, newName) => ({
      ...item,
      data: newName,
    }),
  );
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
      {/* <UncontrolledTreeEnvironment
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
        renderItemsContainer={({ children }) => (
          <OverlayScrollbarsComponent defer>
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
            return <Tables />;
          }
          return (
            <div {...context.itemContainerWithChildrenProps}>
              <div
                className={styles.header}
                {...context.itemContainerWithoutChildrenProps}
                {...context.interactiveElementProps}
              >
                {arrow}
                <div className={styles.name}>{title}</div>
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
      </UncontrolledTreeEnvironment> */}
      <OverlayScrollbarsComponent defer>
        <Accordion type="multiple" className="w-full pb-10">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              <Tables />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              <Tables />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              <Tables />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </OverlayScrollbarsComponent>
    </div>
  );
};
