import { IColumn, IDBDriver, IIndex, ITable } from "@/api/interfaces";
import EventEmitter from "events";
import { ConnectionOptions } from "mysql2/promise";
import { MySQL } from "./mysql";

export class MySQLDriver extends EventEmitter implements IDBDriver {
  private readonly credentials: ConnectionOptions;
  private readonly db: MySQL | null = null;
  constructor(credentials: ConnectionOptions) {
    super();
    this.credentials = credentials;
    this.db = new MySQL(this.credentials);
  }

  async ping() {
    return this.db ? this.db.ping() : false;
  }

  async raw(sql: string) {
    sql = sql.trim();
    this.emit("raw", sql);
    return await this.db?.queryRows(sql);
  }

  async getVersion() {
    const res: any = await this.raw(`SELECT VERSION() as version`);
    return res[0][0].version;
  }

  async getCharacterSets() {
    const res: any = await this.raw(
      "SELECT * FROM `information_schema`.`character_sets` ORDER BY `character_set_name` ASC",
    );
    return res[0].map((o: any) => ({
      characterSetName: o.CHARACTER_SET_NAME,
      defaultCollateName: o.DEFAULT_COLLATE_NAME,
      description: o.DESCRIPTION,
      maxlen: o.MAXLEN,
    }));
  }

  async getCollations(characterSet: string) {
    const res: any = await this.raw(
      `SELECT * FROM \`information_schema\`.\`collations\` WHERE character_set_name = '${characterSet}' ORDER BY \`collation_name\` ASC`,
    );
    return res[0].map((o: any) => ({
      characterSetName: o.CHARACTER_SET_NAME,
      collationName: o.COLLATION_NAME,
      id: o.ID,
      isCompiled: o.IS_COMPILED,
      isDefault: o.IS_DEFAULT,
      padAttribute: o.PAD_ATTRIBUTE,
      sortlen: o.SORTLEN,
    }));
  }

  async getEngines() {
    const res: any = await this.raw(
      `SELECT Engine, Support FROM \`information_schema\`.\`engines\` WHERE SUPPORT IN ('DEFAULT', 'YES') AND Engine != 'PERFORMANCE_SCHEMA'`,
    );
    return res[0].map((o: any) => ({
      engine: o.Engine,
      support: o.Support,
    }));
  }

  async getTables(): Promise<ITable[]> {
    const res: any = await this.raw(
      `SELECT * FROM information_schema.tables WHERE table_schema = '${this.credentials.database}'`,
    );
    return res[0].map((o: any) => ({
      tableCatalog: o.TABLE_CATALOG,
      tableSchema: o.TABLE_SCHEMA,
      tableName: o.TABLE_NAME,
      tableType: o.TABLE_TYPE,
      engine: o.ENGINE,
      version: o.VERSION,
      rowFormat: o.ROW_FORMAT,
      tableRows: o.TABLE_ROWS,
      avgRowLength: o.AVG_ROW_LENGTH,
      dataLength: o.DATA_LENGTH,
      maxDataLength: o.MAX_DATA_LENGTH,
      indexLength: o.INDEX_LENGTH,
      dataFree: o.DATA_FREE,
      autoIncrement: o.AUTO_INCREMENT,
      createTime: o.CREATE_TIME,
      updateTime: o.UPDATE_TIME,
      checkTime: o.CHECK_TIME,
      tableCollation: o.TABLE_COLLATION,
      checksum: o.CHECKSUM,
      createOptions: o.CREATE_OPTIONS,
      tableComment: o.TABLE_COMMENT,
    }));
  }

  async getColumns(table: string): Promise<IColumn[]> {
    const res: any = await this.raw(
      `SELECT * FROM information_schema.columns WHERE table_schema = '${this.credentials.database}' AND table_name = '${table}'`,
    );
    // CHARACTER_MAXIMUM_LENGTH: null;
    // CHARACTER_OCTET_LENGTH: null;
    // CHARACTER_SET_NAME: null;
    // COLLATION_NAME: null;
    // COLUMN_COMMENT: "";
    // COLUMN_DEFAULT: null;
    // COLUMN_KEY: "PRI";
    // COLUMN_NAME: "id";
    // COLUMN_TYPE: "int unsigned";
    // DATA_TYPE: "int";
    // DATETIME_PRECISION: null;
    // EXTRA: "auto_increment";
    // GENERATION_EXPRESSION: "";
    // IS_NULLABLE: "NO";
    // NUMERIC_PRECISION: 10;
    // NUMERIC_SCALE: 0;
    // ORDINAL_POSITION: 1;
    // PRIVILEGES: "select,insert,update,references";
    // SRS_ID: null;
    // TABLE_CATALOG: "def";
    // TABLE_NAME: "user";
    // TABLE_SCHEMA: "test";
    return res[0].map((o: any) => ({
      field: o.COLUMN_NAME,
      type: o.DATA_TYPE,
      length: o.CHARACTER_MAXIMUM_LENGTH,
      unsigned: o.COLUMN_TYPE?.includes("unsigned"),
      collation: o.COLLATION_NAME,
      null: o.IS_NULLABLE,
      key: o.COLUMN_KEY,
      default: o.COLUMN_DEFAULT,
      extra: o.EXTRA,
      privileges: o.PRIVILEGES,
      comment: o.COLUMN_COMMENT,
    }));
  }

  async showVariables(name: string) {
    const res: any = await this.raw(`SHOW VARIABLES LIKE '${name}'`);
    return res[0].find((o: any) => o.Variable_name === name)?.Value;
  }

  async showDatabases() {
    const res: any = await this.raw(`SHOW DATABASES`);
    return res[0]?.map((o: any) => ({ name: o["Database"] }));
  }

  async showCreateTable(table: string) {
    const res: any = await this.raw(
      `SHOW CREATE TABLE \`${this.credentials.database}\`.\`${table}\``,
    );
    return res[0][0]["Create Table"];
  }

  async showIndex(table: string): Promise<IIndex[]> {
    const res: any = await this.raw(
      `SHOW INDEX FROM \`${this.credentials.database}\`.\`${table}\``,
    );
    return res[0].map((o: any) => ({
      cardinality: o.Cardinality,
      collation: o.Collation,
      columnName: o.Column_name,
      comment: o.Comment,
      expression: o.Expression,
      indexComment: o.Index_comment,
      indexType: o.Index_type,
      keyName: o.Key_name,
      nonUnique: o.Non_unique,
      packed: o.Packed,
      seqInIndex: o.Seq_in_index,
      subPart: o.Sub_part,
      table: o.Table,
      visible: o.Visible,
    }));
  }

  async createDatabase(
    name: string,
    encoding?: string | undefined,
    collation?: string | undefined,
  ) {
    return await this.raw(
      `CREATE DATABASE \`${name}\` 
          ${encoding ? `DEFAULT CHARACTER SET = \`${encoding}\`` : ""} 
          ${collation ? `DEFAULT COLLATE = \`${collation}\`` : ""}`,
    );
  }

  async createTable(
    name: string,
    encoding?: string | undefined,
    collation?: string | undefined,
    engine?: string | undefined,
  ) {
    return await this.raw(
      `CREATE TABLE \`${this.credentials.database}\`.\`${name}\` (id INT(11) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT) 
          ${encoding ? `DEFAULT CHARACTER SET = \`${encoding}\`` : ""} 
          ${collation ? `DEFAULT COLLATE = \`${collation}\`` : ""} 
          ${engine ? `ENGINE = \`${engine}\`` : ""}`,
    );
  }

  async renameTable(table: string, name: string) {
    return await this.raw(
      `RENAME TABLE \`${this.credentials.database}\`.\`${table}\` TO \`${name}\``,
    );
  }

  async truncateTable(table: string) {
    return await this.raw(
      `TRUNCATE TABLE \`${this.credentials.database}\`.\`${table}\``,
    );
  }

  async dropTable(table: string) {
    return await this.raw(
      `DROP TABLE \`${this.credentials.database}\`.\`${table}\``,
    );
  }

  async queryTable(table: string, page: number, pageSize: number) {
    const columns = await this.getColumns(table);
    const countRes = await this.raw(
      `SELECT COUNT(1) AS total FROM \`${this.credentials.database}\`.\`${table}\``,
    );
    const total = countRes![0][0]["total"];
    const res: any = await this.raw(
      `SELECT ${columns.map((c) => c.field).join(",")} FROM \`${this.credentials.database}\`.\`${table}\` LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)}`,
    );
    const rows = res[0] ?? [];
    return {
      columns,
      rows,
      total,
      totalPage: Math.ceil(total / pageSize),
    };
  }
}
