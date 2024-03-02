export class RawArray {
  /**
   * Creates a Uint8Array view on top of input.
   * @param {ArrayBuffer|Uint8Array} input The input array.
   * @returns {Uint8Array} A Uint8Array view on top of input.
   */
  public static uint8View = (input: ArrayBuffer | Uint8Array): Uint8Array => {
    if (ArrayBuffer === input.constructor) {
      return new Uint8Array(input);
    } else if (Uint8Array === input.constructor) {
      return input;
    }

    throw Error('unsupported type passed to uint8View');
  };

  /**
   * Copies elements from a source array to a destination array.
   * @param dest The destination array.
   * @param src The source array.
   * @param [numElementsToCopy=undefined] The number of elements to copy.
   * @param [destOffset=0] The first index of the destination to write.
   * @param [srcOffset=0] The first index of the source to read.
   */
  public static copy = (
    dest: Uint8Array,
    src: Uint8Array,
    numElementsToCopy?: number,
    destOffset: number = 0,
    srcOffset: number = 0
  ): any => {
    const length = undefined === numElementsToCopy ? dest.length : numElementsToCopy;
    for (let i = 0; i < length; ++i) {
      dest[destOffset + i] = src[srcOffset + i];
    }
  };

  /**
   * Determines whether or not an array is zero-filled.
   * @param {Array} array The array to check.
   * @returns {boolean} true if the array is zero-filled, false otherwise.
   */
  public static isZeroFilled = (array: Array<any>): boolean => array.every((value) => 0 === value);

  /**
   * Deeply checks the equality of two arrays.
   * @param {Array} lhs First array to compare.
   * @param {Array} rhs Second array to compare.
   * @param {number} [numElementsToCompare=undefined] The number of elements to compare.
   * @returns {boolean} true if all compared elements are equal, false otherwise.
   */
  public static deepEqual = (lhs: Uint8Array, rhs: Uint8Array, numElementsToCompare?: number): boolean => {
    let length = numElementsToCompare;
    if (undefined === length) {
      if (lhs.length !== rhs.length) {
        return false;
      }

      length = lhs.length;
    }

    if (length > lhs.length || length > rhs.length) {
      return false;
    }

    for (let i = 0; i < length; ++i) {
      if (lhs[i] !== rhs[i]) {
        return false;
      }
    }

    return true;
  };
}
