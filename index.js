'use strict'

const assert = require('assert');

function mochaReplica(tests) {
    const testResults = [];

    for (const test of tests) {
        try {
            test();
            testResults.push(test.name + ' - OK');
        } catch (e) {
            testResults.push(test.name + ' - FAIL');
        }
    }

    return testResults;
}

const frameworkTests = [
    function runsTestsSequientially() {
        const marks = [];
        const tests = [
            function add1() { marks.push(1); },
            function add2() { marks.push(2); },
        ];

        mochaReplica(tests);

        assert.deepEqual(marks, [1, 2]);
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

    function reportsResults() {
        const tests = [
            function ok() {},
            function fail() { throw new Error('fail'); },
        ];

        const testResults = mochaReplica(tests);

        assert.deepEqual(testResults, ['ok - OK', 'fail - FAIL']);
    },
];


console.log(mochaReplica(frameworkTests).join("\n"));