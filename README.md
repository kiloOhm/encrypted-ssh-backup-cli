# encrypted-ssh-backup-cli

A utility cli to ssh into a remote machine, copy some data and encrypt it. I built this to back up my password manager data to my local machine. 

## 1. Installation
clone this repository and run:

```
npm run ig
```

## 2. Usage
```
Usage: esbc [options]

Options:
  -v, --version - prints the current version
  -ssh, --ssh [user@host] [privateKeyPath] - SSH into a remote server
  -i, --in [dir] - set input directory
  -o, --out [dir] - set output directory
  -e, --encrypt [path/to/public/key] - encrypt files
  -g, --genkey - generate a new rsa keypair for encryption
  -d, --decrypt [path/to/private/key] - decrypt files
  -r, --remote The remote path to copy from
```
To make automation easier, you can also create a .env file like so:
```
REMOTE_PATH=/var/lib/docker/volumes/app_data
OUT_PATH=./data
SSH_USER=root
SSH_HOST=1.1.1.1
SSH_PRIV_KEY=./.ssh/id_rsa
ENC_PUB_KEY=./.keys/enc_rsa.pub
```
Whith this .env file in your CWD, just run ``esbc``
## 3. Encryption
Provide an RSA public key with --encrypt to encrypt data. You can generate a new keypair with --genkey.

Encryption happens after data has been saved to disk. Original files will be removed.

Don't save the private key on your machine. Otherwise, what is the point of encrypting?

Decrypt your backup like this:
```
esbc -d ./.keys/enc_rsa -i ./data/backup\ 2023-03-16\ 19-55-38
```

The data is encrypted with aes-256-cbc. For each file, 16 bytes of randomness are generated, used as the encryption key, themselves encrypted with RSA and saved alongside the encrypted data.
Why? Because RSA is not suited for encrypting mass data.
