import { trpc } from "@/api/client";
import { ITable } from "@/api/interfaces";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import {
  ChevronRightIcon,
  FilePlus2Icon,
  RefreshCcwIcon,
  TableIcon,
} from "lucide-react";
import { useEffect } from "react";
import Highlighter from "react-highlight-words";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

interface TablesProps {
  filter: string;
}

export default ({ filter }: TablesProps) => {
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    tables: ITable[];
  }>({
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
    <AccordionItem value="tables">
      <AccordionTrigger asChild>
        <div className={styles.header}>
          <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
          <div className={styles.name}>TABLES</div>
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FilePlus2Icon
                    className="h-4 w-4 hover:text-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>Create a new table</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <RefreshCcwIcon
                    className="h-4 w-4 cursor-pointer hover:text-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadTables();
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>Reload tables</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className={styles.container}>
          {state.tables
            .filter((t) => t.name.includes(filter))
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
                          searchWords={[filter]}
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
      </AccordionContent>
    </AccordionItem>
  );
};
