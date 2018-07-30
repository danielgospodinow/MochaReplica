'use strict'

const assert = require('assert');

/** TEST RUNNER *////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function testRunner(tests) {
    const testResults = [];

    for (const test of tests) {
        try {
            await test();
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

function testReporter(testResults) {
    return Object.entries(testResults).map(([testName, testError]) => {
        if (testError) {
            return `${testName} - ${testError.stack}`;
        }

        return `${testName} - OK`;
    }).join('\n');
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

        let res = await testRunner(tests);
        const testResults = testReporter(res);

        assert.ok(/ok - OK\nfail - Error: fail\n.*at/m.test(testResults));
    },

    async function handlesAsyncFuncs() {
        const tests = [
            async function okTest() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 1000, 'Blank');
                });
            },
            async function okTest2() {
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, 3000, 'Blank');
                });
            },
            async function failTest() {
                return new Promise(function (resolve, reject) {
                    setTimeout(reject, 1000, 'This is an error message');
                });
            },
        ]

        let testResults = await testRunner(tests);

        assert.deepEqual(testResults, {
            okTest: null,
            okTest2: null,
            failTest: 'This is an error message',
        });
    }
];

testRunner(frameworkTests).then((res) => {
    console.log(testReporter(res));
}).catch(err => console.log(err));