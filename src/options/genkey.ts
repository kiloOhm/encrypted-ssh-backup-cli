import { generateKeyPair } from "../util/crypto";
import { Option } from "./option";

export const genKeyOption: Option = {
  name: "genkey",
  shortName: "g",
  description: "- generate a new rsa keypair for encryption",
  action: async (ctx, args) => {
    const { privateKey, publicKey } = await generateKeyPair()
    ctx.set('newKeyPair', { 
      priv: privateKey.export({ type: 'pkcs1', format: 'pem' }).toString('utf-8'), 
      pub: publicKey.export({ type: 'spki', format: 'pem' }).toString('utf-8')
    });
  },
};