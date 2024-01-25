import { AgGridReact } from "@ag-grid-community/react";
import styles from "./index.module.css";
import { useEffect, useMemo } from "react";
import { ColDef } from "@ag-grid-community/core";
import { useReactive } from "ahooks";
import { useSnapshot } from "valtio";
import connectionModel from "@/models/connection.model";
import { trpc } from "@/api/client";
import { IColumn } from "@/api/interfaces";

export default () => {
  const state = useReactive<{
    columns: ColDef[];
    rows: any[];
    page: number;
    pageSize: number;
    total: number;
  }>({
    rows: [],
    columns: [],
    page: 1,
    pageSize: 1000,
    total: 0,
  });
  const { target, table } = useSnapshot(connectionModel.state);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
    };
  }, []);

  useEffect(() => {
    loadList();
  }, [target?.database, table]);

  const loadList = async () => {
    if (!!target?.database && !!table) {
      const status = await trpc.table.showTableStatus.query({
        table,
        ...target,
      });

      state.total = status?.data?.rows ?? 0;

      const res = await trpc.table.list.query({
        table,
        page: state.page,
        pageSize: state.pageSize,
        ...target,
      });
      if (res.status) {
        state.columns =
          res.data.columns?.map((c: IColumn) => ({
            field: c.field,
          })) ?? [];
        state.rows = res.data.rows ?? [];
        console.log(state.columns, state.rows);
      }
    }
  };

  return (
    <div className={`ag-theme-alpine-dark ${styles.container}`}>
      <AgGridReact
        rowData={state.rows}
        columnDefs={state.columns}
        defaultColDef={defaultColDef}
        suppressColumnVirtualisation={true}
        suppressRowVirtualisation={true}
      />
    </div>
  );
};
