import { trpc } from "@/api/client";
import {
  ICharacterSet,
  ICollation,
  IDatabase,
  IEngine,
  IIndex,
  ITable,
} from "@/api/interfaces";
import { getSqlValue } from "@/utils/sql";
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
  columns: any[];
  status: ITable | null;
  info: string | null;
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
  columns: [],
  status: null,
  info: null,
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
  raw: async (sql: string) => {
    if (state.target) {
      return await trpc.connection.raw.query({
        ...state.target,
        sql,
      });
    }
  },
  insertRaw: async (data: any[]) => {
    if (state.target && data.length > 0) {
      const columns = data.map((v) => v.field).join(", ");
      const values = data.map((v) => getSqlValue(v.value)).join(", ");
      return await actions.raw(
        `INSERT INTO \`${state.target.database}\`.\`${state.table}\`(${columns}) VALUES(${values})`,
      );
    }
  },
  updateRaw: async (data: any[], conditions: any[]) => {
    if (state.target && data.length > 0 && conditions.length > 0) {
      const valuesSql = data
        .map((v) => `${v.field} = ${getSqlValue(v.value)}`)
        .join(", ");
      const conditionsSql = conditions
        .map((v) => `${v.field} = ${getSqlValue(v.value)}`)
        .join(", ");
      return await actions.raw(
        `UPDATE \`${state.target.database}\`.\`${state.table}\` SET ${valuesSql} WHERE ${conditionsSql}`,
      );
    }
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
  getTables: async () => {
    if (state.target && !!state.target?.database) {
      const res = await trpc.connection.getTables.query(state.target);
      if (res.status) {
        state.tables = res.data ?? [];
      }
    }
  },
  getColumns: async () => {
    if (state.target && !!state.target?.database && !!state.table) {
      const res = await trpc.connection.getColumns.query({
        table: state.table,
        ...state.target,
      });
      if (res) {
        state.columns = res.data;
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
  showCreateTable: async () => {
    if (state.target && !!state.target?.database && !!state.table) {
      const res = await trpc.connection.showCreateTable.query({
        table: state.table,
        ...state.target,
      });
      if (res) {
        state.info = res.data;
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
  state.status = state.tables.find((t) => t.tableName === state.table) ?? null;
});

subscribeKey(state, "tables", async () => {
  state.status = state.tables.find((t) => t.tableName === state.table) ?? null;
});

export default {
  state,
  ...actions,
};
