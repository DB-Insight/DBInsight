import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import {
  FilePlus2Icon,
  RefreshCcwIcon,
  SearchIcon,
  TableIcon,
} from "lucide-react";
import Highlighter from "react-highlight-words";

import { trpc } from "@/api/client";
import { ITable } from "@/api/interfaces";
import { useReactive } from "ahooks";
import { useEffect } from "react";
import styles from "./index.module.css";
import { useSnapshot } from "valtio";

export default () => {
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    filter: string;
    tables: ITable[];
  }>({
    filter: "",
    tables: [],
  });

  useEffect(() => {
    loadTables();
  }, [target, target?.database]);

  const loadTables = async () => {
    if (!!target?.database) {
      const res = await trpc.connection.showTables.query(target);
      if (res.status) {
        state.tables = res.data ?? [];
      }
    }
  };

  return (
    <div className={styles.container}>
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
        <div className={styles.name}>Queries</div>
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
  );
};
