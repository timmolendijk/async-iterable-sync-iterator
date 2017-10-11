export interface IIterator<T> extends Iterator<Promise<T> | undefined> {
    resolve(value?: T | PromiseLike<T>): void;
    reject(reason?: any): void;
    end(): void;
}
export declare function createIterator<T = any>(): IIterator<T>;
