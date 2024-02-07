import { trpc } from "@/api/client";
import { TreeItem, TreeItemIndex } from "react-complex-tree";
import { proxy } from "valtio";

export type Folder = Record<TreeItemIndex, TreeItem<any>>;

const state = proxy<{ folder: Folder }>({
  folder: {},
});

const actions = {
  load: async () => {
    await trpc.file.init.mutate();
  },
  init: (folder: Folder) => {
    state.folder = folder;
  },
};

export default {
  state,
  ...actions,
};
