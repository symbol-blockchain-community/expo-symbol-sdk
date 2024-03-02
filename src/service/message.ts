import { TryDecodeResult } from "../model/message";
import { encodeAesGcm, decodeAesGcm } from "../util/cipherHelpers";
import { Convert } from "../util/converter";
import { deriveSharedKey } from "../util/sharedKey";

const utf8ArrayToString = (uint8Array: Uint8Array) => {
  let string = "";
  for (let i = 0; i < uint8Array.length; i++) {
    string += String.fromCharCode(uint8Array[i]);
  }
  return string;
};

const filterExceptions = (statement: () => Uint8Array, exceptions: string[]): [boolean, Uint8Array | undefined] => {
  try {
    const message = statement();
    return [true, message];
  } catch (exception: unknown) {
    if (!exceptions.some((exceptionMessage: string) => (exception as Error).message.includes(exceptionMessage)))
      throw exception;
  }

  return [false, undefined];
};

/**
 * Encrypts and encodes messages between two parties.
 */
export class MessageEncoder {
  private _privateKey: Uint8Array;
  /**
   * Creates message encoder around private key.
   * @param {string} privateKey private key.
   */
  constructor(privateKey: Uint8Array | string) {
    this._privateKey = typeof privateKey === "string" ? Convert.hexToUint8(privateKey) : privateKey;
  }

  /**
   * Tries to decode encoded message.
   * @param {Uint8Array} senderPublicKey Recipient's public key.
   * @param {Uint8Array} encodedMessage Encoded message.
   * @returns {TryDecodeResult} Tuple containing decoded status and message.
   */
  tryDecode(senderPublicKey: Uint8Array | string, encodedMessage: Uint8Array): TryDecodeResult {
    senderPublicKey =
      typeof senderPublicKey === "string"
        ? Convert.hexToUint8(senderPublicKey)
        : senderPublicKey;
    if (1 === encodedMessage[0]) {
      const [result, message] = filterExceptions(
        () =>
          decodeAesGcm(deriveSharedKey, this._privateKey, senderPublicKey as Uint8Array, encodedMessage.subarray(1)),
        ["Unsupported state or unable to authenticate data", "invalid point"]
      );
      if (result) return { isDecoded: true, message: utf8ArrayToString(message as Uint8Array) };
    }
    return { isDecoded: false, message: encodedMessage };
  }

  /**
   * Encodes message to recipient using recommended format.
   * @param {PublicKey} recipientPublicKey Recipient public key.
   * @param {Uint8Array} message Message to encode.
   * @returns {Uint8Array} Encrypted and encoded message.
   */
  encode(recipientPublicKey: Uint8Array | string, message: string): Uint8Array {
    recipientPublicKey =
      typeof recipientPublicKey === "string" ? Convert.hexToUint8(recipientPublicKey) : recipientPublicKey;
    const { tag, initializationVector, cipherText } = encodeAesGcm(
      deriveSharedKey,
      this._privateKey,
      recipientPublicKey,
      new Uint8Array(Convert.utf8ToUint8(message))
    );
    return Convert.hexToUint8('01' + tag + initializationVector + cipherText);
  }

  /**
	 * Tries to decode encoded message.
	 * @deprecated This function is only provided for compatability with the original Symbol wallets.
	 *             Please use `tryDecode` in any new code.
	 * @param {PublicKey} senderPublicKey Recipient's public key.
	 * @param {Uint8Array} encodedMessage Encoded message
	 * @returns {TryDecodeResult} Tuple containing decoded status and message.
	 */
	tryDecodeDeprecated(senderPublicKey: Uint8Array | string, encodedMessage: Uint8Array): TryDecodeResult {
    senderPublicKey =
      typeof senderPublicKey === "string"
        ? Convert.hexToUint8(senderPublicKey)
        : senderPublicKey;
		const encodedHexString = Convert.uint8ToHex(encodedMessage.subarray(1));
		if (1 === encodedMessage[0] && Convert.isHexString(encodedHexString)) {
			// wallet additionally hex encodes
			return this.tryDecode(senderPublicKey, new Uint8Array([1, ...Convert.hexToUint8(encodedHexString)]));
		}

		return this.tryDecode(senderPublicKey, encodedMessage);
	}
}
