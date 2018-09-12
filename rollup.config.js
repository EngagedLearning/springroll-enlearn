import babel from "rollup-plugin-babel";
import license from "rollup-plugin-license";
import cleanup from "rollup-plugin-cleanup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import path from "path";
import fs from "fs";

const input = "src/index.js";

const plugins = [
  resolve({ browser: true }),
  commonjs(),
  babel({
    exclude: "node_modules/**",
  }),
  cleanup(),
  license({
    banner: {
      file: path.join(__dirname, "banner.txt"),
      data() {
        return {
          license: fs.readFileSync(path.join(__dirname, "LICENSE")),
        };
      },
    },
  }),
];

export default [
  {
    input: input,
    output: {
      file: "dist/springroll-enlearn.umd.js",
      format: "umd",
      name: "enlearn",
      globals: {
        "@enlearn/client": "enlearn",
      },
    },
    plugins: plugins,
    external: ["@enlearn/client"],
  },
  {
    input: input,
    output: {
      file: "dist/springroll-enlearn.esm.js",
      format: "esm",
      name: "enlearn",
    },
    plugins: plugins,
    external: ["@enlearn/client"],
  },
];
