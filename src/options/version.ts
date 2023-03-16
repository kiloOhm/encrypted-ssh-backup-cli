import { Option } from "./option";

export const versionOption: Option = {
  name: 'version',
  shortName: 'v',
  description: '- prints the current version',
  action: async () => {
    const pkg = await import('../../package.json', {
      assert: { type: 'json' }
    });
    console.log(pkg.default.version);
  }
};
