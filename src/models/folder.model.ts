import { trpc } from "@/api/client";
import {
  TreeItem,
  TreeItemIndex,
  TreeItemRenderContext,
} from "react-complex-tree";
import { toast } from "sonner";
import { proxy } from "valtio";

export type Folder = Record<TreeItemIndex, TreeItem<any>>;

const state = proxy<{
  context: TreeItemRenderContext<never> | null;
  folder: Folder;
  selectedItems?: TreeItemIndex[];
  expandedItems?: TreeItemIndex[];
  focusedItem?: TreeItemIndex;
}>({
  context: null,
  folder: {},
  selectedItems: [],
  expandedItems: [],
  focusedItem: "",
});

const actions = {
  load: async () => {
    await trpc.file.init.mutate();
  },
  init: (folder: Folder) => {
    state.folder = folder;
  },
  dirname: async (path: string) => {
    const res = await trpc.file.dirname.mutate({
      path,
    });
    if (!res.status) {
      const data = JSON.parse(res.data);
      toast.error(`${data.code}:${data.errno}`, {
        description: data.message,
        duration: 2000,
      });
    }
    return res.data;
  },
  join: async (paths: string[]) => {
    const res = await trpc.file.join.mutate({
      paths,
    });
    if (!res.status) {
      const data = JSON.parse(res.data);
      toast.error(`${data.code}:${data.errno}`, {
        description: data.message,
        duration: 2000,
      });
    }
    return res.data;
  },
  rename: async (oldPath: string, newPath: string) => {
    try {
      newPath = await actions.join([await actions.dirname(oldPath), newPath]);
      const res = await trpc.file.rename.mutate({
        path: oldPath,
        newPath,
      });
      if (!res.status) {
        const data = JSON.parse(res.data);
        toast.error(`${data.code}:${data.errno}`, {
          description: data.message,
          duration: 2000,
        });
      }
      return newPath;
    } catch (err: any) {
      console.log(err);
      const data = JSON.parse(err.message);
      toast.error(`${data[0]?.code}`, {
        description: data[0].message,
        duration: 2000,
      });
    }
  },
  onContextChange: (context: TreeItemRenderContext<never> | null) => {
    state.context = context;
  },
  onFocusItem: (item: any) => {
    state.focusedItem = item.index;
  },
  onSelectItems: (items: any[]) => {
    state.selectedItems = items;
  },
  onExpandItem: (item: any) => {
    state.expandedItems = [...state.expandedItems!, item.index];
  },
  onCollapseItem: (item: any) => {
    if (state.expandedItems?.includes(item.index)) {
      state.expandedItems = [
        ...state.expandedItems.filter((o) => o !== item.index),
      ];
    }
  },
};

export default {
  state,
  ...actions,
};
