import SearchableSelect from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import connectionModel from "@/models/connection.model";
import { CreateTableSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useReactive } from "ahooks";
import { IPaneviewPanelProps } from "dockview";
import { RotateCwIcon, SearchIcon, TableIcon } from "lucide-react";
import Highlighter from "react-highlight-words";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSnapshot } from "valtio";
import * as z from "zod";
import styles from "./index.module.css";
import { trpc } from "@/api/client";
import { useEffect } from "react";

interface TablesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default ({
  params: { open, onOpenChange },
}: IPaneviewPanelProps<TablesProps>) => {
  const { target, table, tables, characterSets, collations, engines } =
    useSnapshot(connectionModel.state);
  const state = useReactive<{
    filter: string;
  }>({
    filter: "",
  });

  const form = useForm<z.infer<typeof CreateTableSchema>>({
    resolver: zodResolver(CreateTableSchema),
    defaultValues: {
      name: "",
    },
  });
  const watchEncoding = form.watch("encoding");

  useEffect(() => {
    if (!!watchEncoding) {
      connectionModel.getCollations(watchEncoding);
    }
  }, [watchEncoding]);

  const onSubmit = async (data: z.infer<typeof CreateTableSchema>) => {
    try {
      if (target) {
        const res = await trpc.connection.createTable.mutate({
          ...target,
          ...data,
        });
        if (res.status) {
          form.reset();
          toast.success("Successfully created", { duration: 2000 });
          await connectionModel.loadTables();
          onOpenChange(false);
        } else {
          const data = JSON.parse(res.data);
          toast.error(`${data.code}:${data.errno}`, {
            description: data.message,
            duration: 2000,
          });
        }
      }
    } catch (err: any) {
      console.log(err);
      const data = JSON.parse(err.message);
      toast.error(`${data[0]?.code}`, {
        description: data[0].message,
        duration: 2000,
      });
    }
  };

  return (
    <div className={styles.container}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new table</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-300">
                    Table Name*
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Table Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="encoding"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-slate-300">
                    Table Encoding
                  </FormLabel>
                  <FormControl>
                    <SearchableSelect
                      placeholder="Table Encoding"
                      value={field.value}
                      onChange={field.onChange}
                      options={characterSets.map((o) => ({
                        value: o.characterSetName,
                        label: o.characterSetName,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collation"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-slate-300">
                    Table Collation
                  </FormLabel>
                  <FormControl>
                    <SearchableSelect
                      placeholder="Table Collation"
                      value={field.value}
                      onChange={field.onChange}
                      options={collations.map((o) => ({
                        value: o.collationName,
                        label: o.collationName,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="engine"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-slate-300">
                    Table Engine
                  </FormLabel>
                  <FormControl>
                    <SearchableSelect
                      placeholder="Table Engine"
                      value={field.value}
                      onChange={field.onChange}
                      options={engines.map((o) => ({
                        value: o.engine,
                        label: o.engine,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <DialogFooter>
            <Button
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              onClick={form.handleSubmit((values) => {
                onSubmit(values);
              })}
            >
              {form.formState.isSubmitting && (
                <RotateCwIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className={styles.filter}>
        <SearchIcon className="absolute bottom-0 left-4 top-0 my-auto h-4 w-4 text-gray-500" />
        <Input
          className="h-8 rounded-md border-none pl-8 pr-4 text-xs"
          type="text"
          placeholder="Filter"
          value={state.filter}
          onChange={(event) => (state.filter = event.target.value)}
        />
      </div>
      {tables
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
