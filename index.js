'use strict'

const assert = require('assert');

/** TEST RUNNER *////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function testRunner(tests, timeout = 4000) {
    const testResults = [];

    for (const test of tests) {
        try {
            await Promise.race([test(), new Promise(function (resolve, reject) { setTimeout(reject, timeout, `Timeout of ${timeout} milliseconds`); })]);
            testResults.push([test.name, null]);
        } catch (e) {
            testResults.push([test.name, e]);
        }
    }

    const result = {};
    for (const [testName, testError] of testResults) {
        result[testName] = testError;
    }

    return result;
}

/** TEST REPORTER */////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function testReporter(testResults, tap = false) {
    const objEntries = Object.entries(testResults);

    return (objEntries.map(([testName, testError], index) => {
        if (testError) {
            return `${testName} - ${testError.stack || testError}`;
        }

        return `${testName} - OK`;
    }).join('\n'));
}

function testReporterTAP(testResults) {
    const objEntries = Object.entries(testResults);

    return `1..${objEntries.length}\n` + (objEntries.map(([testName, testError], index) => {
        if (testError) {
            return `not ok ${index + 1} - ${testName}`;
        }

        return `ok ${index + 1} - ${testName}`;
    }).join('\n'));
}

/** FRAMEWORK TESTS *///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const frameworkTests = [
    async function runsTestsSequientially() {
        const marks = [];
        const tests = [
            function add1() { marks.push(1); },
            function add2() { marks.push(2); },
        ];

        await testRunner(tests);

        assert.deepEqual(marks, [1, 2]);
    },

    async function isFaultTolerant() {
        const tests = [
            function fail() { throw new Error('fail'); },
        ]

        try {
            await testRunner(tests);
        } catch (e) {
            throw new Error('fail');
        }
    },

    async function testRunnerReturnsObjectDescribingTheSuite() {
        const failError = new Error('fail');
        const tests = [
            function ok() { },
            function fail() { throw failError; },
        ];

        const testResults = await testRunner(tests);

        assert.deepEqual(testResults, {
            ok: null,
            fail: failError,
        });
    },

    async function reportsResultsWithStack() {
        const tests = [
            function ok() { },
            function fail() { throw new Error('fail'); },
        ];

        const res = await testRunner(tests);
        const testResults = testReporter(res); //should be testReporter

        assert.ok(/ok - OK\nfail - Error: fail\n.*at/m.test(testResults));
    },

    async function handlesSyncAndAsyncFuncs() {
        const tests = [
            function okTest1() { },
            async function okTest2() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 100, 'Blank');
                });
            },
            async function failTest() {
                return new Promise(function (resolve, reject) {
                    setTimeout(reject, 100, 'This is an error message');
                });
            },
        ]

        const testResults = await testRunner(tests);

        assert.deepEqual(testResults, {
            okTest1: null,
            okTest2: null,
            failTest: 'This is an error message',
        });
    },

    async function handlesAsyncFuncsTimeouts() {
        const tests = [
            async function fast() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 4, 'Blank');
                });
            },
            async function fastEnough() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 39, 'Blank');
                });
            },
            async function slowEnough() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 41, 'Blank');
                });
            },
            async function slow() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 60, 'Blank');
                });
            },
        ]

        const timeout = 40;
        const testResults = await testRunner(tests, timeout);

        assert.deepEqual(testResults, { fast: null, fastEnough: null, slowEnough: `Timeout of ${timeout} milliseconds`, slow: `Timeout of ${timeout} milliseconds` });
    }
];

testRunner(frameworkTests).then((res) => {
    console.log(testReporterTAP(res));
}).catch(err => console.log(err));