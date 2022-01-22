/// <reference path="../utils.ts"/>

module Geoma.Test
{
    type TestCase = () => void;

    class TestUtils
    {
        private constructor()
        {
        }
        public static testCaseName(fixture: TestFixture, test_name: string): string
        {
            return `${TestUtils.fixtureName(fixture)}.${test_name}`;
        }
        public static printSuccess(text: string): void
        {
            console.log(`%c ${text}`, 'background: #0a0; color: #fff');
        }
        public static printError(text: string): void
        {
            console.log(`%c ${text}`, 'background: #a00; color: #fff');
        }
        public static printGlobal(text: string): void
        {
            TestUtils.printSuccess(`[==========] ${text}`);
        }
        public static printGroup(text: string): void
        {
            TestUtils.printSuccess(`[----------] ${text}`);
        }
        public static printRun(text: string): void
        {
            TestUtils.printSuccess(`[ RUN      ] ${text}`);
        }
        public static printOk(text: string): void
        {
            TestUtils.printSuccess(`[       OK ] ${text}`);
        }
        public static printPassed(text: string): void
        {
            TestUtils.printSuccess(`[  PASSED  ] ${text}`);
        }
        public static printFailed(text: string): void
        {
            TestUtils.printError(`[  FAILED  ] ${text}`);
        }
        public static addTest(fixture: TestFixture, test_name: string): string
        {
            let test_names = TestUtils._tests[TestUtils.fixtureName(fixture)];
            if (!test_names)
            {
                test_names = TestUtils._tests[TestUtils.fixtureName(fixture)] = new Map<string, TestFixture>();
            }
            const test_case_name = TestUtils.testCaseName(fixture, test_name);
            Utils.assert(!test_names.has(test_name), `Duplicate test name: ${test_case_name}`);
            test_names.set(test_name, fixture);
            return test_case_name;
        }
        public static runAll(): boolean
        {
            let tests_count = 0;
            let test_fixtures_count = 0;
            for (const fixture_name in TestUtils._tests)
            {
                const fixture = TestUtils._tests[fixture_name];
                test_fixtures_count++;
                tests_count += fixture.size;
            }

            const s_end = (count: number): string => count > 1 ? "s" : "";
            TestUtils.printGlobal(`Runinig ${tests_count} test${s_end(tests_count)} from ${test_fixtures_count} test case${s_end(test_fixtures_count)}.`);

            let failed_tests = new Array<string>();
            for (const fixture_name in TestUtils._tests)
            {
                const fixture = TestUtils._tests[fixture_name];
                TestUtils.printGroup(`${fixture.size} test${s_end(fixture.size)} from ${fixture_name}`);
                let passed = 0;
                fixture.forEach((fixture: TestFixture, test_name: string) =>
                {
                    if (fixture.run())
                    {
                        passed++;
                    }
                    else
                    {
                        failed_tests.push(TestUtils.testCaseName(fixture, test_name));
                    }
                });
                TestUtils.printGroup(`${passed} test${s_end(passed)} from ${fixture_name}.`);
            }
            TestUtils.printGlobal(`${tests_count} test${s_end(tests_count)} from ${test_fixtures_count} test case${s_end(test_fixtures_count)} ran.`);

            TestUtils.printPassed(`${tests_count - failed_tests.length} test${s_end(tests_count - failed_tests.length)}`);
            if (failed_tests.length)
            {
                TestUtils.printFailed(`${failed_tests.length} test${s_end(failed_tests.length)}, listed below.`);
                for (const failed_test of failed_tests)
                {
                    TestUtils.printFailed(failed_test);
                }
                return false;
            }
            else
            {
                return true;
            }
        }

        protected static fixtureName(fixture: TestFixture): string
        {
            return fixture.constructor.name;
        }

        private static readonly _tests: Record<string, Map<string, TestFixture>> = {};
    }

    type RunFunction = () => boolean;

    export abstract class TestFixture
    {
        constructor(test_name: string, test_case: TestCase)
        {
            const test_case_name = TestUtils.addTest(this, test_name);
            this.run = (() =>
            {
                TestUtils.printRun(test_case_name);
                try
                {
                    test_case();
                    if (this._error)
                    {
                        throw new Error();
                    }
                    else
                    {
                        TestUtils.printOk(test_case_name);
                        return true;
                    }
                }
                catch (error)
                {
                    if (error instanceof Error && error.message)
                    {
                        TestUtils.printError(` ${error.message}`);
                    }
                    else
                    {
                        TestUtils.printError(` Unexpected error`);
                    }
                    TestUtils.printFailed(test_case_name);
                    return false;
                }
            }).bind(this);
        }

        public readonly run: RunFunction;

        private _error: boolean = false;
    }

    class TestFixtureTests extends TestFixture
    {

    }

    new TestFixtureTests("SuccessPass", () =>
    {
    });

    new TestFixtureTests("ThrowError", () =>
    {
        throw new Error("test fixture test error");
    });

    new TestFixtureTests("ThrowNonError", () =>
    {
        throw "test fixture test error";
    });

    //TestUtils.runAll();
}