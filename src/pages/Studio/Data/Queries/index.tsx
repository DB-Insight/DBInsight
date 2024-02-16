import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import folderModel, { Folder } from "@/models/folder.model";
import { FileSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactive, useThrottleFn } from "ahooks";
import { IPaneviewPanelProps } from "dockview";
import { IpcRendererEvent } from "electron";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCode2,
  FolderIcon,
  FolderOpenIcon,
  RotateCwIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  TreeItemIndex,
} from "react-complex-tree";
import Highlighter from "react-highlight-words";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSnapshot } from "valtio";
import * as z from "zod";
import styles from "./index.module.css";
import InlineEditInput from "@/components/InlineEditInput";

interface QueriesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFolder: boolean;
}

export default ({
  params: { open, onOpenChange, isFolder = false },
}: IPaneviewPanelProps<QueriesProps>) => {
  const { folder, selectedItems, expandedItems, focusedItem } = useSnapshot(
    folderModel.state,
  );
  const state = useReactive<{
    filter: string;
    editName: string;
  }>({
    filter: "",
    editName: "",
  });

  const form = useForm<z.infer<typeof FileSchema>>({
    resolver: zodResolver(FileSchema),
    defaultValues: {
      path: "",
    },
  });

  const { run: onFileChange } = useThrottleFn(
    (e: IpcRendererEvent, folder: Folder) => {
      folderModel.init(folder);
    },
  );

  useEffect(() => {
    folderModel.load();
    window.API.on("folder-change", onFileChange);
    return () => {
      window.API.off("folder-change", onFileChange);
    };
  }, [onFileChange]);

  const onSubmit = async ({ path: name }: z.infer<typeof FileSchema>) => {
    try {
      const path = await folderModel.create(name, isFolder);
      folderModel.onFocusItem({ index: path });
      folderModel.onSelectItems([path]);
      onOpenChange(false);
    } catch (err: any) {
      const data = JSON.parse(err.message);
      toast.error(`${data[0]?.code}`, {
        description: data[0].message,
        duration: 2000,
      });
    }
  };

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Create a new {isFolder ? "folder" : "file"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-300">
                    {isFolder ? "Folder" : "File"} Name*
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter ${isFolder ? "folder" : "file"} Name`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <DialogFooter>
            <Button
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              onClick={form.handleSubmit((values) => {
                onSubmit(values);
              })}
            >
              {form.formState.isSubmitting && (
                <RotateCwIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        getItemTitle={(item) => item?.data}
        viewState={{
          ["tree"]: {
            selectedItems,
            expandedItems,
            focusedItem,
          } as any,
        }}
        canSearch={false}
        canRename={false}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
        onFocusItem={(item) => folderModel.onFocusItem(item)}
        onSelectItems={(items) => folderModel.onSelectItems(items)}
        onExpandItem={(item) => folderModel.onExpandItem(item)}
        onCollapseItem={(item) => folderModel.onCollapseItem(item)}
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
        renderItem={({ depth, arrow, item, children, context }) => {
          return (
            <li
              {...context.itemContainerWithChildrenProps}
              onClick={(e) => {
                folderModel.onSelectItems([item.index.toString()]);
                folderModel.onFocusItem([item.index.toString()]);
                if (item.isFolder) {
                  if (context.isExpanded) {
                    folderModel.onCollapseItem({
                      index: item.index.toString(),
                    });
                  } else {
                    folderModel.onExpandItem({
                      index: item.index.toString(),
                    });
                  }
                }
                e.stopPropagation();
              }}
              onContextMenu={(e) => {
                folderModel.onSelectItems([item.index.toString()]);
                e.stopPropagation();
              }}
            >
              <ContextMenu>
                <ContextMenuTrigger>
                  <div
                    {...context.itemContainerWithoutChildrenProps}
                    className={`${styles.node} ${selectedItems?.includes(item.index) ? styles.active : ""}`}
                    style={{ paddingLeft: (depth + 1) * 14 }}
                  >
                    {arrow}
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
                      <div className={styles.name}>
                        {state.editName === item.data ? (
                          <InlineEditInput
                            defaultValue={item.data}
                            onSave={async (value) => {
                              try {
                                if (value !== state.editName) {
                                  if (
                                    !item.isFolder &&
                                    !value.endsWith(".sql")
                                  ) {
                                    value = `${value}.sql`;
                                  }
                                  const path = await folderModel.rename(
                                    item.index.toString(),
                                    value,
                                  );
                                  folderModel.onFocusItem({ index: path });
                                  folderModel.onSelectItems([path]);
                                }
                              } catch (err: any) {
                                console.log(err);
                                const data = JSON.parse(err.message);
                                toast.error(`${data[0]?.code}`, {
                                  description: data[0].message,
                                  duration: 2000,
                                });
                              } finally {
                                state.editName = "";
                              }
                            }}
                          />
                        ) : (
                          <Highlighter
                            searchWords={[state.filter]}
                            autoEscape={true}
                            textToHighlight={item.data}
                            onDoubleClick={() => {
                              state.editName = item.data;
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => {}}>
                    Create a new file
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {}}>
                    Create a new folder
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => {
                      state.editName = item.data;
                    }}
                  >
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={async () => {
                      await folderModel.delete(item.index.toString());
                    }}
                  >
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              {children}
            </li>
          );
        }}
      >
        <Tree treeId="tree" rootItem="root" />
      </ControlledTreeEnvironment>
    </div>
  );
};
