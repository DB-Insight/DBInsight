import { defer } from "react-router-dom";
import { proxy } from "valtio";
import dbModel from "./db.model";

const state = proxy<{}>({});

const actions = {
  load: async () => {
    await dbModel.load();
    return defer({});
  },
};

export default {
  state,
  ...actions,
};
