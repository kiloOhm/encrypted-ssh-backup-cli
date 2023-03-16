import { Option } from "./option";
import { readFile } from "fs/promises";

export const decryptOption: Option = {
  name: "decrypt",
  shortName: "d",
  description: "[path/to/private/key] - decrypt files",
  action: async (ctx, args) => {
    const path = args[0];
    if (!path || typeof path !== "string") {
      throw new Error("No private key specified");
    }
    const priv = await readFile(path, "utf-8");
    ctx.set('decrypt', { priv });
  }
};