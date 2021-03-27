export function deepClone<T>(obj: T): T {
    const _obj = JSON.stringify(obj);
    return JSON.parse(_obj);
};