const createBuilder = (): any => {
  const map: { [key: string]: number } = {};
  return {
    map,
    /**
     * Adds a range mapping to the map.
     * @param {string} start The start character.
     * @param {string} end The end character.
     * @param {number} base The value corresponding to the start character.
     * @memberof module:utils/charMapping~CharacterMapBuilder
     * @instance
     */
    addRange: (start: string, end: string, base: number): void => {
      const startCode = start.charCodeAt(0);
      const endCode = end.charCodeAt(0);

      for (let code = startCode; code <= endCode; ++code) {
        map[String.fromCharCode(code)] = code - startCode + base;
      }
    },
  };
};

const Char_To_Nibble_Map = (): any => {
  const builder = createBuilder();
  builder.addRange('0', '9', 0);
  builder.addRange('a', 'f', 10);
  builder.addRange('A', 'F', 10);
  return builder.map;
};

export const Nibble_To_Char_Map = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
const Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const Decoded_Block_Size = 5;
export const Encoded_Block_Size = 8;
export const tryParseByte = (char1: string, char2: string): any => {
  const charMap = Char_To_Nibble_Map();
  const nibble1 = charMap[char1];
  const nibble2 = charMap[char2];
  return undefined === nibble1 || undefined === nibble2 ? undefined : (nibble1 << 4) | nibble2;
};

export const encodeBlock = (input: any, inputOffset: number, output: any, outputOffset: number): any => {
  output[outputOffset + 0] = Alphabet[input[inputOffset + 0] >> 3];
  output[outputOffset + 1] = Alphabet[((input[inputOffset + 0] & 0x07) << 2) | (input[inputOffset + 1] >> 6)];
  output[outputOffset + 2] = Alphabet[(input[inputOffset + 1] & 0x3e) >> 1];
  output[outputOffset + 3] = Alphabet[((input[inputOffset + 1] & 0x01) << 4) | (input[inputOffset + 2] >> 4)];
  output[outputOffset + 4] = Alphabet[((input[inputOffset + 2] & 0x0f) << 1) | (input[inputOffset + 3] >> 7)];
  output[outputOffset + 5] = Alphabet[(input[inputOffset + 3] & 0x7f) >> 2];
  output[outputOffset + 6] = Alphabet[((input[inputOffset + 3] & 0x03) << 3) | (input[inputOffset + 4] >> 5)];
  output[outputOffset + 7] = Alphabet[input[inputOffset + 4] & 0x1f];
};

const Char_To_Decoded_Char_Map = (): any => {
  const builder = createBuilder();
  builder.addRange('A', 'Z', 0);
  builder.addRange('2', '7', 26);
  return builder.map;
};

const decodeChar = (c: any): any => {
  const charMap = Char_To_Decoded_Char_Map();
  const decodedChar = charMap[c];
  if (undefined !== decodedChar) {
    return decodedChar;
  }
  throw Error(`illegal base32 character ${c}`);
};

export const decodeBlock = (input: any, inputOffset: number, output: any, outputOffset: number): any => {
  const bytes = new Uint8Array(Encoded_Block_Size);
  for (let i = 0; i < Encoded_Block_Size; ++i) {
    bytes[i] = decodeChar(input[inputOffset + i]);
  }

  output[outputOffset + 0] = (bytes[0] << 3) | (bytes[1] >> 2);
  output[outputOffset + 1] = ((bytes[1] & 0x03) << 6) | (bytes[2] << 1) | (bytes[3] >> 4);
  output[outputOffset + 2] = ((bytes[3] & 0x0f) << 4) | (bytes[4] >> 1);
  output[outputOffset + 3] = ((bytes[4] & 0x01) << 7) | (bytes[5] << 2) | (bytes[6] >> 3);
  output[outputOffset + 4] = ((bytes[6] & 0x07) << 5) | bytes[7];
};
