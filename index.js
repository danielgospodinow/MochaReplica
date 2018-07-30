'use strict'

const TESTS = [
    function first() {},
    function second() { throw new Error('fail'); },
    function third() {},
];

for (const test of TESTS) {
    try {
        test();
        console.log(test.name, '- OK');
    } catch (e) {
        console.log(test.name, '- FAIL');
    }
}