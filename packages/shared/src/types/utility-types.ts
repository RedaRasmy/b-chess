export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export type Merge<A, B> = Prettify<Omit<A, keyof B> & B>
