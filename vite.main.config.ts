import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
      // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
      browserField: false,
      mainFields: ["module", "jsnext:main", "jsnext"],
    },
    build: {
      rollupOptions: {
        external: ["fsevents"],
      },
    },
  });
};
