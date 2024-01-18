import PageLoading from "@/components/PageLoading";
import { ThemeProvider } from "@/components/ThemeProvider";
import router from "@/router";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StillnessProvider } from "react-stillness-component";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="theme">
    <StillnessProvider>
      <RouterProvider router={router} fallbackElement={<PageLoading />} />
    </StillnessProvider>
  </ThemeProvider>,
);

console.log("🎉 Node version", window.versions.node());
console.log("🎉 Chrome version", window.versions.chrome());
console.log("🎉 Electron version", window.versions.electron());
