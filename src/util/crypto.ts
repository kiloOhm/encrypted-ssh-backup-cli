import { KeyObject, generateKeyPair as _generateKeyPair, randomBytes, publicEncrypt, createCipheriv, privateDecrypt, createDecipheriv } from "crypto";
import { createReadStream, createWriteStream } from "fs";
import { readFile, writeFile } from "fs/promises";

export function generateKeyPair() {
  return new Promise<{
    publicKey: KeyObject;
    privateKey: KeyObject;
  }>((resolve, reject) => {
    _generateKeyPair("rsa", {
      modulusLength: 2048,
    }, (err, publicKey, privateKey) => {
      if (err) {
        reject(err);
      } else {
        resolve({ publicKey, privateKey });
      }
    });
  })
}

export async function encrypt(path: string, publicKey: KeyObject) {
  return new Promise<void>(async (resolve, reject) => {
    const salt = randomBytes(16).toString('hex');
    const aesKey = Buffer.from(salt);
    const encryptedKey = publicEncrypt(publicKey, aesKey);
    await writeFile(path + '.enc.key', encryptedKey);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', aesKey, iv); 
    let input = createReadStream(path);
    let output = createWriteStream(path + '.enc');
    output.write(iv);
    input.pipe(cipher).pipe(output);
    output.on('finish', async () => {
      resolve();
    });
  });
}

export async  function decrypt(inPath: string, outPath: string, privateKey: KeyObject) {
  return new Promise<void>(async (resolve, reject) => {
    const encKey = await readFile(inPath + '.key');
    const decKey = privateDecrypt(privateKey, encKey);
    const input = createReadStream(inPath);
    const listener = () => {
      input.removeListener('readable', listener);
      const iv = input.read(16);
      const output = createWriteStream(outPath);
      const decipher = createDecipheriv('aes-256-cbc', decKey, iv);
      input.pipe(decipher).pipe(output);
      output.on('finish', () => {
        resolve();
      });
    };
    input.addListener('readable', listener);
  });
}