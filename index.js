'use strict'

const assert = require('assert');

/** TEST RUNNER */

function testRunner(tests) {
    const testResults = [];

    for (const test of tests) {
        try {
            test();
            testResults.push([test.name, null]);
        } catch (e) {
            testResults.push([test.name, e]);
        }
    }

    const result = {};
    for (const [testName, testError] of  testResults) {
        result[testName] = testError;
    }

    return result;
}

/** TEST REPORTER */

function testReporter(testResults) {
    return Object.entries(testResults).map(([testName, testError]) => {
        if (testError) {
            return `${testName} - ${testError.stack}`;
        }
        
        return `${testName} - OK`;
    }).join('\n');
}

/** FRAMEWORK TESTS */

const frameworkTests = [
    function runsTestsSequientially() {
        const marks = [];
        const tests = [
            function add1() { marks.push(1); },
            function add2() { marks.push(2); },
        ];

        testRunner(tests);

        assert.deepEqual(marks, [1, 2]);
    },

    function isFaultTolerant() {
        const tests = [
            function fail() { throw new Error('fail'); },
        ]

        try {
            testRunner(tests);
        } catch (e) {
            throw new Error('fail');
        }
    },

    function testRunnerReturnsObjectDescribingTheSuite() {
        const failError = new Error('fail');
        const tests = [
            function ok() {},
            function fail() { throw failError; },
        ];

        const testResults = testRunner(tests);

        assert.deepEqual(testResults, {
            ok: null,
            fail: failError,
        });
    },

    function reportsResultsWithStack() {
        const tests = [
            function ok() {},
            function fail() { throw new Error('fail'); },
        ];

        const testResults = testReporter(testRunner(tests));

        assert.ok(/ok - OK\nfail - Error: fail\n.*at/m.test(testResults));
    },
];


console.log(testReporter(testRunner(frameworkTests)));