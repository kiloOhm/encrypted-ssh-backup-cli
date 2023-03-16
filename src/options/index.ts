import { decryptOption } from "./decrypt";
import { encryptOption } from "./encrypt";
import { genKeyOption } from "./genkey";
import { inOption } from "./in";
import { Option } from "./option";
import { outOption } from "./out";
import { remoteOption } from "./remote";
import { sshOption } from "./ssh";
import { versionOption } from "./version";

export const options: Option[] = [
  versionOption,
  sshOption,
  inOption,
  outOption,
  encryptOption,
  genKeyOption,
  decryptOption,
  remoteOption
];

export function explainOption(opt: Option): string {
  const shortName = opt.shortName ? `-${opt.shortName}, ` : '';
  return `  ${shortName}--${opt.name} ${opt.description}`;
}

export async function interpret(args: string[], callback?: (ctx: Map<string, any>) => Promise<void> | void) {
  const foundOptions = new Map<number, string[]>();
  let currentIdx = 0;
  for(const arg of args) {
    if (arg.startsWith('-')) {
      let opt: Option;
      if(arg.startsWith('--')) {
        opt = options.find(o => o.name === arg.slice(2));
      } else {
        opt = options.find(o => o.shortName === arg.slice(1));
      }
      if (opt) {
        currentIdx = options.indexOf(opt);
        foundOptions.set(currentIdx, []);
      }
    } else {
      foundOptions.get(currentIdx).push(arg);
    }
  }
  const cleanup = [];
  const ctx = new Map<string, any>();
  for(const [idx, args] of foundOptions) {
    const cleanupCallback = await options[idx].action(ctx, args);
    if (cleanupCallback) {
      cleanup.push(cleanupCallback);
    }
  }
  await callback?.(ctx);
  for(const cb of cleanup) {
    await cb();
  }
  ctx.clear();
}