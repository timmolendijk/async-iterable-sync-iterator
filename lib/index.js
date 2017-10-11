"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createStep() {
    const step = { settled: false };
    step.promise = new Promise((resolve, reject) => {
        step.resolve = (value) => {
            step.settled = true;
            resolve(value);
        };
        step.reject = (reason) => {
            step.settled = true;
            reject(reason);
        };
    });
    return step;
}
function createIterator() {
    let step;
    let done = false;
    return {
        next() {
            if (!step && done)
                return { value: undefined, done };
            if (!step || step.settled)
                step = createStep();
            const value = step.promise;
            if (step.settled)
                step = undefined;
            return { value, done: false };
        },
        resolve(data) {
            if (!step || step.settled)
                step = createStep();
            step.resolve(data);
        },
        reject(err) {
            if (!step || step.settled)
                step = createStep();
            step.reject(err);
        },
        end() {
            done = true;
        }
    };
}
exports.createIterator = createIterator;
