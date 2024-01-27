import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import ThemePro from "./themes/pro.json";
import styles from "./index.module.css";

export default () => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // @ts-ignore
      monaco.editor.defineTheme("Pro", ThemePro);
      monaco.editor.setTheme("Pro");

      monaco.editor.addCommand({
        id: "test",
        run: () => {
          console.log("rrr");
        },
      });

      monaco.languages.registerCodeLensProvider("sql", {
        provideCodeLenses: function (model, token) {
          return {
            lenses: [
              {
                range: {
                  startLineNumber: 1,
                  startColumn: 1,
                  endLineNumber: 2,
                  endColumn: 1,
                },
                id: "Run",
                command: {
                  id: "test",
                  title: "Run",
                },
              },
              {
                range: {
                  startLineNumber: 1,
                  startColumn: 1,
                  endLineNumber: 2,
                  endColumn: 1,
                },
                id: "Refactor",
                command: {
                  id: "test",
                  title: "Refactor",
                },
              },
              {
                range: {
                  startLineNumber: 1,
                  startColumn: 1,
                  endLineNumber: 2,
                  endColumn: 1,
                },
                id: "Explain",
                command: {
                  id: "test",
                  title: "Explain",
                },
              },
            ],
            dispose: () => {},
          };
        },
        resolveCodeLens: function (model, codeLens, token) {
          return codeLens;
        },
      });
    }
  }, [monaco]);

  return (
    <div className={styles.container}>
      <Editor
        defaultLanguage="sql"
        defaultValue={`SELECT * FROM db;`}
        theme="Pro"
      />
    </div>
  );
};
