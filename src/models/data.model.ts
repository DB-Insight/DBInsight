import { proxy } from "valtio";

const state = proxy<{
  folder: any;
}>({
  folder: {
    root: {
      index: "root",
      isFolder: true,
      children: ["child1"],
      data: "Root item",
    },
    child1: {
      index: "child1",
      isFolder: true,
      children: ["child2"],
      data: "tables",
    },
    child2: {
      index: "child2",
      data: "views",
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
