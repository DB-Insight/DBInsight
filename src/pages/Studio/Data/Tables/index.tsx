import { trpc } from "@/api/client";
import { ITable } from "@/api/interfaces";
import InlineEditInput from "@/components/InlineEditInput";
import SearchableSelect from "@/components/SearchableSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import connectionModel from "@/models/connection.model";
import { CreateTableSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useReactive } from "ahooks";
import { IPaneviewPanelProps } from "dockview";
import { RotateCwIcon, SearchIcon, TableIcon } from "lucide-react";
import { useEffect } from "react";
import Highlighter from "react-highlight-words";
import { useForm } from "react-hook-form";
import { useCopyToClipboard } from "react-use";
import { toast } from "sonner";
import { useSnapshot } from "valtio";
import * as z from "zod";
import styles from "./index.module.css";

interface TablesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default ({
  params: { open, onOpenChange },
}: IPaneviewPanelProps<TablesProps>) => {
  const [_, copyToClipboard] = useCopyToClipboard();
  const { target, table, tables, characterSets, collations, engines } =
    useSnapshot(connectionModel.state);
  const state = useReactive<{
    filter: string;
    editName: string;
    target: ITable | null;
    confirmType: string;
  }>({
    filter: "",
    editName: "",
    target: null,
    confirmType: "drop",
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
          await connectionModel.getTables();
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
      <AlertDialog open={!!state.target}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure to{" "}
              {state.confirmType === "drop" ? "drop" : "truncate"} the table?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                state.target = null;
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (target && state.target?.tableName) {
                  try {
                    if (state.confirmType === "drop") {
                      const res = await trpc.connection.dropTable.mutate({
                        table: state.target?.tableName,
                        ...target,
                      });
                      if (res.status) {
                        toast.success("Drop Successfully", {
                          duration: 2000,
                        });
                        await connectionModel.getTables();
                      } else {
                        const data = JSON.parse(res.data);
                        toast.error(`${data.code}:${data.errno}`, {
                          description: data.message,
                          duration: 2000,
                        });
                      }
                    } else {
                      const res = await trpc.connection.truncateTable.mutate({
                        table: state.target?.tableName,
                        ...target,
                      });
                      if (res.status) {
                        toast.success("Truncate Successfully", {
                          duration: 2000,
                        });
                      } else {
                        const data = JSON.parse(res.data);
                        toast.error(`${data.code}:${data.errno}`, {
                          description: data.message,
                          duration: 2000,
                        });
                      }
                    }
                  } catch (err: any) {
                    const data = JSON.parse(err.message);
                    toast.error(`${data[0]?.code}`, {
                      description: data[0].message,
                      duration: 2000,
                    });
                  } finally {
                    state.target = null;
                  }
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        .filter((t) => t.tableName.includes(state.filter))
        .map((t) => (
          <ContextMenu key={t.tableName}>
            <ContextMenuTrigger asChild>
              <div
                className={`${styles.item} ${table === t.tableName ? styles.active : null}`}
                onClick={() => {
                  connectionModel.changeTable(t.tableName);
                }}
              >
                <TableIcon className="h-4 w-4 min-w-4" />
                <div className={styles.name}>
                  {state.editName === t.tableName ? (
                    <InlineEditInput
                      defaultValue={t.tableName}
                      onSave={async (value) => {
                        try {
                          if (value !== state.editName) {
                            if (target) {
                              const res =
                                await trpc.connection.renameTable.mutate({
                                  table: t.tableName,
                                  name: value,
                                  ...target,
                                });
                              if (res.status) {
                                toast.success("Rename successfully", {
                                  duration: 2000,
                                });
                                await connectionModel.changeTable(value);
                                await connectionModel.getTables();
                                onOpenChange(false);
                              } else {
                                const data = JSON.parse(res.data);
                                toast.error(`${data.code}:${data.errno}`, {
                                  description: data.message,
                                  duration: 2000,
                                });
                              }
                            }
                          }
                        } catch (err: any) {
                          console.log(err);
                          const data = JSON.parse(err.message);
                          toast.error(`${data[0]?.code}`, {
                            description: data[0].message,
                            duration: 2000,
                          });
                        } finally {
                          state.editName = "";
                        }
                      }}
                    />
                  ) : (
                    <div>
                      <Highlighter
                        searchWords={[state.filter]}
                        autoEscape={true}
                        textToHighlight={t.tableName}
                        onDoubleClick={() => {
                          state.editName = t.tableName;
                        }}
                      />
                      <span className={styles.rows}>{t.tableRows} rows</span>
                    </div>
                  )}
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  copyToClipboard(t.tableName);
                  toast.success("Copied to clipboard", {
                    duration: 2000,
                  });
                }}
              >
                Copy the table name
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  state.editName = t.tableName;
                }}
              >
                Rename the table
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => {
                  state.target = t;
                  state.confirmType = "truncate";
                }}
              >
                Truncate the table
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  state.target = t;
                  state.confirmType = "drop";
                }}
              >
                Drop the table
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
    </div>
  );
};
