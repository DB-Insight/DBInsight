import { defer } from "react-router-dom";
import { proxy } from "valtio";

const state = proxy<{  }>({
});

const actions = {
  load: async () => {
    return defer({  });
  },
};

export default {
  state,
  ...actions,
};
