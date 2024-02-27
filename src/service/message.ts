import { Convert } from "../util/converter";
import { createRandomBytes, createCipheriv, createDecipheriv } from "../util/crypto";
import { KeyPair } from "../util/keypair";
import * as utilities from "../util/keypair-utils";

export class EncryptMessage {
  private constructor() {}

  /**
   *
   * @param senderPrivateKey
   * @param recipientPublicKey
   * @param message plain text（not hex）
   * @returns encrypt message payload（hex）
   */
  static encrypt(senderPrivateKey: string, recipientPublicKey: string, message: string) {
    const payload: string = this.encode(senderPrivateKey, recipientPublicKey, message).toUpperCase();
    return payload;
  }

  /**
   *
   * @param recipientPrivateKey
   * @param senderPublicKey
   * @param messagePayload message payload (hex)
   */
  static decrypt(recipientPrivateKey: string, senderPublicKey: string, messagePayload: string) {
    const decoded: string = this.decode(recipientPrivateKey, senderPublicKey, messagePayload);
    return Buffer.from(decoded, "hex").toString();
  }

  private static encode(senderPrivatekey: string, recipientPublickey: string, message: string) {
    const keyPair = KeyPair.createKeyPairFromPrivateKeyString(senderPrivatekey);
    const sharedKey = utilities.catapult_crypto.deriveSharedKey(
      keyPair.privateKey,
      Convert.hexToUint8(recipientPublickey)
    );
    const encKey = Buffer.from(sharedKey, 32);
    const encIv = Buffer.from(createRandomBytes(12));
    const cipher = createCipheriv("aes-256-gcm", encKey, encIv);
    const hexMessage = Convert.utf8ToHex(message);
    const encrypted = Buffer.concat([cipher.update(Buffer.from(Convert.hexToUint8(hexMessage))), cipher.final()]);
    const result = cipher.getAuthTag().toString("hex") + encIv.toString("hex") + encrypted.toString("hex");
    return result;
  }

  private static decode(recipientPrivatekey: string, senderPublickey: string, payload: string): string {
    const binPayload = Convert.hexToUint8(payload);
    const payloadBuffer = new Uint8Array(binPayload.buffer, 16 + 12); //tag + iv
    const tagAndIv = new Uint8Array(binPayload.buffer, 0, 16 + 12);
    try {
      const keyPair = KeyPair.createKeyPairFromPrivateKeyString(recipientPrivatekey);
      const sharedKey = utilities.catapult_crypto.deriveSharedKey(
        keyPair.privateKey,
        Convert.hexToUint8(senderPublickey)
      );
      const encKey = Buffer.from(sharedKey, 32);
      const encIv = Buffer.from(new Uint8Array(tagAndIv.buffer, 16, 12));
      const encTag = Buffer.from(new Uint8Array(tagAndIv.buffer, 0, 16));
      const cipher = createDecipheriv("aes-256-gcm", encKey, encIv);
      cipher.setAuthTag(encTag);
      const decrypted = Buffer.concat([cipher.update(Buffer.from(payloadBuffer)), cipher.final()]);
      return decrypted.toString("hex").toUpperCase();
    } catch {
      // To return empty string rather than error throwing if authentication failed
      return "";
    }
  }
}
