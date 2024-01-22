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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import connectionModel from "@/models/connection.model";
import { ColDef } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
import { useReactive } from "ahooks";
import { Allotment } from "allotment";
import { InfoIcon, LogOutIcon, RocketIcon, UserIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Offscreen } from "react-stillness-component";
import { useSnapshot } from "valtio";
import Chats from "./Chats";
import Editor from "./Editor";
import Queries from "./Queries";
import Tables from "./Tables";
import styles from "./index.module.css";

export default () => {
  const nav = useNavigate();
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    tab: string;
    filter: string;
    databases: IDatabase[];
    tables: ITable[];
    columns: ColDef[];
    rows: any[];
    page: number;
    pageSize: number;
    total: number;
  }>({
    tab: "tables",
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
              <Tabs
                className="mb-1 text-center"
                value={state.tab}
                onValueChange={(e) => (state.tab = e)}
              >
                <TabsList>
                  <TabsTrigger value="tables">Tables</TabsTrigger>
                  <TabsTrigger value="queries">Queries</TabsTrigger>
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className={styles.side}>
                <Offscreen visible={state.tab === "tables"}>
                  <Tables />
                </Offscreen>
                <Offscreen visible={state.tab === "queries"}>
                  <Queries />
                </Offscreen>
                <Offscreen visible={state.tab === "chats"}>
                  <Chats />
                </Offscreen>
              </div>
            </ResizablePanel>
            <ResizableHandle className="w-[3px] hover:bg-primary" withHandle />
            <ResizablePanel className={styles.main}>
              <Allotment vertical>
                <Allotment.Pane key="editor" minSize={70}>
                  <Editor />
                </Allotment.Pane>
                <Allotment.Pane
                  key="panel"
                  snap
                  minSize={100}
                  preferredSize="40%"
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
                </Allotment.Pane>
              </Allotment>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
};
