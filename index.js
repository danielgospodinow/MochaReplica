'use strict'

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

    function reportsResults() {
        const tests = [
            function ok() {},
            function fail() { throw new Error('fail'); },
        ];

        const testResults = mochaReplica(tests);

        if (testResults.length !== 2 || testResults[0] !== 'ok - OK' || testResults[1] !== 'fail - FAIL') {
            throw new Error('fail');
        }
    },
];


console.log(mochaReplica(frameworkTests).join("\n"));