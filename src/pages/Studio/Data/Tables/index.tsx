import { trpc } from "@/api/client";
import { ITable } from "@/api/interfaces";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import { SearchIcon, TableIcon } from "lucide-react";
import { useEffect } from "react";
import Highlighter from "react-highlight-words";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    tables: ITable[];
    filter: string;
  }>({
    tables: [],
    filter: "",
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
      {/* <div className="relative">
        <SearchIcon className="absolute bottom-0 left-8 top-0 my-auto h-4 w-4 text-gray-500" />
        <Input
          className="h-8 rounded-md border-none pl-8 pr-4"
          type="text"
          placeholder="Filter"
          value={state.filter}
          onChange={(event) => (state.filter = event.target.value)}
        />
      </div> */}
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
  );
};
