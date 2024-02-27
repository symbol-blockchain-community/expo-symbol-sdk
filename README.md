# Symbol SDK Crypto

This library is a lightweight SDK extracted from the Symbol SDK’s use of Node.js’s crypto module. To avoid complex dependency resolutions on platforms like Web, Node.js, and React Native, this library serves as the base for SDKs tailored to each platform. This light version of the SDK offers the following features:

- Creation and loading of private keys
- Encryption and decryption of messages
- Signing of transaction payloads with a private key

## Target Users

* Developers considering Symbol blockchain application development on Expo environment
* Developers who want to leverage the convenience of Managed React Native while developing secure Symbol applications
* Developers already familiar with symbol-sdk


## Installation

```shell
npm install @symbol-blockchain-community/expo-symbol-sdk
```

## Usage

Create PrivateKey

```ts
import { Account, NetworkType } from "@symbol-blockchain-community/expo-symbol-sdk";

const account = Account.generateNewAccount(NetworkType.TEST_NET);
console.log(account);
```

Signing a transaction created with symbol-sdk.

```ts
const account = Account.generateNewAccount(NetworkType.TEST_NET);

const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
const serializedTransactionPayload =
  "AE00000000000000000000000000000000000000000000000000000000000000" +
  "0000000000000000000000000000000000000000000000000000000000000000" +
  "0000000000000000000000000000000000000000000000000000000000000000" +
  "0000000000000000000000000000000000000000000000000000000000000001" +
  "985441F84300000000000003983E640900000098EC10797B167D59E419781125" +
  "EE36676AA61D9E4F90CDAF0E000000000000000048656C6C6F2053796D626F6C21";

const signedPayload = account.sign(serializedTransactionPayload, generationHash);
console.log(signedPayload);
```

Encryption and decryption of messages.

```ts
import { MessageEncoder, Account } from "@symbol-blockchain-community/expo-symbol-sdk";
import { Account, NetworkType } from "symbol-sdk";

const alice = Account.generateNewAccount(NetworkType.TEST_NET);
const bob = Account.generateNewAccount(NetworkType.TEST_NET);

const messageEncoder = new MessageEncoder(alice.privateKey);
const messageDecoder = new MessageEncoder(bob.privateKey);

const encoded = messageEncoder.encode(bob.publicKey, 'Hello, symbol!');
console.log('encoded: ', encoded);
const decoded = messageDecoder.tryDecode(alice.publicKey, encoded);
console.log('decoded: ', decoded);
```

## Contributing

expo-symbol-crypto is an open-source project. Contributions are welcome. Please refer to the GitHub repository for details.

## License

This software is provided under the [MIT License](./LICENSE).

## Contact

For questions or feedback, please contact us through the GitHub repository.
