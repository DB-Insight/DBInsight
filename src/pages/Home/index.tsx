import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReactive } from "ahooks";
import { PlusIcon, SearchIcon } from "lucide-react";
import styles from "./index.module.css";

export default () => {
  const state = useReactive({
    filter: "",
  });
  return (
    <div className={styles.container}>
      <div className={styles.title}>Databases</div>
      <div className="flex items-center justify-between py-4">
        <Button>
          <PlusIcon className="mr-1 h-4 w-4" />
          ADD DATABASE
        </Button>
        <div className="relative max-w-[300px] ">
          <SearchIcon className="absolute bottom-0 left-3 top-0 my-auto h-5 w-5 text-gray-500" />
          <Input
            className="pl-10 pr-4"
            type="text"
            placeholder="Database List Search"
            value={state.filter}
            onChange={(event) => (state.filter = event.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
