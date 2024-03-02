import forge from 'node-forge';

export function createRandomBytes(len: number): Uint8Array {
  return new Uint8Array(Array.from(forge.random.getBytesSync(32), (c) => c.charCodeAt(0)));
}
