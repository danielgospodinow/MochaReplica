'use strict'

const TESTS = [
    function() { console.log('1'); },
    function() { console.log('2'); },
];

for (const test of TESTS) {
    test();
}