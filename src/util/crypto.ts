import crypto from "crypto";

type CryptoAlgorithm = "aes-256-gcm";

export function createRandomBytes(len: number): Buffer {
  return crypto.randomBytes(len);
}

export function createCipheriv(alg: CryptoAlgorithm, encKey: Buffer, envIv: Buffer) {
  return crypto.createCipheriv(alg, encKey, envIv);
}

export function createDecipheriv(alg: CryptoAlgorithm, encKey: Buffer, envIv: Buffer) {
  return crypto.createDecipheriv(alg, encKey, envIv);
}
