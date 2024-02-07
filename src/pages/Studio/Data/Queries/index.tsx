import { Input } from "@/components/ui/input";
import folderModel, { Folder } from "@/models/folder.model";
import { useReactive } from "ahooks";
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
import { useEffect, useMemo, useRef } from "react";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const InlineEditInput = ({
  defaultValue,
  onSave,
}: {
  defaultValue: string;
  onSave: (value: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const state = useReactive({
    value: defaultValue,
  });
  useEffect(() => {
    if (!!ref.current) {
      setTimeout(() => {
        ref.current!.focus();
      }, 300);
    }
  }, [ref.current, defaultValue]);
  return (
    <Input
      ref={ref}
      className="h-6 w-full text-xs"
      autoFocus
      value={state.value}
      onChange={(e) => {
        state.value = e.target.value;
      }}
      onBlur={() => {
        onSave(state.value);
      }}
    />
  );
};

interface TablesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default ({
  params: { open, onOpenChange },
}: IPaneviewPanelProps<TablesProps>) => {
  const { folder } = useSnapshot(folderModel.state);
  const state = useReactive<{
    filter: string;
  }>({
    filter: "",
  });

  useEffect(() => {
    folderModel.load();

    const onFileChange = (e: IpcRendererEvent, folder: Folder) => {
      folderModel.init(folder);
    };

    window.API.on("folder-change", onFileChange);
    return () => {
      window.API.off("folder-change", onFileChange);
    };
  }, []);

  const dataProvider = useMemo(() => {
    return new StaticTreeDataProvider(folder as any);
  }, [folder]);

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
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={(item) => item.data}
        viewState={{}}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
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
            <li
              {...context.itemContainerWithChildrenProps}
              {...context.interactiveElementProps}
            >
              <div className={styles.item}>
                {item.isFolder ? (
                  context.isExpanded ? (
                    <FolderOpenIcon className="h-4 w-4" />
                  ) : (
                    <FolderIcon className="h-4 w-4" />
                  )
                ) : (
                  <FileCode2 className="ml-5 h-4 w-4" />
                )}
                <div className={styles.name}>{title}</div>
              </div>
            </li>
          );
        }}
      >
        <Tree treeId="tree" rootItem="root" />
      </UncontrolledTreeEnvironment>
    </div>
  );
};
