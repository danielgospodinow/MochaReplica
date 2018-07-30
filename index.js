'use strict'

const TESTS = [
    function() { console.log('1'); },
    function() { throw new Error('fail'); },
    function() { console.log('2'); },
];

for (const test of TESTS) {
    try {
        test();
    } catch (e) {

    }
}