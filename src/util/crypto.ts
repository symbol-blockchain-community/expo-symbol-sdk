import crypto from "expo-crypto";

export function createRandomBytes(len: number): Uint8Array {
  return crypto.getRandomBytes(len);
}
