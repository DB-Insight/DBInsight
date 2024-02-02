import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import { ColDef, IRowNode } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import { useReactive } from "ahooks";
import { MinusIcon, PlusIcon, RotateCwIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default () => {
  const { target, table, columns } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    columns: ColDef[];
  }>({
    columns: [
      {
        field: "field",
        headerName: "Field",
      },
      {
        field: "type",
        headerName: "Type",
      },
      {
        field: "collation",
        headerName: "Collation",
      },
      {
        field: "null",
        headerName: "Null",
      },
      {
        field: "key",
        headerName: "Key",
      },
      {
        field: "default",
        headerName: "Default",
      },
      {
        field: "extra",
        headerName: "Extra",
      },
      {
        field: "comment",
        headerName: "Comment",
      },
    ],
  });
  const gridRef = useRef<AgGridReact>(null);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
      headerComponent: (params: any) => {
        return <div className={styles.header}>{params.displayName}</div>;
      },
      cellRenderer: (params: any) => {
        return (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className="h-full w-full"
                onContextMenu={() => {
                  gridRef.current?.api.setNodesSelected({
                    nodes: [params.node] as IRowNode[],
                    newValue: true,
                  });
                }}
              >
                {params.value}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => {}}>Delete Index</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => {}}>
                Reset AUTO_INCREMENT
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      },
    };
  }, []);

  useEffect(() => {
    connectionModel.getColumns();
  }, [target?.database, table]);

  console.log(columns);

  return (
    <div className={styles.container}>
      <div className={`ag-theme-alpine-dark ${styles.grid}`}>
        <AgGridReact
          ref={gridRef}
          rowData={columns as any[]}
          columnDefs={state.columns}
          defaultColDef={defaultColDef}
          rowSelection="single"
          suppressCellFocus
          suppressScrollOnNewData
          suppressPaginationPanel
          suppressDragLeaveHidesColumns
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
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Delete selected row(s)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RotateCwIcon
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    connectionModel.loadIndex();
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Refresh table contents</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
