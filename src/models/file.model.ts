import { trpc } from "@/api/client";
import { proxy } from "valtio";

const state = proxy<{}>({});

const actions = {
  load: async () => {
    await trpc.file.init.mutate();
  },
};

export default {
  state,
  ...actions,
};
