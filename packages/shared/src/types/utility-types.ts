export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export type Merge<A, B> = Prettify<Omit<A, keyof B> & B>

export type Update<
    A,
    B extends Partial<Record<keyof A, unknown>> & {
        [Key in keyof B]: Key extends keyof A ? B[Key] : never
    },
> = Merge<A, B>

export type Narrow<
    A,
    B extends Partial<A> & {
        [Key in keyof B]: Key extends keyof A
            ? B[Key] extends A[Key]
                ? B[Key]
                : never
            : never
    },
> = Merge<A, B>
