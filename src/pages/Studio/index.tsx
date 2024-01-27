import { trpc } from "@/api/client";
import { IDatabase } from "@/api/interfaces";
import KeepAlive from "@/components/KeepAlive";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import { Allotment } from "allotment";
import { InfoIcon, LogOutIcon, RocketIcon, UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import Chat from "./Chat";
import Data from "./Data";
import Editor from "./Editor";
import Panel from "./Panel";
import styles from "./index.module.css";

export default () => {
  const nav = useNavigate();
  const { target } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    tab: string;
    filter: string;
    databases: IDatabase[];
  }>({
    tab: "data",
    filter: "",
    databases: [],
  });

  useEffect(() => {
    loadDatebases();
  }, [target]);

  const loadDatebases = async () => {
    if (target) {
      const res = await trpc.connection.showDatabases.query(target);
      if (res.status) {
        state.databases = res.data ?? [];
      }
    }
  };

  return (
    <div className={styles.container}>
      {target && (
        <>
          <div className="flex items-center justify-between pl-2">
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
                  <Button className="h-8" variant="outline" size="sm">
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
          <Allotment className={styles.content} defaultSizes={[25, 75]}>
            <Allotment.Pane className={styles.side}>
              <Tabs
                className="mb-1 pr-[20px] text-center"
                value={state.tab}
                onValueChange={(e) => (state.tab = e)}
              >
                <TabsList>
                  <TabsTrigger className="py-1 text-xs" value="data">
                    Data
                  </TabsTrigger>
                  <TabsTrigger className="py-1 text-xs" value="chat">
                    Chat
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <KeepAlive visible={state.tab === "data"}>
                <Data />
              </KeepAlive>
              <KeepAlive visible={state.tab === "chat"}>
                <Chat />
              </KeepAlive>
            </Allotment.Pane>
            <Allotment.Pane className={styles.main}>
              <Allotment defaultSizes={[60, 40]} vertical>
                <Allotment.Pane
                  className={styles.editor}
                  key="editor"
                  snap
                  minSize={100}
                >
                  <Editor />
                </Allotment.Pane>
                <Allotment.Pane
                  className={styles.panel}
                  key="panel"
                  snap
                  minSize={100}
                >
                  <Panel />
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </>
      )}
    </div>
  );
};
