export type Option = {
  name: string;
  shortName?: string;
  description: string;
  action: ( ctx: Map<string, any>, args: any[]) => Promise<(() => Promise<void> | void) | void> | void;
}