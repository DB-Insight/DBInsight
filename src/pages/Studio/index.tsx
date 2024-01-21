import { trpc } from "@/api/client";
import { IDatabase, ITable } from "@/api/interfaces";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import {
  InfoIcon,
  LogOutIcon,
  RocketIcon,
  SearchIcon,
  TableIcon,
  UserIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default () => {
  const nav = useNavigate();
  const { target } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    filter: string;
    databases: IDatabase[];
    tables: ITable[];
  }>({
    filter: "",
    databases: [],
    tables: [],
  });

  useEffect(() => {
    (async () => {
      if (target) {
        const res = await trpc.connection.databases.query(target);
        state.databases = res.data ?? [];
      }
    })();
  }, [target]);

  useEffect(() => {
    (async () => {
      if (!!target?.database) {
        const res = await trpc.connection.tables.query(target);
        state.tables = res.data ?? [];
      }
    })();
  }, [target?.database]);

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
                <div className={styles.title}>Tables</div>
                <div className={styles.list}>
                  {state.tables
                    .filter((t) => t.name.includes(state.filter))
                    .map((t) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div key={t.name} className={styles.item}>
                              <TableIcon className="h-4 w-4 min-w-4" />
                              <div className={styles.name}>{t.name}</div>
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
              <div className={styles.main}></div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
};
