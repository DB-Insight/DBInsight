import { trpc } from "@/api/client";
import { IColumn } from "@/api/interfaces";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import {
  CellEditingStartedEvent,
  CellEditingStoppedEvent,
  ColDef,
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
} from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import { useReactive } from "ahooks";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyPlusIcon,
  MinusIcon,
  PlusIcon,
  RotateCwIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const state = useReactive<{
    columns: ColDef[];
    rows: any[];
    page: number;
    pageSize: number;
    total: number;
    totalPage: number;
  }>({
    rows: [],
    columns: [],
    page: 1,
    pageSize: 1000,
    total: 0,
    totalPage: 1,
  });
  const { target, table } = useSnapshot(connectionModel.state);
  const gridRef = useRef<AgGridReact<any>>(null);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      editable: true,
      minWidth: 100,
      headerComponent: (params: any) => {
        return (
          <div className={styles.header}>
            {params.displayName}
            <div className={styles.type}>{params.type}</div>
          </div>
        );
      },
    };
  }, []);

  useEffect(() => {
    state.page = 1;
    loadList();
  }, [target?.database, table]);

  useEffect(() => {
    loadList();
  }, [state.page, state.pageSize]);

  const loadList = useCallback(async () => {
    if (!!target?.database && !!table) {
      const res = await trpc.connection.queryTable.query({
        table,
        page: state.page,
        pageSize: state.pageSize,
        ...target,
      });
      if (res.status) {
        state.columns =
          res.data.columns?.map((c: IColumn) => ({
            field: c.field,
            headerComponentParams: {
              type: c.type,
            },
          })) ?? [];
        state.rows = res.data.rows ?? [];
        state.total = res.data.total ?? 0;
        state.totalPage = res.data.totalPage ?? 1;
      }
    }
  }, [target?.database, table, state.page, state.pageSize]);

  const gotoFirst = useCallback(() => {
    state.page = 1;
    // gridRef.current!.api.paginationGoToFirstPage();
  }, [gridRef.current]);

  const gotoLast = useCallback(() => {
    state.page = state.totalPage;
    // gridRef.current!.api.paginationGoToLastPage();
  }, [gridRef.current]);

  const gotoNext = useCallback(() => {
    if (state.page < state.totalPage) {
      state.page = state.page + 1;
    }
    // gridRef.current!.api.paginationGoToNextPage();
  }, [gridRef.current, state.page, state.totalPage]);

  const gotoPrevious = useCallback(() => {
    if (state.page > 1) {
      state.page = state.page - 1;
    }
    //gridRef.current!.api.paginationGoToPreviousPage();
  }, [gridRef.current, state.page, state.totalPage]);

  return (
    <div className={styles.container}>
      <div className={`ag-theme-alpine-dark ${styles.grid}`}>
        <AgGridReact
          ref={gridRef}
          rowData={state.rows}
          columnDefs={state.columns}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          suppressScrollOnNewData
          suppressPaginationPanel
          pagination
          paginationPageSize={state.pageSize}
          onRowEditingStarted={(e: RowEditingStartedEvent) => {
            console.log("never called - not doing row editing");
          }}
          onRowEditingStopped={(e: RowEditingStoppedEvent) => {
            console.log("never called - not doing row editing");
          }}
          onCellEditingStarted={(e: CellEditingStartedEvent) => {
            console.log("cellEditingStarted");
          }}
          onCellEditingStopped={(e: CellEditingStoppedEvent) => {
            console.log("cellEditingStopped");
          }}
        />
      </div>
      <div className={styles.footer}>
        <div className="flex items-center gap-2 text-nowrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PlusIcon
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadList();
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Add row</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MinusIcon
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadList();
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Delete selected row(s)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CopyPlusIcon
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadList();
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Duplicate selected row</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RotateCwIcon
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadList();
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Refresh table contents</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="ml-4">Total: {state.total}</div>
        </div>
        <Pagination className="justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem className="mr-6 flex items-center gap-1 text-xs">
              <span className="mr-1 text-nowrap">Page Size:</span>
              <Select
                value={state.pageSize.toString()}
                onValueChange={(e) => (state.pageSize = Number(e))}
              >
                <SelectTrigger className="h-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="2000">2000</SelectItem>
                </SelectContent>
              </Select>
            </PaginationItem>
            <PaginationItem onClick={gotoFirst}>
              <ChevronFirstIcon className="h-4 w-4 hover:text-foreground" />
            </PaginationItem>
            <PaginationItem
              className={state.page <= 1 ? "text-gray-500" : ""}
              onClick={gotoPrevious}
            >
              <ChevronLeftIcon className="h-4 w-4 hover:text-foreground" />
            </PaginationItem>
            <PaginationItem className="text-xs">
              Page <span className="font-bold">{state.page}</span> of{" "}
              <span className="font-bold">{state.totalPage}</span>
            </PaginationItem>
            <PaginationItem
              className={state.page >= state.totalPage ? "text-gray-500" : ""}
              onClick={gotoNext}
            >
              <ChevronRightIcon className="h-4 w-4 hover:text-foreground" />
            </PaginationItem>
            <PaginationItem onClick={gotoLast}>
              <ChevronLastIcon className="h-4 w-4 hover:text-foreground" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
