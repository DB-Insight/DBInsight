import EventEmitter from "events";

export interface IDBDriver extends EventEmitter {
  ping(): Promise<boolean>;
  raw(sql: string): Promise<any>;
  getVersion(): Promise<string>;
  getCharacterSets(): Promise<ICharacterSet[]>;
  getCollations(characterSet: string): Promise<ICollation[]>;
  getEngines(): Promise<IEngine[]>;
  showVariables(name: string): Promise<string>;
  showDatabases(): Promise<IDatabase[]>;
  showTables(): Promise<ITable[]>;
  showTableStatus(table: string): Promise<ITableStatus>;
  showCreateTable(table: string): Promise<string>;
  showColumns(table: string): Promise<IColumn[]>;
  showIndex(table: string): Promise<IIndex[]>;
  createDatabase(
    name: string,
    encoding?: string,
    collation?: string,
  ): Promise<any>;
  createTable(
    name: string,
    encoding?: string,
    collation?: string,
    engine?: string,
  ): Promise<any>;
  renameTable(table: string, name: string): Promise<any>;
  truncateTable(table: string): Promise<any>;
  dropTable(table: string): Promise<any>;
  queryTable(
    table: string,
    page: number,
    pageSize: number,
  ): Promise<{
    columns: IColumn[];
    rows: any[];
  }>;
}

export interface IDatabase {
  name: string;
}

export interface ITable {
  name: string;
}

export interface ITableStatus {
  autoIncrement?: number;
  avgRowLength?: number;
  checkTime: Date | null;
  checksum?: number;
  collation: string;
  comment?: string;
  createOptions: string;
  createTime: Date;
  dataFree: number;
  dataLength: number;
  engine: string;
  indexLength: number;
  maxDataLength: number;
  name: string;
  rowFormat: string;
  rows: number;
  updateTime?: Date;
  version: number;
}

export interface IColumn {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string;
  extra: string;
}

export interface IIndex {
  cardinality: number;
  collation: string;
  columnName: string;
  comment: string;
  expression: null | string;
  indexComment: string;
  indexType: string;
  keyName: string;
  nonUnique: number;
  isNull: string;
  packed: null | string;
  sequenceInIndex: number;
  subPart: null | string;
  table: string;
  visible: string;
}

export interface ICharacterSet {
  characterSetName: string;
  defaultCollateName: string;
  description: string;
  maxlen: number;
}
export interface ICollation {
  characterSetName: string;
  collationName: string;
  id: number;
  isCompiled: string;
  isDefault: string;
  padAttribute: string;
  sortlen: number;
}

export interface IEngine {
  engine: string;
  support: string;
}
