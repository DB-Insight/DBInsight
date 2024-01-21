import { defer } from "react-router-dom";
import { proxy } from "valtio";
import connectionModel from "./connection.model";

const state = proxy<{}>({});

const actions = {
  load: async () => {
    await connectionModel.load();
    return defer({});
  },
};

export default {
  state,
  ...actions,
};
