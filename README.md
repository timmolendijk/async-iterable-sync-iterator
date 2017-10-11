# Asynchronously iterable (synchronous) iterator

Utility to create a regular (synchronous) iterator that provides promises as values, allowing for asynchronous iteration without requiring [the ECMAScript async iteration standard](https://github.com/tc39/proposal-async-iteration).

The ECMAScript spec will not allow iterations to fail _without_ terminating the iterator, while this iterator enables asynchronous iteration with failure as an acceptable and catchable possible scenario for every single iteration.

It can be used to make a stream of fallible events asynchronously iterable, for instance when running a compiler in watch mode:

```js
const { createIterator } = require('async-iterable-sync-iterator');

async function main() {

  const iterator = createIterator();

  watchCompile((err, result) => {
    if (err) {
      // Let's assume the compiler's Error objects have a property that
      // indicates whether the error is fatal or not.
      if (err.isFatal)
        iterator.end();
      iterator.reject(err);
    } else {
      iterator.resolve(result);
    }
  });

  for (const value of iterator) {

    console.log("Awaiting next compile…");

    let result;
    try {
      result = await value;
    } catch (err) {
      console.error("Compile failed", err);
      continue;
    }

    console.log("Compile succeeded", result);

  }

}

main();
```

## Support

Has been developed and tested against Node 8, but it is very likely to also work fine on older versions.
