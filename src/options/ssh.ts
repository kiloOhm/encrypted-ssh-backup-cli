import { NodeSSH } from "node-ssh";
import { Option } from "./option";
import { readFile } from "fs/promises";

export const sshOption: Option = {
  name: "ssh",
  shortName: "ssh",
  description: "[user@host] [privateKeyPath] - SSH into a remote server",
  action: async (ctx, args) => {
    if(!args[0] || !args[1]) {
      console.log("Usage: vbc ssh [user@host] [privateKeyPath]");
      process.exit(1);
    }
    const ssh = new NodeSSH();
    const [ username, host ] = args[0].split('@');
    const privateKey = await readFile(args[1], "utf-8");
    await ssh.connect({
      host,
      username,
      privateKey,
    });
    ctx.set('ssh', ssh);
    return () => {
      ssh.dispose();
    }
  },
};
