'use strict'

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

const frameworkTests = [
    function runsTestsSequientially() {
        const marks = [];
        const tests = [
            function add1() { marks.push(1); },
            function add2() { marks.push(2); },
        ]

        mochaReplica(tests);

        if (marks.length !== 2 || marks[0] !== 1 || marks[1] !== 2) {
            throw new Error('fail');
        }
    },

    function isFaultTolerant() {
        const tests = [
            function fail() { throw new Error('fail'); },
        ]

        try {
            mochaReplica(tests);
        } catch (e) {
            throw new Error('fail');
        }
    },
];


mochaReplica(frameworkTests);