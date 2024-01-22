import { trpc } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import connectionModel, { Connection } from "@/models/connection.model";
import { ConnectionSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useReactive } from "ahooks";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CopyIcon,
  FilePenLineIcon,
  PlusIcon,
  RotateCwIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCopyToClipboard } from "react-use";
import { toast } from "sonner";
import { useSnapshot } from "valtio";
import * as z from "zod";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";

const DatabaseTypeMaps: Record<string, string> = {
  mysql: "MySQL",
};
export default () => {
  const [_, copyToClipboard] = useCopyToClipboard();
  const nav = useNavigate();
  const state = useReactive<{
    visible: boolean;
    testing: boolean;
    target: Connection | null;
  }>({
    visible: false,
    testing: false,
    target: null,
  });

  const form = useForm<z.infer<typeof ConnectionSchema>>({
    resolver: zodResolver(ConnectionSchema),
    defaultValues: {
      type: "mysql",
      alias: "",
      host: "",
      port: "3306",
      user: "",
      password: "",
      database: "",
    },
  });
  useEffect(() => {
    if (state.visible) {
      if (state.target) {
        form.reset({ ...state.target });
      } else {
        form.setValue("type", "mysql");
        form.setValue("port", "3306");
      }
    } else {
      state.target = null;
      form.reset();
    }
  }, [form, state.visible, state.target]);
  const onSubmit = async (
    data: z.infer<typeof ConnectionSchema>,
    isTesting: boolean = false,
  ) => {
    try {
      if (isTesting) {
        state.testing = true;
        const res = await trpc.connection.ping.query({ ...data });
        if (res.status) {
          toast.success("Successfully connected", { duration: 2000 });
        } else {
          const data = JSON.parse(res.data);
          toast.error(`${data.code}:${data.errno}`, {
            description: data.message,
            duration: 2000,
          });
        }
      } else {
        if (state.target) {
          connectionModel.update({
            id: state.target.id,
            ...data,
          });
          toast.success("Successfully updated", { duration: 2000 });
        } else {
          connectionModel.create({
            id: nanoid(),
            ...data,
          });
          toast.success("Successfully added", { duration: 2000 });
        }
        state.visible = false;
      }
    } catch (err) {
      console.error(err);
    } finally {
      state.testing = false;
    }
  };

  const { list } = useSnapshot(connectionModel.state);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const columns: ColumnDef<Connection>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "alias",
      header: "Connection alias",
      cell: ({ row }) => (
        <div
          className="cursor-pointer text-ellipsis underline hover:text-primary"
          onClick={async () => {
            const toastId = toast.loading("Connecting...");
            try {
              const res = await trpc.connection.connect.query(row.original);
              toast.dismiss(toastId);
              if (res.status) {
                toast.success("Successfully connected", { duration: 2000 });
                connectionModel.connect({
                  ...row.original,
                  version: res.data,
                });
                nav("/studio");
              } else {
                const data = JSON.parse(res.data);
                toast.error(`${data.code}:${data.errno}`, {
                  description: data.message,
                  duration: 2000,
                });
              }
            } finally {
              toast.dismiss(toastId);
            }
          }}
        >
          {row.getValue("alias")}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => (
        <div
          className="flex cursor-pointer items-center gap-1 text-ellipsis"
          onClick={() => {
            copyToClipboard(row.getValue("host"));
            toast.success("Copied to clipboard", { duration: 2000 });
          }}
        >
          {row.getValue("host")}
          <CopyIcon className="h-3 w-3 text-gray-500 hover:text-gray-100" />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "port",
      header: "Port",
      cell: ({ row }) => (
        <div className="text-ellipsis">{row.getValue("port")}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="text-ellipsis">{row.getValue("user")}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "lastConnection",
      header: () => <div className="text-right">Last connection</div>,
      cell: ({ row }) => {
        const date = row.getValue("lastConnection") as Date;
        return (
          <div className="text-right font-medium">
            {date ? formatDistanceToNow(date) : ""}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex items-center justify-end">
            <Button
              className="h-8 w-8 p-0 lg:flex"
              variant="ghost"
              onClick={() => {
                state.target = data;
                state.visible = true;
              }}
            >
              <FilePenLineIcon className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-200" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="h-8 w-8 p-0 lg:flex" variant="ghost">
                  <Trash2Icon className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-200" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col p-4" side="left">
                <div className="mt-2 text-sm">
                  Are you sure you want to delete?
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await connectionModel.remove(data);
                      table.resetRowSelection();
                      toast.success("Deleted", {
                        duration: 2000,
                      });
                    }}
                  >
                    Yes
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];
  const table = useReactTable({
    data: list as any,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.title}>Connections</div>
      <div className="flex items-center justify-between py-4">
        <Button onClick={() => (state.visible = true)}>
          <PlusIcon className="mr-1 h-4 w-4" />
          ADD CONNECTION
        </Button>
        <div className="relative max-w-[300px] ">
          <SearchIcon className="absolute bottom-0 left-3 top-0 my-auto h-5 w-5 text-gray-500" />
          <Input
            className="rounded-md pl-10 pr-4"
            type="text"
            placeholder="Connection List Search"
            value={(table.getColumn("alias")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("alias")?.setFilterValue(event.target.value)
            }
          />
        </div>
      </div>

      <ResizablePanelGroup className={styles.content} direction="horizontal">
        <ResizablePanel>
          <div className={styles.list}>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 p-2">
              <div className="flex h-8 flex-1 items-center text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="ml-2 h-8 w-8 p-0 lg:flex"
                        variant="destructive"
                        size="sm"
                        disabled={
                          table.getFilteredSelectedRowModel().rows.length <= 0
                        }
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col p-4" side="top">
                      <div className="mt-2 text-sm">
                        Are you sure you want to delete?
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            for (let row of table.getFilteredSelectedRowModel()
                              .rows) {
                              await connectionModel.remove(row.original);
                            }
                            table.resetRowSelection();
                            toast.success("Deleted", {
                              duration: 2000,
                            });
                          }}
                        >
                          Yes
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex items-center space-x-2 lg:space-x-8">
                <div className="flex items-center justify-center text-xs text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
        {state.visible && (
          <>
            <ResizableHandle className="w-[3px] hover:bg-primary" withHandle />
            <ResizablePanel maxSize={40} minSize={30}>
              <div className={styles.main}>
                <div className="absolute right-8 top-6">
                  <Button
                    variant="ghost"
                    className="hidden h-8 w-8 p-0 hover:bg-slate-700 lg:flex"
                    onClick={() => (state.visible = false)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className={styles.form}>
                  <h1 className={styles.title}>
                    {!state.target ? "Add" : "Update"} Connection
                  </h1>
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="type"
                      defaultValue="mysql"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            Database Type*
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Database Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(DatabaseTypeMaps).map((k) => (
                                <SelectItem key={k} value={k}>
                                  {DatabaseTypeMaps[k]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            Connection Alias*
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Connection Alias"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            Host*
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Host" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            Port*
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Port" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            User*
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter User" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            Password*
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter Password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="database"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-slate-300">
                            Database
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Database" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>
                </div>
                <div className={styles.action}>
                  <div>
                    <Button
                      disabled={
                        state.testing ||
                        !form.formState.isValid ||
                        form.formState.isSubmitting
                      }
                      variant="ghost"
                      onClick={form.handleSubmit((values) => {
                        onSubmit(values, true);
                      })}
                    >
                      {state.testing && (
                        <RotateCwIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      onClick={() => {
                        state.visible = false;
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        state.testing ||
                        !form.formState.isValid ||
                        form.formState.isSubmitting
                      }
                      onClick={form.handleSubmit((values) => {
                        onSubmit(values);
                      })}
                    >
                      {form.formState.isSubmitting && (
                        <RotateCwIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!state.target ? "Add" : "Update"} Connection
                    </Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
