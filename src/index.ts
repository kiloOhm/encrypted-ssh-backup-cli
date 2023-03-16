#!/usr/bin/env node --no-warnings
import { NodeSSH } from 'node-ssh';
import { options, explainOption, interpret } from './options';
import { writeFile, rm, readdir, stat, mkdir } from 'fs/promises';
import { decrypt, encrypt } from './util/crypto';
import { createPublicKey, createPrivateKey } from 'crypto';
import dotenv from 'dotenv';
import { fileNameSafeDate } from './util/time';
dotenv.config();

let args = process.argv.slice(2);
if(!args.length) {
  if(process.env.SSH_HOST && process.env.SSH_USER && process.env.SSH_PRIV_KEY) {
    args.push('-ssh');
    args.push(process.env.SSH_USER + '@' + process.env.SSH_HOST);
    args.push(process.env.SSH_PRIV_KEY);
  }
  if(process.env.DATA_PATH) {
    args.push('-o');
    args.push(process.env.DATA_PATH);
  }
  if(process.env.REMOTE_PATH) {
    args.push('-r');
    args.push(process.env.REMOTE_PATH);
  }
  if(process.env.ENC_PUB_KEY) {
    args.push('-e');
    args.push(process.env.ENC_PUB_KEY);
  }
}
if (args.length === 0) {
  console.log('Usage: esbc [options]\n');
  console.log('Options:');
  options.forEach(cmd => {
    console.log(explainOption(cmd));
  });
  process.exit(1);
}
interpret(args, async (ctx) => {
  if(ctx.has('newKeyPair')) {
    const { priv, pub } = ctx.get('newKeyPair') as { priv: string, pub: string }; 
    let out = ctx.get('out') as string;
    if(!out) {
      out = process.cwd();
    }
    await Promise.all([
      writeFile(`${out}/enc_rsa`, priv),
      writeFile(`${out}/enc_rsa.pub`, pub),
    ]);
    return;
  }
  if(ctx.has('decrypt')) {
    const privateKey = ctx.get('decrypt').priv;
    if(privateKey && typeof privateKey !== 'string') {
      throw new Error('Invalid private key');
    }
    let out = ctx.get('out') as string;
    if(!out) {
      out = process.cwd() + '/decrypted';
    }
    let _in = ctx.get('in') as string;
    if(!_in) {
      _in = process.cwd();
    }
    if(out === _in) {
      throw new Error('Input and output directories cannot be the same');
    }
    //recursive decrypt
    async function decryptDir(path: string = _in, root?: string) {
      const files = await readdir(path);
      for(const file of files) {
        const fullPath = `${path}/${file}`;
        const stats = await stat(fullPath);
        if(stats.isDirectory()) {
          await decryptDir(fullPath, root ?? path);
        }
        if(stats.isFile()) {
          if(!fullPath.endsWith('.enc')) continue;
          const relativePath = fullPath.replace(root ?? path, '').replace('.enc', '');
          const fullOutPath = `${out}/${relativePath}`;
          // assert parent directory exists
          const parentDir = fullOutPath.split('/').slice(0, -1).join('/');
          try {
            await readdir(parentDir);
          } catch(e) {
            if(e.code !== 'ENOENT') throw e;
            await mkdir(parentDir, { recursive: true });
          }
          await decrypt(fullPath, fullOutPath, createPrivateKey(privateKey as string));
        }
      }
    }
    await decryptDir();
    console.log('Successfully decrypted data');
    return;
  }
  const ssh = ctx.get('ssh') as NodeSSH;
  if(!ssh || !ssh.isConnected()) {
    throw new Error('SSH connection not established');
  }
  let out = ctx.get('out') as string;
  if(!out) {
    out = process.cwd();
  }
  const publicKey = ctx.get('encrypt').pub;
  if(publicKey && typeof publicKey !== 'string') {
    throw new Error('Invalid public key');
  }
  const remotePath = ctx.get('remote');
  if(!remotePath || typeof remotePath !== 'string') {
    throw new Error('No remote path specified');
  }
  const localPath = out + `/backup ${fileNameSafeDate(new Date())}`;
  await mkdir(localPath, { recursive: true })
  if(await ssh.getDirectory(localPath, remotePath, {
    recursive: true,
    async tick(localPath, remotePath, error) {
      if (error) {
        console.error('Failed to copy data from remote server', error);
      } else {
        if(publicKey) {
          await encrypt(localPath, createPublicKey(publicKey as string));
          await rm(localPath, { force: true });
        } else {
          console.log(`Copied ${remotePath}`);
        }
      }
    },
  })) {
    console.log('Successfully copied data');
  }
}).then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});