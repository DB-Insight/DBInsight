import { INode } from "react-accessible-treeview";
import { proxy } from "valtio";

const state = proxy<{
  folder: INode[];
}>({
  folder: [
    {
      name: "",
      children: [1, 4, 9, 10, 11],
      id: 0,
      parent: null,
    },
    { name: "src", children: [2, 3], id: 1, parent: 0 },
    { name: "index.js", id: 2, parent: 1, children: [] },
    { name: "styles.css", id: 3, parent: 1, children: [] },
    { name: "node_modules", children: [5, 7], id: 4, parent: 0 },
    { name: "react-accessible-treeview", children: [6], id: 5, parent: 4 },
    { name: "bundle.js", id: 6, parent: 5, children: [] },
    { name: "react", children: [8], id: 7, parent: 4 },
    { name: "bundle.js", id: 8, parent: 7, children: [] },
    { name: ".npmignore", id: 9, parent: 0, children: [] },
    { name: "package.json", id: 10, parent: 0, children: [] },
    { name: "webpack.config.js", id: 11, parent: 1, children: [] },
  ],
});

const actions = {
  changeFolder: (folder: INode[]) => {
    state.folder = folder;
  },
};

export default {
  state,
  ...actions,
};
