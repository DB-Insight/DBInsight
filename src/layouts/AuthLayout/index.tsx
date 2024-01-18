import PageLoading from "@/components/PageLoading";
import globalModel from "@/models/global.model";
import { Suspense } from "react";
import { Await } from "react-router-dom";
import MainLayout from "../MainLayout";

export default () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Await resolve={globalModel.load()}>
        {() => {
          return <MainLayout />;
        }}
      </Await>
    </Suspense>
  );
};
