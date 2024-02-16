import { trpc } from "@/api/client";
import { TreeItem, TreeItemIndex } from "react-complex-tree";
import { toast } from "sonner";
import { proxy } from "valtio";

export type Folder = Record<TreeItemIndex, TreeItem<any>>;

const state = proxy<{
  folder: Folder;
  selectedItems?: TreeItemIndex[];
  expandedItems?: TreeItemIndex[];
  focusedItem?: TreeItemIndex;
}>({
  folder: {},
  selectedItems: [],
  expandedItems: [],
  focusedItem: "",
});

const actions = {
  load: async () => {
    await trpc.file.init.mutate();
  },
  reload: async () => {
    await trpc.file.reload.mutate();
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
  create: async (path: string, isFolder: boolean) => {
    let basePath = state.focusedItem?.toString() ?? "";
    if (!!basePath && basePath.endsWith(".sql")) {
      basePath = await actions.dirname(basePath);
    }
    if (!isFolder && !path.endsWith(".sql")) {
      path = `${path}.sql`;
    }
    path = await actions.join([basePath, path]);
    const res = await trpc.file.create.mutate({
      path,
      isFolder,
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
  delete: async (path: string) => {
    if (!path) return;
    try {
      const res = await trpc.file.delete.mutate({
        path,
      });
      if (!res.status) {
        const data = JSON.parse(res.data);
        toast.error(`${data.code}:${data.errno}`, {
          description: data.message,
          duration: 2000,
        });
      }
    } catch (err: any) {
      console.log(err);
      const data = JSON.parse(err.message);
      toast.error(`${data[0]?.code}`, {
        description: data[0].message,
        duration: 2000,
      });
    }
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
