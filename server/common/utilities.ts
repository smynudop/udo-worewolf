export const keyof = <T extends object>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[]
}
