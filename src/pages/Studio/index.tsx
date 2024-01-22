import { trpc } from "@/api/client";
import { IColumn, IDatabase, ITable } from "@/api/interfaces";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import { useReactive } from "ahooks";
import {
  FilePlus2Icon,
  InfoIcon,
  LogOutIcon,
  RefreshCcwIcon,
  RocketIcon,
  SearchIcon,
  TableIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const nav = useNavigate();
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    filter: string;
    databases: IDatabase[];
    tables: ITable[];
    columns: ColDef[];
    rows: any[];
    page: number;
    pageSize: number;
    total: number;
  }>({
    filter: "",
    databases: [],
    tables: [],
    rows: [],
    columns: [],
    page: 1,
    pageSize: 1000,
    total: 0,
  });

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
    };
  }, []);

  useEffect(() => {
    loadDatebases();
  }, [target]);

  useEffect(() => {
    state.columns = [];
    state.rows = [];
    state.page = 1;
    state.pageSize = 1000;
    state.total = 0;
    loadTables();
  }, [target, target?.database]);

  useEffect(() => {
    loadList();
  }, [target?.database, table]);

  const loadDatebases = async () => {
    if (target) {
      const res = await trpc.connection.showDatabases.query(target);
      if (res.status) {
        state.databases = res.data ?? [];
      }
    }
  };

  const loadTables = async () => {
    if (!!target?.database) {
      const res = await trpc.connection.showTables.query(target);
      if (res.status) {
        state.tables = res.data ?? [];
      }
    }
  };

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
    <div className={styles.container}>
      {target && (
        <>
          <div className="flex items-center justify-between">
            <div className={styles.title}>
              {target.alias}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <InfoIcon className="h-4 w-4" />
                </HoverCardTrigger>
                <HoverCardContent className={styles.info} side="right">
                  <div className="mb-4 flex items-center text-sm">
                    {target.host}:{target.port}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-xs">
                      <RocketIcon className="h-3 w-3" />
                      {target.version}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <UserIcon className="h-3 w-3" />
                      {target.user}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="flex flex-1 items-center justify-end gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {target.database ? target.database : "Select database"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        loadDatebases();
                      }}
                    >
                      Reload databases
                    </DropdownMenuItem>
                    <DropdownMenuItem>Create a new database</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Databases</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={target.database ?? ""}
                    onValueChange={(e) => connectionModel.changeDatabase(e)}
                  >
                    {state.databases.map((d) => (
                      <DropdownMenuRadioItem key={d.name} value={d.name}>
                        {d.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="h-8 w-8 p-0 lg:flex" variant="ghost">
                    <LogOutIcon className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-200" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="mr-4 flex flex-col p-4"
                  side="bottom"
                >
                  <div className="mt-2 text-sm">
                    Are you sure you want to disconnect?
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        connectionModel.disconnect();
                        nav("/", { replace: true });
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <ResizablePanelGroup
            className={styles.content}
            direction="horizontal"
          >
            <ResizablePanel defaultSize={22} maxSize={80} minSize={0}>
              <div className={styles.side}>
                <div className="relative">
                  <SearchIcon className="absolute bottom-0 left-3 top-0 my-auto h-5 w-5 text-gray-500" />
                  <Input
                    className="rounded-md pl-10 pr-4"
                    type="text"
                    placeholder="Filter"
                    value={state.filter}
                    onChange={(event) => (state.filter = event.target.value)}
                  />
                </div>
                <div className={styles.header}>
                  <div className={styles.name}>Tables</div>
                  <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FilePlus2Icon className="h-4 w-4 cursor-pointer hover:text-gray-200" />
                        </TooltipTrigger>
                        <TooltipContent>Create a new table</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <RefreshCcwIcon
                            className="h-4 w-4 cursor-pointer hover:text-gray-200"
                            onClick={() => {
                              loadTables();
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Reload tables</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className={styles.list}>
                  {state.tables
                    .filter((t) => t.name.includes(state.filter))
                    .map((t) => (
                      <TooltipProvider key={t.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`${styles.item} ${table === t.name ? styles.active : null}`}
                              onClick={() => {
                                connectionModel.changeTable(t.name);
                              }}
                            >
                              <TableIcon className="h-4 w-4 min-w-4" />
                              <div className={styles.name}>
                                <Highlighter
                                  searchWords={[state.filter]}
                                  autoEscape={true}
                                  textToHighlight={t.name}
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{t.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle className="w-[3px] hover:bg-primary" withHandle />
            <ResizablePanel>
              <ResizablePanelGroup className={styles.main} direction="vertical">
                <ResizablePanel></ResizablePanel>
                {!!table && (
                  <>
                    <ResizableHandle
                      className="w-[3px] hover:bg-primary"
                      withHandle
                    />
                    <ResizablePanel
                      className={styles.panel}
                      defaultSize={80}
                      maxSize={80}
                      minSize={20}
                    >
                      <div className={`ag-theme-alpine-dark ${styles.grid}`}>
                        <AgGridReact
                          rowData={state.rows}
                          columnDefs={state.columns}
                          defaultColDef={defaultColDef}
                          suppressColumnVirtualisation={true}
                          suppressRowVirtualisation={true}
                        />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
};
