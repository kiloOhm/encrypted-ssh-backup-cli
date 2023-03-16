import { Option } from "./option";
import { readdir, mkdir } from "fs/promises";

export const outOption: Option = {
  name: "out",
  shortName: "o",
  description: "[dir] - set output directory",
  action: async (ctx, args) => {
    const dir = args[0];
    if (!dir || typeof dir !== "string") {
      throw new Error("No output directory specified");
    }
    //assert dir
    try {
      await readdir(dir);
    } catch (e) {
      if(e.code !== "ENOENT") throw e;
      await mkdir(dir, { recursive: true });
    }
    ctx.set("out", dir);
  },
};