import EventEmitter from "events";

export interface IDBDriver extends EventEmitter {
  ping(): Promise<boolean>;
  raw(sql: string): Promise<any>;

  getVersion(): Promise<string>;
  getCharacterSets(): Promise<ICharacterSet[]>;
  getCollations(characterSet: string): Promise<ICollation[]>;
  getEngines(): Promise<IEngine[]>;
  getTables(): Promise<ITable[]>;
  getColumns(table: string): Promise<IColumn[]>;

  showVariables(name: string): Promise<string>;
  showDatabases(): Promise<IDatabase[]>;
  showCreateTable(table: string): Promise<string>;
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
  tableCatalog: string;
  tableSchema: string;
  tableName: string;
  tableType: string;
  engine: string;
  version: number;
  rowFormat: string;
  tableRows: number;
  avgRowLength: number;
  dataLength: number;
  maxDataLength: number;
  indexLength: number;
  dataFree: number;
  autoIncrement: number;
  createTime: string;
  updateTime: null | string;
  checkTime: null | string;
  tableCollation: string;
  checksum: null | string;
  createOptions: string;
  tableComment: string;
}

export interface IColumn {
  field: string;
  type: string;
  collation: string;
  null: string;
  key: string;
  default: string;
  extra: string;
  privileges?: string;
  comment?: string;
  length?: number;
  unsigned?: boolean;
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
