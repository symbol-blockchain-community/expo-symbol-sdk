# expo-symbol-sdk

expo-symbol-sdk is a symbol-sdk optimized for use on expo managed react native. This sdk can be used by application developers simply by installing it, without the need for complex environment setup.

However, this sdk is a lightweight package that extracts only the functions of symbol-sdk that depend on the node.js core module. Only the following features are provided compared to the original symbol-sdk:

- Creation and loading of private keys
- Encryption and decryption of messages
- Signing of transaction payloads with a private key

## Target Users

- Developers considering Symbol blockchain application development on Expo environment
- Developers who want to leverage the convenience of Managed React Native while developing secure Symbol applications
- Developers already familiar with symbol-sdk

## Installation

```shell
npm install @symbol-blockchain-community/expo-symbol-sdk
```

## Usage

Create PrivateKey

```ts
import { Account, NetworkType } from '@symbol-blockchain-community/expo-symbol-sdk';

const account = Account.generateNewAccount(NetworkType.TEST_NET);
console.log(account);
```

Signing a transaction created with symbol-sdk.

```ts
import { Account, NetworkType } from '@symbol-blockchain-community/expo-symbol-sdk';

const generationHash = '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4';
const serializedTransactionPayload =
  'AE00000000000000000000000000000000000000000000000000000000000000' +
  '0000000000000000000000000000000000000000000000000000000000000000' +
  '0000000000000000000000000000000000000000000000000000000000000000' +
  '0000000000000000000000000000000000000000000000000000000000000001' +
  '985441F84300000000000003983E640900000098EC10797B167D59E419781125' +
  'EE36676AA61D9E4F90CDAF0E000000000000000048656C6C6F2053796D626F6C21';

const account = Account.generateNewAccount(NetworkType.TEST_NET);
const signedPayload = account.sign(serializedTransactionPayload, generationHash);
console.log(signedPayload);
```

Encryption and decryption of messages.

```ts
import { MessageEncoder, Account, NetworkType } from '@symbol-blockchain-community/expo-symbol-sdk';

const alice = Account.generateNewAccount(NetworkType.TEST_NET);
const bob = Account.generateNewAccount(NetworkType.TEST_NET);

const messageEncoder = new MessageEncoder(alice.privateKey);
const messageDecoder = new MessageEncoder(bob.privateKey);

const encoded = messageEncoder.encode(bob.publicKey, 'Hello, symbol!');
const decoded = messageDecoder.tryDecode(alice.publicKey, encoded);
console.log('encoded: ', encoded);
console.log('decoded: ', decoded);
```

`MessageEncoder.encode` returns a `Uint8Array`. It can be used directly with symbol-sdk@3. However, if you need to handle it as a string, you can convert it to hex with the following implementation.

```javascript
const hex = Array.from(encoded).map(b => b.toString(16).padStart(2, '0')).join('');
```

Application developers do not need to be aware of this, but when an encrypted message is sent to a node and retrieved from the node again, the "01" will be added to the beginning of the hex string. This is a flag to indicate that the message is encrypted.
If you want to send an encrypted message to another application without going through a node and decrypt it using the SDK, you need to add "01" to the beginning of the hex yourself.

## Contributing

`expo-symbol-crypto` is an open-source project. Contributions are welcome. Please refer to the GitHub repository for details.

## License

This software is provided under the [MIT License](./LICENSE).

## Contact

For questions or feedback, please contact us through the GitHub repository.

## External sites

* [Symbol Community Web](https://symbol-community.com)
* [Symbol Document](https://docs.symbol.dev/ja/index.html)
* [Symbol/NEM Discord](https://discord.gg/xymcity)