interface IStep<T> {
  readonly settled: boolean;
  readonly promise: Promise<T>;
  resolve(value?: T | PromiseLike<T>): void;
  reject(reason?: any): void;
}

function createStep<T>(): IStep<T> {
  const step: any = { settled: false };
  step.promise = new Promise((resolve, reject) => {
    step.resolve = (value?: T | PromiseLike<T>) => {
      step.settled = true;
      resolve(value);
    };
    step.reject = (reason?: any) => {
      step.settled = true;
      reject(reason);
    };
  });
  return step;
}

export interface IIterator<T> extends Iterator<Promise<T> | undefined> {
  resolve(value?: T | PromiseLike<T>): void;
  reject(reason?: any): void;
  end(): void;
}

export function createIterator<T = any>(): IIterator<T> {
  let step: IStep<T> | undefined;
  let done = false;
  return {
    next() {
      if (!step && done)
        return { value: undefined, done };
      if (!step || step.settled)
        step = createStep<T>();
      const value = step.promise;
      if (step.settled)
        step = undefined;
      return { value, done: false };
    },
    resolve(data) {
      if (!step || step.settled)
        step = createStep<T>();
      step.resolve(data);
    },
    reject(err) {
      if (!step || step.settled)
        step = createStep<T>();
      step.reject(err);
    },
    end() {
      done = true;
    }
  };
}
