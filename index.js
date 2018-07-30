'use strict'

const TESTS = [
    function first() { },
    function second() { throw new Error('fail'); },
    function third() { },
];

function mochaReplica(tests) {
    for (const test of tests) {
        try {
            test();
            console.log(test.name, '- OK');
        } catch (e) {
            console.log(test.name, '- FAIL');
        }
    }
}

mochaReplica(TESTS);