export interface IDBDriver {
  ping(): Promise<boolean>;
  raw(sql: string): Promise<any>;
  getVersion(): Promise<string>;
  showDatabases(): Promise<IDatabase[]>;
  showTables(): Promise<ITable[]>;
  showTableStatus(table: string): Promise<ITableStatus>;
  showCreateTable(table: string): Promise<string>;
  showColumns(table: string): Promise<IColumn[]>;
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
