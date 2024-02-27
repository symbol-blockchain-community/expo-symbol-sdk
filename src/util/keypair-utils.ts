import CryptoJS from "crypto-js";
import hkdf from "futoin-hkdf";
import { sha512 } from "js-sha512";
import { RawArray } from "./raw-array";
import * as nacl from "./nacl_catapult";

export const Key_Size = 32;
export const Signature_Size = 64;
export const Half_Signature_Size = Signature_Size / 2;
export const Hash_Size = 64;
export const Half_Hash_Size = Hash_Size / 2;
/**
 * Convert an Uint8Array to WordArray
 *
 * @param {Uint8Array} ua - An Uint8Array
 * @param {number} uaLength - The Uint8Array length
 *
 * @return {WordArray}
 */
export const ua2words = (ua: Uint8Array, uaLength: number): any => {
  const temp: number[] = [];
  for (let i = 0; i < uaLength; i += 4) {
    const x = ua[i] * 0x1000000 + (ua[i + 1] || 0) * 0x10000 + (ua[i + 2] || 0) * 0x100 + (ua[i + 3] || 0);
    temp.push(x > 0x7fffffff ? x - 0x100000000 : x);
  }
  return CryptoJS.lib.WordArray.create(temp, uaLength);
};

// custom catapult crypto functions
export const catapult_crypto = (() => {
  function clamp(d: Uint8Array): void {
    d[0] &= 248;
    d[31] &= 127;
    d[31] |= 64;
  }

  function prepareForScalarMult(sk: string | Uint8Array | number[] | ArrayBuffer): Uint8Array {
    const d = new Uint8Array(64);
    const hash = sha512.arrayBuffer(sk);
    RawArray.copy(d, RawArray.uint8View(hash), 32);
    clamp(d);
    return d;
  }

  return {
    deriveSharedKey: (privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array => {
      const sharedSecret: any = catapult_crypto.deriveSharedSecret(privateKey, publicKey);
      const info = "catapult";
      const hash = "SHA-256";
      return hkdf(sharedSecret, 32, {
        salt: Buffer.from(new Uint8Array(32)),
        info,
        hash,
      });
    },

    deriveSharedSecret: (privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array => {
      const c = nacl;
      const d = prepareForScalarMult(privateKey);

      // sharedKey = pack(p = d (derived from privateKey) * q (derived from publicKey))
      const q = [c.gf(), c.gf(), c.gf(), c.gf()];
      const p = [c.gf(), c.gf(), c.gf(), c.gf()];
      const sharedSecret = new Uint8Array(Key_Size);

      c.unpack(q, publicKey);
      c.scalarmult(p, q, d);
      c.pack(sharedSecret, p);
      return sharedSecret;
    },
  };
})();
