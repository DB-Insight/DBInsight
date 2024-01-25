import { TreeItem, TreeItemIndex } from "react-complex-tree";
import { proxy } from "valtio";

const state = proxy<{
  folder: Record<TreeItemIndex, TreeItem<any>>;
}>({
  folder: {
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
      data: "tables",
    },
    tablesPanel: {
      index: "tablesPanel",
      data: "tablesPanel",
    },
    queries: {
      index: "queries",
      isFolder: true,
      children: ["queriesPanel"],
      data: "queries",
    },
    queriesPanel: {
      index: "queriesPanel",
      data: "queriesPanel",
    },
  },
});

const actions = {
  changeFolder: (folder: any) => {
    state.folder = folder;
  },
};

export default {
  state,
  ...actions,
};
