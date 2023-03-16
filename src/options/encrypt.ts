import { Option } from "./option";
import { readFile } from "fs/promises";

export const encryptOption: Option = {
  name: "encrypt",
  shortName: "e",
  description: "[path/to/public/key] - encrypt files",
  action: async (ctx, args) => {
    const path = args[0];
    if (!path || typeof path !== "string") {
      throw new Error("No public key specified");
    }
    const pub = await readFile(path, "utf-8");
    ctx.set('encrypt', { pub });
  },
};