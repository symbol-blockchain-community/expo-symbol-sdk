import crypto from "crypto-browserify";

export const concatArrays = (...arrays: Uint8Array[]) => {
  const totalLength = arrays
    .map((buffer) => buffer.length)
    .reduce((accumulator, currentValue) => accumulator + currentValue);
  const result = new Uint8Array(totalLength);
  let targetOffset = 0;
  arrays.forEach((buffer) => {
    result.set(buffer, targetOffset);
    targetOffset += buffer.length;
  });
  return result;
};

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
   * @returns {Uint8Array} Cipher text with appended tag.
   */
  encrypt(clearText: Uint8Array, iv: Uint8Array): Uint8Array {
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(this._key), Buffer.from(iv));

    const cipherText = cipher.update(clearText);
    cipher.final(); // no padding for GCM

    const tag = cipher.getAuthTag();

    return concatArrays(cipherText, tag);
  }

  /**
   * Decrypts cipher text with appended tag.
   * @param {Uint8Array} cipherText Cipher text with appended tag to decrypt.
   * @param {Uint8Array} iv IV bytes.
   * @returns {Uint8Array} Clear text.
   */
  decrypt(cipherText: Uint8Array, iv: Uint8Array): Uint8Array {
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(this._key), Buffer.from(iv));

    const tagStartOffset = cipherText.length - AesGcmCipher.TAG_SIZE;
    decipher.setAuthTag(cipherText.subarray(tagStartOffset));

    const clearText = decipher.update(Buffer.from(cipherText.subarray(0, tagStartOffset)));
    decipher.final(); // no padding for GCM
    return clearText;
  }
}
