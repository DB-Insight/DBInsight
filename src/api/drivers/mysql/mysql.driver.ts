import { IColumn, IDBDriver, IIndex, ITableStatus } from "@/api/interfaces";
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

  async showVariables(name: string) {
    const res: any = await this.raw(`SHOW VARIABLES LIKE '${name}'`);
    return res[0].find((o: any) => o.Variable_name === name)?.Value;
  }

  async showDatabases() {
    const res: any = await this.raw(`SHOW DATABASES`);
    return res[0]?.map((o: any) => ({ name: o["Database"] }));
  }

  async showTables() {
    const res: any = await this.raw(`SHOW TABLES`);
    return res[0]?.map((o: any) => ({
      name: o[`Tables_in_${this.credentials.database}`],
    }));
  }

  async showTableStatus(table: string): Promise<ITableStatus> {
    const res: any = await this.raw(`SHOW TABLE STATUS LIKE '${table}'`);
    const status = res[0][0];
    return {
      autoIncrement: status.Auto_increment,
      avgRowLength: status.Avg_row_length,
      checkTime: status.Check_time,
      checksum: status.Checksum,
      collation: status.Collation,
      comment: status.Comment,
      createOptions: status.Create_options,
      createTime: status.Create_time,
      dataFree: status.Data_free,
      dataLength: status.Data_length,
      engine: status.Engine,
      indexLength: status.Index_length,
      maxDataLength: status.Max_data_length,
      name: status.Name,
      rowFormat: status.Row_format,
      rows: status.Rows,
      updateTime: status.Update_time,
      version: status.Version,
    };
  }

  async showCreateTable(table: string) {
    const res: any = await this.raw(
      `SHOW CREATE TABLE \`${this.credentials.database}\`.\`${table}\``,
    );
    return res[0][0]["Create Table"];
  }

  async showColumns(table: string): Promise<IColumn[]> {
    const res: any = await this.raw(
      `SHOW COLUMNS FROM \`${this.credentials.database}\`.\`${table}\``,
    );
    return res[0].map((o: any) => ({
      field: o.Field,
      type: o.Type,
      null: o.Null,
      key: o.Key,
      default: o.Default,
      extra: o.Extra,
    }));
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

  async queryTable(table: string, page: number, pageSize: number) {
    const columns = await this.showColumns(table);
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
