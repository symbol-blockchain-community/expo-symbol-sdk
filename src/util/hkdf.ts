import forge from 'node-forge';
import { Convert } from './converter';

export default class hkdf {
  static extract(key: Uint8Array, message: Uint8Array) {
    var hmac = forge.hmac.create();
    hmac.start('sha256', forge.util.createBuffer(key));
    hmac.update(String.fromCharCode.apply(null, [...message]));
    return hmac.digest();
  }

  static expand(prk: forge.util.ByteStringBuffer, info: string, length: number) {
    const iterations = Math.ceil(length / 32);
    const buffers = [];
    let prev = new Uint8Array();
    for (let i = 0; i < iterations; i++) {
      var hmac = forge.hmac.create();
      hmac.start('sha256', prk);
      hmac.update(String.fromCharCode.apply(null, [...prev]));
      hmac.update(info);
      hmac.update(forge.util.text.utf8.decode(new Uint8Array([i + 1])));
      let digestBytes = hmac.digest().getBytes();
      let digestCodes = Array.from(digestBytes, c => c.charCodeAt(0));
      prev = new Uint8Array(digestCodes);
      buffers.push(prev);
    }
    return Convert.concatArrays(buffers);
  }

  static deriveSecret(secret: Uint8Array, salt: Uint8Array, info: string, length: number) {
    const prk = hkdf.extract(salt, secret);
    return hkdf.expand(prk, info, length);
  }
}
