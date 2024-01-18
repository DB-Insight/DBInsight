import { proxy } from "valtio";

const state = proxy<{ open: boolean }>({
  open: false,
});

const actions = {
  onOpenChange: (open: boolean) => (state.open = open),
};

export default {
  state,
  ...actions,
};
