import { Convert } from '../util/converter';
import { KeyPair } from '../util/keypair';
import { IKeyPair } from '../model/keypair';
import { Address } from './address';
import { NetworkType } from '../model/network';
import { RawAddress } from '../util/raw-address';
import { createRandomBytes } from '../util/crypto';

export class Account {
  private constructor(
    /** The account address. */
    public readonly address: Address,
    /** The account keyPair, public and private key. */
    private readonly keyPair: IKeyPair
  ) {}

  /** Account public key. */
  public get publicKey(): string {
    return Convert.uint8ToHex(this.keyPair.publicKey);
  }

  /** Account private key.*/
  public get privateKey(): string {
    return Convert.uint8ToHex(this.keyPair.privateKey);
  }

  /** Account network type. */
  public get networkType(): NetworkType {
    return this.address.networkType;
  }

  /**
   * Sign a transaction
   * @param serializedTransaction transaction.serialize()
   * @param generationHash
   */
  public sign(serializedTransaction: string, generationHash: string) {
    const tx = Array.from(Convert.hexToUint8(serializedTransaction));
    const generationHashBytes = Array.from(Convert.hexToUint8(generationHash));
    // 1. prepare the raw transaction to be signed
    const signingBytes: number[] = this.getSigningBytes(tx, generationHashBytes);
    // 2. sign the raw transaction
    const signature = this.signRawTransaction(this.privateKey, Uint8Array.from(signingBytes));
    // 3. prepare the (signed) payload
    const payload = this.preparePayload(Uint8Array.from(tx), signature, this.publicKey);
    return payload;
  }

  /**
   * Generate signing bytes
   * @param payloadBytes Payload buffer
   * @param generationHashBytes GenerationHash buffer
   */
  private getSigningBytes(payloadBytes: number[], generationHashBytes: number[]): number[] {
    const byteBufferWithoutHeader = payloadBytes.slice(4 + 64 + 32 + 8);
    // if (this.type === TransactionType.AGGREGATE_BONDED || this.type === TransactionType.AGGREGATE_COMPLETE) {
    //   return generationHashBytes.concat(byteBufferWithoutHeader.slice(0, 52));
    // } else {
    return generationHashBytes.concat(byteBufferWithoutHeader);
    // }
  }

  /**
   * Signs raw transaction with the given private key
   * @param {string} privateKey - Private key of the signer account
   * @param {Uint8Array} rawTransactionSigningBytes - Raw transaction siging bytes
   * @returns {Uint8Array} Signature byte array
   */
  private signRawTransaction(privateKey: string, rawTransactionSigningBytes: Uint8Array): Uint8Array {
    const keyPairEncoded = KeyPair.createKeyPairFromPrivateKeyString(privateKey);
    return KeyPair.sign(keyPairEncoded, new Uint8Array(rawTransactionSigningBytes));
  }

  /**
   * Prepares and return signed payload
   * @param {Uint8Array} serializedTransaction Serialized transaction
   * @param {Uint8Array} signature Signature of the transaction
   * @param {string} publicKey Public key of the signing account
   * @returns {string} Payload (ready to be announced)
   */
  private preparePayload(serializedTransaction: Uint8Array, signature: Uint8Array, publicKey: string): string {
    const transactionBytes = Array.from(serializedTransaction);
    const signatureBytes = Array.from(signature);
    const signedTransactionBuffer = transactionBytes
      .splice(0, 8)
      .concat(signatureBytes)
      .concat(Array.from(Convert.hexToUint8(publicKey)))
      .concat(Array.from(new Uint8Array(4)))
      .concat(transactionBytes.splice(64 + 32 + 4, transactionBytes.length));
    return Convert.uint8ToHex(new Uint8Array(signedTransactionBuffer));
  }

  /** Generate a new account */
  public static generateNewAccount(networkType: NetworkType) {
    // Create random bytes
    const randomBytesArray = createRandomBytes(32);
    // Hash random bytes with entropy seed
    // Finalize and keep only 32 bytes
    const hashKey = Convert.uint8ToHex(randomBytesArray);
    // Create KeyPair from hash key
    const keyPair = KeyPair.createKeyPairFromPrivateKeyString(hashKey);
    const address = Address.createFromPublicKey(Convert.uint8ToHex(keyPair.publicKey), networkType);
    return new Account(address, keyPair);
  }

  /** Create an Account from a given private key */
  public static createFromPrivateKey(privateKey: string, networkType: NetworkType): Account {
    const keyPair: IKeyPair = KeyPair.createKeyPairFromPrivateKeyString(privateKey);
    const address = RawAddress.addressToString(RawAddress.publicKeyToAddress(keyPair.publicKey, networkType));
    return new Account(Address.createFromRawAddress(address), keyPair);
  }
}
