import localForage from "localforage";
import SuperJSON from "superjson";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";

export interface Connection {
  id: string;
  type: "mysql";
  alias: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database?: string;
  lastConnection?: Date;
}

const state = proxy<{ list: Connection[] }>({
  list: [],
});

const actions = {
  load: async () => {
    const list: string | null = await localForage.getItem("connections");
    state.list = list ? SuperJSON.parse<Connection[]>(list) : [];
  },
  create: (db: Connection) => {
    state.list = [...state.list, db];
  },
  update: (db: Connection) => {
    const id = db.id;
    const idx = state.list.findIndex((o) => o.id === id);
    const old = state.list[idx];
    state.list = state.list.filter((o) => o.id !== id);
    state.list = [...state.list, { ...old, ...db }];
  },
  remove: (db: Connection) => {
    state.list = state.list.filter((o) => o.id !== db.id);
  },
};

subscribeKey(state, "list", async () => {
  await localForage.setItem("connections", SuperJSON.stringify(state.list));
});

export default {
  state,
  ...actions,
};
