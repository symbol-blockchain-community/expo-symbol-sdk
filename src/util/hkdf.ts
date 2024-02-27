import createHmac from "create-hmac";

export default class hkdf {
  static extract(key: Buffer, message: Buffer) {
    const hmac = createHmac("sha256", key);
    hmac.update(message);
    return hmac.digest();
  }

  static expand(prk: Buffer, info: Buffer, length: number) {
    const iterations = Math.ceil(length / 32);
    const buffers = [];
    let prev = Buffer.from("");
    for (let i = 0; i < iterations; i++) {
      const hmac = createHmac("sha256", prk);
      hmac.update(prev);
      hmac.update(info);
      hmac.update(Buffer.from([i + 1]));
      prev = hmac.digest();
      buffers.push(prev);
    }
    return Buffer.concat(buffers, length);
  }

  static deriveSecret(secret: Buffer, salt: Buffer, info: Buffer, length: number) {
    const prk = hkdf.extract(salt, secret);
    return hkdf.expand(prk, info, length);
  }
}
