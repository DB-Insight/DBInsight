import { StaticTreeDataProvider } from "react-complex-tree";
import styles from "./index.module.css";

export default () => {
  // const dataProvider = new StaticTreeDataProvider(
  //   {
  //     root: {
  //       index: "root",
  //       isFolder: true,
  //       children: ["tables", "queries"],
  //       data: "root",
  //     },
  //     tables: {
  //       index: "tables",
  //       isFolder: true,
  //       children: ["tablesPanel"],
  //       data: "Tables",
  //     },
  //     tablesPanel: {
  //       index: "tablesPanel",
  //       data: "tablesPanel",
  //     },
  //     queries: {
  //       index: "queries",
  //       isFolder: true,
  //       children: ["queriesPanel"],
  //       data: "Queries",
  //     },
  //     queriesPanel: {
  //       index: "queriesPanel",
  //       data: "queriesPanel",
  //     },
  //   },
  //   (item, newName) => ({
  //     ...item,
  //     data: newName,
  //   }),
  // );
  return (
    <div className={styles.container}>
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
    </div>
  );
};
