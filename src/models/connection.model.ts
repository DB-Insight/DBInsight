import { trpc } from "@/api/client";
import {
  ICharacterSet,
  ICollation,
  IDatabase,
  IEngine,
  IIndex,
  ITable,
} from "@/api/interfaces";
import localForage from "localforage";
import SuperJSON from "superjson";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";

export const SYSTEM_DBS = [
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
];

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
  databases: IDatabase[];
  tables: ITable[];
  characterSets: ICharacterSet[];
  collations: ICollation[];
  engines: IEngine[];
  indexs: IIndex[];
  target: Connection | null;
  table: string;
}>({
  list: [],
  databases: [],
  tables: [],
  characterSets: [],
  collations: [],
  engines: [],
  indexs: [],
  target: null,
  table: "",
});

const actions = {
  load: async () => {
    const list: string | null = await localForage.getItem("connections");
    state.list = list ? SuperJSON.parse<Connection[]>(list) : [];

    const target: string | null =
      await localForage.getItem("connection-target");
    state.target = target ? SuperJSON.parse<Connection>(target) : null;

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
    state.tables = [];
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
  getCharacterSets: async () => {
    if (state.target) {
      const res = await trpc.connection.getCharacterSets.query(state.target);
      if (res.status) {
        state.characterSets = res.data ?? [];
      }
    }
  },
  getCollations: async (encoding: string) => {
    if (state.target && encoding) {
      const res = await trpc.connection.getCollations.query({
        characterSet: encoding,
        ...state.target,
      });
      if (res.status) {
        state.collations = res.data ?? [];
      }
    }
  },
  getEngines: async () => {
    if (state.target) {
      const res = await trpc.connection.getEngines.query({
        ...state.target,
      });
      if (res.status) {
        state.engines = res.data ?? [];
      }
    }
  },
  loadDatebases: async () => {
    if (state.target) {
      const res = await trpc.connection.showDatabases.query(state.target);
      if (res.status) {
        state.databases =
          res.data.filter((o: IDatabase) => !SYSTEM_DBS.includes(o.name)) ?? [];
      }
    }
  },
  loadTables: async () => {
    if (state.target && !!state.target?.database) {
      const res = await trpc.connection.showTables.query(state.target);
      if (res.status) {
        state.tables = res.data ?? [];
      }
    }
  },
  loadIndex: async () => {
    if (state.target && !!state.target?.database && !!state.table) {
      const res = await trpc.connection.showIndex.query({
        table: state.table,
        ...state.target,
      });
      if (res.status) {
        state.indexs = res.data ?? [];
      }
    }
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
