import { Option } from "./option";
import { readdir } from "fs/promises";

export const inOption: Option = {
  name: "in",
  shortName: "i",
  description: "[dir] - set input directory",
  action: async (ctx, args) => {
    const path = args[0];
    if (!path || typeof path !== "string") {
      throw new Error("No input directory specified");
    }
    //check if dir exists
    const dir = await readdir(path);
    if (!dir) {
      throw new Error("Input directory does not exist");
    }
    ctx.set("in", path);
  },
};