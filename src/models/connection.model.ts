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
  user: string;
  password: string;
  database?: string;
  version?: string;
  lastConnection?: Date;
}

const state = proxy<{
  list: Connection[];
  target: Connection | null;
  table: string;
}>({
  list: [],
  target: null,
  table: "",
});

const actions = {
  load: async () => {
    const target: string | null =
      await localForage.getItem("connection-target");
    state.target = target ? SuperJSON.parse<Connection>(target) : null;

    const list: string | null = await localForage.getItem("connections");
    state.list = list ? SuperJSON.parse<Connection[]>(list) : [];

    const table: string | null = await localForage.getItem("connection-table");
    state.table = table ?? "";
  },
  connect: (connection: Connection) => {
    connection.lastConnection = new Date();
    state.target = connection;
    actions.update(connection);
  },
  disconnect: () => {
    state.target = null;
    state.table = "";
  },
  create: (connection: Connection) => {
    state.list = [...state.list, connection];
  },
  update: (connection: Partial<Connection>) => {
    const id = connection.id;
    const idx = state.list.findIndex((o) => o.id === id);
    const old = state.list[idx];
    state.list = state.list.filter((o) => o.id !== id);
    state.list = [...state.list, { ...old, ...connection }];
  },
  remove: (connection: Connection) => {
    state.list = state.list.filter((o) => o.id !== connection.id);
  },
  changeDatabase: (database: string) => {
    // @ts-ignore
    state.target = { ...state.target, database };
    actions.update({
      ...state.target,
      database,
    });
  },
  changeTable: (table: string) => {
    state.table = table;
  },
};

subscribeKey(state, "target", async () => {
  state.table = "";
  await localForage.setItem(
    "connection-target",
    SuperJSON.stringify(state.target),
  );
});

subscribeKey(state, "list", async () => {
  await localForage.setItem("connections", SuperJSON.stringify(state.list));
});

subscribeKey(state, "table", async () => {
  await localForage.setItem("connection-table", state.table);
});

export default {
  state,
  ...actions,
};
