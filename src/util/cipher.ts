import forge from 'node-forge';

/**
 * Performs AES GCM encryption and decryption with a given key.
 */
export class AesGcmCipher {
  private _key: Uint8Array;

  /**
   * Byte size of GCM tag.
   * @type number
   */
  static TAG_SIZE: number = 16;

  /**
   * Creates a cipher around an aes shared key.
   * @param {SharedKey256} aesKey AES shared key.
   */
  constructor(aesKey: Uint8Array) {
    /**
     * @private
     */
    this._key = aesKey;
  }

  /**
   * Encrypts clear text and appends tag to encrypted payload.
   * @param {Uint8Array} clearText Clear text to encrypt.
   * @param {Uint8Array} iv IV bytes.
   * @returns {object} Cipher text with appended tag.
   */
  encrypt(clearText: Uint8Array): { cipherText: string; initializationVector: string; tag: string } {
    const cipher = forge.cipher.createCipher('AES-GCM', forge.util.createBuffer(this._key));
    const iv = forge.random.getBytesSync(12);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(clearText));
    cipher.finish();
    const cipherText = cipher.output.toHex();
    const tag = cipher.mode.tag.toHex();
    const initializationVector = forge.util.createBuffer(iv).toHex();
    return { cipherText, initializationVector, tag };
  }

  /**
   * Decrypts cipher text with appended tag.
   * @param {Uint8Array} cipherText Cipher text with appended tag to decrypt.
   * @param {Uint8Array} iv IV bytes.
   * @returns {Uint8Array} Clear text.
   */
  decrypt(cipherText: Uint8Array, tag: Uint8Array, iv: Uint8Array): Uint8Array {
    const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.createBuffer(this._key));
    const ivString = String.fromCharCode.apply(null, [...iv]);
    const ivBuffer = forge.util.createBuffer(ivString);
    const tagString = String.fromCharCode.apply(null, [...tag]);
    const tagBuffer = forge.util.createBuffer(tagString);
    decipher.start({ iv: ivBuffer, tag: tagBuffer });
    decipher.update(forge.util.createBuffer(cipherText));
    const pass = decipher.finish();
    if (pass) {
      return new Uint8Array(Array.from(decipher.output.getBytes(), (c) => c.charCodeAt(0)));
    } else {
      throw new Error('Unable to authenticate data');
    }
  }
}
