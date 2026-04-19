/**
 * Utility Types
 *
 * Common utility types used throughout the codebase.
 */

/**
 * DeepImmutable - Makes all properties of an object recursively readonly.
 *
 * This is similar to TypeScript's built-in `Readonly<T>` but applies
 * recursively to all nested objects and arrays.
 *
 * @example
 * ```typescript
 * type Mutable = {
 *   name: string
 *   nested: { value: number }
 *   items: string[]
 * }
 *
 * type Immutable = DeepImmutable<Mutable>
 * // Immutable.nested.value is readonly
 * // Immutable.items is readonly string[]
 * ```
 */
export type DeepImmutable<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepImmutable<U>>
    : T extends Map<infer K, infer V>
      ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
      : T extends Set<infer M>
        ? ReadonlySet<DeepImmutable<M>>
        : T extends object
          ? { readonly [P in keyof T]: DeepImmutable<T[P]> }
          : T

/**
 * Permutations - Generates all possible permutations of a tuple.
 *
 * @example
 * ```typescript
 * type Result = Permutations<[1, 2, 3]>
 * // Result = [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
 * ```
 */
export type Permutations<T extends readonly unknown[]> = T extends [
  infer First,
  ...infer Rest,
]
  ? [
      First,
      ...Permutations<Rest>,
      ...Permutations<Rest> extends infer P extends unknown[]
        ? P
        : never,
    ]
  : T extends []
    ? []
    : T extends readonly [infer First, ...infer Rest]
      ? Permutations<[First, ...Rest]>
      : T

/**
 * DeepPartial - Makes all properties of an object recursively optional.
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * DeepRequired - Makes all properties of an object recursively required.
 */
export type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T

/**
 * NonNullableFields - Makes specified fields non-nullable.
 */
export type NonNullableFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>
}

/**
 * PickByType - Pick properties from T that have type U.
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

/**
 * OmitByType - Omit properties from T that have type U.
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}
