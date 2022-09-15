import path from "path";

/** @type {import('vite').UserConfig} */
export default {
  root: path.resolve(__dirname, "game"),
  server: {
    port: 3000,
  },
  envDir: path.resolve(__dirname, "."),
};
