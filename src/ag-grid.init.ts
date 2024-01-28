import "@/assets/styles/ag-grid.css";

import { ModuleRegistry } from "@ag-grid-community/core";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  InfiniteRowModelModule,
]);
