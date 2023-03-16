import { Option } from "./option";

export const remoteOption: Option = {
  name: 'remote',
  shortName: 'r',
  description: 'The remote path to copy from',
  action: (ctx, args) => {
    if(args.length > 0) {
      ctx.set('remote', args[0]);
    }
  }
};