import { AesGcmCipher } from './cipher';

const GCM_IV_SIZE = 12;
const SALT_SIZE = 32;

const decode = (tagSize: number, ivSize: number, encodedMessage: Uint8Array) => ({
  tag: encodedMessage.subarray(0, tagSize),
  initializationVector: encodedMessage.subarray(tagSize, tagSize + ivSize),
  encodedMessageData: encodedMessage.subarray(tagSize + ivSize),
});

const decodeAesGcm = (
  deriveSharedKey: (privateKey: Uint8Array, recipientPublicKey: Uint8Array) => Uint8Array,
  privateKey: Uint8Array,
  recipientPublicKey: Uint8Array,
  encodedMessage: Uint8Array
) => {
  const { tag, initializationVector, encodedMessageData } = decode(AesGcmCipher.TAG_SIZE, GCM_IV_SIZE, encodedMessage);

  const sharedKey = deriveSharedKey(privateKey, recipientPublicKey);
  const cipher = new AesGcmCipher(sharedKey);

  return new Uint8Array(cipher.decrypt(encodedMessageData, tag, initializationVector));
};

const encodeAesGcm = (
  deriveSharedKey: (privateKey: Uint8Array, recipientPublicKey: Uint8Array) => Uint8Array,
  privateKey: Uint8Array,
  recipientPublicKey: Uint8Array,
  message: Uint8Array
) => {
  const sharedKey = deriveSharedKey(privateKey, recipientPublicKey);
  const cipher = new AesGcmCipher(sharedKey);

  const { cipherText, initializationVector, tag } = cipher.encrypt(message);

  return { tag, initializationVector, cipherText };
};

export { decodeAesGcm, encodeAesGcm, SALT_SIZE };
