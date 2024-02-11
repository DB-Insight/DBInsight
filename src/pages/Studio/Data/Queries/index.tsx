import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import folderModel, { Folder } from "@/models/folder.model";
import { useReactive, useThrottleFn } from "ahooks";
import { IPaneviewPanelProps } from "dockview";
import { IpcRendererEvent } from "electron";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCode2,
  FolderIcon,
  FolderOpenIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  TreeItemIndex,
} from "react-complex-tree";
import Highlighter from "react-highlight-words";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

interface TablesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default ({
  params: { open, onOpenChange },
}: IPaneviewPanelProps<TablesProps>) => {
  const { folder, selectedItems, expandedItems, focusedItem, context } =
    useSnapshot(folderModel.state);
  const state = useReactive<{
    filter: string;
  }>({
    filter: "",
  });

  const { run: onFileChange } = useThrottleFn(
    (e: IpcRendererEvent, folder: Folder) => {
      folderModel.init(folder);
      console.log("onFileChange");
    },
  );

  useEffect(() => {
    folderModel.load();
    window.API.on("folder-change", onFileChange);
    return () => {
      window.API.off("folder-change", onFileChange);
    };
  }, [onFileChange]);

  const items = useMemo(() => {
    let data: any = {};
    if (!!state.filter) {
      Object.keys(folder)
        .filter(
          (k) =>
            k.includes(state.filter) ||
            folder[k]!.children?.some((o: TreeItemIndex) =>
              o.toString().includes(state.filter),
            ),
        )
        .forEach((k: string) => {
          data[k] = folder[k];
        });
    } else {
      data = { ...folder };
    }
    return data;
  }, [folder, state.filter]);
  return (
    <div className={styles.container}>
      <div className={styles.filter}>
        <SearchIcon className="absolute bottom-0 left-4 top-0 my-auto h-4 w-4 text-gray-500" />
        <Input
          className="h-8 rounded-md border-none pl-8 pr-4 text-xs"
          type="text"
          placeholder="Filter"
          value={state.filter}
          onChange={(event) => (state.filter = event.target.value)}
        />
      </div>
      <ControlledTreeEnvironment
        items={items}
        getItemTitle={(item) => item.data}
        viewState={{
          ["tree"]: {
            selectedItems,
            expandedItems,
            focusedItem,
          } as any,
        }}
        canSearch={false}
        canRename={true}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
        onFocusItem={(item) => folderModel.onFocusItem(item)}
        onSelectItems={(items) => folderModel.onSelectItems(items)}
        onExpandItem={(item) => folderModel.onExpandItem(item)}
        onCollapseItem={(item) => folderModel.onCollapseItem(item)}
        onRenameItem={async (item, name) => {
          if (!item.isFolder && !name.endsWith(".sql")) {
            name = `${name}.sql`;
          }
          const path = await folderModel.rename(item.index.toString(), name);
          folderModel.onFocusItem({ index: path });
          folderModel.onSelectItems([path]);
        }}
        renderItemArrow={({ item, context }) =>
          item.isFolder ? (
            <span {...context.arrowProps}>
              {context.isExpanded ? (
                <ChevronDownIcon className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRightIcon className="mr-1 h-4 w-4" />
              )}
            </span>
          ) : null
        }
        renderItemTitle={({ title, item, context }) => {
          return (
            <div
              className={styles.item}
              onContextMenu={() => {
                folderModel.onContextChange(context);
                context.selectItem();
              }}
            >
              {item.isFolder ? (
                context.isExpanded ? (
                  <FolderOpenIcon className="h-4 w-4" />
                ) : (
                  <FolderIcon className="h-4 w-4" />
                )
              ) : (
                <FileCode2 className="ml-5 h-4 w-4" />
              )}
              <div className={styles.name}>
                <Highlighter
                  searchWords={[state.filter]}
                  autoEscape={true}
                  textToHighlight={title}
                  onDoubleClick={() => {
                    context.startRenamingItem();
                  }}
                />
              </div>
            </div>
          );
        }}
        renderItemsContainer={({ children, info }) => {
          return (
            <ContextMenu
              onOpenChange={(open) => {
                if (!open) {
                  folderModel.onContextChange(null);
                }
              }}
            >
              <ContextMenuTrigger>{children}</ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => {}}>Copy</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => {
                    context?.startRenamingItem();
                  }}
                >
                  Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={() => {}}>Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        }}
      >
        <Tree treeId="tree" rootItem="root" />
      </ControlledTreeEnvironment>
    </div>
  );
};
