const tap = require('tap');
const { createIterator } = require('../lib');

tap.test("`next()` returns object of type `IteratorResult`", async t => {

  const iterator = createIterator();
  const result = iterator.next();

  t.assert(
    result.done === false && result.value !== undefined ||
    result.done === true && result.value === undefined
  );

});

tap.test("`resolve()` resolves promise in current `next()` value", async t => {

  const iterator = createIterator();
  const result = iterator.next();

  let resolved = false;
  async function awaitResolve(value) {
    await value;
    resolved = true;
  }

  t.assert(result.value instanceof Promise);

  awaitResolve(result.value);
  // Prevent race condition between (not) setting and checking `resolved`.
  await Promise.resolve();
  t.assert(resolved === false);

  iterator.resolve();
  // Prevent race condition between setting and checking `resolved`.
  await Promise.resolve();
  t.assert(resolved === true);

});

tap.test("`next()` gives identical value if called before previous value has settled", async t => {

  const { next } = createIterator();

  t.assert(next().value === next().value);

});

tap.test("`next()` gives new unsettled value if called after previous value has settled", async t => {

  const { next, resolve } = createIterator();
  const value1 = next().value;
  resolve();
  const value2 = next().value;

  t.assert(value1 !== value2);

});

tap.test("`next()` always gives unsettled value, even if it means omitting a `resolve()` or `reject()`", async t => {

  const { next, resolve } = createIterator();

  async function awaitResolve(value, expect) {
    t.assert(await value === expect);
  }

  const awaitBeforeEnd = [];

  awaitBeforeEnd.push(awaitResolve(next().value, 1));
  resolve(1);

  resolve(2);

  awaitBeforeEnd.push(awaitResolve(next().value, 3));
  resolve(3);

  await Promise.all(awaitBeforeEnd);

});

tap.test("`end()` prevents new unsettled value from being created", async t => {

  const { next, end } = createIterator();

  end();
  t.assert(next().done === true);

});

tap.test("`end()` does not affect currently pending value", async t => {

  const { next, end } = createIterator();

  next();
  end();
  t.assert(next().done === false);

});