import { trpc } from "@/api/client";
import { ICharacterSet, ICollation, IDatabase } from "@/api/interfaces";
import KeepAlive from "@/components/KeepAlive";
import SearchableSelect from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import connectionModel from "@/models/connection.model";
import { CreateDatabaseSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactive } from "ahooks";
import { Allotment } from "allotment";
import {
  InfoIcon,
  LogOutIcon,
  RocketIcon,
  RotateCwIcon,
  UserIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSnapshot } from "valtio";
import * as z from "zod";
import Chat from "./Chat";
import Data from "./Data";
import Editor from "./Editor";
import Panel from "./Panel";
import styles from "./index.module.css";

const SYSTEM_DBS = ["information_schema", "mysql", "performance_schema", "sys"];

export default () => {
  const nav = useNavigate();
  const { target } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    open: boolean;
    tab: string;
    filter: string;
    databases: IDatabase[];
    characterSets: ICharacterSet[];
    collations: ICollation[];
    encoding: string;
    collation: string;
  }>({
    open: false,
    tab: "data",
    filter: "",
    databases: [],
    characterSets: [],
    collations: [],
    encoding: "",
    collation: "",
  });

  const form = useForm<z.infer<typeof CreateDatabaseSchema>>({
    resolver: zodResolver(CreateDatabaseSchema),
    defaultValues: {
      name: "",
      encoding: state.encoding,
      collation: state.collation,
    },
  });
  const watchEncoding = form.watch("encoding", state.encoding);

  useEffect(() => {
    getCharacterSets();
    loadDatebases();
  }, [target]);

  useEffect(() => {
    if (!!watchEncoding) {
      getCollations(watchEncoding);
    }
  }, [watchEncoding]);

  const getCharacterSets = async () => {
    if (target) {
      const res = await trpc.connection.getCharacterSets.query(target);
      if (res.status) {
        state.characterSets = res.data ?? [];
      }
    }
  };

  const getCollations = async (encoding: string) => {
    if (target && encoding) {
      const res = await trpc.connection.getCollations.query({
        characterSet: encoding,
        ...target,
      });
      if (res.status) {
        state.collations = res.data ?? [];
      }
    }
  };

  const loadDatebases = async () => {
    if (target) {
      const res = await trpc.connection.showDatabases.query(target);
      if (res.status) {
        state.databases =
          res.data.filter((o: IDatabase) => !SYSTEM_DBS.includes(o.name)) ?? [];
      }

      const variableRes = await Promise.all([
        await trpc.connection.showVariables
          .query({
            variable: "character_set_server",
            ...target,
          })
          .then((res) => res.data),
        await trpc.connection.showVariables
          .query({
            variable: "collation_server",
            ...target,
          })
          .then((res) => res.data),
      ]);
      state.encoding = variableRes[0];
      state.collation = variableRes[1];
      form.setValue("encoding", state.encoding);
      form.setValue("collation", state.collation);
    }
  };

  const onSubmit = async (data: z.infer<typeof CreateDatabaseSchema>) => {
    try {
      if (target) {
        const res = await trpc.connection.createDatabase.mutate({
          ...target,
          ...data,
        });
        if (res.status) {
          toast.success("Successfully created", { duration: 2000 });
          await loadDatebases();
          state.open = false;
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
      {target && (
        <>
          <Dialog open={state.open} onOpenChange={(e) => (state.open = e)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a new database</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-300">
                        Database Name*
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Database Name" {...field} />
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
                        Database Encoding (Default {state.encoding})
                      </FormLabel>
                      <FormControl>
                        <SearchableSelect
                          placeholder="Database Encoding"
                          value={field.value}
                          onChange={field.onChange}
                          options={state.characterSets.map((o) => ({
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
                        Database Collation (Default {state.collation})
                      </FormLabel>
                      <FormControl>
                        <SearchableSelect
                          placeholder="Database Collation"
                          value={field.value}
                          onChange={field.onChange}
                          options={state.collations.map((o) => ({
                            value: o.collationName,
                            label: o.collationName,
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
                  disabled={
                    !form.formState.isValid || form.formState.isSubmitting
                  }
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
                    <DropdownMenuItem
                      onClick={() => {
                        state.open = true;
                      }}
                    >
                      Create a new database
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Databases</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={target.database ?? ""}
                    onValueChange={(e) => connectionModel.changeDatabase(e)}
                  >
                    {SYSTEM_DBS.map((d) => (
                      <DropdownMenuRadioItem key={d} value={d}>
                        {d}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
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
              <Allotment defaultSizes={[30, 70]} vertical>
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
